// ========== MENSAJES - VERSIÓN SIMPLIFICADA QUE FUNCIONA ==========

console.log('✅ [MESSAGES] Script cargado');

let usuarioActual = null;
let conversacionActiva = null;

// ========== INICIALIZACIÓN ==========
window.addEventListener('DOMContentLoaded', function() {
  console.log('🔄 [MESSAGES] DOM cargado, iniciando...');
  
  // Verificar sesión - intentar ambas claves
  let usuarioActualStr = localStorage.getItem('currentUser') || localStorage.getItem('usuarioActual');
  if (!usuarioActualStr) {
    console.error('❌ [MESSAGES] No hay sesión activa');
    mostrarError('No hay sesión activa', 'Por favor inicia sesión', 'login.html');
    return;
  }
  
  try {
    usuarioActual = JSON.parse(usuarioActualStr);
    console.log('✅ [MESSAGES] Usuario:', usuarioActual.nombre, 'ID:', usuarioActual.id);
  } catch (e) {
    console.error('❌ [MESSAGES] Error al parsear usuario:', e);
    mostrarError('Error de sesión', 'Datos de sesión corruptos', 'login.html');
    return;
  }
  
  // Exponer funciones globalmente
  window.cargarConversaciones = cargarConversaciones;
  window.cargarMensajes = cargarMensajes;
  window.usuarioActual = usuarioActual;
  window.conversacionActiva = null;
  
  // Cargar avatar del usuario en el navbar
  const navAvatar = document.getElementById('navAvatar');
  if (navAvatar && usuarioActual) {
    navAvatar.src = obtenerAvatar(usuarioActual, 40);
    console.log('✅ [MESSAGES] Avatar navbar cargado');
  }
  
  // Configurar event listeners
  configurarEventListeners();
  
  // Cargar conversaciones
  cargarConversaciones();
  
  // Actualizar cada 15 segundos
  setInterval(() => {
    if (!conversacionActiva) {
      cargarConversaciones();
    }
  }, 15000);
  
  console.log('✅ [MESSAGES] Inicialización completada');
});

