// ========== VARIABLES GLOBALES ==========
let usuarioActual = null;
let conversacionActiva = null;
let intervalActualizacion = null;
let mensajesNoLeidos = {};

// Exponer variables globales para acceso desde HTML
window.usuarioActual = null;
window.conversacionActiva = null;
window.cargarMensajes = null;
window.cargarConversaciones = null;

// ========== PROTEGER PÁGINA Y CARGAR USUARIO ==========
window.addEventListener('DOMContentLoaded', function() {
  // Verificar sesión
  if (!auth.protegerPagina()) {
    return;
  }
  
  // Obtener usuario actual
  usuarioActual = auth.obtenerUsuarioActual();
  window.usuarioActual = usuarioActual;
  
  if (usuarioActual) {
    inicializarPagina();
  }
});

// ========== INICIALIZAR PÁGINA ==========
function inicializarPagina() {
  // Exponer funciones globalmente
  window.cargarMensajes = cargarMensajes;
  window.cargarConversaciones = cargarConversaciones;
  
  // Actualizar navbar
  actualizarNavbar();
  
  // Cargar conversaciones
  cargarConversaciones();
  
  // Event listeners
  configurarEventListeners();
  
  // Verificar si hay un usuario específico en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('user');
  
  if (userId && userId !== usuarioActual.id) {
    iniciarConversacion(userId);
  }
  
  // Actualizar conversaciones cada 15 segundos (reducido para evitar refresh constante)
  intervalActualizacion = setInterval(() => {
    if (conversacionActiva) {
      cargarMensajes(conversacionActiva, true); // true = actualización silenciosa
    }
    cargarConversaciones(); // Ya incluye actualización del contador
  }, 15000);
}

// ========== ACTUALIZAR NAVBAR ==========
function actualizarNavbar() {
  const navAvatar = document.getElementById('navAvatar');
  if (navAvatar) {
    navAvatar.src = usuarioActual.foto || 'https://via.placeholder.com/32';
  }
}

// ========== CONFIGURAR EVENT LISTENERS ==========
function configurarEventListeners() {
  // Botón cerrar sesión
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        if (intervalActualizacion) {
          clearInterval(intervalActualizacion);
        }
        auth.cerrarSesion();
      }
    });
  }
  
  // Botón nuevo mensaje
  const btnNewMessage = document.getElementById('btnNewMessage');
  const newMessageModal = document.getElementById('newMessageModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnGoToHome = document.getElementById('btnGoToHome');
  
  if (btnNewMessage && newMessageModal) {
    btnNewMessage.addEventListener('click', function() {
      newMessageModal.style.display = 'flex';
    });
  }
  
  if (btnCloseModal && newMessageModal) {
    btnCloseModal.addEventListener('click', function() {
      newMessageModal.style.display = 'none';
    });
  }
  
  if (btnGoToHome) {
    btnGoToHome.addEventListener('click', function() {
      window.location.href = 'home.html';
    });
  }
  
  // Cerrar modal al hacer click fuera
  if (newMessageModal) {
    newMessageModal.addEventListener('click', function(e) {
      if (e.target === newMessageModal) {
        newMessageModal.style.display = 'none';
      }
    });
  }
  
  // Formulario de mensaje
  const messageForm = document.getElementById('messageForm');
  if (messageForm) {
    messageForm.addEventListener('submit', enviarMensaje);
  }
  
  // Botón cerrar chat
  const btnCloseChat = document.getElementById('btnCloseChat');
  if (btnCloseChat) {
    btnCloseChat.addEventListener('click', cerrarChat);
  }
  
  // Botón ver perfil
  const btnViewProfile = document.getElementById('btnViewProfile');
  if (btnViewProfile) {
    btnViewProfile.addEventListener('click', function() {
      if (conversacionActiva) {
        window.location.href = `profile.html?user=${conversacionActiva}`;
      }
    });
  }
  
  // Búsqueda de conversaciones
  const searchConversations = document.getElementById('searchConversations');
  if (searchConversations) {
    searchConversations.addEventListener('input', function() {
      filtrarConversaciones(this.value);
    });
  }
  
  // Dropdown de perfil
  const navPerfil = document.getElementById('navPerfil');
  if (navPerfil) {
    navPerfil.addEventListener('click', function(e) {
      if (!e.target.closest('.dropdown-menu')) {
        this.classList.toggle('active');
      }
    });
  }
  
  // Cerrar dropdown al hacer click fuera
  document.addEventListener('click', function(e) {
    const navPerfil = document.getElementById('navPerfil');
    if (navPerfil && !navPerfil.contains(e.target)) {
      navPerfil.classList.remove('active');
    }
  });
}

