# 📋 Guía Completa del Sistema de Tickets de Soporte

## 🎯 Descripción General

El sistema de tickets permite a los usuarios obtener ayuda personalizada cuando el chatbot de IA no puede resolver su consulta. Los administradores pueden ver, asignar y responder tickets desde el panel de administración.

---

## 🔧 Diagnóstico de Problemas

### Si los tickets NO se están creando:

1. **Abre `test-tickets-debug.html` en tu navegador**
   ```
   file:///ruta/a/LaburitoYa/test-tickets-debug.html
   ```

2. **Haz clic en los botones en orden:**
   - ✅ 1. Verificar Sistemas Cargados
   - ✅ 2. Verificar Conexión Firebase
   - ✅ 3. Verificar Autenticación
   - ✅ 4. Crear Ticket de Prueba
   - ✅ 5. Listar Tickets Existentes

3. **Revisa el log** para identificar el problema exacto

### Problemas Comunes:

#### ❌ "Sistema de tickets no disponible"
**Causa:** El archivo `support-tickets.js` no se está cargando
**Solución:**
- Verifica que el archivo existe en la carpeta raíz
- Verifica que está incluido en `home.html`:
  ```html
  <script src="support-tickets.js"></script>
  ```
- Verifica que se carga ANTES de `support-chat.js`

#### ❌ "Usuario no autenticado"
**Causa:** No hay usuario en sesión
**Solución:**
- Inicia sesión en `login.html` primero
- O usa `test-tickets-debug.html` que crea un usuario de prueba

#### ❌ Error de Firebase
**Causa:** Problema de conexión o permisos
**Solución:**
- Verifica las reglas de Firebase (ver `REGLAS_FIREBASE_COPIAR_PEGAR.txt`)
- Verifica la URL de Firebase en `support-tickets.js`

---

## 👤 Flujo para Usuarios

### 1. Abrir el Chat de Soporte

En cualquier página (home.html, profile.html, etc.):
- Haz clic en el botón flotante 💬 en la esquina inferior derecha

### 2. Interactuar con el Chatbot

El chatbot responderá automáticamente a preguntas comunes:
- ¿Cómo publico?
- ¿Cómo busco profesionales?
- ¿Cómo uso hashtags?
- ¿Cómo envío mensajes?
- etc.

### 3. Crear un Ticket (si el bot no puede ayudar)

Si el chatbot no puede resolver tu consulta:
1. El bot mostrará un botón: **"📝 Crear Ticket de Soporte"**
2. Haz clic en el botón
3. El sistema creará automáticamente un ticket con:
   - Tu conversación con el bot
   - Tu información de usuario
   - Fecha y hora

### 4. Esperar Respuesta

- Recibirás una notificación cuando un administrador responda
- El ticket incluye toda la conversación del chat

---

## 👨‍💼 Flujo para Administradores

### 1. Acceder al Panel de Administración

```
http://localhost/LaburitoYa/admin-panel.html
```

**Requisitos:**
- Tener un rol de administrador (SOPORTE, MODERADOR, ADMIN, o CEO)
- Estar autenticado

### 2. Ver Tickets

1. En el menú lateral, haz clic en **"💬 Soporte"**
2. Verás:
   - Estadísticas de tickets (Total, Pendientes, En Proceso, Resueltos)
   - Lista de todos los tickets
   - Filtros por estado y prioridad

### 3. Ver Detalles de un Ticket

1. Haz clic en **"👁️ Ver Detalles"** en cualquier ticket
2. Verás:
   - Información del usuario
   - Asunto y mensaje
   - Conversación completa del chat
   - Respuestas anteriores (si las hay)

### 4. Responder a un Ticket

1. En la ventana de detalles del ticket
2. Escribe tu respuesta en el campo de texto
3. Haz clic en **"Enviar Respuesta"**
4. El usuario recibirá una notificación

### 5. Asignar un Ticket

1. Haz clic en **"✋ Asignarme"** para asignarte el ticket
2. El ticket cambiará a estado "En Proceso"
3. Tu nombre aparecerá como responsable

### 6. Cambiar Estado del Ticket

Estados disponibles:
- **⏳ Pendiente**: Recién creado, sin asignar
- **🔄 En Proceso**: Asignado a alguien, trabajando en él
- **✓ Resuelto**: Problema solucionado
- **🔒 Cerrado**: Ticket finalizado

Para cambiar estado:
- Haz clic en **"✓ Marcar Resuelto"** cuando hayas solucionado el problema

---

## 📊 Estructura de un Ticket