// ========== CARGAR CONVERSACIONES ==========
function cargarConversaciones() {
  console.log('📥 [MESSAGES] Cargando conversaciones...');
  
  const conversationsList = document.getElementById('conversationsList');
  if (!conversationsList) {
    console.error('❌ [MESSAGES] No se encontró conversationsList');
    return;
  }
  
  // Mostrar loading
  conversationsList.innerHTML = `
    <div class="loading-conversations">
      <div class="spinner-small"></div>
      <p>Cargando conversaciones...</p>
    </div>
  `;
  
  fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/mensajes.json')
    .then(response => {
      console.log('📡 [MESSAGES] Respuesta:', response.status);
      if (!response.ok) throw new Error('Error HTTP: ' + response.status);
      return response.json();
    })
    .then(data => {
      console.log('📊 [MESSAGES] Datos recibidos:', data ? 'Sí' : 'No');
      
      if (!data) {
        conversationsList.innerHTML = '';
        const noConv = document.getElementById('noConversations');
        if (noConv) noConv.style.display = 'block';
        return;
      }
      
      // Agrupar conversaciones - soportar AMBAS estructuras
      const conversaciones = {};
      
      for (const key in data) {
        const item = data[key];
        
        // Verificar si es estructura anidada (objeto con múltiples mensajes) o plana (mensaje directo)
        const esEstructuraAnidada = item && typeof item === 'object' && !item.mensaje && !item.de && !item.remitente;
        
        if (esEstructuraAnidada) {
          // Estructura anidada: /mensajes/{conversacionId}/{mensajeId}
          for (const mensajeId in item) {
            const mensaje = item[mensajeId];
            if (!mensaje || typeof mensaje !== 'object') continue;
            
            // Soportar ambos formatos: de/para y remitente/destinatario
            const remitente = mensaje.remitente || mensaje.de;
            const destinatario = mensaje.destinatario || mensaje.para;
            
            if (!remitente || !destinatario) continue;
            
            if (remitente === usuarioActual.id || destinatario === usuarioActual.id) {
              const otroUsuarioId = remitente === usuarioActual.id ? destinatario : remitente;
            
              if (!conversaciones[otroUsuarioId]) {
                conversaciones[otroUsuarioId] = {
                  ultimoMensaje: mensaje,
                  mensajes: []
                };
              }
              
              conversaciones[otroUsuarioId].mensajes.push(mensaje);
              
              if (new Date(mensaje.fecha) > new Date(conversaciones[otroUsuarioId].ultimoMensaje.fecha)) {
                conversaciones[otroUsuarioId].ultimoMensaje = mensaje;
              }
            }
          }
        } else {
          // Estructura plana: /mensajes/{mensajeId}
          const mensaje = item;
          if (!mensaje || typeof mensaje !== 'object') continue;
          
          // Soportar ambos formatos
          const remitente = mensaje.remitente || mensaje.de;
          const destinatario = mensaje.destinatario || mensaje.para;
          
          if (!remitente || !destinatario) continue;
          
          if (remitente === usuarioActual.id || destinatario === usuarioActual.id) {
            const otroUsuarioId = remitente === usuarioActual.id ? destinatario : remitente;
          
            if (!conversaciones[otroUsuarioId]) {
              conversaciones[otroUsuarioId] = {
                ultimoMensaje: mensaje,
                mensajes: []
              };
            }
            
            conversaciones[otroUsuarioId].mensajes.push(mensaje);
            
            if (new Date(mensaje.fecha) > new Date(conversaciones[otroUsuarioId].ultimoMensaje.fecha)) {
              conversaciones[otroUsuarioId].ultimoMensaje = mensaje;
            }
          }
        }
      }
      
      const numConv = Object.keys(conversaciones).length;
      console.log('✅ [MESSAGES] Conversaciones encontradas:', numConv);
      
      if (numConv === 0) {
        conversationsList.innerHTML = '';
        const noConv = document.getElementById('noConversations');
        if (noConv) noConv.style.display = 'block';
        return;
      }
      
      const noConv = document.getElementById('noConversations');
      if (noConv) noConv.style.display = 'none';
      
      // Ordenar por fecha
      const conversacionesOrdenadas = Object.entries(conversaciones).sort((a, b) => {
        return new Date(b[1].ultimoMensaje.fecha) - new Date(a[1].ultimoMensaje.fecha);
      });
      
      // Limpiar lista
      conversationsList.innerHTML = '';
      
      // Renderizar cada conversación
      conversacionesOrdenadas.forEach(([userId, conv]) => {
        fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios/${userId}.json`)
          .then(r => r.json())
          .then(usuario => {
            if (!usuario) return;
            
            const ultimoMensaje = conv.ultimoMensaje;
            // Soportar ambos formatos
            const remitente = ultimoMensaje.remitente || ultimoMensaje.de;
            const esEnviado = remitente === usuarioActual.id;
            const textoMensaje = esEnviado ? `Tú: ${ultimoMensaje.mensaje}` : ultimoMensaje.mensaje;
            
            // Contar no leídos - soportar ambos formatos
            const noLeidos = conv.mensajes.filter(m => {
              const dest = m.destinatario || m.para;
              return dest === usuarioActual.id && !m.leido;
            }).length;
            
            const tiempo = calcularTiempo(ultimoMensaje.fecha);
            
            const div = document.createElement('div');
            div.className = 'conversation-item';
            if (noLeidos > 0) div.classList.add('unread');
            if (conversacionActiva === userId) div.classList.add('active');
            
            div.innerHTML = `
              <img src="${obtenerAvatar(usuario, 48)}" alt="${usuario.nombre}" class="conversation-avatar" />
              <div class="conversation-info">
                <p class="conversation-name">${auth.renderNombreConBadge(usuario.nombre, usuario)}</p>
                <p class="conversation-last-message">${textoMensaje}</p>
              </div>
              <span class="conversation-time">${tiempo}</span>
              ${noLeidos > 0 ? `<span class="unread-badge">${noLeidos}</span>` : ''}
            `;
            
            div.addEventListener('click', () => abrirConversacion(userId, usuario));
            
            conversationsList.appendChild(div);
            console.log('✅ [MESSAGES] Renderizada:', usuario.nombre);
          })
          .catch(err => console.error('❌ [MESSAGES] Error al obtener usuario:', err));
      });
    })
    .catch(error => {
      console.error('❌ [MESSAGES] Error:', error);
      conversationsList.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <p style="color: #d32f2f; margin-bottom: 10px;">❌ Error al cargar conversaciones</p>
          <p style="font-size: 12px; color: #666;">${error.message}</p>
          <button onclick="window.cargarConversaciones()" style="padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
            🔄 Reintentar
          </button>
        </div>
      `;
    });
}

// ========== ABRIR CONVERSACIÓN ==========
function abrirConversacion(userId, usuario) {
  console.log('💬 [MESSAGES] Abriendo conversación con:', usuario.nombre);
  conversacionActiva = userId;
  window.conversacionActiva = userId;
  
  // Actualizar UI
  const chatEmpty = document.getElementById('chatEmpty');
  const chatActive = document.getElementById('chatActive');
  const chatArea = document.querySelector('.chat-area');
  const conversationsSidebar = document.querySelector('.conversations-sidebar');
  
  if (chatEmpty) chatEmpty.style.display = 'none';
  if (chatActive) chatActive.style.display = 'flex';
  
  // En móvil, mostrar chat y ocultar sidebar
  if (window.innerWidth <= 768) {
    if (chatArea) chatArea.classList.add('mobile-show');
    if (conversationsSidebar) conversationsSidebar.classList.add('mobile-hide');
    console.log('📱 [MESSAGES] Modo móvil activado');
  }
  
  // Actualizar header
  const chatAvatar = document.getElementById('chatAvatar');
  const chatUserName = document.getElementById('chatUserName');
  const chatUserStatus = document.getElementById('chatUserStatus');
  
  if (chatAvatar) chatAvatar.src = obtenerAvatar(usuario, 40);
  if (chatUserName) chatUserName.innerHTML = auth.renderNombreConBadge(usuario.nombre, usuario);
  if (chatUserStatus) chatUserStatus.textContent = usuario.perfil || 'Usuario';
  
  // Actualizar conversaciones activas
  document.querySelectorAll('.conversation-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Marcar notificaciones de mensajes como leídas
  marcarNotificacionesMensajesComoLeidas(userId);
  
  // Cargar mensajes
  cargarMensajes(userId);
}

// ========== CARGAR MENSAJES ==========
function cargarMensajes(userId) {
  console.log('📨 [MESSAGES] Cargando mensajes con:', userId);
  
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/mensajes.json')
    .then(r => r.json())
    .then(data => {
      if (!data) {
        chatMessages.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay mensajes</p>';
        return;
      }
      
      // Filtrar mensajes - soportar AMBAS estructuras
      const mensajes = [];
      
      for (const key in data) {
        const item = data[key];
        
        // Verificar si es estructura anidada o plana
        const esEstructuraAnidada = item && typeof item === 'object' && !item.mensaje && !item.de && !item.remitente;
        
        if (esEstructuraAnidada) {
          // Estructura anidada
          for (const mensajeId in item) {
            const mensaje = item[mensajeId];
            if (!mensaje || typeof mensaje !== 'object') continue;
            
            const remitente = mensaje.remitente || mensaje.de;
            const destinatario = mensaje.destinatario || mensaje.para;
            
            if (!remitente || !destinatario) continue;
            
            if ((remitente === usuarioActual.id && destinatario === userId) ||
                (remitente === userId && destinatario === usuarioActual.id)) {
              mensajes.push({ id: mensajeId, ...mensaje });
            }
          }
        } else {
          // Estructura plana
          const mensaje = item;
          if (!mensaje || typeof mensaje !== 'object') continue;
          
          const remitente = mensaje.remitente || mensaje.de;
          const destinatario = mensaje.destinatario || mensaje.para;
          
          if (!remitente || !destinatario) continue;
          
          if ((remitente === usuarioActual.id && destinatario === userId) ||
              (remitente === userId && destinatario === usuarioActual.id)) {
            mensajes.push({ id: key, ...mensaje });
          }
        }
      }
      
      // Ordenar por fecha
      mensajes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      
      // Renderizar
      chatMessages.innerHTML = '';
      mensajes.forEach(mensaje => {
        const div = document.createElement('div');
        // Soportar ambos formatos
        const remitente = mensaje.remitente || mensaje.de;
        const esEnviado = remitente === usuarioActual.id;
        div.className = `message-item ${esEnviado ? 'sent' : 'received'}`;
        
        // Usar foto del remitente si está disponible
        let avatar;
        if (esEnviado) {
          avatar = usuarioActual.foto || generarAvatarPlaceholder(usuarioActual.nombre, 32);
        } else {
          // Si el mensaje tiene foto del remitente, usarla
          avatar = mensaje.remitenteFoto || avatarGenerico(32);
        }
        
        const tiempo = new Date(mensaje.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        // Formatear mensaje (convertir markdown básico)
        let mensajeFormateado = mensaje.mensaje
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **texto** -> <strong>texto</strong>
          .replace(/\n/g, '<br>'); // saltos de línea
        
        // Mensaje de texto
        div.innerHTML = `
          <img src="${avatar}" alt="Avatar" class="message-avatar" />
          <div class="message-content">
            <div class="message-bubble">${mensajeFormateado}</div>
            <span class="message-time">${tiempo}</span>
          </div>
        `;
        
        chatMessages.appendChild(div);
      });
      
      chatMessages.scrollTop = chatMessages.scrollHeight;
    })
    .catch(err => console.error('❌ [MESSAGES] Error al cargar mensajes:', err));
}

// ========== CONFIGURAR EVENT LISTENERS ==========
function configurarEventListeners() {
  // Cerrar sesión
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('usuarioActual');
        window.location.href = 'login.html';
      }
    });
  }
  
  // Formulario de mensaje
  const messageForm = document.getElementById('messageForm');
  if (messageForm) {
    messageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      enviarMensaje();
    });
  }
  
  // Cerrar chat
  const btnCloseChat = document.getElementById('btnCloseChat');
  if (btnCloseChat) {
    btnCloseChat.addEventListener('click', cerrarChat);
  }
}

