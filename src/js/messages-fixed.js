// ========== MENSAJES - VERSIÓN SIMPLIFICADA QUE FUNCIONA ==========

console.log('✅ [MESSAGES] Script cargado');

let usuarioActual = null;
let conversacionActiva = null;
let mensajesCargados = [];
let cargandoMensajesAntiguos = false;
let todosLosMensajesCargados = false;
const MENSAJES_POR_CARGA = 20;
let ultimaActualizacionConversaciones = null;

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
  window.cargarMensajesRecientes = cargarMensajesRecientes;
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
  
  // Actualizar cada 30 segundos solo si hay cambios
  setInterval(() => {
    if (!conversacionActiva) {
      cargarConversacionesSilencioso();
    }
  }, 30000);
  
  console.log('✅ [MESSAGES] Inicialización completada');
});

// ========== CARGAR CONVERSACIONES SILENCIOSO (SIN PARPADEO) ==========
function cargarConversacionesSilencioso() {
  // No recargar si hay una conversación activa
  if (conversacionActiva) {
    console.log('📥 [MESSAGES] Conversación activa, no recargar');
    return;
  }
  
  fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/mensajes.json')
    .then(response => response.json())
    .then(data => {
      const dataHash = JSON.stringify(data);
      if (dataHash === ultimaActualizacionConversaciones) {
        console.log('📥 [MESSAGES] Sin cambios en conversaciones');
        return;
      }
      ultimaActualizacionConversaciones = dataHash;
      cargarConversaciones(false);
    })
    .catch(err => console.error('❌ [MESSAGES] Error en actualización silenciosa:', err));
}

