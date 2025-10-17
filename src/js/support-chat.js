// ========== SISTEMA DE CHAT DE SOPORTE ==========

let conversacionActual = [];
let ticketActual = null;
let esperandoRespuesta = false;
let chatInicializado = false; // Prevenir múltiples inicializaciones

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
  if (!chatInicializado) {
    inicializarChatSoporte();
  }
});

function inicializarChatSoporte() {
  // Prevenir múltiples inicializaciones
  if (chatInicializado) {
    console.log('⚠️ Chat de soporte ya inicializado');
    return;
  }

  const floatingBtn = document.getElementById('floatingSupportBtn');
  const chatModal = document.getElementById('supportChatModal');
  const closeBtn = document.getElementById('closeSupportChat');
  const sendBtn = document.getElementById('supportSendBtn');
  const messageInput = document.getElementById('supportMessageInput');

  if (!floatingBtn || !chatModal) {
    console.warn('⚠️ Elementos del chat de soporte no encontrados');
    return;
  }

  // Abrir chat
  floatingBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    chatModal.classList.add('active');
    cargarSugerencias();
    messageInput.focus();
    
    // Marcar notificaciones como leídas
    const badge = document.getElementById('supportBadge');
    if (badge) {
      badge.style.display = 'none';
      badge.textContent = '0';
    }
  });

  // Cerrar chat
  closeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    chatModal.classList.remove('active');
  });

  // Enviar mensaje con botón
  sendBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    enviarMensajeChatbot();
  });
  
  // Enviar mensaje con Enter
  messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      enviarMensajeChatbot();
    }
  });

  // Auto-resize del textarea
  messageInput.addEventListener('input', function(e) {
    e.stopPropagation();
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });

  // Prevenir que el modal se cierre al hacer clic dentro
  chatModal.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  // Cerrar modal al hacer clic fuera
  document.addEventListener('click', function(e) {
    if (chatModal.classList.contains('active') && 
        !chatModal.contains(e.target) && 
        !floatingBtn.contains(e.target)) {
      chatModal.classList.remove('active');
    }
  });

  // Toggle de sugerencias colapsables
  const suggestionsHeader = document.getElementById('suggestionsHeader');
  const quickSuggestions = document.getElementById('quickSuggestions');
  
  if (suggestionsHeader && quickSuggestions) {
    suggestionsHeader.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      quickSuggestions.classList.toggle('collapsed');
      console.log('🔄 Toggle sugerencias:', quickSuggestions.classList.contains('collapsed') ? 'colapsado' : 'expandido');
    });
  }

  // Verificar tickets pendientes
  verificarTicketsPendientes();

  chatInicializado = true;
  console.log('✅ Chat de soporte inicializado correctamente');
}

// ========== CARGAR SUGERENCIAS ==========
function cargarSugerencias() {
  const suggestionsGrid = document.getElementById('suggestionsGrid');
  
  if (!suggestionsGrid || !window.supportAI) return;

  const sugerencias = window.supportAI.obtenerSugerencias();
  
  suggestionsGrid.innerHTML = sugerencias.map(sugerencia => `
    <button class="suggestion-btn" onclick="usarSugerencia('${sugerencia.replace(/'/g, "\\'")}')">
      ${sugerencia}
    </button>
  `).join('');
}

// ========== USAR SUGERENCIA ==========
function usarSugerencia(texto) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  // Prevenir si ya está esperando respuesta
  if (esperandoRespuesta) {
    console.log('⚠️ Ya hay un mensaje en proceso');
    return;
  }
  
  const messageInput = document.getElementById('supportMessageInput');
  messageInput.value = texto;
  messageInput.focus();
  
  // Enviar inmediatamente sin timeout para evitar duplicados
  enviarMensajeChatbot();
}

