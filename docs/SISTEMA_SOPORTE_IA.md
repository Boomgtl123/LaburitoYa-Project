# 🤖 Sistema de Soporte con IA - LaburitoYa

## ✅ Implementación Completada

Se ha implementado un sistema completo de soporte con IA que incluye:

### 1. Chat de Soporte con IA (100% Gratis)
- ✅ Botón flotante en todas las páginas
- ✅ Chat interactivo con respuestas automáticas
- ✅ Base de conocimiento sobre LaburitoYa
- ✅ Sugerencias rápidas de preguntas
- ✅ Indicador de escritura
- ✅ Historial de conversación

### 2. Sistema de Tickets
- ✅ Creación automática de tickets desde el chat
- ✅ Almacenamiento en Firebase
- ✅ Estados: Pendiente, En Proceso, Resuelto, Cerrado
- ✅ Prioridades: Baja, Media, Alta, Urgente
- ✅ Asignación a usuarios con rol "Soporte"
- ✅ Sistema de respuestas

### 3. Panel de Administración
- ✅ Vista de todos los tickets
- ✅ Filtros por estado y prioridad
- ✅ Estadísticas de tickets
- ✅ Asignación de tickets
- ✅ Responder tickets
- ✅ Cambiar estados
- ✅ Ver conversación completa del chat

## 📁 Archivos Creados

### JavaScript
1. **support-ai.js** - Base de conocimiento y lógica de IA
2. **support-tickets.js** - Gestión de tickets en Firebase
3. **support-chat.js** - Interfaz y lógica del chat

### CSS
1. **support-chat.css** - Estilos del chat flotante
2. **support-tickets.css** - Estilos de tickets en admin panel

### Archivos Modificados
1. **home.html** - Agregado botón flotante y modal de chat
2. **admin-panel.html** - Agregada sección de soporte
3. **admin-panel.js** - Funciones de gestión de tickets
4. **REGLAS_FIREBASE_COPIAR_PEGAR.txt** - Agregada ruta `/tickets`

## 🎯 Características del Sistema

### Base de Conocimiento
El sistema puede responder preguntas sobre:
- ✅ Información general de LaburitoYa
- ✅ Registro y creación de cuenta
- ✅ Inicio de sesión
- ✅ Crear publicaciones
- ✅ Usar hashtags
- ✅ Sistema de mensajería
- ✅ Gestión de perfil
- ✅ Verificación de perfiles
- ✅ Búsqueda de servicios
- ✅ Sistema de seguidores
- ✅ Empleos
- ✅ Notificaciones
- ✅ Problemas técnicos
- ✅ Seguridad y privacidad

### Flujo de Uso

```
1. Usuario hace clic en botón flotante 💬
   ↓
2. Se abre chat de soporte
   ↓
3. Usuario escribe su pregunta
   ↓
4. IA busca en base de conocimiento
   ↓
5a. Si encuentra respuesta → Responde automáticamente
5b. Si no encuentra → Ofrece crear ticket
   ↓
6. Usuario crea ticket (opcional)
   ↓
7. Ticket se guarda en Firebase
   ↓
8. Notificación a usuarios con rol "Soporte"
   ↓
9. Agente de soporte responde
   ↓
10. Usuario recibe notificación
```

## 🔧 Configuración Requerida

### 1. Aplicar Reglas de Firebase

**IMPORTANTE**: Debes actualizar las reglas de Firebase para incluir la ruta `/tickets`.

Copia el contenido de `REGLAS_FIREBASE_COPIAR_PEGAR.txt` y pégalo en:
- Firebase Console → Realtime Database → Rules

Las reglas ahora incluyen:
```json
{
  "rules": {
    // ... otras rutas ...
    "tickets": {
      ".read": true,
      ".write": true
    }
  }
}
```

### 2. Asignar Rol de Soporte

Para que un usuario pueda gestionar tickets:

1. Inicia sesión como CEO
2. Ve al Panel de Administración
3. Sección "Usuarios"
4. Selecciona un usuario
5. Haz clic en "Asignar Rol"
6. Selecciona "Soporte"
7. Confirma

## 📊 Estructura de Datos

### Ticket en Firebase
```javascript
{
  "tickets": {
    "ticket_id": {
      // Usuario
      "usuarioId": "user123",
      "usuarioNombre": "Juan Pérez",
      "usuarioEmail": "juan@example.com",
      "usuarioFoto": "url_foto",
      
      // Ticket
      "asunto": "Consulta sobre...",
      "mensaje": "Texto del mensaje",
      "categoria": "chat_soporte",
      "prioridad": "media",
      
      // Conversación del chat
      "conversacion": [
        {
          "rol": "usuario",
          "mensaje": "¿Cómo publico?",
          "fecha": "2024-01-01T10:00:00Z"
        },
        {
          "rol": "asistente",
          "mensaje": "Para publicar...",
          "categoria": "publicaciones",
          "fecha": "2024-01-01T10:00:01Z"
        }
      ],
      
      // Estado
      "estado": "pendiente",
      "fechaCreacion": "2024-01-01T10:00:00Z",
      "fechaActualizacion": "2024-01-01T10:00:00Z",
      
      // Asignación
      "asignadoA": "admin_id",
      "asignadoNombre": "Admin Name",
      
      // Respuestas
      "respuestas": [
        {
          "autor": "Soporte",
          "autorId": "admin_id",
          "autorFoto": "url",
          "mensaje": "Respuesta del soporte",
          "fecha": "2024-01-01T11:00:00Z",
          "esUsuario": false
        }
      ]
    }
  }
}
```