// ========== ENVIAR MENSAJE ==========
function enviarMensaje() {
  if (!conversacionActiva) return;
  
  const messageInput = document.getElementById('messageInput');
  const mensaje = messageInput.value.trim();
  
  if (!mensaje) return;
  
  const data = {
    de: usuarioActual.id,
    para: conversacionActiva,
    mensaje: mensaje,
    fecha: new Date().toISOString(),
    leido: false
  };
  
  fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/mensajes.json', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  .then(response => {
    if (response.ok) {
      messageInput.value = '';
      cargarMensajes(conversacionActiva);
      cargarConversaciones();
    }
  })
  .catch(error => console.error('❌ [MESSAGES] Error al enviar:', error));
}

// ========== CERRAR CHAT ==========
function cerrarChat() {
  conversacionActiva = null;
  
  const chatEmpty = document.getElementById('chatEmpty');
  const chatActive = document.getElementById('chatActive');
  
  if (chatEmpty) chatEmpty.style.display = 'flex';
  if (chatActive) chatActive.style.display = 'none';
  
  document.querySelectorAll('.conversation-item').forEach(item => {
    item.classList.remove('active');
  });
}

// ========== UTILIDADES ==========
function calcularTiempo(fecha) {
  const ahora = new Date();
  const fechaMensaje = new Date(fecha);
  const diferencia = ahora - fechaMensaje;
  
  const segundos = Math.floor(diferencia / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  
  if (dias > 0) return `${dias}d`;
  if (horas > 0) return `${horas}h`;
  if (minutos > 0) return `${minutos}m`;
  return 'Ahora';
}

function mostrarError(titulo, mensaje, redirectUrl) {
  const conversationsList = document.getElementById('conversationsList');
  if (conversationsList) {
    conversationsList.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <p style="color: #d32f2f; font-weight: 600; margin-bottom: 10px;">${titulo}</p>
        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">${mensaje}</p>
        <button onclick="window.location.href='${redirectUrl}'" style="padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Ir a ${redirectUrl === 'login.html' ? 'Login' : 'Inicio'}
        </button>
      </div>
    `;
  }
}

// ========== MARCAR NOTIFICACIONES DE MENSAJES COMO LEÍDAS ==========
async function marcarNotificacionesMensajesComoLeidas(userId) {
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/notificaciones.json");
    const data = await response.json();
    
    if (!data) return;
    
    const updates = {};
    
    for (const id in data) {
      const notif = data[id];
      // Marcar como leída si es una notificación de mensaje del usuario con el que estamos chateando
      if (notif.tipo === 'mensaje' && 
          notif.para === usuarioActual.id && 
          notif.de === userId && 
          !notif.leida) {
        updates[`/notificaciones/${id}/leida`] = true;
        console.log('📝 [MESSAGES] Marcando notificación como leída:', id);
      }
    }
    
    if (Object.keys(updates).length > 0) {
      await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/.json", {
        method: "PATCH",
        body: JSON.stringify(updates)
      });
      
      console.log('✅ [MESSAGES] Notificaciones marcadas como leídas:', Object.keys(updates).length);
      
      // Recargar notificaciones para actualizar el contador
      setTimeout(() => {
        if (window.notifications && window.notifications.inicializarNotificaciones) {
          window.notifications.inicializarNotificaciones();
        }
      }, 500);
    }
  } catch (error) {
    console.error('❌ [MESSAGES] Error al marcar notificaciones como leídas:', error);
  }
}

console.log('✅ [MESSAGES] Script completamente cargado');