// ========== CARGAR CONVERSACIONES ==========
async function cargarConversaciones() {
  const conversationsList = document.getElementById('conversationsList');
  const noConversations = document.getElementById('noConversations');
  
  if (!conversationsList) return;
  
  try {
    // Obtener todos los mensajes
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/mensajes.json");
    const data = await response.json();
    
    if (!data) {
      conversationsList.innerHTML = '';
      if (noConversations) noConversations.style.display = 'block';
      return;
    }
    
    // Limpiar contador de mensajes no leídos antes de recalcular
    mensajesNoLeidos = {};
    
    // Agrupar mensajes por conversación
    const conversaciones = {};
    
    for (const id in data) {
      const mensaje = data[id];
      
      // Solo mostrar conversaciones donde el usuario actual participa
      if (mensaje.de === usuarioActual.id || mensaje.para === usuarioActual.id) {
        const otroUsuarioId = mensaje.de === usuarioActual.id ? mensaje.para : mensaje.de;
        
        if (!conversaciones[otroUsuarioId]) {
          conversaciones[otroUsuarioId] = {
            ultimoMensaje: mensaje,
            mensajes: []
          };
        }
        
        conversaciones[otroUsuarioId].mensajes.push(mensaje);
        
        // Actualizar último mensaje si es más reciente
        if (new Date(mensaje.fecha) > new Date(conversaciones[otroUsuarioId].ultimoMensaje.fecha)) {
          conversaciones[otroUsuarioId].ultimoMensaje = mensaje;
        }
      }
    }
    
    if (Object.keys(conversaciones).length === 0) {
      conversationsList.innerHTML = '';
      if (noConversations) noConversations.style.display = 'block';
      // Actualizar contador a 0
      actualizarContadorNotificaciones();
      return;
    }
    
    if (noConversations) noConversations.style.display = 'none';
    
    // Ordenar conversaciones por fecha del último mensaje
    const conversacionesOrdenadas = Object.entries(conversaciones).sort((a, b) => {
      return new Date(b[1].ultimoMensaje.fecha) - new Date(a[1].ultimoMensaje.fecha);
    });
    
    // Renderizar conversaciones
    conversationsList.innerHTML = '';
    
    // Obtener todos los usuarios en paralelo para mejorar rendimiento
    const usuariosPromises = conversacionesOrdenadas.map(([userId]) => obtenerUsuario(userId));
    const usuarios = await Promise.all(usuariosPromises);
    
    conversacionesOrdenadas.forEach(([userId, conv], index) => {
      const usuario = usuarios[index];
      if (usuario) {
        const conversationElement = crearElementoConversacion(userId, usuario, conv);
        conversationsList.appendChild(conversationElement);
      }
    });
    
    // Actualizar contador de notificaciones después de renderizar
    actualizarContadorNotificaciones();
    
  } catch (error) {
    console.error('Error al cargar conversaciones:', error);
    conversationsList.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Error al cargar conversaciones</p>';
  }
}