// ========== ENVIAR MENSAJE DEL CHATBOT ==========
async function enviarMensajeChatbot() {
  // Validación robusta para prevenir duplicados
  if (esperandoRespuesta) {
    console.log('⚠️ Ya hay un mensaje siendo procesado');
    return;
  }

  const messageInput = document.getElementById('supportMessageInput');
  const sendBtn = document.getElementById('supportSendBtn');
  const mensaje = messageInput.value.trim();
  
  if (!mensaje) {
    console.log('⚠️ Mensaje vacío');
    return;
  }

  // Marcar como esperando respuesta INMEDIATAMENTE
  esperandoRespuesta = true;
  
  // Deshabilitar controles
  if (sendBtn) sendBtn.disabled = true;
  if (messageInput) messageInput.disabled = true;

  console.log('📤 Enviando mensaje:', mensaje);

  // Limpiar input
  messageInput.value = '';
  messageInput.style.height = 'auto';

  // Agregar mensaje del usuario
  agregarMensaje(mensaje, true);

  // Guardar en conversación
  conversacionActual.push({
    rol: 'usuario',
    mensaje: mensaje,
    fecha: new Date().toISOString()
  });

  // Mostrar indicador de escritura
  mostrarIndicadorEscritura();

  try {
    // Simular delay de respuesta (más natural)
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    // Obtener respuesta de la IA
    const respuesta = window.supportAI.buscarRespuesta(mensaje);

    console.log('📥 Respuesta recibida:', respuesta.category);

    // Ocultar indicador
    ocultarIndicadorEscritura();

    // Agregar respuesta de la IA
    agregarMensaje(respuesta.response, false);

    // Guardar en conversación
    conversacionActual.push({
      rol: 'asistente',
      mensaje: respuesta.response,
      categoria: respuesta.category,
      fecha: new Date().toISOString()
    });

    // Si no se encontró respuesta, ofrecer crear ticket
    if (!respuesta.found) {
      await new Promise(resolve => setTimeout(resolve, 500));
      mostrarOpcionCrearTicket();
    }
  } catch (error) {
    console.error('❌ Error al procesar mensaje:', error);
    ocultarIndicadorEscritura();
    agregarMensaje('Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.', false);
  } finally {
    // Rehabilitar controles
    esperandoRespuesta = false;
    if (sendBtn) sendBtn.disabled = false;
    if (messageInput) {
      messageInput.disabled = false;
      messageInput.focus();
    }
    console.log('✅ Mensaje procesado completamente');
  }
}

