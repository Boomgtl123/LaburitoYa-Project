# 🔥 Configurar Credenciales de Firebase

## ⚠️ Problema Actual

El error **401 Unauthorized** ocurre porque **faltan las credenciales completas de Firebase** en el archivo `config/config.js`.

Actualmente solo tienes:
```javascript
{
  databaseURL: "https://laburitoya-6e55d-default-rtdb.firebaseio.com",
  projectId: "laburitoya-6e55d"
}
```

Pero Firebase necesita **todas estas credenciales**:
```javascript
{
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

---

## 🎯 Solución: Obtener Credenciales de Firebase

### **Paso 1: Ir a Firebase Console**
1. Abre: https://console.firebase.google.com/
2. Selecciona tu proyecto: **laburitoya-6e55d**

### **Paso 2: Ir a Configuración del Proyecto**
1. Click en el ícono de **⚙️ (engranaje)** al lado de "Descripción general del proyecto"
2. Click en **"Configuración del proyecto"**

### **Paso 3: Obtener las Credenciales**
1. Baja hasta la sección **"Tus apps"**
2. Si ya tienes una app web, verás un ícono `</>`
3. Si NO tienes una app web:
   - Click en el ícono **`</>`** (Web)
   - Dale un nombre: "LaburitoYa Web"
   - Click en "Registrar app"

### **Paso 4: Copiar la Configuración**
Verás algo como esto:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdefghijklmnopqrst",
  authDomain: "laburitoya-6e55d.firebaseapp.com",
  databaseURL: "https://laburitoya-6e55d-default-rtdb.firebaseio.com",
  projectId: "laburitoya-6e55d",
  storageBucket: "laburitoya-6e55d.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};
```

### **Paso 5: Actualizar config/config.js**
1. Abre el archivo `config/config.js`
2. Reemplaza las credenciales con las tuyas:

```javascript
// ========== CONFIGURACIÓN DE FIREBASE ==========
// IMPORTANTE: Este archivo contiene información sensible
// NO compartir públicamente ni subir a repositorios públicos

const FIREBASE_CONFIG = {
  apiKey: "TU_API_KEY_AQUI",                    // ← Pegar tu apiKey
  authDomain: "laburitoya-6e55d.firebaseapp.com",
  databaseURL: "https://laburitoya-6e55d-default-rtdb.firebaseio.com",
  projectId: "laburitoya-6e55d",
  storageBucket: "laburitoya-6e55d.appspot.com",
  messagingSenderId: "TU_SENDER_ID_AQUI",      // ← Pegar tu messagingSenderId
  appId: "TU_APP_ID_AQUI"                      // ← Pegar tu appId
};

// Inicializar Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG);
  console.log('✅ Firebase inicializado correctamente');
} else {
  console.log('✅ Firebase ya estaba inicializado');
}

// Exportar configuración
window.FIREBASE_CONFIG = FIREBASE_CONFIG;

console.log('✅ Configuración de Firebase cargada');
```

### **Paso 6: Guardar y Probar**
1. Guarda el archivo `config/config.js`
2. Recarga tu aplicación
3. El error 401 debería desaparecer

---

## 📋 Checklist

- [ ] Ir a Firebase Console
- [ ] Abrir Configuración del proyecto (⚙️)
- [ ] Copiar todas las credenciales
- [ ] Pegar en `config/config.js`
- [ ] Guardar el archivo
- [ ] Recargar la aplicación
- [ ] Verificar que funciona

---

## 🔍 Verificación

### **Antes de configurar:**
```
❌ Error 401 Unauthorized
❌ Firebase no inicializado
❌ No se cargan datos
```

### **Después de configurar:**
```
✅ Firebase inicializado correctamente
✅ Conexión exitosa
✅ Datos se cargan
✅ Todo funciona
```

---

## 🎯 Resumen de Problemas y Soluciones

### **Problema 1: Redireccionamientos** ✅ RESUELTO
- Todos los archivos JS corregidos
- Navegación funciona correctamente

### **Problema 2: Credenciales Firebase** ⚠️ REQUIERE ACCIÓN
- Necesitas copiar credenciales de Firebase Console
- Pegar en `config/config.js`
- Es un paso de 3 minutos

---

## 📝 Ejemplo Visual

```
Firebase Console
    ↓
⚙️ Configuración del proyecto
    ↓
Tus apps → </> Web
    ↓
Copiar firebaseConfig
    ↓
Pegar en config/config.js
    ↓
Guardar archivo
    ↓
Recargar aplicación
    ↓
✅ TODO FUNCIONA
```

---

## 🔒 Seguridad

⚠️ **IMPORTANTE:** 
- NO subas `config/config.js` a GitHub
- Ya está en `.gitignore`
- Las credenciales son sensibles
- Mantén el archivo local

---

## ✅ Resultado Final

Después de configurar las credenciales:

✅ **Redireccionamientos:** Funcionando
✅ **Firebase:** Inicializado y conectado
✅ **Publicaciones:** Se cargan
✅ **Usuarios:** Información visible
✅ **Hashtags:** Funcionan
✅ **Todo:** Operativo

---

**Nota:** Este es el último paso para que la aplicación funcione completamente. Los redireccionamientos ya están corregidos, solo falta configurar Firebase.
