// ========== SISTEMA DE TICKETS DE SOPORTE (VERSIÓN SIMPLIFICADA) ==========
console.log('🔄 Cargando support-tickets-simple.js...');

const FIREBASE_URL = 'https://laburitoya-6e55d-default-rtdb.firebaseio.com';

// Flag de inicialización
let sistemaTicketsListo = false;

// Estados de tickets
const TICKET_STATUS = {
  PENDIENTE: 'pendiente',
  EN_PROCESO: 'en_proceso',
  RESUELTO: 'resuelto',
  CERRADO: 'cerrado'
};

// Prioridades
const TICKET_PRIORITY = {
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta',
  URGENTE: 'urgente'
};

// ========== CREAR TICKET (SIMPLIFICADO) ==========
async function crearTicket(ticketData) {
  console.log('📝 Intentando crear ticket...');
  
  try {
    // Obtener usuario actual
    let usuarioActual = null;
    
    if (window.auth && typeof window.auth.obtenerUsuarioActual === 'function') {
      usuarioActual = window.auth.obtenerUsuarioActual();
    }
    
    if (!usuarioActual) {
      // Intentar obtener de localStorage directamente
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        try {
          usuarioActual = JSON.parse(userStr);
        } catch (e) {
          console.error('Error al parsear usuario:', e);
        }
      }
    }
    
    if (!usuarioActual) {
      console.error('❌ No hay usuario autenticado');
      return { success: false, error: 'Usuario no autenticado' };
    }

    console.log('✅ Usuario encontrado:', usuarioActual.nombre);

    const ticket = {
      // Información del usuario
      usuarioId: usuarioActual.id,
      usuarioNombre: usuarioActual.nombre,
      usuarioEmail: usuarioActual.correo || 'sin-email@laburitoya.com',
      usuarioFoto: usuarioActual.foto || null,
      
      // Información del ticket
      asunto: ticketData.asunto || 'Consulta general',
      mensaje: ticketData.mensaje || '',
      categoria: ticketData.categoria || 'general',
      prioridad: ticketData.prioridad || TICKET_PRIORITY.MEDIA,
      
      // Conversación del chat (si existe)
      conversacion: ticketData.conversacion || [],
      
      // Estado y fechas
      estado: TICKET_STATUS.PENDIENTE,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      
      // Asignación
      asignadoA: null,
      asignadoNombre: null,
      
      // Respuestas
      respuestas: [],
      
      // Metadata
      navegador: navigator.userAgent,
      url: window.location.href
    };

    console.log('📤 Enviando ticket a Firebase...');
    console.log('Datos del ticket:', ticket);

    const response = await fetch(`${FIREBASE_URL}/tickets.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ticket)
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ Ticket creado exitosamente!');
    console.log('ID del ticket:', data.name);

    return { 
      success: true, 
      ticketId: data.name,
      ticket: ticket
    };
  } catch (error) {
    console.error('❌ Error al crear ticket:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// ========== OBTENER TICKETS ==========
async function obtenerTickets(filtros = {}) {
  try {
    const response = await fetch(`${FIREBASE_URL}/tickets.json`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data) {
      return [];
    }

    let tickets = Object.entries(data).map(([id, ticket]) => ({
      id,
      ...ticket
    }));

    // Aplicar filtros
    if (filtros.estado) {
      tickets = tickets.filter(t => t.estado === filtros.estado);
    }

    if (filtros.usuarioId) {
      tickets = tickets.filter(t => t.usuarioId === filtros.usuarioId);
    }

    // Ordenar por fecha (más recientes primero)
    tickets.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

    return tickets;
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    return [];
  }
}

// ========== OBTENER TICKET POR ID ==========
async function obtenerTicket(ticketId) {
  try {
    const response = await fetch(`${FIREBASE_URL}/tickets/${ticketId}.json`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const ticket = await response.json();
    
    if (!ticket) {
      return null;
    }

    return {
      id: ticketId,
      ...ticket
    };
  } catch (error) {
    console.error('Error al obtener ticket:', error);
    return null;
  }
}

// ========== ACTUALIZAR TICKET ==========
async function actualizarTicket(ticketId, cambios) {
  try {
    const actualizacion = {
      ...cambios,
      fechaActualizacion: new Date().toISOString()
    };

    const response = await fetch(`${FIREBASE_URL}/tickets/${ticketId}.json`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(actualizacion)
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error al actualizar ticket:', error);
    return { success: false, error: error.message };
  }
}

// ========== AGREGAR RESPUESTA ==========
async function agregarRespuesta(ticketId, mensaje, esUsuario = false) {
  try {
    let usuarioActual = null;
    
    if (window.auth && typeof window.auth.obtenerUsuarioActual === 'function') {
      usuarioActual = window.auth.obtenerUsuarioActual();
    }
    
    if (!usuarioActual) {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        usuarioActual = JSON.parse(userStr);
      }
    }
    
    if (!usuarioActual) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Obtener ticket actual
    const ticket = await obtenerTicket(ticketId);
    
    if (!ticket) {
      return { success: false, error: 'Ticket no encontrado' };
    }

    const respuesta = {
      autor: usuarioActual.nombre,
      autorId: usuarioActual.id,
      autorFoto: usuarioActual.foto || null,
      mensaje: mensaje,
      fecha: new Date().toISOString(),
      esUsuario: esUsuario
    };

    const respuestas = ticket.respuestas || [];
    respuestas.push(respuesta);

    const updateResult = await actualizarTicket(ticketId, {
      respuestas: respuestas,
      estado: esUsuario ? ticket.estado : TICKET_STATUS.EN_PROCESO
    });

    // Si la respuesta es del soporte (no es usuario), enviar mensaje directo
    if (!esUsuario && updateResult.success) {
      await enviarMensajeDirectoTicket(ticket.usuarioId, usuarioActual, mensaje, ticketId, ticket.asunto);
    }

    return updateResult;
  } catch (error) {
    console.error('Error al agregar respuesta:', error);
    return { success: false, error: error.message };
  }
}

// ========== ENVIAR MENSAJE DIRECTO POR TICKET ==========
async function enviarMensajeDirectoTicket(destinatarioId, remitente, mensaje, ticketId, asuntoTicket) {
  try {
    console.log('📨 Enviando mensaje directo por ticket...');
    console.log('📨 Destinatario ID:', destinatarioId);
    console.log('📨 Remitente:', remitente.nombre, '(ID:', remitente.id + ')');
    console.log('📨 Ticket ID:', ticketId);
    console.log('📨 FIREBASE_URL:', FIREBASE_URL);
    
    // Validar datos
    if (!destinatarioId || !remitente || !remitente.id) {
      throw new Error('Datos inválidos: falta destinatario o remitente');
    }
    
    // Crear ID de conversación (ordenado alfabéticamente)
    const conversacionId = [remitente.id, destinatarioId].sort().join('_');
    console.log('📨 Conversación ID:', conversacionId);
    
    // Crear mensaje con referencia al ticket
    const nuevoMensaje = {
      remitente: remitente.id,
      remitenteNombre: remitente.nombre,
      remitenteFoto: remitente.foto || null,
      destinatario: destinatarioId,
      mensaje: `📋 **Respuesta a tu ticket de soporte**\n\n**Ticket:** ${asuntoTicket}\n**ID:** #${ticketId.substring(0, 8)}\n\n${mensaje}`,
      fecha: new Date().toISOString(),
      leido: false,
      ticketId: ticketId // Referencia al ticket
    };

    console.log('📨 Mensaje a enviar:', nuevoMensaje);
    console.log('📨 URL completa:', `${FIREBASE_URL}/mensajes/${conversacionId}.json`);

    // Guardar mensaje en Firebase
    console.log('📨 Enviando mensaje a Firebase...');
    const mensajeResponse = await fetch(`${FIREBASE_URL}/mensajes/${conversacionId}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoMensaje)
    });

    console.log('📨 Response status:', mensajeResponse.status);
    console.log('📨 Response ok:', mensajeResponse.ok);

    if (!mensajeResponse.ok) {
      const errorText = await mensajeResponse.text();
      console.error('📨 Error response:', errorText);
      throw new Error(`Error al enviar mensaje: ${mensajeResponse.status} - ${errorText}`);
    }

    const mensajeData = await mensajeResponse.json();
    console.log('📨 Mensaje guardado con ID:', mensajeData.name);

    // Actualizar o crear conversación
    console.log('📨 Actualizando conversación...');
    const conversacion = {
      participantes: [remitente.id, destinatarioId],
      ultimoMensaje: nuevoMensaje.mensaje.substring(0, 100),
      ultimaActualizacion: new Date().toISOString(),
      [`noLeidos_${destinatarioId}`]: true
    };

    const conversacionResponse = await fetch(`${FIREBASE_URL}/conversaciones/${conversacionId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversacion)
    });

    console.log('📨 Conversación actualizada:', conversacionResponse.ok);

    // Crear notificación para el usuario
    console.log('📨 Creando notificación...');
    const notificacion = {
      tipo: 'respuesta_ticket',
      titulo: 'Respuesta a tu ticket de soporte',
      mensaje: `${remitente.nombre} ha respondido tu ticket: ${asuntoTicket}`,
      ticketId: ticketId,
      remitenteId: remitente.id,
      remitenteNombre: remitente.nombre,
      remitenteFoto: remitente.foto || null,
      fecha: new Date().toISOString(),
      leida: false,
      url: 'messages.html'
    };

    const notifResponse = await fetch(`${FIREBASE_URL}/notificaciones/${destinatarioId}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificacion)
    });

    console.log('📨 Notificación creada:', notifResponse.ok);

    console.log('✅ Mensaje directo enviado exitosamente');
    return { success: true };
  } catch (error) {
    console.error('❌ Error al enviar mensaje directo:', error);
    console.error('❌ Error stack:', error.stack);
    return { success: false, error: error.message };
  }
}

// ========== CAMBIAR ESTADO ==========
async function cambiarEstado(ticketId, nuevoEstado) {
  try {
    const cambios = {
      estado: nuevoEstado
    };

    if (nuevoEstado === TICKET_STATUS.CERRADO || nuevoEstado === TICKET_STATUS.RESUELTO) {
      cambios.fechaCierre = new Date().toISOString();
    }

    return await actualizarTicket(ticketId, cambios);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    return { success: false, error: error.message };
  }
}

// ========== OBTENER MIS TICKETS ==========
async function obtenerMisTickets() {
  try {
    let usuarioActual = null;
    
    if (window.auth && typeof window.auth.obtenerUsuarioActual === 'function') {
      usuarioActual = window.auth.obtenerUsuarioActual();
    }
    
    if (!usuarioActual) {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        usuarioActual = JSON.parse(userStr);
      }
    }
    
    if (!usuarioActual) {
      return [];
    }

    return await obtenerTickets({ usuarioId: usuarioActual.id });
  } catch (error) {
    console.error('Error al obtener mis tickets:', error);
    return [];
  }
}

// ========== ESTADÍSTICAS ==========
async function obtenerEstadisticas() {
  try {
    const tickets = await obtenerTickets();
    
    return {
      total: tickets.length,
      pendientes: tickets.filter(t => t.estado === TICKET_STATUS.PENDIENTE).length,
      enProceso: tickets.filter(t => t.estado === TICKET_STATUS.EN_PROCESO).length,
      resueltos: tickets.filter(t => t.estado === TICKET_STATUS.RESUELTO).length,
      cerrados: tickets.filter(t => t.estado === TICKET_STATUS.CERRADO).length,
      porPrioridad: {
        baja: tickets.filter(t => t.prioridad === TICKET_PRIORITY.BAJA).length,
        media: tickets.filter(t => t.prioridad === TICKET_PRIORITY.MEDIA).length,
        alta: tickets.filter(t => t.prioridad === TICKET_PRIORITY.ALTA).length,
        urgente: tickets.filter(t => t.prioridad === TICKET_PRIORITY.URGENTE).length
      }
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return null;
  }
}

// ========== EXPORTAR FUNCIONES ==========
console.log('🔄 Exportando window.supportTickets...');

try {
  window.supportTickets = {
    // Constantes
    TICKET_STATUS,
    TICKET_PRIORITY,
    
    // Funciones principales
    crearTicket,
    obtenerTickets,
    obtenerTicket,
    actualizarTicket,
    agregarRespuesta,
    cambiarEstado,
    enviarMensajeDirectoTicket,
    
    // Funciones de usuario
    obtenerMisTickets,
    
    // Estadísticas
    obtenerEstadisticas,
    
    // Flag de estado
    estaListo: () => sistemaTicketsListo
  };
  
  // Marcar como listo
  sistemaTicketsListo = true;
  
  console.log('✅ window.supportTickets exportado correctamente');
  console.log('✅ Funciones disponibles:', Object.keys(window.supportTickets));
  console.log('✅ Sistema de tickets SIMPLIFICADO cargado correctamente');
  console.log('✅ sistemaTicketsListo = true');
  
  // Disparar evento personalizado para notificar que está listo
  window.dispatchEvent(new CustomEvent('supportTicketsReady'));
  console.log('✅ Evento supportTicketsReady disparado');
  
} catch (error) {
  console.error('❌ Error al exportar window.supportTickets:', error);
  sistemaTicketsListo = false;
}
