# 📁 Estructura del Proyecto LaburitoYa

## 🎯 Nueva Organización - 108 Archivos Reorganizados

El proyecto ha sido completamente reorganizado en carpetas lógicas para mejor mantenibilidad, claridad y escalabilidad. Esta reorganización incluye **108 archivos** distribuidos estratégicamente en una estructura modular.

```
LaburitoYa/
├── 📄 index.html              # Página principal (raíz)
├── 📄 README.md               # Documentación principal
├── 📄 .env                    # Variables de entorno (NO en Git)
├── 📄 .env.example            # Plantilla de variables de entorno
├── 📄 .gitignore              # Archivos excluidos de Git
│
├── 📁 src/                    # Código fuente
│   ├── 📁 js/                 # JavaScript
│   │   ├── admin-panel.js
│   │   ├── auth.js
│   │   ├── empleos.js
│   │   ├── fileUpload.js
│   │   ├── followers.js
│   │   ├── hashtags.js
│   │   ├── home.js
│   │   ├── locations.js
│   │   ├── login.js
│   │   ├── messages.js
│   │   ├── notifications.js
│   │   ├── profile-instagram.js
│   │   ├── public-profile.js
│   │   ├── register.js
│   │   ├── roles.js
│   │   ├── search.js
│   │   ├── support-ai.js
│   │   ├── support-chat.js
│   │   ├── support-tickets.js
│   │   └── ... (otros archivos JS)
│   │
│   ├── 📁 css/                # Estilos
│   │   ├── admin-panel.css
│   │   ├── home-responsive-additions.css
│   │   ├── messages.css
│   │   ├── mobile-avatar-menu.css
│   │   ├── profile-instagram.css
│   │   ├── styles.css
│   │   ├── support-chat.css
│   │   └── support-tickets.css
│   │
│   └── 📁 pages/              # Páginas HTML
│       ├── admin-panel.html
│       ├── diagnostico-home.html
│       ├── empleos.html
│       ├── home.html
│       ├── login.html
│       ├── messages.html
│       ├── politicas.html
│       ├── profile.html
│       ├── public-profile.html
│       ├── quienes-somos.html
│       ├── register.html
│       └── ... (otras páginas)
│
├── 📁 assets/                 # Recursos estáticos
│   └── 📁 images/             # Imágenes
│       ├── logo.png
│       ├── LOGO PNG.png
│       ├── notificaciones.png
│       ├── verificado.png
│       └── WhatsApp Image 2025-06-23 at 22.23.32.jpeg
│
├── 📁 config/                 # Configuración
│   ├── config.js              # Configuración real (NO en Git)
│   ├── config.example.js      # Plantilla de configuración
│   ├── REGLAS_FIREBASE_COMPLETAS_2024.json
│   └── REGLAS_FIREBASE_COPIAR_PEGAR.txt
│
├── 📁 docs/                   # Documentación
│   ├── 📁 security/           # Documentación de seguridad
│   │   ├── SECURITY.md
│   │   ├── CONFIGURACION_SEGURIDAD.md
│   │   ├── INSTRUCCIONES_INMEDIATAS.md
│   │   ├── RESUMEN_SEGURIDAD.md
│   │   └── GUIA_VISUAL_SEGURIDAD.md
│   │
│   ├── 📁 guides/             # Guías y tutoriales
│   │   ├── GUIA_RAPIDA_FIREBASE.md
│   │   ├── GUIA_SISTEMA_ROLES.md
│   │   ├── GUIA_SISTEMA_TICKETS.md
│   │   └── COMO_VER_CAMBIOS_GITHUB.md
│   │
│   ├── 📁 updates/            # Notas de actualización
│   │   ├── ACTUALIZACION_REDES_SOCIALES.md
│   │   ├── ACTUALIZACION_REPO.md
│   │   ├── INSTRUCCIONES_ACTUALIZACION.md
│   │   ├── RESUMEN_FIX_CHATS.md
│   │   ├── RESUMEN_OPTIMIZACIONES.md
│   │   └── RESUMEN_SISTEMA_ROLES.md
│   │
│   └── 📄 ... (otros documentos)
│       ├── CAMBIOS_MENU_INFO.md
│       ├── CAROUSEL_TODO.md
│       ├── CONFIGURAR_FIREBASE_AHORA.md
│       ├── CORRECCION_ANUNCIOS.md
│       ├── DIAGNOSTICO_CHATS.md
│       ├── ESTADO_ACTUAL.md
│       ├── FIXES_COMPLETADOS.md
│       ├── FOLLOWERS_IMPLEMENTATION.md
│       └── ... (más documentos)
│
├── 📁 tests/                  # Archivos de prueba
│   └── (archivos de test)
│
└── 📁 backup_version_avanzada/ # Backup de versión anterior
    └── (archivos de respaldo)
```

