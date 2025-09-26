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
  const response = await fetch(url, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();
  if (!response.ok) {
    const message = isJson && data && data.error ? data.error : `HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
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


