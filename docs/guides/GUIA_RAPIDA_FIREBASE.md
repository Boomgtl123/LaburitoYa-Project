# 🔥 Guía Rápida - Configurar Firebase

## ⚡ Solución Rápida (5 minutos)

### Paso 1: Configurar Reglas de Firebase

1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto: **laburitoya-6e55d**
3. En el menú lateral, busca **"Realtime Database"**
4. Haz clic en la pestaña **"Reglas"**
5. Copia y pega estas reglas:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

6. Haz clic en **"Publicar"**

⚠️ **IMPORTANTE**: Estas reglas permiten acceso total. Son para desarrollo/testing.

---

### Paso 2: Crear Datos de Prueba

Opción A - **Usar la interfaz de Firebase**:

1. En Firebase Console, ve a la pestaña **"Datos"**
2. Haz clic en el **"+"** junto a la raíz
3. Crea esta estructura:

```
usuarios/
  └─ test123/
      ├─ nombre: "Usuario Test"
      ├─ username: "usuariotest"
      ├─ correo: "test@test.com"
      ├─ contrasena: "test123"
      ├─ telefono: "123456789"
      ├─ perfil: "Trabajador"
      ├─ pais: "Argentina"
      ├─ distrito: "Guaminí"
      ├─ localidad: "Guaminí"
      ├─ zona: "Guaminí, Guaminí, Argentina"
      ├─ fecha: "2025-01-15T00:00:00.000Z"
      ├─ foto: "https://via.placeholder.com/150"
      └─ biografia: "Usuario de prueba"

posts/
  └─ post1/
      ├─ contenido: "¡Hola! Busco trabajo como desarrollador #Trabajo"
      ├─ fecha: "2025-01-15T10:00:00.000Z"
      ├─ userId: "test123"
      ├─ userName: "Usuario Test"
      ├─ userFoto: "https://via.placeholder.com/48"
      ├─ userPerfil: "Trabajador"
      ├─ hashtags: ["#trabajo"]
      ├─ likes: []
      └─ comentarios: []
```

Opción B - **Registrarse desde la app**:

1. Abre `register.html` en tu navegador
2. Completa el formulario
3. Haz clic en "Registrarme"

---

### Paso 3: Probar la Aplicación

1. Abre `login.html`
2. Ingresa:
   - **Correo**: test@test.com
   - **Contraseña**: test123
3. Haz clic en "Ingresar"
4. Deberías ver el feed con publicaciones

---

## 🐛 Si Aún No Funciona

### Verificar en la Consola del Navegador

1. Abre cualquier página (home.html, register.html, etc.)
2. Presiona **F12** (o **Cmd+Option+I** en Mac)
3. Ve a la pestaña **"Console"**
4. Busca errores en rojo

### Errores Comunes:

**Error: "Permission denied"**
- ✅ Solución: Verifica que las reglas de Firebase estén publicadas

**Error: "Failed to fetch"**
- ✅ Solución: Verifica tu conexión a internet
- ✅ Verifica que la URL sea: `https://laburitoya-6e55d-default-rtdb.firebaseio.com`

**No se muestran publicaciones**
- ✅ Solución: Crea datos de prueba (Paso 2)
- ✅ Verifica que hayas iniciado sesión

---

## ✅ Checklist de Verificación

- [ ] Firebase Realtime Database está creado
- [ ] Reglas de seguridad están configuradas y publicadas
- [ ] Hay al menos un usuario en la base de datos
- [ ] Hay al menos una publicación en la base de datos
- [ ] Puedes iniciar sesión correctamente
- [ ] Las publicaciones se muestran en home.html

---

## 📞 Siguiente Paso

Una vez que Firebase esté funcionando:

1. **Registra tu usuario real** desde register.html
2. **Crea publicaciones** desde home.html
3. **Prueba todas las funcionalidades**:
   - ✅ Likes/Recomendaciones
   - ✅ Comentarios con archivos adjuntos
   - ✅ Notificaciones
   - ✅ Búsqueda dinámica
   - ✅ Mensajería
   - ✅ Hashtags

---

## 🔒 Reglas de Seguridad para Producción

Cuando todo funcione, cambia las reglas a:

```json
{
  "rules": {
    "usuarios": {
      "$uid": {
        ".read": true,
        ".write": "auth != null"
      }
    },
    "posts": {
      ".read": true,
      "$postId": {
        ".write": "auth != null"
      }
    },
    "mensajes": {
      "$messageId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "notificaciones": {
      "$notifId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

---

**¿Necesitas ayuda?** Comparte los errores de la consola del navegador.