// ========== CREAR ELEMENTO DE CONVERSACIÓN ==========
function crearElementoConversacion(userId, usuario, conversacion) {
  const div = document.createElement('div');
  div.className = 'conversation-item';
  if (conversacionActiva === userId) {
    div.classList.add('active');
  }
  
  const ultimoMensaje = conversacion.ultimoMensaje;
  const esEnviado = ultimoMensaje.de === usuarioActual.id;
  const textoMensaje = esEnviado ? `Tú: ${ultimoMensaje.mensaje}` : ultimoMensaje.mensaje;
  
  // Contar mensajes no leídos
  const noLeidos = conversacion.mensajes.filter(m => 
    m.para === usuarioActual.id && !m.leido
  ).length;
  
  if (noLeidos > 0) {
    div.classList.add('unread');
    mensajesNoLeidos[userId] = noLeidos;
  }
  
  const tiempo = calcularTiempoTranscurrido(ultimoMensaje.fecha);
  const badgeNoLeidos = noLeidos > 0 ? `<span class="unread-badge">${noLeidos}</span>` : '';
  
  // Renderizar nombre con badge si existe la función
  let nombreConBadge = usuario.nombre;
  if (window.auth && typeof window.auth.renderNombreConBadge === 'function') {
    nombreConBadge = window.auth.renderNombreConBadge(usuario.nombre, usuario);
  } else if (usuario.verificado) {
    nombreConBadge = `${usuario.nombre} <span class="verified-badge">✓</span>`;
  }
  
  div.innerHTML = `
    <img src="${usuario.foto || 'https://via.placeholder.com/48'}" alt="${usuario.nombre}" class="conversation-avatar" />
    <div class="conversation-info">
      <p class="conversation-name">${nombreConBadge}</p>
      <p class="conversation-last-message">${textoMensaje}</p>
    </div>
    <span class="conversation-time">${tiempo}</span>
    ${badgeNoLeidos}
  `;
  
  div.addEventListener('click', function() {
    abrirConversacion(userId, usuario);
  });
  
  return div;
}

// ========== ABRIR CONVERSACIÓN ==========
async function abrirConversacion(userId, usuario) {
  conversacionActiva = userId;
  window.conversacionActiva = userId;
  
  // Marcar mensajes como leídos
  await marcarMensajesComoLeidos(userId);
  
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
  }
  
  // Actualizar header del chat
  const chatAvatar = document.getElementById('chatAvatar');
  const chatUserName = document.getElementById('chatUserName');
  const chatUserStatus = document.getElementById('chatUserStatus');
  
  if (chatAvatar) chatAvatar.src = usuario.foto || 'https://via.placeholder.com/40';
  
  // Renderizar nombre con badge
  if (chatUserName) {
    let nombreConBadge = usuario.nombre;
    if (window.auth && typeof window.auth.renderNombreConBadge === 'function') {
      nombreConBadge = window.auth.renderNombreConBadge(usuario.nombre, usuario);
    } else if (usuario.verificado) {
      nombreConBadge = `${usuario.nombre} <span class="verified-badge">✓</span>`;
    }
    chatUserName.innerHTML = nombreConBadge;
  }
  
  if (chatUserStatus) chatUserStatus.textContent = usuario.perfil || 'Usuario';
  
  // Actualizar conversaciones activas
  document.querySelectorAll('.conversation-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const conversationItems = document.querySelectorAll('.conversation-item');
  conversationItems.forEach(item => {
    if (item.querySelector('.conversation-name').textContent.includes(usuario.nombre)) {
      item.classList.add('active');
    }
  });
  
  // Cargar mensajes
  await cargarMensajes(userId);
  
  // Focus en el input
  const messageInput = document.getElementById('messageInput');
  if (messageInput) {
    messageInput.focus();
  }
  
  // Actualizar contador de notificaciones
  await actualizarContadorNotificaciones();
}

// ========== INICIAR CONVERSACIÓN (desde publicación) ==========
async function iniciarConversacion(userId) {
  const usuario = await obtenerUsuario(userId);
  if (usuario) {
    await abrirConversacion(userId, usuario);
  }
}