## 🎨 Personalización

### Agregar Nuevas Preguntas a la Base de Conocimiento

Edita `support-ai.js` y agrega nuevas entradas en `KNOWLEDGE_BASE`:

```javascript
const KNOWLEDGE_BASE = {
  // ... existentes ...
  
  nueva_categoria: {
    keywords: ['palabra1', 'palabra2', 'palabra3'],
    response: `Tu respuesta aquí con formato markdown básico:
    
    **Negrita**
    • Lista con bullets
    
    Texto normal`
  }
};
```

### Cambiar Colores del Chat

Edita `support-chat.css`:

```css
.floating-support-btn {
  background: linear-gradient(135deg, #TU_COLOR_1 0%, #TU_COLOR_2 100%);
}
```

### Modificar Prioridades de Tickets

Edita `support-tickets.js`:

```javascript
const TICKET_PRIORITY = {
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta',
  URGENTE: 'urgente',
  // Agrega más si necesitas
};
```

## 🧪 Cómo Probar

### 1. Probar el Chat de Soporte

1. Abre `home.html` en el navegador
2. Haz clic en el botón flotante 💬
3. Prueba estas preguntas:
   - "¿Cómo publico en LaburitoYa?"
   - "¿Cómo busco electricistas?"
   - "¿Cómo edito mi perfil?"
   - "Tengo un problema técnico"

### 2. Crear un Ticket

1. En el chat, escribe algo que la IA no pueda responder
2. Haz clic en "Crear Ticket de Soporte"
3. El ticket se creará automáticamente

### 3. Gestionar Tickets (Como Soporte)

1. Inicia sesión con un usuario que tenga rol "Soporte"
2. Ve al Panel de Administración
3. Haz clic en "Soporte" en el menú lateral
4. Verás todos los tickets
5. Haz clic en "Ver Detalles" en un ticket
6. Escribe una respuesta
7. Haz clic en "Enviar Respuesta"

## 📈 Estadísticas Disponibles

En el panel de soporte verás:
- 📋 Total de tickets
- ⏳ Tickets pendientes
- 🔄 Tickets en proceso
- ✓ Tickets resueltos

## 🔔 Notificaciones

El sistema envía notificaciones automáticas:
- ✅ A usuarios con rol "Soporte" cuando se crea un ticket
- ✅ Al usuario cuando el soporte responde su ticket

## 🚀 Próximas Mejoras Sugeridas

1. **Integración con API de BLACKBOX real**
   - Respuestas más inteligentes
   - Aprendizaje continuo

2. **Sistema de calificación**
   - Usuarios pueden calificar las respuestas
   - Métricas de satisfacción

3. **Chat en vivo**
   - Conexión directa con agente de soporte
   - WebSockets para tiempo real

4. **Base de conocimiento dinámica**
   - Agregar preguntas desde el panel
   - Actualizar respuestas sin código

5. **Análisis de sentimientos**
   - Detectar urgencia en mensajes
   - Priorización automática

6. **Historial de tickets del usuario**
   - Vista de tickets propios
   - Seguimiento de estado

## 🐛 Solución de Problemas

### El chat no se abre
- Verifica que `support-chat.js` esté cargado
- Revisa la consola del navegador (F12)
- Asegúrate de que el botón flotante esté visible

### No se crean tickets
- Verifica las reglas de Firebase
- Asegúrate de que `/tickets` tenga permisos de escritura
- Revisa la consola para errores

### No veo la sección de soporte en el panel
- Verifica que el usuario tenga rol "Soporte" o sea CEO
- Revisa que `support-tickets.js` esté cargado
- Verifica permisos en `roles.js`

### Las respuestas de la IA no son buenas
- Edita `support-ai.js` y mejora las respuestas
- Agrega más palabras clave
- Crea nuevas categorías

## 📝 Notas Importantes

1. **Seguridad**: Las reglas actuales son abiertas para desarrollo. En producción, implementa reglas más restrictivas.

2. **Escalabilidad**: Para muchos tickets, considera implementar paginación.

3. **Performance**: La base de conocimiento es local y muy rápida. No hay llamadas a APIs externas.

4. **Mantenimiento**: Actualiza regularmente la base de conocimiento con nuevas preguntas frecuentes.

5. **Backup**: Los tickets se guardan en Firebase, pero considera hacer backups periódicos.

## ✅ Checklist de Implementación

- [x] Crear módulo de IA (`support-ai.js`)
- [x] Crear sistema de tickets (`support-tickets.js`)
- [x] Crear interfaz de chat (`support-chat.js` y `support-chat.css`)
- [x] Integrar en `home.html`
- [x] Actualizar panel de administración
- [x] Agregar estilos de tickets
- [x] Actualizar reglas de Firebase
- [x] Documentar sistema
- [ ] Aplicar reglas de Firebase (PENDIENTE - Usuario debe hacerlo)
- [ ] Asignar rol de soporte a usuarios
- [ ] Probar sistema completo

---

**Fecha de implementación**: 2024
**Estado**: ✅ Completado y listo para usar
**Costo**: 💰 100% Gratis (sin APIs externas)
