import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Modal, Pressable, SafeAreaView, StatusBar, TextInput, Alert } from 'react-native';
import { useUser } from './contexts/UserContext';
import { getPostres, createPostre, updatePostre, deletePostre } from './api';

export default function MenuScreen() {
  const { isAdmin, user } = useUser();
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [isCartVisible, setIsCartVisible] = React.useState(false);
  const [cartItems, setCartItems] = React.useState([]); // {id, name, price, qty}
  const [items, setItems] = React.useState([]); // Datos de la API
  const [loading, setLoading] = React.useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = React.useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState(null);
  const [formData, setFormData] = React.useState({ nombre: '', descripcion: '', cantidad_disponible: '', precio: '' });
  const colorPrimario = '#ff1fa9';

  // Cargar postres desde la API
  React.useEffect(() => {
    loadPostres();
  }, []);

  const loadPostres = async () => {
    try {
      setLoading(true);
      const postres = await getPostres();
      setItems(postres);
    } catch (error) {
      console.error('Error loading postres:', error);
      Alert.alert('Error', 'No se pudieron cargar los postres');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  const openAddModal = () => {
    setFormData({ nombre: '', descripcion: '', cantidad_disponible: '', precio: '' });
    setIsAddModalVisible(true);
  };

  const closeAddModal = () => {
    setIsAddModalVisible(false);
    setFormData({ nombre: '', descripcion: '', cantidad_disponible: '', precio: '' });
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      cantidad_disponible: item.cantidad_disponible?.toString() || '0',
      precio: item.precio?.toString() || ''
    });
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditingItem(null);
    setFormData({ nombre: '', descripcion: '', cantidad_disponible: '', precio: '' });
  };

  const handleCreatePostre = async () => {
    try {
      if (!formData.nombre || !formData.precio) {
        Alert.alert('Error', 'Nombre y precio son requeridos');
        return;
      }

      await createPostre({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        cantidad_disponible: parseInt(formData.cantidad_disponible) || 0,
        precio: parseFloat(formData.precio)
      });

      Alert.alert('Éxito', 'Postre creado correctamente');
      closeAddModal();
      loadPostres(); // Recargar la lista
    } catch (error) {
      console.error('Error creating postre:', error);
      Alert.alert('Error', 'No se pudo crear el postre');
    }
  };

  const handleUpdatePostre = async () => {
    try {
      if (!editingItem) return;

      await updatePostre(editingItem.id, {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        cantidad_disponible: parseInt(formData.cantidad_disponible) || 0,
        precio: parseFloat(formData.precio)
      });

      Alert.alert('Éxito', 'Postre actualizado correctamente');
      closeEditModal();
      loadPostres(); // Recargar la lista
    } catch (error) {
      console.error('Error updating postre:', error);
      Alert.alert('Error', 'No se pudo actualizar el postre');
    }
  };

  const handleDeletePostre = async (item) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar "${item.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePostre(item.id);
              Alert.alert('Éxito', 'Postre eliminado correctamente');
              loadPostres(); // Recargar la lista
            } catch (error) {
              console.error('Error deleting postre:', error);
              Alert.alert('Error', 'No se pudo eliminar el postre');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.cardItem} onPress={() => openModal(item)}>
      <Image source={require('./assets/icon.png')} style={{ width: 70, height: 70, resizeMode: 'cover' }} />
      <Text style={styles.cardTitle}>{item.nombre}</Text>
      {isAdmin() && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePostre(item)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const addToCart = () => {
    if (!selectedItem) return;
    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === selectedItem.id);
      if (existing) {
        const newQty = Math.min(existing.qty + 1, 10);
        return prev.map((p) => (p.id === existing.id ? { ...p, qty: newQty } : p));
      }
      return [...prev, { id: selectedItem.id, name: selectedItem.nombre, price: selectedItem.precio, qty: 1 }];
    });
    setIsModalVisible(false);
    setSelectedItem(null);
    setIsCartVisible(true);
  };

  const incrementItem = (id) => {
    setCartItems((prev) => prev
      .map((p) => (p.id === id ? { ...p, qty: Math.min(p.qty + 1, 10) } : p)));
  };

  const decrementItem = (id) => {
    setCartItems((prev) => {
      const updated = prev
        .map((p) => (p.id === id ? { ...p, qty: Math.max(p.qty - 1, 0) } : p))
        .filter((p) => p.qty > 0);
      return updated;
    });
  };

  const cartTotal = cartItems.reduce((sum, it) => sum + it.price * it.qty, 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>Cargando postres...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.menuHeader}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Text style={styles.menuTitle}>Menu {isAdmin() ? '(Admin)' : '(Cliente)'}</Text>
            {/* Solo mostrar carrito si NO es admin */}
            {!isAdmin() && (
              <TouchableOpacity onPress={() => setIsCartVisible(true)}>
                <Text style={styles.cartIcon}>🛒</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.userInfo}>Usuario: {user?.correo || 'N/A'} | Priv: {user?.privilegio || 'N/A'}</Text>
        </View>

        {/* Botón "+" circular solo para administradores */}
        {isAdmin() && (
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}

        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          data={items}
          renderItem={renderItem}
          keyExtractor={(it) => it.id.toString()}
          numColumns={2}
          style={{ width: '100%' }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isAdmin() 
                  ? 'No hay postres. Usa el botón "+" para agregar uno.' 
                  : 'Cargando postres...'}
              </Text>
            </View>
          }
        />

        {/* Modal de detalles del postre */}
        <Modal
          transparent
          visible={isModalVisible}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {selectedItem && (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.modalTitle}>{selectedItem.nombre}</Text>
                    <Pressable onPress={closeModal}><Text style={{ fontSize: 18 }}>✕</Text></Pressable>
                  </View>
                  <Text style={styles.modalLabel}>Descripción:</Text>
                  <Text style={styles.modalText}>{selectedItem.descripcion || 'Sin descripción'}</Text>
                  <Text style={[styles.modalText, { marginTop: 8 }]}>Cantidad disponible: {selectedItem.cantidad_disponible || 0}</Text>
                  <Text style={[styles.modalPrice]}>$ {selectedItem.precio}</Text>

                  {/* Botón de editar para administradores */}
                  {isAdmin() && (
                    <TouchableOpacity
                      style={[styles.editButton, { backgroundColor: colorPrimario }]}
                      onPress={() => {
                        closeModal();
                        openEditModal(selectedItem);
                      }}
                    >
                      <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                  )}

                  {/* Botón de agregar al carrito solo para NO administradores */}
                  {!isAdmin() && (
                    <TouchableOpacity style={[styles.addButton, { backgroundColor: '#22c55e' }]} onPress={addToCart}>
                      <Text style={styles.addButtonText}>Agregar</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Modal de carrito */}
        <Modal
          transparent
          visible={isCartVisible}
          animationType="fade"
          onRequestClose={() => setIsCartVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.modalTitle}>Carrito</Text>
                <Pressable onPress={() => setIsCartVisible(false)}><Text style={{ fontSize: 18 }}>✕</Text></Pressable>
              </View>

              {cartItems.length === 0 ? (
                <Text style={{ marginTop: 12 }}>Tu carrito está vacío</Text>
              ) : (
                <View style={{ marginTop: 12 }}>
                  {cartItems.map((it) => (
                    <View key={it.id} style={styles.cartRow}>
                      <Text style={{ flex: 1 }}>{it.name}</Text>
                      <View style={styles.qtyBox}>
                        <TouchableOpacity onPress={() => decrementItem(it.id)}>
                          <Text style={styles.qtyBtn}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{it.qty}</Text>
                        <TouchableOpacity onPress={() => incrementItem(it.id)}>
                          <Text style={styles.qtyBtn}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  <Text style={[styles.modalText, { marginTop: 8 }]}>Total: {cartTotal}</Text>
                  <TouchableOpacity style={[styles.addButton, { backgroundColor: '#22c55e' }]}>
                    <Text style={styles.addButtonText}>Comprar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Modal para agregar postre */}
        <Modal
          transparent
          visible={isAddModalVisible}
          animationType="fade"
          onRequestClose={closeAddModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.modalTitle}>Agregar Postre</Text>
                <Pressable onPress={closeAddModal}><Text style={{ fontSize: 18 }}>✕</Text></Pressable>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Nombre del postre"
                value={formData.nombre}
                onChangeText={(text) => setFormData({ ...formData, nombre: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Descripción"
                value={formData.descripcion}
                onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                multiline
              />
              <TextInput
                style={styles.input}
                placeholder="Cantidad disponible"
                value={formData.cantidad_disponible}
                onChangeText={(text) => setFormData({ ...formData, cantidad_disponible: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Precio"
                value={formData.precio}
                onChangeText={(text) => setFormData({ ...formData, precio: text })}
                keyboardType="numeric"
              />

              <TouchableOpacity style={[styles.addButton, { backgroundColor: colorPrimario }]} onPress={handleCreatePostre}>
                <Text style={styles.addButtonText}>Crear Postre</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal para editar postre */}
        <Modal
          transparent
          visible={isEditModalVisible}
          animationType="fade"
          onRequestClose={closeEditModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.modalTitle}>Editar Postre</Text>
                <Pressable onPress={closeEditModal}><Text style={{ fontSize: 18 }}>✕</Text></Pressable>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Nombre del postre"
                value={formData.nombre}
                onChangeText={(text) => setFormData({ ...formData, nombre: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Descripción"
                value={formData.descripcion}
                onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                multiline
              />
              <TextInput
                style={styles.input}
                placeholder="Cantidad disponible"
                value={formData.cantidad_disponible}
                onChangeText={(text) => setFormData({ ...formData, cantidad_disponible: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Precio"
                value={formData.precio}
                onChangeText={(text) => setFormData({ ...formData, precio: text })}
                keyboardType="numeric"
              />

              <TouchableOpacity style={[styles.addButton, { backgroundColor: colorPrimario }]} onPress={handleUpdatePostre}>
                <Text style={styles.addButtonText}>Actualizar Postre</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f1f1f1',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '700',
  },
  qtyText: {
    width: 28,
    textAlign: 'center',
    fontWeight: '600',
  },
  menuHeader: {
    width: '100%',
    paddingTop: StatusBar.currentHeight, // Asegura que el contenido esté debajo de la barra de estado
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  cartIcon: {
    fontSize: 20,
  },
  cardItem: {
    width: '48%',
    height: 120,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 16,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    position: 'relative',
  },
  cardTitle: {
    marginTop: 8,
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 120, // Aumentado para evitar conflicto con barra de navegación
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff1fa9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 10, // Agregado elevation para Android
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    fontSize: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalLabel: {
    marginTop: 12,
    fontWeight: '600',
  },
  modalText: {
    marginTop: 6,
    color: '#333',
  },
  modalPrice: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