// ========== CARGAR MENSAJES ==========
async function cargarMensajes(userId, silencioso = false) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/mensajes.json");
    const data = await response.json();
    
    if (!data) {
      if (!silencioso) {
        chatMessages.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay mensajes aún. ¡Envía el primero!</p>';
      }
      return;
    }
    
    // Filtrar mensajes de esta conversación
    const mensajes = [];
    for (const id in data) {
      const mensaje = data[id];
      if ((mensaje.de === usuarioActual.id && mensaje.para === userId) ||
          (mensaje.de === userId && mensaje.para === usuarioActual.id)) {
        mensajes.push({ id, ...mensaje });
      }
    }
    
    // Ordenar por fecha
    mensajes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    if (mensajes.length === 0) {
      if (!silencioso) {
        chatMessages.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay mensajes aún. ¡Envía el primero!</p>';
      }
      return;
    }
    
    // Guardar posición del scroll antes de actualizar
    const scrollPos = chatMessages.scrollTop;
    const scrollHeight = chatMessages.scrollHeight;
    const isAtBottom = scrollHeight - scrollPos - chatMessages.clientHeight < 50;
    
    // Renderizar mensajes solo si hay cambios
    const currentMessagesCount = chatMessages.querySelectorAll('.message-item').length;
    if (!silencioso || currentMessagesCount !== mensajes.length) {
      chatMessages.innerHTML = '';
      
      let fechaAnterior = null;
      
      mensajes.forEach(mensaje => {
        const fechaMensaje = new Date(mensaje.fecha).toLocaleDateString();
        
        // Agregar divisor de fecha si cambió el día
        if (fechaMensaje !== fechaAnterior) {
          const divider = document.createElement('div');
          divider.className = 'message-date-divider';
          divider.innerHTML = `<span class="date-divider-text">${formatearFecha(mensaje.fecha)}</span>`;
          chatMessages.appendChild(divider);
          fechaAnterior = fechaMensaje;
        }
        
        const messageElement = crearElementoMensaje(mensaje);
        chatMessages.appendChild(messageElement);
      });
      
      // Scroll al final solo si estaba al final o no es actualización silenciosa
      if (!silencioso || isAtBottom) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      } else {
        chatMessages.scrollTop = scrollPos;
      }
    }
    
  } catch (error) {
    console.error('Error al cargar mensajes:', error);
    if (!silencioso) {
      chatMessages.innerHTML = '<p style="text-align: center; color: #d32f2f; padding: 20px;">Error al cargar mensajes</p>';
    }
  }
}

// ========== CREAR ELEMENTO DE MENSAJE ==========
function crearElementoMensaje(mensaje) {
  const div = document.createElement('div');
  const esEnviado = mensaje.de === usuarioActual.id;
  
  div.className = `message-item ${esEnviado ? 'sent' : 'received'}`;
  
  const avatar = esEnviado ? usuarioActual.foto : 'https://via.placeholder.com/32';
  const tiempo = new Date(mensaje.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  
  // Indicador de visto (solo para mensajes enviados)
  const vistoIndicador = esEnviado ? 
    `<span class="message-read-indicator ${mensaje.leido ? '' : 'unread'}">${mensaje.leido ? '✓✓' : '✓'}</span>` : 
    '';
  
  // Contenido del mensaje (texto o audio)
  let contenidoMensaje = '';
  if (mensaje.tipo === 'audio' && mensaje.audio) {
    contenidoMensaje = `
      <div class="message-audio">
        <audio controls>
          <source src="${mensaje.audio}" type="audio/webm">
          Tu navegador no soporta audio.
        </audio>
      </div>
    `;
  } else {
    contenidoMensaje = `<div class="message-bubble">${mensaje.mensaje}</div>`;
  }
  
  div.innerHTML = `
    <img src="${avatar || 'https://via.placeholder.com/32'}" alt="Avatar" class="message-avatar" />
    <div class="message-content">
      ${contenidoMensaje}
      <span class="message-time">${tiempo} ${vistoIndicador}</span>
    </div>
  `;
  
  return div;
}

// ========== ENVIAR MENSAJE ==========
async function enviarMensaje(e) {
  e.preventDefault();
  
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
  
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/mensajes.json", {
      method: "POST",
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      messageInput.value = '';
      await cargarMensajes(conversacionActiva);
      await cargarConversaciones();
      
      // Crear notificación para el destinatario
      if (window.notifications) {
        const mensajeCorto = mensaje.length > 50 ? mensaje.substring(0, 50) + '...' : mensaje;
        window.notifications.crearNotificacion(
          'mensaje',
          conversacionActiva,
          `${usuarioActual.nombre}: ${mensajeCorto}`,
          null
        );
      }
    }
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    alert('Error al enviar el mensaje. Por favor intenta de nuevo.');
  }
}