// ========== AGREGAR MENSAJE AL CHAT ==========
function agregarMensaje(texto, esUsuario = false) {
  const messagesContainer = document.getElementById('supportChatMessages');
  const usuarioActual = window.auth ? window.auth.obtenerUsuarioActual() : null;

  const messageDiv = document.createElement('div');
  messageDiv.className = `support-message ${esUsuario ? 'user' : 'bot'}`;

  const avatar = esUsuario 
    ? (usuarioActual?.foto || 'https://via.placeholder.com/32')
    : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Crect fill="%23667eea" width="32" height="32" rx="16"/%3E%3Ctext fill="white" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="18"%3E🤖%3C/text%3E%3C/svg%3E';

  messageDiv.innerHTML = `
    <img src="${avatar}" alt="Avatar" class="message-avatar" />
    <div class="message-content">
      <div class="message-bubble">${formatearMensaje(texto)}</div>
      <div class="message-time">${formatearHora(new Date())}</div>
    </div>
  `;

  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

// ========== FORMATEAR MENSAJE ==========
function formatearMensaje(texto) {
  // Convertir markdown básico a HTML
  let formatted = texto
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **negrita**
    .replace(/\n/g, '<br>') // saltos de línea
    .replace(/• /g, '&bull; '); // bullets

  return formatted;
}

// ========== FORMATEAR HORA ==========
function formatearHora(fecha) {
  return fecha.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// ========== INDICADOR DE ESCRITURA ==========
function mostrarIndicadorEscritura() {
  const messagesContainer = document.getElementById('supportChatMessages');
  
  const typingDiv = document.createElement('div');
  typingDiv.className = 'typing-indicator active';
  typingDiv.id = 'typingIndicator';
  typingDiv.innerHTML = `
    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect fill='%23667eea' width='32' height='32' rx='16'/%3E%3Ctext fill='white' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='18'%3E🤖%3C/text%3E%3C/svg%3E" alt="Bot" class="message-avatar" />
    <div class="typing-dots">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  
  messagesContainer.appendChild(typingDiv);
  scrollToBottom();
}

function ocultarIndicadorEscritura() {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// ========== MOSTRAR OPCIÓN CREAR TICKET ==========
function mostrarOpcionCrearTicket() {
  const messagesContainer = document.getElementById('supportChatMessages');
  
  const promptDiv = document.createElement('div');
  promptDiv.className = 'create-ticket-prompt';
  promptDiv.innerHTML = `
    <p>💡 <strong>¿No encontraste lo que buscabas?</strong></p>
    <p>Puedo crear un ticket de soporte para que un agente humano te ayude personalmente.</p>
    <button class="btn-create-ticket" onclick="crearTicketDesdeChat()">
      📝 Crear Ticket de Soporte
    </button>
  `;
  
  messagesContainer.appendChild(promptDiv);
  scrollToBottom();
}

// ========== CREAR TICKET DESDE CHAT ==========
async function crearTicketDesdeChat() {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  console.log('🎫 Iniciando creación de ticket...');
  console.log('🔍 Verificando disponibilidad de window.supportTickets...');
  
  // Función mejorada para esperar a que el sistema esté listo
  const esperarSistemaTickets = async () => {
    return new Promise((resolve, reject) => {
      let intentos = 0;
      const maxIntentos = 30; // 3 segundos máximo
      
      const verificar = () => {
        intentos++;
        console.log(`🔄 Intento ${intentos}/${maxIntentos} - Verificando window.supportTickets...`);
        
        // Verificar si existe y está listo (probar ambas versiones)
        const sistema = window.supportTickets || window.supportTicketsTest;
        
        if (sistema) {
          console.log('✅ Sistema de tickets encontrado:', sistema === window.supportTickets ? 'supportTickets' : 'supportTicketsTest');
          
          // Verificar si tiene la función estaListo
          if (typeof sistema.estaListo === 'function') {
            if (sistema.estaListo()) {
              console.log('✅ Sistema de tickets confirmado como listo');
              resolve(true);
              return;
            } else {
              console.log('⏳ Sistema de tickets existe pero no está listo aún');
            }
          } else {
            // Si no tiene estaListo, asumir que está listo si tiene crearTicket
            if (typeof sistema.crearTicket === 'function') {
              console.log('✅ Sistema de tickets tiene crearTicket, asumiendo listo');
              resolve(true);
              return;
            }
          }
        } else {
          console.log('⏳ Sistema de tickets aún no está disponible');
        }
        
        if (intentos >= maxIntentos) {
          console.error('❌ Timeout esperando sistema de tickets');
          reject(new Error('Timeout esperando sistema de tickets'));
          return;
        }
        
        setTimeout(verificar, 100);
      };
      
      verificar();
    });
  };
  
  try {
    // Esperar a que el sistema esté listo
    await esperarSistemaTickets();
    console.log('✅ Sistema de tickets verificado y listo');
  } catch (error) {
    console.error('❌ Error esperando sistema de tickets:', error);
    agregarMensaje(
      '❌ Lo siento, el sistema de tickets no está disponible en este momento.\n\n' +
      '**Posibles soluciones:**\n' +
      '• Recarga la página e intenta de nuevo\n' +
      '• Verifica tu conexión a internet\n' +
      '• Si el problema persiste, contacta a soporte@laburitoya.com',
      false
    );
    return;
  }

  const usuarioActual = window.auth ? window.auth.obtenerUsuarioActual() : null;
  
  if (!usuarioActual) {
    console.error('❌ Usuario no autenticado');
    agregarMensaje(
      '❌ Debes iniciar sesión para crear un ticket de soporte.',
      false
    );
    return;
  }
  
  console.log('✅ Usuario autenticado:', usuarioActual.nombre);

  // Deshabilitar botón
  const btn = event ? event.target : null;
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Creando ticket...';
  }

  try {
    // Extraer el último mensaje del usuario como asunto
    const ultimoMensajeUsuario = conversacionActual
      .filter(m => m.rol === 'usuario')
      .pop();

    const asunto = ultimoMensajeUsuario 
      ? ultimoMensajeUsuario.mensaje.substring(0, 100)
      : 'Consulta desde chat de soporte';

    // Crear resumen de la conversación
    const resumenConversacion = conversacionActual
      .map(m => `[${m.rol.toUpperCase()}]: ${m.mensaje}`)
      .join('\n\n');

    const ticketData = {
      asunto: asunto,
      mensaje: resumenConversacion,
      categoria: 'chat_soporte',
      prioridad: 'media',
      conversacion: conversacionActual
    };

    console.log('📤 Enviando datos del ticket:', ticketData);
    
    // Usar el sistema disponible
    const sistema = window.supportTickets || window.supportTicketsTest;
    console.log('📤 Usando sistema:', sistema === window.supportTickets ? 'supportTickets' : 'supportTicketsTest');
    
    const result = await sistema.crearTicket(ticketData);
    
    console.log('📥 Resultado de creación:', result);

    if (result.success) {
      ticketActual = result.ticketId;
      console.log('✅ Ticket creado exitosamente:', ticketActual);
      
      mostrarTicketCreado(result.ticketId);
      
      // Agregar mensaje de confirmación
      agregarMensaje(
        `✅ ¡Ticket creado exitosamente!\n\n` +
        `Tu ticket #${result.ticketId.substring(0, 8)} ha sido creado. ` +
        `Nuestro equipo de soporte te responderá pronto.\n\n` +
        `Recibirás una notificación cuando haya una respuesta.`,
        false
      );
    } else {
      console.error('❌ Error al crear ticket:', result.error);
      if (btn) {
        btn.disabled = false;
        btn.textContent = '📝 Crear Ticket de Soporte';
      }
      agregarMensaje(
        `❌ Error al crear ticket: ${result.error}\n\n` +
        `Por favor, intenta de nuevo o contacta a soporte@laburitoya.com`,
        false
      );
    }
  } catch (error) {
    console.error('❌ Excepción al crear ticket:', error);
    if (btn) {
      btn.disabled = false;
      btn.textContent = '📝 Crear Ticket de Soporte';
    }
    agregarMensaje(
      `❌ Error inesperado al crear ticket.\n\n` +
      `Por favor, intenta de nuevo. Si el problema persiste, contacta a soporte@laburitoya.com`,
      false
    );
  }
}

