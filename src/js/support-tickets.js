// ========== SISTEMA DE TICKETS DE SOPORTE ==========
console.log('🔄 Iniciando carga de support-tickets.js...');

const FIREBASE_URL = 'https://laburitoya-6e55d-default-rtdb.firebaseio.com';
console.log('✅ FIREBASE_URL definida:', FIREBASE_URL);

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

// ========== CREAR TICKET ==========
async function crearTicket(ticketData) {
  try {
    const usuarioActual = window.auth ? window.auth.obtenerUsuarioActual() : null;
    
    if (!usuarioActual) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const ticket = {
      // Información del usuario
      usuarioId: usuarioActual.id,
      usuarioNombre: usuarioActual.nombre,
      usuarioEmail: usuarioActual.correo,
      usuarioFoto: usuarioActual.foto || null,
      
      // Información del ticket
      asunto: ticketData.asunto || 'Consulta general',
      mensaje: ticketData.mensaje,
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

    console.log('Creando ticket:', ticket);

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
    
    console.log('Ticket creado exitosamente:', data.name);

    // Enviar notificación a usuarios con rol de soporte
    await notificarSoporte(data.name, ticket);

    return { 
      success: true, 
      ticketId: data.name,
      ticket: ticket
    };
  } catch (error) {
    console.error('Error al crear ticket:', error);
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

    if (filtros.asignadoA) {
      tickets = tickets.filter(t => t.asignadoA === filtros.asignadoA);
    }

    if (filtros.prioridad) {
      tickets = tickets.filter(t => t.prioridad === filtros.prioridad);
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

    console.log('Ticket actualizado:', ticketId);

    return { success: true };
  } catch (error) {
    console.error('Error al actualizar ticket:', error);
    return { success: false, error: error.message };
  }
}

// ========== AGREGAR RESPUESTA ==========
async function agregarRespuesta(ticketId, mensaje, esUsuario = false) {
  try {
    const usuarioActual = window.auth ? window.auth.obtenerUsuarioActual() : null;
    
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

    const result = await actualizarTicket(ticketId, {
      respuestas: respuestas,
      estado: esUsuario ? ticket.estado : TICKET_STATUS.EN_PROCESO
    });

    if (result.success) {
      // Notificar al usuario si la respuesta es del soporte
      if (!esUsuario) {
        await notificarUsuario(ticket.usuarioId, ticketId);
      }
    }

    return result;
  } catch (error) {
    console.error('Error al agregar respuesta:', error);
    return { success: false, error: error.message };
  }
}

// ========== ASIGNAR TICKET ==========
async function asignarTicket(ticketId, usuarioId) {
  try {
    if (!window.auth || typeof window.auth.obtenerUsuarioPorId !== 'function') {
      return { success: false, error: 'Sistema de autenticación no disponible' };
    }
    
    const usuario = await window.auth.obtenerUsuarioPorId(usuarioId);
    
    if (!usuario) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    return await actualizarTicket(ticketId, {
      asignadoA: usuarioId,
      asignadoNombre: usuario.nombre,
      estado: TICKET_STATUS.EN_PROCESO
    });
  } catch (error) {
    console.error('Error al asignar ticket:', error);
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

// ========== CAMBIAR PRIORIDAD ==========
async function cambiarPrioridad(ticketId, nuevaPrioridad) {
  try {
    return await actualizarTicket(ticketId, {
      prioridad: nuevaPrioridad
    });
  } catch (error) {
    console.error('Error al cambiar prioridad:', error);
    return { success: false, error: error.message };
  }
}

// ========== OBTENER MIS TICKETS ==========
async function obtenerMisTickets() {
  try {
    const usuarioActual = window.auth ? window.auth.obtenerUsuarioActual() : null;
    
    if (!usuarioActual) {
      return [];
    }

    return await obtenerTickets({ usuarioId: usuarioActual.id });
  } catch (error) {
    console.error('Error al obtener mis tickets:', error);
    return [];
  }
}

// ========== OBTENER TICKETS ASIGNADOS ==========
async function obtenerTicketsAsignados() {
  try {
    const usuarioActual = window.auth ? window.auth.obtenerUsuarioActual() : null;
    
    if (!usuarioActual) {
      return [];
    }

    return await obtenerTickets({ asignadoA: usuarioActual.id });
  } catch (error) {
    console.error('Error al obtener tickets asignados:', error);
    return [];
  }
}

// ========== NOTIFICACIONES ==========
async function notificarSoporte(ticketId, ticket) {
  try {
    // Obtener usuarios con rol de soporte
    const response = await fetch(`${FIREBASE_URL}/usuarios.json`);
    const usuarios = await response.json();
    
    if (!usuarios) return;

    for (const [userId, usuario] of Object.entries(usuarios)) {
      // Verificar si es usuario de soporte o CEO
      const esCEO = window.auth && typeof window.auth.esCEO === 'function' ? window.auth.esCEO(usuario) : false;
      const esSoporte = usuario.rol === 'SOPORTE' || usuario.rol === 'ADMIN' || usuario.rol === 'MODERADOR';
      
      if (esSoporte || esCEO) {
        // Crear notificación
        const notificacion = {
          tipo: 'nuevo_ticket',
          titulo: 'Nuevo ticket de soporte',
          mensaje: `${ticket.usuarioNombre}: ${ticket.asunto}`,
          ticketId: ticketId,
          fecha: new Date().toISOString(),
          leida: false
        };

        await fetch(`${FIREBASE_URL}/notificaciones/${userId}.json`, {
          method: 'POST',
          body: JSON.stringify(notificacion)
        });
      }
    }
  } catch (error) {
    console.error('Error al notificar soporte:', error);
  }
}

async function notificarUsuario(usuarioId, ticketId) {
  try {
    const notificacion = {
      tipo: 'respuesta_ticket',
      titulo: 'Respuesta a tu ticket',
      mensaje: 'El equipo de soporte ha respondido tu consulta',
      ticketId: ticketId,
      fecha: new Date().toISOString(),
      leida: false
    };

    await fetch(`${FIREBASE_URL}/notificaciones/${usuarioId}.json`, {
      method: 'POST',
      body: JSON.stringify(notificacion)
    });
  } catch (error) {
    console.error('Error al notificar usuario:', error);
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
    asignarTicket,
    cambiarEstado,
    cambiarPrioridad,
    
    // Funciones de usuario
    obtenerMisTickets,
    obtenerTicketsAsignados,
    
    // Estadísticas
    obtenerEstadisticas
  };
  
  console.log('✅ window.supportTickets exportado correctamente');
  console.log('✅ Funciones disponibles:', Object.keys(window.supportTickets));
  console.log('✅ Sistema de tickets de soporte cargado correctamente');
} catch (error) {
  console.error('❌ Error al exportar window.supportTickets:', error);
}