// ========== CERRAR CHAT ==========
function cerrarChat() {
  conversacionActiva = null;
  window.conversacionActiva = null;
  
  const chatEmpty = document.getElementById('chatEmpty');
  const chatActive = document.getElementById('chatActive');
  const chatArea = document.querySelector('.chat-area');
  const conversationsSidebar = document.querySelector('.conversations-sidebar');
  
  if (chatEmpty) chatEmpty.style.display = 'flex';
  if (chatActive) chatActive.style.display = 'none';
  
  // En móvil, ocultar chat y mostrar sidebar
  if (window.innerWidth <= 768) {
    if (chatArea) chatArea.classList.remove('mobile-show');
    if (conversationsSidebar) conversationsSidebar.classList.remove('mobile-hide');
  }
  
  // Quitar active de conversaciones
  document.querySelectorAll('.conversation-item').forEach(item => {
    item.classList.remove('active');
  });
}

// ========== FILTRAR CONVERSACIONES ==========
function filtrarConversaciones(busqueda) {
  const conversationItems = document.querySelectorAll('.conversation-item');
  const busquedaLower = busqueda.toLowerCase();
  
  conversationItems.forEach(item => {
    const nombre = item.querySelector('.conversation-name').textContent.toLowerCase();
    if (nombre.includes(busquedaLower)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

// ========== OBTENER USUARIO ==========
async function obtenerUsuario(userId) {
  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios/${userId}.json`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
}

// ========== CALCULAR TIEMPO TRANSCURRIDO ==========
function calcularTiempoTranscurrido(fecha) {
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

// ========== FORMATEAR FECHA ==========
function formatearFecha(fecha) {
  const fechaMensaje = new Date(fecha);
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  
  if (fechaMensaje.toDateString() === hoy.toDateString()) {
    return 'Hoy';
  } else if (fechaMensaje.toDateString() === ayer.toDateString()) {
    return 'Ayer';
  } else {
    return fechaMensaje.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}

// ========== MARCAR MENSAJES COMO LEÍDOS ==========
async function marcarMensajesComoLeidos(userId) {
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/mensajes.json");
    const data = await response.json();
    
    if (!data) return;
    
    const updates = {};
    
    for (const id in data) {
      const mensaje = data[id];
      // Marcar como leído si es para el usuario actual y viene del otro usuario
      if (mensaje.para === usuarioActual.id && mensaje.de === userId && !mensaje.leido) {
        updates[`/mensajes/${id}/leido`] = true;
      }
    }
    
    if (Object.keys(updates).length > 0) {
      await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/.json", {
        method: "PATCH",
        body: JSON.stringify(updates)
      });
    }
  } catch (error) {
    console.error('Error al marcar mensajes como leídos:', error);
  }
}

// ========== ACTUALIZAR CONTADOR DE NOTIFICACIONES ==========
async function actualizarContadorNotificaciones() {
  try {
    // Recalcular mensajes no leídos desde la base de datos
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/mensajes.json");
    const data = await response.json();
    
    if (!data) {
      mensajesNoLeidos = {};
    } else {
      // Limpiar contador
      mensajesNoLeidos = {};
      
      // Contar mensajes no leídos por conversación
      for (const id in data) {
        const mensaje = data[id];
        if (mensaje.para === usuarioActual.id && !mensaje.leido) {
          const otroUsuarioId = mensaje.de;
          mensajesNoLeidos[otroUsuarioId] = (mensajesNoLeidos[otroUsuarioId] || 0) + 1;
        }
      }
    }
    
    const totalNoLeidos = Object.values(mensajesNoLeidos).reduce((sum, count) => sum + count, 0);
    
    const notificationsBadge = document.getElementById('notificationsBadge');
    if (notificationsBadge) {
      if (totalNoLeidos > 0) {
        notificationsBadge.textContent = totalNoLeidos;
        notificationsBadge.style.display = 'flex';
      } else {
        notificationsBadge.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error al actualizar contador de notificaciones:', error);
  }
}

// Limpiar intervalo al salir de la página
window.addEventListener('beforeunload', function() {
  if (intervalActualizacion) {
    clearInterval(intervalActualizacion);
  }
});
