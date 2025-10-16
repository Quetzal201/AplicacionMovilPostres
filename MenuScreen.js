import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Modal, Pressable, SafeAreaView, StatusBar, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useUser } from './contexts/UserContext';
import { getPostres, createPostre, updatePostre, deletePostre, createOrder } from './api';

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
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [orderSuccess, setOrderSuccess] = React.useState(false);
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
    if (selectedItem) {
      // Check if item already in cart
      const existingItemIndex = cartItems.findIndex(item => item.id === selectedItem.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedCart = [...cartItems];
        updatedCart[existingItemIndex].qty += 1;
        setCartItems(updatedCart);
      } else {
        // Add new item to cart
        setCartItems([...cartItems, { ...selectedItem, qty: 1 }]);
      }
      
      setIsModalVisible(false);
      Alert.alert('¡Añadido!', `${selectedItem.nombre} ha sido añadido al carrito`);
    }
  };

  const updateCartItemQty = (itemId, newQty) => {
    if (newQty < 1) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(cartItems.map(item => 
      item.id === itemId ? { ...item, qty: newQty } : item
    ));
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const incrementItem = (id) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      updateCartItemQty(id, item.qty + 1);
    }
  };

  const decrementItem = (id) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      updateCartItemQty(id, item.qty - 1);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.precio * item.qty), 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para realizar un pedido');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos al carrito antes de pagar');
      return;
    }

    try {
      setIsCheckingOut(true);
      
      // Prepare order items for the API
      const orderItems = cartItems.map(item => ({
        postre_id: item.id,
        cantidad: item.qty
      }));

      // Create the order
      await createOrder(user.id, orderItems);
      
      // Clear cart and show success
      setCartItems([]);
      setOrderSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartVisible(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error al realizar el pedido:', error);
      Alert.alert('Error', 'No se pudo completar el pedido. Por favor, inténtalo de nuevo.');
    } finally {
      setIsCheckingOut(false);
    }
  };

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
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{selectedItem.nombre}</Text>
                    <Pressable style={styles.modalClose} onPress={closeModal}><Text style={styles.modalCloseText}>✕</Text></Pressable>
                  </View>
                  <View style={styles.divider} />
                  <Text style={styles.modalLabel}>Descripción</Text>
                  <Text style={styles.modalText}>{selectedItem.descripcion || 'Sin descripción'}</Text>
                  <Text style={[styles.modalText, { marginTop: 8 }]}>Cantidad disponible: {selectedItem.cantidad_disponible || 0}</Text>
                  <Text style={styles.modalPrice}>$ {selectedItem.precio}</Text>

                  {isAdmin() && (
                    <TouchableOpacity
                      style={[styles.primaryButton]}
                      onPress={() => {
                        closeModal();
                        openEditModal(selectedItem);
                      }}
                    >
                      <Text style={styles.primaryButtonText}>Editar</Text>
                    </TouchableOpacity>
                  )}

                  {!isAdmin() && (
                    <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#22c55e' }]} onPress={addToCart}>
                      <Text style={styles.primaryButtonText}>Agregar al carrito</Text>
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
            <View style={[styles.modalCard, styles.sheetCard]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Carrito</Text>
                <Pressable style={styles.modalClose} onPress={() => setIsCartVisible(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </Pressable>
              </View>
              <View style={styles.divider} />

              {orderSuccess ? (
                <View style={styles.successContainer}>
                  <Text style={styles.successText}>¡Pedido realizado con éxito!</Text>
                  <Text style={styles.successSubtext}>Puedes ver el estado de tu pedido en la sección de Mis Pedidos</Text>
                </View>
              ) : (
                <>
                  {cartItems.length === 0 ? (
                    <View style={styles.emptyCartContainer}>
                      <Text style={styles.emptyCartText}>Tu carrito está vacío</Text>
                      <Text style={styles.emptyCartSubtext}>Agrega productos para continuar</Text>
                    </View>
                  ) : (
                    <>
                      <FlatList
                        data={cartItems}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                          <View style={styles.cartItem}>
                            <View style={styles.cartItemInfo}>
                              <Text style={styles.cartItemName} numberOfLines={1}>{item.nombre}</Text>
                              <Text style={styles.cartItemPrice}>${(item.precio * item.qty).toFixed(2)}</Text>
                            </View>
                            <View style={styles.cartItemActions}>
                              <TouchableOpacity 
                                style={[styles.qtyButton, styles.qtyButtonMinus]}
                                onPress={() => decrementItem(item.id)}
                              >
                                <Text style={styles.qtyButtonText}>−</Text>
                              </TouchableOpacity>
                              <Text style={styles.cartItemQty}>{item.qty}</Text>
                              <TouchableOpacity 
                                style={[styles.qtyButton, styles.qtyButtonPlus]}
                                onPress={() => incrementItem(item.id)}
                              >
                                <Text style={styles.qtyButtonText}>＋</Text>
                              </TouchableOpacity>
                              <TouchableOpacity 
                                style={styles.removeButton}
                                onPress={() => removeFromCart(item.id)}
                              >
                                <Text style={styles.removeButtonText}>✕</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                        contentContainerStyle={{ paddingBottom: 16 }}
                      />
                      <View style={styles.cartFooter}>
                        <View style={styles.totalContainer}>
                          <Text style={styles.totalLabel}>Total:</Text>
                          <Text style={styles.totalAmount}>${calculateTotal()}</Text>
                        </View>
                        <TouchableOpacity 
                          style={[styles.primaryButton, styles.checkoutButton, isCheckingOut && styles.checkoutButtonDisabled]}
                          onPress={handleCheckout}
                          disabled={isCheckingOut}
                        >
                          {isCheckingOut ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <Text style={styles.primaryButtonText}>Realizar Pedido</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </>
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
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Agregar Postre</Text>
                <Pressable style={styles.modalClose} onPress={closeAddModal}><Text style={styles.modalCloseText}>✕</Text></Pressable>
              </View>
              <View style={styles.divider} />

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

              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colorPrimario }]} onPress={handleCreatePostre}>
                <Text style={styles.primaryButtonText}>Crear Postre</Text>
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
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar Postre</Text>
                <Pressable style={styles.modalClose} onPress={closeEditModal}><Text style={styles.modalCloseText}>✕</Text></Pressable>
              </View>
              <View style={styles.divider} />

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

              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colorPrimario }]} onPress={handleUpdatePostre}>
                <Text style={styles.primaryButtonText}>Actualizar Postre</Text>
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalClose: {
    padding: 6,
    borderRadius: 16,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#4B5563',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  sheetCard: {
    maxHeight: '80%',
  },
  // Cart styles
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 10,
  },
  cartItemName: {
    fontWeight: '600',
    color: '#111827',
  },
  cartItemPrice: {
    marginTop: 2,
    color: '#6B7280',
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  qtyButtonMinus: {
    backgroundColor: '#FEE2E2',
  },
  qtyButtonPlus: {
    backgroundColor: '#DCFCE7',
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cartItemQty: {
    width: 28,
    textAlign: 'center',
    fontWeight: '600',
    color: '#111827',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginLeft: 4,
  },
  removeButtonText: {
    color: '#EF4444',
    fontWeight: '800',
  },
  cartFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalLabel: {
    fontWeight: '700',
  },
  totalAmount: {
    fontWeight: '700',
    color: '#111827',
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  checkoutButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  emptyCartContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyCartText: {
    fontWeight: '700',
    color: '#111827',
  },
  emptyCartSubtext: {
    marginTop: 4,
    color: '#6B7280',
  },
  successContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  successText: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  successSubtext: {
    color: '#6B7280',
    textAlign: 'center',
  },
});
