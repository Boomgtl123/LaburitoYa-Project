// ========== VARIABLES GLOBALES ==========
let usuarioActual = null;
let conversacionActiva = null;
let intervalActualizacion = null;

// ========== PROTEGER PÁGINA Y CARGAR USUARIO ==========
window.addEventListener('DOMContentLoaded', function() {
  // Verificar sesión
  if (!auth.protegerPagina()) {
    return;
  }
  
  // Obtener usuario actual
  usuarioActual = auth.obtenerUsuarioActual();
  
  if (usuarioActual) {
    inicializarPagina();
  }
});

// ========== INICIALIZAR PÁGINA ==========
function inicializarPagina() {
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
  
  // Actualizar conversaciones cada 5 segundos
  intervalActualizacion = setInterval(() => {
    if (conversacionActiva) {
      cargarMensajes(conversacionActiva);
    }
    cargarConversaciones();
  }, 5000);
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
      return;
    }
    
    if (noConversations) noConversations.style.display = 'none';
    
    // Ordenar conversaciones por fecha del último mensaje
    const conversacionesOrdenadas = Object.entries(conversaciones).sort((a, b) => {
      return new Date(b[1].ultimoMensaje.fecha) - new Date(a[1].ultimoMensaje.fecha);
    });
    
    // Renderizar conversaciones
    conversationsList.innerHTML = '';
    
    for (const [userId, conv] of conversacionesOrdenadas) {
      const usuario = await obtenerUsuario(userId);
      if (usuario) {
        const conversationElement = crearElementoConversacion(userId, usuario, conv);
        conversationsList.appendChild(conversationElement);
      }
    }
    
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
  
  const tiempo = calcularTiempoTranscurrido(ultimoMensaje.fecha);
  
  div.innerHTML = `
    <img src="${usuario.foto || 'https://via.placeholder.com/48'}" alt="${usuario.nombre}" class="conversation-avatar" />
    <div class="conversation-info">
      <p class="conversation-name">${usuario.nombre}</p>
      <p class="conversation-last-message">${textoMensaje}</p>
    </div>
    <span class="conversation-time">${tiempo}</span>
  `;
  
  div.addEventListener('click', function() {
    abrirConversacion(userId, usuario);
  });
  
  return div;
}

// ========== ABRIR CONVERSACIÓN ==========
async function abrirConversacion(userId, usuario) {
  conversacionActiva = userId;
  
  // Actualizar UI
  const chatEmpty = document.getElementById('chatEmpty');
  const chatActive = document.getElementById('chatActive');
  
  if (chatEmpty) chatEmpty.style.display = 'none';
  if (chatActive) chatActive.style.display = 'flex';
  
  // Actualizar header del chat
  const chatAvatar = document.getElementById('chatAvatar');
  const chatUserName = document.getElementById('chatUserName');
  const chatUserStatus = document.getElementById('chatUserStatus');
  
  if (chatAvatar) chatAvatar.src = usuario.foto || 'https://via.placeholder.com/40';
  if (chatUserName) chatUserName.textContent = usuario.nombre;
  if (chatUserStatus) chatUserStatus.textContent = usuario.perfil || 'Usuario';
  
  // Actualizar conversaciones activas
  document.querySelectorAll('.conversation-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const conversationItems = document.querySelectorAll('.conversation-item');
  conversationItems.forEach(item => {
    if (item.querySelector('.conversation-name').textContent === usuario.nombre) {
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
}

// ========== INICIAR CONVERSACIÓN (desde publicación) ==========
async function iniciarConversacion(userId) {
  const usuario = await obtenerUsuario(userId);
  if (usuario) {
    await abrirConversacion(userId, usuario);
  }
}

// ========== CARGAR MENSAJES ==========
async function cargarMensajes(userId) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/mensajes.json");
    const data = await response.json();
    
    if (!data) {
      chatMessages.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay mensajes aún. ¡Envía el primero!</p>';
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
      chatMessages.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay mensajes aún. ¡Envía el primero!</p>';
      return;
    }
    
    // Renderizar mensajes
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
    
    // Scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
  } catch (error) {
    console.error('Error al cargar mensajes:', error);
    chatMessages.innerHTML = '<p style="text-align: center; color: #d32f2f; padding: 20px;">Error al cargar mensajes</p>';
  }
}

// ========== CREAR ELEMENTO DE MENSAJE ==========
function crearElementoMensaje(mensaje) {
  const div = document.createElement('div');
  const esEnviado = mensaje.de === usuarioActual.id;
  
  div.className = `message-item ${esEnviado ? 'sent' : 'received'}`;
  
  const avatar = esEnviado ? usuarioActual.foto : 'https://via.placeholder.com/32';
  const tiempo = new Date(mensaje.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  
  div.innerHTML = `
    <img src="${avatar || 'https://via.placeholder.com/32'}" alt="Avatar" class="message-avatar" />
    <div class="message-content">
      <div class="message-bubble">${mensaje.mensaje}</div>
      <span class="message-time">${tiempo}</span>
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
    fecha: new Date().toISOString()
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
  
  const chatEmpty = document.getElementById('chatEmpty');
  const chatActive = document.getElementById('chatActive');
  
  if (chatEmpty) chatEmpty.style.display = 'flex';
  if (chatActive) chatActive.style.display = 'none';
  
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

// Limpiar intervalo al salir de la página
window.addEventListener('beforeunload', function() {
  if (intervalActualizacion) {
    clearInterval(intervalActualizacion);
  }
});