---

## 🔑 Archivos Importantes en la Raíz

| Archivo | Descripción | En Git |
|---------|-------------|--------|
| `index.html` | Página de inicio | ✅ Sí |
| `README.md` | Documentación principal | ✅ Sí |
| `.env` | Variables de entorno con credenciales | ❌ No (protegido) |
| `.env.example` | Plantilla de variables de entorno | ✅ Sí |
| `.gitignore` | Archivos excluidos de Git | ✅ Sí |
| `ESTRUCTURA_PROYECTO.md` | Este documento | ✅ Sí |

---

## 📂 Descripción de Carpetas

### `src/` - Código Fuente
Contiene todo el código fuente de la aplicación organizado por tipo:
- **js/**: Archivos JavaScript con la lógica de la aplicación
- **css/**: Hojas de estilo
- **pages/**: Páginas HTML (excepto index.html que está en la raíz)

### `assets/` - Recursos Estáticos
Recursos que no cambian frecuentemente:
- **images/**: Imágenes, logos, iconos

### `config/` - Configuración
Archivos de configuración del proyecto:
- Configuración de Firebase
- Reglas de base de datos
- Variables de entorno

### `docs/` - Documentación
Toda la documentación del proyecto organizada por categorías:
- **security/**: Documentación de seguridad
- **guides/**: Guías y tutoriales
- **updates/**: Notas de actualización y cambios

### `tests/` - Pruebas
Archivos de prueba y testing

### `backup_version_avanzada/` - Respaldo
Backup de la versión anterior del proyecto

---

## 🔒 Archivos Protegidos (NO en Git)

Estos archivos están en `.gitignore` y NO se suben a GitHub:

- `.env` - Variables de entorno con credenciales
- `config/config.js` - Configuración con datos reales
- `*.log` - Archivos de log
- `.DS_Store` - Archivos de sistema
- `node_modules/` - Dependencias

---

## 🚀 Cómo Usar Esta Estructura

### Para Desarrolladores Nuevos:

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Boomgtl123/LaburitoYa-Project.git
   cd LaburitoYa
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales
   ```

3. **Configurar Firebase**
   ```bash
   cp config/config.example.js config/config.js
   # Editar config/config.js con tus credenciales de Firebase
   ```

4. **Abrir el proyecto**
   - Abrir `index.html` en el navegador
   - O usar un servidor local

### Para Encontrar Archivos:

- **¿Buscas una página HTML?** → `src/pages/` (excepto index.html en raíz)
- **¿Buscas JavaScript?** → `src/js/`
- **¿Buscas estilos CSS?** → `src/css/`
- **¿Buscas imágenes?** → `assets/images/`
- **¿Buscas documentación?** → `docs/`
- **¿Buscas configuración?** → `config/`

---

## 📝 Notas Importantes

1. **Rutas Relativas**: Al mover archivos, las rutas en HTML/CSS/JS se mantienen relativas desde la raíz del proyecto.

2. **Git Tracking**: Git rastrea automáticamente los movimientos de archivos, por lo que el historial se mantiene.

3. **Seguridad**: Los archivos sensibles están protegidos por `.gitignore`.

4. **Documentación**: Toda la documentación está organizada en `docs/` por categorías.

---

## 🔄 Migración Completada

✅ Archivos organizados en carpetas lógicas
✅ Documentación categorizada
✅ Archivos sensibles protegidos
✅ Estructura clara y mantenible
✅ Git tracking preservado

---

**Fecha de reorganización**: 16 de Octubre, 2024
**Versión**: 2.0 - Estructura Organizada
