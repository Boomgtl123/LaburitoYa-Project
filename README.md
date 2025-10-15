# 🚀 LaburitoYa - Red Social Profesional

Versión simplificada de LinkedIn para conectar trabajadores y empleadores.

## 📋 Características

### ✅ Funcionalidades Implementadas

#### 🔐 Autenticación
- ✅ Registro de usuarios con validación
- ✅ Login con correo y contraseña
- ✅ Sesión persistente con localStorage
- ✅ Username único
- ✅ Restricción geográfica (Argentina/Perú)

#### 📱 Feed Principal
- ✅ Crear publicaciones
- ✅ Ver feed de publicaciones en tiempo real
- ✅ Sistema de likes/recomendaciones
- ✅ Comentarios con soporte de archivos adjuntos
- ✅ Hashtags automáticos (#Trabajo, #Empleo, etc.)
- ✅ Búsqueda dinámica de publicaciones

#### 👤 Perfil de Usuario
- ✅ Página de perfil personalizada
- ✅ Editar información personal
- ✅ Subir foto de perfil
- ✅ Agregar biografía
- ✅ Enlaces a redes sociales (Facebook, Instagram, LinkedIn, Twitter)
- ✅ Ver publicaciones del usuario

#### 💬 Mensajería
- ✅ Sistema de mensajes directos
- ✅ Lista de conversaciones
- ✅ Chat en tiempo real
- ✅ Indicador de mensajes no leídos

#### 🔔 Notificaciones
- ✅ Notificaciones de likes
- ✅ Notificaciones de comentarios
- ✅ Notificaciones de mensajes
- ✅ Contador de notificaciones no leídas
- ✅ Panel de notificaciones

#### 🎨 Diseño
- ✅ Interfaz estilo LinkedIn
- ✅ Layout de 3 columnas (perfil, feed, tendencias)
- ✅ Navbar profesional
- ✅ Diseño responsive
- ✅ Colores corporativos (#0a66c2)

---

## 🔥 Configuración de Firebase

### ⚡ Solución Rápida (5 minutos)

#### 1. Configurar Reglas de Firebase

1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto: **laburitoya-6e55d**
3. En el menú lateral → **"Realtime Database"**
4. Pestaña **"Reglas"** → Copia y pega:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

5. Haz clic en **"Publicar"**

⚠️ **Nota**: Estas reglas son para desarrollo. Ver sección de seguridad más abajo.

#### 2. Probar la Conexión

Abre `test-firebase-simple.html` en tu navegador y:

1. **Test 1**: Verifica la conexión
2. **Test 4**: Crea un usuario de prueba
3. **Test 5**: Crea una publicación de prueba

Credenciales de prueba creadas:
- **Correo**: test@test.com
- **Contraseña**: test123

#### 3. Iniciar Sesión

1. Abre `login.html`
2. Ingresa las credenciales de prueba
3. ¡Listo! Deberías ver el feed funcionando

---

## 📁 Estructura del Proyecto

```
LaburitoYa/
├── index.html              # Landing page
├── register.html           # Registro de usuarios
├── login.html              # Inicio de sesión
├── home.html               # Feed principal
├── profile.html            # Perfil de usuario
├── messages.html           # Sistema de mensajería
│
├── styles.css              # Estilos globales
├── home.css                # Estilos del feed
├── profile.css             # Estilos del perfil
├── messages.css            # Estilos de mensajería
│
├── register.js             # Lógica de registro
├── login.js                # Lógica de login
├── home.js                 # Lógica del feed
├── profile.js              # Lógica del perfil
├── messages.js             # Lógica de mensajería
├── auth.js                 # Autenticación
├── notifications.js        # Sistema de notificaciones
├── search.js               # Búsqueda dinámica
├── hashtags.js             # Procesamiento de hashtags
├── fileUpload.js           # Subida de archivos
├── locations.js            # Datos de ubicaciones
│
├── test-firebase-simple.html  # Test de Firebase
├── GUIA_RAPIDA_FIREBASE.md    # Guía de configuración
└── README.md                   # Este archivo
```

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase Realtime Database
- **Diseño**: Inspirado en LinkedIn
- **Almacenamiento**: localStorage para sesiones

---

## 🚀 Cómo Usar

### 1. Registro

1. Abre `register.html`
2. Completa el formulario:
   - Perfil (Empleador/Trabajador)
   - Nombre completo
   - Username único
   - Correo electrónico
   - Teléfono
   - País (Argentina/Perú)
   - Distrito y Localidad
   - Contraseña
3. Haz clic en "Registrarme"

### 2. Iniciar Sesión

1. Abre `login.html`
2. Ingresa correo y contraseña
3. Haz clic en "Ingresar"

### 3. Crear Publicaciones

1. En el feed principal, escribe tu publicación
2. Usa hashtags (#Trabajo, #Empleo, etc.)
3. Haz clic en "Publicar"

### 4. Interactuar

- **Like**: Haz clic en "👍 Recomendar"
- **Comentar**: Haz clic en "💬 Comentar" y escribe
- **Adjuntar archivos**: Usa el botón 📎 en comentarios
- **Compartir**: Haz clic en "🔄 Compartir"

### 5. Mensajería

1. Haz clic en "💬 Mensajes" en el navbar
2. Selecciona un usuario
3. Escribe y envía mensajes

### 6. Perfil

1. Haz clic en "👤 Yo" en el navbar
2. Edita tu información
3. Sube foto de perfil
4. Agrega redes sociales

---

## 🔍 Búsqueda

La búsqueda es dinámica y busca en:
- Contenido de publicaciones
- Nombres de usuarios
- Hashtags

---

## 🐛 Solución de Problemas

### No se cargan las publicaciones

1. Verifica que Firebase esté configurado (ver arriba)
2. Abre la consola del navegador (F12)
3. Busca errores en rojo
4. Usa `test-firebase-simple.html` para diagnosticar

### Error: "Permission denied"

- ✅ Verifica que las reglas de Firebase estén publicadas
- ✅ Asegúrate de usar las reglas de desarrollo (ver arriba)

### No puedo registrarme

- ✅ Verifica que el username sea único
- ✅ Verifica que el país sea Argentina o Perú
- ✅ Completa todos los campos requeridos

### Las notificaciones no funcionan

- ✅ Asegúrate de haber iniciado sesión
- ✅ Verifica que `notifications.js` esté cargado
- ✅ Revisa la consola del navegador

---

## 🔒 Reglas de Seguridad para Producción

Cuando todo funcione, cambia las reglas de Firebase a:

```json
{
  "rules": {
    "usuarios": {
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid"
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
        ".read": "auth != null && (data.child('senderId').val() === auth.uid || data.child('receiverId').val() === auth.uid)",
        ".write": "auth != null"
      }
    },
    "notificaciones": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "auth != null"
      }
    }
  }
}
```

---

## 📊 Estructura de Datos en Firebase

```json
{
  "usuarios": {
    "userId": {
      "nombre": "string",
      "username": "string",
      "correo": "string",
      "contrasena": "string",
      "telefono": "string",
      "perfil": "Empleador|Trabajador",
      "pais": "Argentina|Perú",
      "distrito": "string",
      "localidad": "string",
      "zona": "string",
      "fecha": "ISO date",
      "foto": "URL",
      "biografia": "string",
      "redesSociales": {
        "facebook": "URL",
        "instagram": "URL",
        "linkedin": "URL",
        "twitter": "URL"
      }
    }
  },
  "posts": {
    "postId": {
      "contenido": "string",
      "fecha": "ISO date",
      "userId": "string",
      "userName": "string",
      "userFoto": "URL",
      "userPerfil": "string",
      "hashtags": ["array"],
      "likes": ["array de userIds"],
      "comentarios": [
        {
          "userId": "string",
          "userName": "string",
          "userFoto": "URL",
          "texto": "string",
          "fecha": "ISO date",
          "archivo": {
            "nombre": "string",
            "tipo": "string",
            "url": "URL"
          }
        }
      ]
    }
  },
  "mensajes": {
    "messageId": {
      "senderId": "string",
      "senderName": "string",
      "receiverId": "string",
      "receiverName": "string",
      "mensaje": "string",
      "fecha": "ISO date",
      "leido": boolean
    }
  },
  "notificaciones": {
    "userId": {
      "notifId": {
        "tipo": "like|comentario|mensaje",
        "de": "string (userId)",
        "deNombre": "string",
        "deFoto": "URL",
        "postId": "string",
        "mensaje": "string",
        "fecha": "ISO date",
        "leida": boolean
      }
    }
  }
}
```

---

## 📝 Notas de Desarrollo

- **Firebase URL**: https://laburitoya-6e55d-default-rtdb.firebaseio.com
- **Proyecto**: laburitoya-6e55d
- **Región**: us-central1
- **Autenticación**: Sin Firebase Auth (autenticación manual)
- **Almacenamiento**: localStorage para sesiones

---

## 🎯 Próximas Mejoras

- [ ] Implementar Firebase Authentication
- [ ] Agregar sistema de búsqueda de empleos
- [ ] Implementar chat en tiempo real con WebSockets
- [ ] Agregar sistema de recomendaciones
- [ ] Implementar notificaciones push
- [ ] Agregar sistema de reportes
- [ ] Implementar modo oscuro
- [ ] Agregar internacionalización (i18n)

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisa la consola del navegador (F12)
2. Usa `test-firebase-simple.html` para diagnosticar
3. Consulta `GUIA_RAPIDA_FIREBASE.md`
4. Verifica que Firebase esté configurado correctamente

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 👨‍💻 Autor

Desarrollado con ❤️ para conectar trabajadores y empleadores.

---

**¡Gracias por usar LaburitoYa!** 🚀
