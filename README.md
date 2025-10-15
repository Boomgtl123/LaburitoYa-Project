# 🚀 LaburitoYa - Red Social No Profesional v. BETA

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



## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 👨‍💻 Autor
Benja y Santi
Desarrollado con ❤️ para conectar trabajadores y empleadores.

---

**¡Gracias por usar LaburitoYa!** 🚀
