import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Modal, Pressable, SafeAreaView } from 'react-native';

export default function MenuScreen() {
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [isCartVisible, setIsCartVisible] = React.useState(false);
  const [cartItems, setCartItems] = React.useState([]); // {id, name, price, qty}
  const colorPrimario = '#ff1fa9';

  const items = [
    { id: '1', name: 'Pastel', description: 'Pastel de chocolate con nuez', stock: 8, price: 300, src: require('./assets/icon.png') },
    { id: '2', name: 'Galletas', description: 'Galletas surtidas', stock: 15, price: 50, src: require('./assets/icon.png') },
    { id: '3', name: 'Cupcake', description: 'Cupcake de vainilla', stock: 10, price: 45, src: require('./assets/icon.png') },
    { id: '4', name: 'Pay', description: 'Pay de limón', stock: 6, price: 120, src: require('./assets/icon.png') },
    { id: '5', name: 'Brownie', description: 'Brownie con nuez', stock: 12, price: 60, src: require('./assets/icon.png') },
    { id: '6', name: 'Cheesecake', description: 'Cheesecake fresa', stock: 5, price: 140, src: require('./assets/icon.png') },
  ];

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.cardItem} onPress={() => openModal(item)}>
      <Image source={item.src} style={{ width: 70, height: 70, resizeMode: 'cover' }} />
      <Text style={styles.cardTitle}>{item.name}</Text>
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
      return [...prev, { id: selectedItem.id, name: selectedItem.name, price: selectedItem.price, qty: 1 }];
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>Menu</Text>
          <TouchableOpacity onPress={() => setIsCartVisible(true)}>
            <Text style={styles.cartIcon}>🛒</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          data={items}
          renderItem={renderItem}
          keyExtractor={(it) => it.id}
          numColumns={2}
          style={{ width: '100%' }}
        />
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
                    <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                    <Pressable onPress={closeModal}><Text style={{ fontSize: 18 }}>✕</Text></Pressable>
                  </View>
                  <Text style={styles.modalLabel}>Descripción:</Text>
                  <Text style={styles.modalText}>{selectedItem.description}</Text>
                  <Text style={[styles.modalText, { marginTop: 8 }]}>Cantidad disponible: {selectedItem.stock}</Text>
                  <Text style={[styles.modalPrice]}>$ {selectedItem.price}</Text>
                  <TouchableOpacity style={[styles.addButton, { backgroundColor: '#22c55e' }]} onPress={addToCart}>
                    <Text style={styles.addButtonText}>Agregar</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

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
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
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
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  },
  cardTitle: {
    marginTop: 8,
    fontWeight: '600',
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
  addButton: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