```javascript
{
  // Información del usuario
  usuarioId: "abc123",
  usuarioNombre: "Juan Pérez",
  usuarioEmail: "juan@example.com",
  usuarioFoto: "url_foto",
  
  // Información del ticket
  asunto: "Consulta sobre publicaciones",
  mensaje: "Texto completo del problema",
  categoria: "chat_soporte",
  prioridad: "media", // baja, media, alta, urgente
  
  // Conversación del chat (si viene del chatbot)
  conversacion: [
    { rol: "usuario", mensaje: "...", fecha: "..." },
    { rol: "asistente", mensaje: "...", fecha: "..." }
  ],
  
  // Estado y fechas
  estado: "pendiente", // pendiente, en_proceso, resuelto, cerrado
  fechaCreacion: "2024-01-15T10:30:00Z",
  fechaActualizacion: "2024-01-15T10:30:00Z",
  
  // Asignación
  asignadoA: null, // ID del admin asignado
  asignadoNombre: null,
  
  // Respuestas del soporte
  respuestas: [
    {
      autor: "Admin",
      autorId: "admin123",
      mensaje: "Respuesta del soporte",
      fecha: "2024-01-15T11:00:00Z",
      esUsuario: false
    }
  ]
}
```

---

## 🔐 Permisos Requeridos

### Para Ver Tickets:
- Permiso: `ver_tickets`
- Roles: SOPORTE, MODERADOR, ADMIN, CEO

### Para Responder Tickets:
- Permiso: `ver_tickets`
- Roles: SOPORTE, MODERADOR, ADMIN, CEO

### Para Asignar Tickets:
- Cualquier admin puede asignarse tickets a sí mismo
- Solo CEO puede asignar a otros

---

## 🗄️ Estructura en Firebase

```
laburitoya-6e55d-default-rtdb/
├── tickets/
│   ├── ticket_id_1/
│   │   ├── usuarioId
│   │   ├── usuarioNombre
│   │   ├── asunto
│   │   ├── mensaje
│   │   ├── estado
│   │   ├── prioridad
│   │   ├── conversacion/
│   │   ├── respuestas/
│   │   └── ...
│   └── ticket_id_2/
│       └── ...
└── notificaciones/
    └── usuario_id/
        └── notificacion_id/
            ├── tipo: "respuesta_ticket"
            ├── ticketId
            └── ...
```

---

## 🧪 Pruebas

### Prueba 1: Crear Ticket desde el Chat

1. Abre `home.html`
2. Haz clic en el botón flotante 💬
3. Escribe: "Tengo un problema que no puedo resolver"
4. El bot ofrecerá crear un ticket
5. Haz clic en "Crear Ticket"
6. Verifica que aparece el mensaje de confirmación

### Prueba 2: Ver Ticket en el Panel Admin

1. Abre `admin-panel.html`
2. Ve a la sección "Soporte"
3. Deberías ver el ticket creado
4. Haz clic en "Ver Detalles"
5. Verifica que se muestra toda la información

### Prueba 3: Responder al Ticket

1. En los detalles del ticket
2. Escribe una respuesta
3. Haz clic en "Enviar Respuesta"
4. Verifica que la respuesta aparece en el ticket

### Prueba 4: Verificar Notificación

1. Como usuario, ve a home.html
2. Haz clic en el ícono de notificaciones 🔔
3. Deberías ver una notificación de respuesta al ticket

---

## 🐛 Solución de Problemas

### El botón "Crear Ticket" no aparece

**Causa:** El chatbot encontró una respuesta
**Solución:** Haz una pregunta que el bot no pueda responder, como "Tengo un problema específico con mi cuenta"

### "Sistema de tickets no disponible"

**Causa:** `support-tickets.js` no se cargó
**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores de carga de scripts
3. Verifica que el archivo existe
4. Verifica el orden de carga en HTML

### Los tickets no aparecen en el panel admin

**Causa:** Problema de permisos o conexión
**Solución:**
1. Verifica que tienes rol de admin
2. Verifica las reglas de Firebase
3. Abre la consola y busca errores

### No puedo responder tickets

**Causa:** Falta de permisos
**Solución:**
1. Verifica que tienes el permiso `ver_tickets`
2. Verifica que estás autenticado correctamente

---

## 📞 Contacto y Soporte

Si sigues teniendo problemas:

1. **Usa `test-tickets-debug.html`** para diagnóstico detallado
2. **Revisa la consola del navegador** (F12) para errores
3. **Verifica las reglas de Firebase** en `REGLAS_FIREBASE_COPIAR_PEGAR.txt`
4. **Revisa los logs** en el panel de administración

---

## ✅ Checklist de Verificación

- [ ] `support-tickets.js` existe y se carga correctamente
- [ ] `support-chat.js` se carga DESPUÉS de `support-tickets.js`
- [ ] Usuario está autenticado
- [ ] Firebase está configurado correctamente
- [ ] Reglas de Firebase permiten lectura/escritura en `/tickets`
- [ ] Usuario tiene permisos de admin (para ver tickets)
- [ ] El chatbot funciona correctamente
- [ ] El botón "Crear Ticket" aparece cuando corresponde

---

**Última actualización:** 2024
**Versión del sistema:** 1.0
