import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, FlatList } from 'react-native';
import React from 'react';
import { registerUser, loginUser, API_BASE } from './api';

export default function App() {
  const [mode, setMode] = React.useState('login'); // 'login' | 'register'
  const [correo, setCorreo] = React.useState('');
  const [contrasena, setContrasena] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState(false);

  const colorPrimario = '#ff1fa9';

  const onSubmit = async () => {
    try {
      setLoading(true);
      if (mode === 'register') {
        await registerUser({ correo, contrasena });
        Alert.alert('Éxito', 'Usuario creado. Ahora inicia sesión.');
        setMode('login');
      } else {
        const data = await loginUser({ email: correo, password: contrasena });
        setLoggedIn(true);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  if (loggedIn) {
    return (
      <View style={styles.container}>
        <MenuScreen onLogout={() => setLoggedIn(false)} />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{mode === 'login' ? 'Inicio de Sesión' : 'Registro'}</Text>
        <Text style={styles.label}>{mode === 'login' ? 'Correo' : 'Correo'}</Text>
        <TextInput
          style={styles.input}
          placeholder="correo@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={correo}
          onChangeText={setCorreo}
        />
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          value={contrasena}
          onChangeText={setContrasena}
        />

        <TouchableOpacity disabled={loading} onPress={onSubmit} style={[styles.button, { backgroundColor: colorPrimario, opacity: loading ? 0.6 : 1 }]}> 
          <Text style={styles.buttonText}>{mode === 'login' ? 'Iniciar Sesión' : 'Registrarme'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <Text style={[styles.link, { color: colorPrimario }]}>
            {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.helper}>API: {API_BASE}</Text>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

function MenuScreen({ onLogout }) {
  const colorPrimario = '#ff1fa9';
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
    <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
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
      <View style={[styles.bottomBar, { backgroundColor: colorPrimario }]}>
        <Text style={styles.bottomIcon}>🧁</Text>
        <Text style={styles.bottomIcon}>🚚</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.bottomIcon}>🚪</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomIcon: {
    fontSize: 22,
    color: '#fff',
  },
  card: {
    width: '85%',
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  helper: {
    marginTop: 12,
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
  },
});
