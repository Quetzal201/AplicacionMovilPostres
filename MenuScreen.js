import React from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';

export default function MenuScreen() {
  const items = [
    { id: '1', src: require('./assets/icon.png') },
    { id: '2', src: require('./assets/icon.png') },
    { id: '3', src: require('./assets/icon.png') },
    { id: '4', src: require('./assets/icon.png') },
    { id: '5', src: require('./assets/icon.png') },
    { id: '6', src: require('./assets/icon.png') },
  ];
  const renderItem = ({ item }) => (
    <View style={styles.cardItem}>
      <Image source={item.src} style={{ width: 70, height: 70, resizeMode: 'cover' }} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.menuHeader}>
        <Text style={styles.menuTitle}>Menu</Text>
        <Text style={styles.cartIcon}>🛒</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  menuHeader: {
    width: '100%',
    paddingTop: 12,
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
});