// ========== MOSTRAR TICKET CREADO ==========
function mostrarTicketCreado(ticketId) {
  const messagesContainer = document.getElementById('supportChatMessages');
  
  const ticketDiv = document.createElement('div');
  ticketDiv.className = 'ticket-created-message';
  ticketDiv.innerHTML = `
    <h4>✅ Ticket Creado</h4>
    <p>ID: <span class="ticket-id">#${ticketId.substring(0, 8)}</span></p>
    <p>Nuestro equipo te responderá pronto</p>
    <button class="btn-view-tickets" onclick="verMisTickets()">
      Ver Mis Tickets
    </button>
  `;
  
  messagesContainer.appendChild(ticketDiv);
  scrollToBottom();
}

// ========== VER MIS TICKETS ==========
async function verMisTickets() {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  // Redirigir a una página de tickets o mostrar modal
  alert('Próximamente: Vista de tus tickets de soporte');
  // TODO: Implementar vista de tickets del usuario
}

// ========== VERIFICAR TICKETS PENDIENTES ==========
async function verificarTicketsPendientes() {
  if (!window.supportTickets || !window.auth) return;

  const usuarioActual = window.auth.obtenerUsuarioActual();
  if (!usuarioActual) return;

  try {
    const tickets = await window.supportTickets.obtenerMisTickets();
    const pendientes = tickets.filter(t => 
      t.estado === 'pendiente' || t.estado === 'en_proceso'
    );

    if (pendientes.length > 0) {
      const badge = document.getElementById('supportBadge');
      if (badge) {
        badge.textContent = pendientes.length;
        badge.style.display = 'flex';
      }
    }
  } catch (error) {
    console.error('Error al verificar tickets:', error);
  }
}

// ========== SCROLL TO BOTTOM ==========
function scrollToBottom() {
  const messagesContainer = document.getElementById('supportChatMessages');
  if (messagesContainer) {
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  }
}

// ========== EXPORTAR FUNCIONES GLOBALES ==========
window.usarSugerencia = usarSugerencia;
window.crearTicketDesdeChat = crearTicketDesdeChat;
window.verMisTickets = verMisTickets;

console.log('✅ Chat de soporte cargado correctamente');
