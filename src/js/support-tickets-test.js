// ========== TEST SIMPLE DE TICKETS ==========
console.log('🧪 TEST: Cargando support-tickets-test.js...');

// Verificar que estamos en el contexto correcto
console.log('🧪 TEST: window existe?', typeof window !== 'undefined');
console.log('🧪 TEST: document existe?', typeof document !== 'undefined');

const FIREBASE_URL_TICKETS = 'https://laburitoya-6e55d-default-rtdb.firebaseio.com';
console.log('🧪 TEST: FIREBASE_URL_TICKETS =', FIREBASE_URL_TICKETS);

// Función simple de crear ticket
async function crearTicketTest(ticketData) {
  console.log('🧪 TEST: crearTicketTest llamada');
  console.log('🧪 TEST: ticketData =', ticketData);
  
  try {
    // Obtener usuario
    let usuarioActual = null;
    
    if (window.auth && typeof window.auth.obtenerUsuarioActual === 'function') {
      usuarioActual = window.auth.obtenerUsuarioActual();
      console.log('🧪 TEST: Usuario obtenido de window.auth');
    }
    
    if (!usuarioActual) {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        usuarioActual = JSON.parse(userStr);
        console.log('🧪 TEST: Usuario obtenido de localStorage');
      }
    }
    
    if (!usuarioActual) {
      console.error('🧪 TEST: ❌ No hay usuario');
      return { success: false, error: 'Usuario no autenticado' };
    }

    console.log('🧪 TEST: ✅ Usuario encontrado:', usuarioActual.nombre);

    const ticket = {
      usuarioId: usuarioActual.id,
      usuarioNombre: usuarioActual.nombre,
      usuarioEmail: usuarioActual.correo || 'sin-email@laburitoya.com',
      asunto: ticketData.asunto || 'Consulta general',
      mensaje: ticketData.mensaje || '',
      categoria: ticketData.categoria || 'general',
      prioridad: ticketData.prioridad || 'media',
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString(),
      conversacion: ticketData.conversacion || []
    };

    console.log('🧪 TEST: Enviando a Firebase...');
    console.log('🧪 TEST: URL =', `${FIREBASE_URL_TICKETS}/tickets.json`);
    console.log('🧪 TEST: Datos =', ticket);

    const response = await fetch(`${FIREBASE_URL_TICKETS}/tickets.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket)
    });

    console.log('🧪 TEST: Response status =', response.status);
    console.log('🧪 TEST: Response ok =', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🧪 TEST: ❌ Error HTTP:', response.status, errorText);
      throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🧪 TEST: ✅ Respuesta de Firebase:', data);
    console.log('🧪 TEST: ✅ Ticket ID:', data.name);

    return { 
      success: true, 
      ticketId: data.name,
      ticket: ticket
    };
  } catch (error) {
    console.error('🧪 TEST: ❌ Excepción:', error);
    console.error('🧪 TEST: ❌ Error stack:', error.stack);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// ========== ENVIAR MENSAJE DIRECTO POR TICKET ==========
async function enviarMensajeDirectoTicketTest(destinatarioId, remitente, mensaje, ticketId, asuntoTicket) {
  try {
    console.log('🧪 TEST: 📨 Enviando mensaje directo por ticket...');
    console.log('🧪 TEST: Destinatario:', destinatarioId);
    console.log('🧪 TEST: Remitente:', remitente.nombre);
    
    // Crear ID de conversación (ordenado alfabéticamente)
    const conversacionId = [remitente.id, destinatarioId].sort().join('_');
    console.log('🧪 TEST: Conversación ID:', conversacionId);
    
    // Crear mensaje con referencia al ticket
    const nuevoMensaje = {
      remitente: remitente.id,
      remitenteNombre: remitente.nombre,
      remitenteFoto: remitente.foto || null,
      destinatario: destinatarioId,
      mensaje: `📋 **Respuesta a tu ticket de soporte**\n\n**Ticket:** ${asuntoTicket}\n**ID:** #${ticketId.substring(0, 8)}\n\n${mensaje}`,
      fecha: new Date().toISOString(),
      leido: false,
      ticketId: ticketId
    };

    console.log('🧪 TEST: Mensaje a enviar:', nuevoMensaje);

    // Guardar mensaje en Firebase
    const mensajeResponse = await fetch(`${FIREBASE_URL_TICKETS}/mensajes/${conversacionId}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoMensaje)
    });

    console.log('🧪 TEST: Response status mensaje:', mensajeResponse.status);

    if (!mensajeResponse.ok) {
      throw new Error(`Error al enviar mensaje: ${mensajeResponse.status}`);
    }

    // Actualizar o crear conversación
    const conversacion = {
      participantes: [remitente.id, destinatarioId],
      ultimoMensaje: nuevoMensaje.mensaje.substring(0, 100),
      ultimaActualizacion: new Date().toISOString(),
      [`noLeidos_${destinatarioId}`]: true
    };

    console.log('🧪 TEST: Actualizando conversación...');

    await fetch(`${FIREBASE_URL_TICKETS}/conversaciones/${conversacionId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversacion)
    });

    // Crear notificación para el usuario
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

    console.log('🧪 TEST: Creando notificación...');

    await fetch(`${FIREBASE_URL_TICKETS}/notificaciones/${destinatarioId}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificacion)
    });

    console.log('🧪 TEST: ✅ Mensaje directo enviado exitosamente');
    return { success: true };
  } catch (error) {
    console.error('🧪 TEST: ❌ Error al enviar mensaje directo:', error);
    return { success: false, error: error.message };
  }
}

// Exportar
console.log('🧪 TEST: Exportando window.supportTicketsTest...');

try {
  window.supportTicketsTest = {
    crearTicket: crearTicketTest,
    enviarMensajeDirectoTicket: enviarMensajeDirectoTicketTest,
    estaListo: () => true
  };
  console.log('🧪 TEST: ✅ window.supportTicketsTest exportado');
  console.log('🧪 TEST: ✅ Funciones:', Object.keys(window.supportTicketsTest));
} catch (error) {
  console.error('🧪 TEST: ❌ Error al exportar:', error);
}

console.log('🧪 TEST: ========== FIN DE CARGA ==========');
