// ========================================
// CONFIGURACIÓN DE FIREBASE - PLANTILLA
// ========================================
// INSTRUCCIONES:
// 1. Copia este archivo como config.js
// 2. Reemplaza los valores con tus credenciales reales
// 3. NUNCA subas config.js a GitHub

const FIREBASE_CONFIG = {
  databaseURL: "https://tu-proyecto.firebaseio.com",
  projectId: "tu-proyecto-id",
  // Agregar aquí otras configuraciones de Firebase si es necesario
  // apiKey: "tu-api-key",
  // authDomain: "tu-proyecto.firebaseapp.com",
  // storageBucket: "tu-proyecto.appspot.com",
  // messagingSenderId: "123456789",
  // appId: "1:123456789:web:abcdef123456"
};

// Exportar configuración
window.FIREBASE_CONFIG = FIREBASE_CONFIG;

console.log('✅ Configuración de Firebase cargada');
