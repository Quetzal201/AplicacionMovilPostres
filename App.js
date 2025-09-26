import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { registerUser, loginUser, API_BASE } from './api';
import MenuScreen from './MenuScreen';
import PedidosScreen from './PedidosScreen';

export default function App() {
  const [mode, setMode] = React.useState('login'); // 'login' | 'register'
  const [correo, setCorreo] = React.useState('');
  const [contrasena, setContrasena] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [currentScreen, setCurrentScreen] = React.useState('menu'); // 'menu' | 'pedidos' 

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
        setCurrentScreen('menu'); // Asegurarse de que al iniciar sesión se va al menú
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    setLoggedIn(false);
    setCurrentScreen('login'); // Volver a la pantalla de login al cerrar sesión
  };

  const handleNavigateToPedidos = () => {
    setCurrentScreen('pedidos');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
  };

  if (loggedIn) {
    return (
      <View style={styles.appContainer}>
        {currentScreen === 'menu' && (
          <MenuScreen onLogout={handleLogout} onNavigateToPedidos={handleNavigateToPedidos} />
        )}
        {currentScreen === 'pedidos' && (
          <PedidosScreen onBackToMenu={handleBackToMenu} />
        )}
        <View style={[styles.bottomBar, { backgroundColor: colorPrimario }]}>
          <TouchableOpacity onPress={handleBackToMenu}>
            <Text style={styles.bottomIcon}>🧁</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNavigateToPedidos}>
            <Text style={styles.bottomIcon}>🚚</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.bottomIcon}>🚪</Text>
          </TouchableOpacity>
        </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
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
