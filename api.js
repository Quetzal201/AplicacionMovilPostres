// Simple API helper for React Native with Android emulator support
const getBaseUrl = () => {
  // On Android emulator, localhost refers to the emulator itself; use 10.0.2.2
  // On iOS simulator or web, localhost works fine
  // We'll detect platform at runtime without importing from react-native to keep this file lean
  try {
    // Dynamically require to avoid circular deps when bundling
    const { Platform } = require('react-native');
    if (Platform.OS === 'android') {
      return 'https://api-aplicacion-movil-nine.vercel.app';
    }
  } catch (e) {
    // Fallback to localhost if Platform is not available
  }
  return 'https://api-aplicacion-movil-nine.vercel.app';
};

export const API_BASE = getBaseUrl();

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  // Debug: log outgoing request
  try {
    console.log('[apiFetch][request]', {
      method: (options.method || 'GET'),
      url,
      path,
      body: options.body ? safeJsonParse(options.body) : undefined,
    });
  } catch (e) {
    // ignore logging errors
  }

  const response = await fetch(url, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  // Debug: log incoming response
  try {
    console.log('[apiFetch][response]', {
      url,
      status: response.status,
      ok: response.ok,
      data,
    });
  } catch (e) {
    // ignore logging errors
  }
  if (!response.ok) {
    const message = isJson && data && data.error ? data.error : `HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

// Helper para evitar romper logs al parsear cuerpos JSON como string
function safeJsonParse(str) {
  try { return JSON.parse(str); } catch { return str; }
}

export async function registerUser({ correo, contrasena, privilegio = 'cliente' }) {
  return apiFetch('/api/usuarios', {
    method: 'POST',
    body: JSON.stringify({ correo, contrasena, privilegio }),
  });
}

export async function loginUser({ email, password }) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Funciones CRUD para postres
export async function getPostres() {
  return apiFetch('/api/postres');
}

export async function getPostreById(id) {
  return apiFetch(`/api/postres/${id}`);
}

export async function createPostre(postreData) {
  return apiFetch('/api/postres', {
    method: 'POST',
    body: JSON.stringify(postreData),
  });
}

export async function updatePostre(id, postreData) {
  return apiFetch(`/api/postres/${id}`, {
    method: 'PUT',
    body: JSON.stringify(postreData),
  });
}

export async function deletePostre(id) {
  return apiFetch(`/api/postres/${id}`, {
    method: 'DELETE',
  });
}

// Funciones para pedidos
export async function createOrder(usuarioId, items) {
  return apiFetch('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify({ usuario_id: usuarioId, items }),
  });
}

export async function getOrders(userId, isAdminUser) {
  const path = isAdminUser ? '/api/pedidos' : `/api/pedidos/usuario/${userId}`;
  return apiFetch(path);
}

export async function updateOrderStatus(orderId, newStatus) {
  return apiFetch(`/api/pedidos/${orderId}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: newStatus }),
  });
}

// Obtener detalles de un pedido específico
export async function getOrderDetails(orderId) {
  return apiFetch(`/api/pedidos/${orderId}`);
}

// Obtener items de un pedido
export async function getOrderItems(orderId) {
  return apiFetch(`/api/pedidos/${orderId}/items`);
}