// ========== CARGAR CONVERSACIONES ==========
function cargarConversaciones(mostrarLoading = true) {
  console.log('📥 [MESSAGES] Cargando conversaciones...');
  
  const conversationsList = document.getElementById('conversationsList');
  if (!conversationsList) {
    console.error('❌ [MESSAGES] No se encontró conversationsList');
    return;
  }
  
  // Mostrar loading solo si es la primera carga
  if (mostrarLoading) {
    conversationsList.innerHTML = `
      <div class="loading-conversations">
        <div class="spinner-small"></div>
        <p>Cargando conversaciones...</p>
      </div>
    `;
  }
  
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
      
      // Ordenar por fecha (más reciente primero)
      const conversacionesOrdenadas = Object.entries(conversaciones).sort((a, b) => {
        return new Date(b[1].ultimoMensaje.fecha) - new Date(a[1].ultimoMensaje.fecha);
      });
      
      // Limpiar lista solo si mostrarLoading es true
      if (mostrarLoading) {
        conversationsList.innerHTML = '';
      }
      
      // Guardar conversaciones ya renderizadas para evitar duplicados
      const conversacionesExistentes = new Set();
      document.querySelectorAll('.conversation-item').forEach(item => {
        const userId = item.dataset.userId;
        if (userId) conversacionesExistentes.add(userId);
      });
      
      // Renderizar cada conversación
      conversacionesOrdenadas.forEach(([userId, conv]) => {
        // Evitar duplicados
        if (conversacionesExistentes.has(userId) && !mostrarLoading) {
          return;
        }
        
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
            div.dataset.userId = userId; // Agregar ID para evitar duplicados
            if (noLeidos > 0) div.classList.add('unread');
            if (conversacionActiva === userId) div.classList.add('active');
            
            // Indicador de visto
            let indicadorVisto = '';
            if (esEnviado) {
              if (ultimoMensaje.leido) {
                indicadorVisto = '<span class="message-status read">✓✓</span>';
              } else {
                indicadorVisto = '<span class="message-status sent">✓</span>';
              }
            }
            
            div.innerHTML = `
              <img src="${obtenerAvatar(usuario, 48)}" alt="${usuario.nombre}" class="conversation-avatar" />
              <div class="conversation-info">
                <p class="conversation-name">${auth.renderNombreConBadge(usuario.nombre, usuario)}</p>
                <p class="conversation-last-message">${indicadorVisto} ${textoMensaje}</p>
              </div>
              <span class="conversation-time">${tiempo}</span>
              ${noLeidos > 0 ? `<span class="unread-badge">${noLeidos}</span>` : ''}
            `;
            
            div.addEventListener('click', () => abrirConversacion(userId, usuario));
            
            if (mostrarLoading) {
              conversationsList.appendChild(div);
            } else {
              // Insertar en orden si no es carga inicial
              const items = Array.from(conversationsList.children);
              let inserted = false;
              for (let i = 0; i < items.length; i++) {
                const itemUserId = items[i].dataset.userId;
                const itemConv = conversaciones[itemUserId];
                if (itemConv && new Date(conv.ultimoMensaje.fecha) > new Date(itemConv.ultimoMensaje.fecha)) {
                  conversationsList.insertBefore(div, items[i]);
                  inserted = true;
                  break;
                }
              }
              if (!inserted) {
                conversationsList.appendChild(div);
              }
            }
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
  
  // Marcar mensajes como leídos
  marcarMensajesComoLeidos(userId);
  
  // Marcar notificaciones de mensajes como leídas
  marcarNotificacionesMensajesComoLeidas(userId);
  
  // Cargar mensajes (solo los últimos)
  cargarMensajesRecientes(userId);
  
  // Recargar conversaciones después de marcar como leídos para actualizar el contador
  setTimeout(() => {
    cargarConversaciones(false);
  }, 500);
}

// ========== CARGAR MENSAJES RECIENTES (LAZY LOADING) ==========
function cargarMensajesRecientes(userId) {
  console.log('📨 [MESSAGES] Cargando mensajes recientes con:', userId);
  
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  // Resetear variables
  mensajesCargados = [];
  todosLosMensajesCargados = false;
  
  fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/mensajes.json')
    .then(r => r.json())
    .then(data => {
      if (!data) {
        chatMessages.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay mensajes</p>';
        return;
      }
      
      // Filtrar TODOS los mensajes de esta conversación
      const todosMensajes = [];
      
      for (const key in data) {
        const item = data[key];
        const esEstructuraAnidada = item && typeof item === 'object' && !item.mensaje && !item.de && !item.remitente;
        
        if (esEstructuraAnidada) {
          for (const mensajeId in item) {
            const mensaje = item[mensajeId];
            if (!mensaje || typeof mensaje !== 'object') continue;
            
            const remitente = mensaje.remitente || mensaje.de;
            const destinatario = mensaje.destinatario || mensaje.para;
            
            if (!remitente || !destinatario) continue;
            
            if ((remitente === usuarioActual.id && destinatario === userId) ||
                (remitente === userId && destinatario === usuarioActual.id)) {
              todosMensajes.push({ id: mensajeId, ...mensaje });
            }
          }
        } else {
          const mensaje = item;
          if (!mensaje || typeof mensaje !== 'object') continue;
          
          const remitente = mensaje.remitente || mensaje.de;
          const destinatario = mensaje.destinatario || mensaje.para;
          
          if (!remitente || !destinatario) continue;
          
          if ((remitente === usuarioActual.id && destinatario === userId) ||
              (remitente === userId && destinatario === usuarioActual.id)) {
            todosMensajes.push({ id: key, ...mensaje });
          }
        }
      }
      
      // Ordenar por fecha (más antiguos primero)
      todosMensajes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      
      // Guardar todos los mensajes
      mensajesCargados = todosMensajes;
      
      // Cargar solo los últimos MENSAJES_POR_CARGA
      const mensajesAMostrar = todosMensajes.slice(-MENSAJES_POR_CARGA);
      
      if (todosMensajes.length <= MENSAJES_POR_CARGA) {
        todosLosMensajesCargados = true;
      }
      
      // Renderizar
      renderizarMensajes(mensajesAMostrar, userId, true);
      
      // Configurar scroll listener para carga lazy
      configurarScrollLazy(chatMessages, userId);
    })
    .catch(err => console.error('❌ [MESSAGES] Error al cargar mensajes:', err));
}

// ========== RENDERIZAR MENSAJES ==========
function renderizarMensajes(mensajes, userId, scrollAlFinal = false) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  // Si es la primera carga, ocultar y limpiar
  if (scrollAlFinal) {
    chatMessages.style.opacity = '0';
    chatMessages.innerHTML = '';
  }
  
  fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios/${userId}.json`)
    .then(r => r.json())
    .then(otroUsuario => {
      const fragment = document.createDocumentFragment();
      
      mensajes.forEach(mensaje => {
        const div = document.createElement('div');
        const remitente = mensaje.remitente || mensaje.de;
        const esEnviado = remitente === usuarioActual.id;
        div.className = `message-item ${esEnviado ? 'sent' : 'received'}`;
        div.dataset.messageId = mensaje.id;
        
        let avatar;
        if (esEnviado) {
          avatar = obtenerAvatar(usuarioActual, 32);
        } else {
          if (mensaje.remitenteFoto) {
            avatar = mensaje.remitenteFoto;
          } else if (otroUsuario) {
            avatar = obtenerAvatar(otroUsuario, 32);
          } else {
            avatar = avatarGenerico(32);
          }
        }
        
        const tiempo = new Date(mensaje.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        let mensajeFormateado = mensaje.mensaje
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br>');
        
        // Indicador de visto para mensajes enviados
        let indicadorVisto = '';
        if (esEnviado) {
          if (mensaje.leido) {
            indicadorVisto = '<span class="message-status-inline read">✓✓</span>';
          } else {
            indicadorVisto = '<span class="message-status-inline sent">✓</span>';
          }
        }
        
        div.innerHTML = `
          <img src="${avatar}" alt="Avatar" class="message-avatar" />
          <div class="message-content">
            <div class="message-bubble">${mensajeFormateado}</div>
            <span class="message-time">${tiempo} ${indicadorVisto}</span>
          </div>
        `;
        
        if (scrollAlFinal) {
          fragment.appendChild(div);
        } else {
          // Insertar al principio para mensajes antiguos
          chatMessages.insertBefore(div, chatMessages.firstChild);
        }
      });
      
      if (scrollAlFinal) {
        chatMessages.appendChild(fragment);
        
        // Scroll al final INMEDIATAMENTE
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Mostrar con fade-in
        setTimeout(() => {
          chatMessages.style.opacity = '1';
        }, 50);
      }
    })
    .catch(err => console.error('❌ [MESSAGES] Error al renderizar:', err));
}

// ========== CONFIGURAR SCROLL LAZY ==========
function configurarScrollLazy(chatMessages, userId) {
  // Remover listener anterior si existe
  chatMessages.removeEventListener('scroll', chatMessages._scrollHandler);
  
  chatMessages._scrollHandler = function() {
    // Si está cerca del top (scrollTop < 100px) y no está cargando
    if (chatMessages.scrollTop < 100 && !cargandoMensajesAntiguos && !todosLosMensajesCargados) {
      cargarMensajesAntiguos(userId);
    }
  };
  
  chatMessages.addEventListener('scroll', chatMessages._scrollHandler);
}

// ========== CARGAR MENSAJES ANTIGUOS ==========
function cargarMensajesAntiguos(userId) {
  if (cargandoMensajesAntiguos || todosLosMensajesCargados) return;
  
  cargandoMensajesAntiguos = true;
  console.log('📜 [MESSAGES] Cargando mensajes antiguos...');
  
  const chatMessages = document.getElementById('chatMessages');
  const scrollAnterior = chatMessages.scrollHeight;
  
  // Mostrar indicador de carga
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-old-messages';
  loadingDiv.style.cssText = 'text-align: center; padding: 10px; color: #666; font-size: 12px;';
  loadingDiv.innerHTML = '<div class="spinner-small" style="margin: 0 auto;"></div><p style="margin: 5px 0 0 0;">Cargando mensajes antiguos...</p>';
  chatMessages.insertBefore(loadingDiv, chatMessages.firstChild);
  
  // Calcular cuántos mensajes ya están mostrados
  const mensajesMostrados = chatMessages.querySelectorAll('.message-item').length;
  const totalMensajes = mensajesCargados.length;
  
  // Calcular índice de inicio para los siguientes mensajes
  const indiceInicio = Math.max(0, totalMensajes - mensajesMostrados - MENSAJES_POR_CARGA);
  const indiceFin = totalMensajes - mensajesMostrados;
  
  if (indiceInicio >= indiceFin || indiceInicio < 0) {
    todosLosMensajesCargados = true;
    loadingDiv.innerHTML = '<p style="margin: 0; color: #999; font-size: 12px;">📭 No hay más mensajes</p>';
    setTimeout(() => loadingDiv.remove(), 2000);
    cargandoMensajesAntiguos = false;
    return;
  }
  
  const mensajesACargar = mensajesCargados.slice(indiceInicio, indiceFin);
  
  setTimeout(() => {
    // Remover indicador de carga
    loadingDiv.remove();
    
    // Renderizar mensajes antiguos
    renderizarMensajes(mensajesACargar, userId, false);
    
    // Mantener posición de scroll
    setTimeout(() => {
      const scrollNuevo = chatMessages.scrollHeight;
      chatMessages.scrollTop = scrollNuevo - scrollAnterior;
      cargandoMensajesAntiguos = false;
    }, 100);
    
    // Verificar si ya cargamos todos
    if (indiceInicio === 0) {
      todosLosMensajesCargados = true;
    }
  }, 500);
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
      cargarMensajesRecientes(conversacionActiva);
      cargarConversaciones(false);
      
      // Crear notificación para el destinatario
      crearNotificacionMensaje(conversacionActiva, mensaje);
    }
  })
  .catch(error => console.error('❌ [MESSAGES] Error al enviar:', error));
}

// ========== CREAR NOTIFICACIÓN DE MENSAJE ==========
async function crearNotificacionMensaje(destinatarioId, mensaje) {
  try {
    const notificacion = {
      tipo: 'mensaje',
      de: usuarioActual.id,
      para: destinatarioId,
      deNombre: usuarioActual.nombre,
      deFoto: usuarioActual.foto || null,
      mensaje: mensaje.substring(0, 100),
      fecha: new Date().toISOString(),
      leida: false,
      url: 'messages.html'
    };
    
    await fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/notificaciones.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificacion)
    });
    
    console.log('✅ [MESSAGES] Notificación creada para:', destinatarioId);
  } catch (error) {
    console.error('❌ [MESSAGES] Error al crear notificación:', error);
  }
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

// ========== OBTENER AVATAR ==========
function obtenerAvatar(usuario, size = 40) {
  if (usuario && usuario.foto) {
    return usuario.foto;
  }
  // Generar avatar con iniciales
  return generarAvatarPlaceholder(usuario ? usuario.nombre : 'Usuario', size);
}

function generarAvatarPlaceholder(nombre, size = 40) {
  const iniciales = nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  const colores = ['#1976d2', '#388e3c', '#d32f2f', '#f57c00', '#7b1fa2', '#0097a7'];
  const color = colores[nombre.length % colores.length];
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size
