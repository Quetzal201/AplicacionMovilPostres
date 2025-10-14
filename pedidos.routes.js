const express = require('express');
const { runQuery } = require('./db/client');

const router = express.Router();

// Crear pedido con items: { usuario_id, items: [{ postre_id, cantidad }] }
router.post('/', async (req, res) => {
	const { usuario_id, items } = req.body;
	if (!usuario_id || !Array.isArray(items) || items.length === 0) {
		return res.status(400).json({ error: 'usuario_id e items son requeridos' });
	}
	try {
		// Crear pedido base
		const create = await runQuery(`INSERT INTO pedidos (usuario_id, estado, total) VALUES (?, 'pendiente', 0) RETURNING id`, [usuario_id]);
		const pedidoId = create.rows[0].id;

		let total = 0;
		for (const it of items) {
			const { postre_id, cantidad } = it;
			if (!postre_id || !cantidad || cantidad <= 0) continue;
			const prodRes = await runQuery(`SELECT id, precio, cantidad_disponible FROM postres WHERE id = ?`, [postre_id]);
			if (prodRes.rows.length === 0) return res.status(400).json({ error: `postre ${postre_id} no existe` });
			const prod = prodRes.rows[0];
			if (prod.cantidad_disponible < cantidad) return res.status(400).json({ error: `stock insuficiente para postre ${postre_id}` });

			const precioUnit = prod.precio;
			const subtotal = precioUnit * cantidad;
			total += subtotal;

			await runQuery(
				`INSERT INTO pedido_items (pedido_id, postre_id, cantidad, precio_unitario, subtotal) VALUES (?,?,?,?,?)`,
				[pedidoId, postre_id, cantidad, precioUnit, subtotal]
			);
		}

		await runQuery(`UPDATE pedidos SET total = ?, actualizado_en = datetime('now') WHERE id = ?`, [total, pedidoId]);

		res.status(201).json({ id: pedidoId, total, estado: 'pendiente' });
	} catch (err) {
		res.status(500).json({ error: 'Error al crear pedido' });
	}
});

// Listar pedidos
router.get('/', async (_req, res) => {
	try {
		const result = await runQuery(`SELECT * FROM pedidos ORDER BY id DESC`);
		res.json(result.rows);
	} catch (err) {
		res.status(500).json({ error: 'Error al listar pedidos' });
	}
});

router.get('/usuario/:usuario_id', async (req, res) => {
	try {
		const result = await runQuery(`SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY id DESC`, [req.params.usuario_id]);
		res.json(result.rows);
	} catch (err) {
		res.status(500).json({ error: 'Error al listar pedidos del usuario' });
	}
});

// Obtener pedido con items
router.get('/:id', async (req, res) => {
	try {
		const p = await runQuery(`SELECT * FROM pedidos WHERE id = ?`, [req.params.id]);
		if (p.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
		const items = await runQuery(`SELECT * FROM pedido_items WHERE pedido_id = ?`, [req.params.id]);
		res.json({ ...p.rows[0], items: items.rows });
	} catch (err) {
		res.status(500).json({ error: 'Error al obtener pedido' });
	}
});

// Actualizar estado del pedido, y si aprueba, descontar stock
router.patch('/:id/estado', async (req, res) => {
	const { estado } = req.body; // pendiente | rechazado | aprobado
	if (!['pendiente','rechazado','aprobado'].includes(estado)) return res.status(400).json({ error: 'estado inválido' });
	try {
		const p = await runQuery(`SELECT estado FROM pedidos WHERE id = ?`, [req.params.id]);
		if (p.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
		const current = p.rows[0].estado;
		if (current === estado) return res.json({ message: 'Sin cambios' });

		if (estado === 'aprobado' && current !== 'aprobado') {
			const items = await runQuery(`SELECT postre_id, cantidad FROM pedido_items WHERE pedido_id = ?`, [req.params.id]);
			for (const it of items.rows) {
				const stock = await runQuery(`SELECT cantidad_disponible FROM postres WHERE id = ?`, [it.postre_id]);
				if (stock.rows.length === 0) return res.status(400).json({ error: `postre ${it.postre_id} no existe` });
				if (stock.rows[0].cantidad_disponible < it.cantidad) return res.status(400).json({ error: `stock insuficiente en aprobación para postre ${it.postre_id}` });
				await runQuery(`UPDATE postres SET cantidad_disponible = cantidad_disponible - ? WHERE id = ?`, [it.cantidad, it.postre_id]);
			}
		}

		await runQuery(`UPDATE pedidos SET estado = ?, actualizado_en = datetime('now') WHERE id = ?`, [estado, req.params.id]);
		res.json({ message: 'Estado actualizado' });
	} catch (err) {
		res.status(500).json({ error: 'Error al actualizar estado' });
	}
});

// Eliminar pedido (y sus items)
router.delete('/:id', async (req, res) => {
	try {
		await runQuery(`DELETE FROM pedido_items WHERE pedido_id = ?`, [req.params.id]);
		await runQuery(`DELETE FROM pedidos WHERE id = ?`, [req.params.id]);
		res.json({ message: 'Pedido eliminado' });
	} catch (err) {
		res.status(500).json({ error: 'Error al eliminar pedido' });
	}
});

module.exports = router;
