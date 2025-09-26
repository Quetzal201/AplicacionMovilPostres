import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';

const pedidosData = [
  {
    id: '1',
    nombre: 'Pedido 1',
    estado: 'completado', // 'completado', 'en_proceso', 'pendiente'
    detalles: [
      { item: '1 Pastel', cantidad: 1 },
      { item: '2 Pays', cantidad: 2 },
    ],
    total: 340,
  },
  {
    id: '2',
    nombre: 'Pedido 2',
    estado: 'en_proceso',
    detalles: [
      { item: '3 Galletas', cantidad: 3 },
      { item: '1 Café', cantidad: 1 },
    ],
    total: 120,
  },
  {
    id: '3',
    nombre: 'Pedido 3',
    estado: 'pendiente',
    detalles: [
      { item: '4 Donas', cantidad: 4 },
    ],
    total: 80,
  },
];

const EstadoIndicador = ({ estado }) => {
  let color = 'gray';
  if (estado === 'completado') {
    color = 'green';
  } else if (estado === 'en_proceso') {
    color = 'orange';
  } else if (estado === 'pendiente') {
    color = 'red';
  }
  return <View style={[styles.estadoCirculo, { backgroundColor: color }]} />;
};

const AccordionItem = ({ pedido }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.accordionCard}>
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.accordionHeader}>
        <Text style={styles.accordionTitle}>{pedido.nombre}</Text>
        <EstadoIndicador estado={pedido.estado} />
        <Text style={styles.arrow}>{isOpen ? '^' : 'v'}</Text>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.accordionContent}>
          {pedido.detalles.map((detalle, index) => (
            <Text key={index} style={styles.detalleText}>- {detalle.item}</Text>
          ))}
          <Text style={styles.totalText}>TOTAL: {pedido.total}</Text>
        </View>
      )}
    </View>
  );
};

export default function PedidosScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Pedidos</Text>
        </View>
        <ScrollView style={styles.scrollView}>
          {pedidosData.map((pedido) => (
            <AccordionItem key={pedido.id} pedido={pedido} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: StatusBar.currentHeight, // Asegura que el contenido esté debajo de la barra de estado
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  // backButton y refreshIcon ya no son necesarios
  // backButton: {
  //   padding: 5,
  // },
  // refreshIcon: {
  //   fontSize: 24,
  //   color: '#ff1fa9',
  // },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  accordionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  estadoCirculo: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  arrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  accordionContent: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#fdfdfd',
  },
  detalleText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 5,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'right',
    color: '#333',
  },
});
