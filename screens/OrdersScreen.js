import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { getOrders, updateOrderStatus } from '../api';
import { API_BASE } from '../api';

const OrderStatus = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'aprobado': return '#10B981'; // verde
      case 'pendiente': return '#F59E0B'; // amarillo
      case 'rechazado': return '#EF4444'; // rojo
      default: return '#9CA3AF'; // gris
    }
  };

  return (
    <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
  );
};

const OrderItem = ({ item, isAdmin, onStatusUpdate }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Pedido #{item.id}</Text>
        <View style={styles.orderStatus}>
          <Text style={styles.statusText}>{item.estado.toUpperCase()}</Text>
          <OrderStatus status={item.estado} />
        </View>
      </View>
      
      <Text style={styles.orderDate}>{formatDate(item.fecha_creacion)}</Text>
      <Text style={styles.orderTotal}>Total: ${item.total.toFixed(2)}</Text>
      
      {isAdmin && (
        <View style={styles.adminActions}>
          <Text style={styles.sectionTitle}>Acciones:</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => onStatusUpdate(item.id, 'aprobado')}>
              <Text style={styles.actionButtonText}>Aprobar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => onStatusUpdate(item.id, 'rechazado')}>
              <Text style={styles.actionButtonText}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default function OrdersScreen({ refreshKey }) {
  const { user, isAdmin } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('OrdersScreen - Cargando pedidos para usuario:', user.id, 'isAdmin:', isAdmin());
      const data = await getOrders(user.id, isAdmin());
      console.log('OrdersScreen - Datos recibidos:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('OrdersScreen - Error cargando pedidos:', error);
      Alert.alert('Error', `No se pudieron cargar tus pedidos: ${error.message || 'Error de conexión'}`);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user, refreshKey]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders(); // Recargar la lista
      Alert.alert('Éxito', `Pedido ${newStatus} correctamente`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado del pedido');
      console.error(error);
    }
  };

  const testConnection = async () => {
    try {
      console.log('Testing connection to:', `${API_BASE}/api/postres`);
      const response = await fetch(`${API_BASE}/api/postres`);
      console.log('Connection test response:', response.status, response.statusText);
      if (response.ok) {
        Alert.alert('Conexión OK', 'El servidor responde correctamente');
      } else {
        Alert.alert('Error de conexión', `Servidor respondió con código ${response.status}`);
      }
    } catch (error) {
      console.error('Connection test error:', error);
      Alert.alert('Error de conexión', `No se pudo conectar al servidor: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Mis Pedidos</Text>
          <TouchableOpacity onPress={loadOrders}>
            <Text style={styles.refreshIcon}>⟳</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.centerContainer}>
            <Text>Cargando pedidos...</Text>
            <Text style={styles.debugText}>API: {API_BASE}</Text>
            <Text style={styles.debugText}>Usuario ID: {user?.id || 'N/A'}</Text>
            <Text style={styles.debugText}>Es Admin: {isAdmin() ? 'Sí' : 'No'}</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No hay pedidos para mostrar</Text>
            <Text style={styles.debugText}>¿Has realizado algún pedido?</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.testButton} onPress={testConnection}>
              <Text style={styles.testButtonText}>Probar Conexión</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <OrderItem 
                item={item} 
                isAdmin={isAdmin()} 
                onStatusUpdate={handleStatusUpdate} 
              />
            )}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: StatusBar.currentHeight + 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f2937',
  },
  listContainer: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginRight: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  orderDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
  },
  adminActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  approveButton: {
    backgroundColor: '#d1fae5',
  },
  rejectButton: {
    backgroundColor: '#fee2e2',
  },
  actionButtonText: {
    color: '#1f2937',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 32,
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  testButton: {
    backgroundColor: '#6B7280',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
