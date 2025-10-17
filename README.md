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

## 🔒 Configuración de Seguridad

### ⚠️ IMPORTANTE: Antes de Empezar

Este proyecto contiene información sensible que **NO debe ser compartida públicamente**. Por favor, sigue estos pasos:

### 1. Configuración Inicial

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/LaburitoYa.git
cd LaburitoYa

# 2. Crear archivo de configuración
cp .env.example .env
cp config.example.js config.js

# 3. Editar .env con tus credenciales de Firebase
# 4. Editar config.js con tus credenciales de Firebase
```

### 2. Obtener Credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Configuración del proyecto** → **General**
4. Copia tus credenciales y pégalas en `.env` y `config.js`

### 3. Configurar Reglas de Seguridad

1. En Firebase Console, ve a **Realtime Database** → **Reglas**
2. Copia las reglas del archivo `SECURITY.md`
3. Haz clic en **Publicar**

### 📚 Documentación de Seguridad

- **[SECURITY.md](SECURITY.md)** - Guía completa de seguridad
- **[CONFIGURACION_SEGURIDAD.md](CONFIGURACION_SEGURIDAD.md)** - Guía rápida de configuración

### ⚠️ Archivos que NO se suben a GitHub

Los siguientes archivos están protegidos por `.gitignore`:
- `.env` - Variables de entorno
- `config.js` - Configuración con credenciales
- Archivos de backup y logs

**NUNCA subas estos archivos a GitHub o los compartas públicamente.**

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

1. Verifica que Firebase esté configurado correctamente
2. Verifica que `.env` y `config.js` tengan las credenciales correctas
3. Abre la consola del navegador (F12)
4. Busca errores en rojo
5. Usa `test-firebase-simple.html` para diagnosticar
6. Revisa las reglas de seguridad en Firebase Console

### Error de autenticación

1. Verifica que las reglas de Firebase permitan lectura/escritura
2. Limpia la caché del navegador (Ctrl + Shift + R)
3. Verifica que el usuario esté correctamente logueado

### Archivos sensibles en Git

Si accidentalmente subiste archivos con credenciales:
1. Lee la sección "Limpiar Historial de Git" en `CONFIGURACION_SEGURIDAD.md`
2. Regenera tus credenciales en Firebase Console
3. Actualiza tus archivos `.env` y `config.js` locales

---

## 🔐 Seguridad

Este proyecto implementa las siguientes medidas de seguridad:

- ✅ Variables de entorno para credenciales
- ✅ `.gitignore` para proteger archivos sensibles
- ✅ Documentación completa de seguridad
- ✅ Plantillas de configuración para nuevos desarrolladores
- ⚠️ **Recomendado**: Implementar Firebase Authentication
- ⚠️ **Recomendado**: Encriptar contraseñas con bcrypt

Para más información, consulta [SECURITY.md](SECURITY.md)

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 👨‍💻 Autor
Benja y Santi
Desarrollado con ❤️ para conectar trabajadores y empleadores.

---

**¡Gracias por usar LaburitoYa!** 🚀
