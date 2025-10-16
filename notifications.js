// ========== SISTEMA DE NOTIFICACIONES ==========

let notificacionesActivas = [];
let intervalNotificaciones = null;

// ========== INICIALIZAR SISTEMA DE NOTIFICACIONES ==========
function inicializarNotificaciones() {
  const usuarioActual = auth.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  // Cargar notificaciones iniciales
  cargarNotificaciones();
  
  // Actualizar cada 10 segundos
  intervalNotificaciones = setInterval(cargarNotificaciones, 10000);
}

// ========== CARGAR NOTIFICACIONES ==========
async function cargarNotificaciones() {
  const usuarioActual = auth.obtenerUsuarioActual();
  if (!usuarioActual) return;
  
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/notificaciones.json");
    const data = await response.json();
    
    if (!data) {
      actualizarBadgeNotificaciones(0);
      return;
    }
    
    // Filtrar notificaciones del usuario actual que no han sido leídas
    const notificaciones = [];
    for (const id in data) {
      const notif = data[id];
      if (notif.para === usuarioActual.id && !notif.leida) {
        notificaciones.push({ id, ...notif });
      }
    }
    
    // Ordenar por fecha (más recientes primero)
    notificaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Actualizar badge
    actualizarBadgeNotificaciones(notificaciones.length);
    
    // Mostrar notificaciones nuevas (que no estaban antes)
    notificaciones.forEach(notif => {
      if (!notificacionesActivas.find(n => n.id === notif.id)) {
        mostrarNotificacionToast(notif);
        notificacionesActivas.push(notif);
      }
    });
    
    // Limpiar notificaciones antiguas de la lista activa
    notificacionesActivas = notificacionesActivas.filter(n => 
      notificaciones.find(notif => notif.id === n.id)
    );
    
  } catch (error) {
    console.error('Error al cargar notificaciones:', error);
  }
}

// ========== ACTUALIZAR BADGE DE NOTIFICACIONES ==========
function actualizarBadgeNotificaciones(cantidad) {
  // Badge en mensajes
  const mensajesBadge = document.getElementById('mensajesBadge');
  if (mensajesBadge) {
    if (cantidad > 0) {
      mensajesBadge.textContent = cantidad > 99 ? '99+' : cantidad;
      mensajesBadge.style.display = 'block';
    } else {
      mensajesBadge.style.display = 'none';
    }
  }
  
  // Badge general de notificaciones (si existe)
  const notifBadge = document.getElementById('notificationsBadge');
  if (notifBadge) {
    if (cantidad > 0) {
      notifBadge.textContent = cantidad > 99 ? '99+' : cantidad;
      notifBadge.style.display = 'block';
    } else {
      notifBadge.style.display = 'none';
    }
  }
}

// ========== MOSTRAR NOTIFICACIÓN TOAST ==========
function mostrarNotificacionToast(notificacion) {
  const toast = document.createElement('div');
  toast.className = 'notification-toast';
  
  let icono = '🔔';
  let titulo = 'Notificación';
  
  switch (notificacion.tipo) {
    case 'like':
      icono = '❤️';
      titulo = 'Nueva recomendación';
      break;
    case 'comentario':
      icono = '💬';
      titulo = 'Nuevo comentario';
      break;
    case 'mensaje':
      icono = '📩';
      titulo = 'Nuevo mensaje';
      break;
  }
  
  toast.innerHTML = `
    <div class="toast-icon">${icono}</div>
    <div class="toast-content">
      <div class="toast-title">${titulo}</div>
      <div class="toast-message">${notificacion.mensaje}</div>
      <div class="toast-time">${calcularTiempoTranscurrido(notificacion.fecha)}</div>
    </div>
    <button class="toast-close" onclick="cerrarToast(this)">✕</button>
  `;
  
  // Agregar click para ir a la notificación
  toast.addEventListener('click', function(e) {
    if (!e.target.classList.contains('toast-close')) {
      irANotificacion(notificacion);
      marcarComoLeida(notificacion.id);
      toast.remove();
    }
  });
  
  document.body.appendChild(toast);
  
  // Animación de entrada
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Auto-cerrar después de 5 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// ========== CERRAR TOAST ==========
function cerrarToast(button) {
  const toast = button.closest('.notification-toast');
  if (toast) {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }
}

// ========== IR A NOTIFICACIÓN ==========
function irANotificacion(notificacion) {
  switch (notificacion.tipo) {
    case 'like':
    case 'comentario':
      window.location.href = `home.html?post=${notificacion.postId}`;
      break;
    case 'mensaje':
      window.location.href = `messages.html?user=${notificacion.de}`;
      break;
  }
}

// ========== MARCAR COMO LEÍDA ==========
async function marcarComoLeida(notificacionId) {
  try {
    await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/notificaciones/${notificacionId}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ leida: true })
    });
    
    // Recargar notificaciones
    cargarNotificaciones();
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
  }
}

// ========== CREAR NOTIFICACIÓN ==========
async function crearNotificacion(tipo, para, mensaje, postId = null) {
  const usuarioActual = auth.obtenerUsuarioActual();
  if (!usuarioActual || para === usuarioActual.id) return;
  
  const notificacion = {
    tipo,
    de: usuarioActual.id,
    deNombre: usuarioActual.nombre,
    deFoto: usuarioActual.foto || generarAvatarPlaceholder(usuarioActual.nombre, 32),
    para,
    mensaje,
    postId,
    fecha: new Date().toISOString(),
    leida: false
  };
  
  try {
    await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/notificaciones.json", {
      method: "POST",
      body: JSON.stringify(notificacion)
    });
  } catch (error) {
    console.error('Error al crear notificación:', error);
  }
}

// ========== CALCULAR TIEMPO TRANSCURRIDO ==========
function calcularTiempoTranscurrido(fecha) {
  const ahora = new Date();
  const fechaNotif = new Date(fecha);
  const diferencia = ahora - fechaNotif;
  
  const segundos = Math.floor(diferencia / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  
  if (dias > 0) return `Hace ${dias}d`;
  if (horas > 0) return `Hace ${horas}h`;
  if (minutos > 0) return `Hace ${minutos}m`;
  return 'Ahora';
}

// ========== LIMPIAR INTERVALO ==========
function detenerNotificaciones() {
  if (intervalNotificaciones) {
    clearInterval(intervalNotificaciones);
  }
}

// Limpiar al salir
window.addEventListener('beforeunload', detenerNotificaciones);

// Exportar funciones
window.notifications = {
  inicializarNotificaciones,
  crearNotificacion,
  marcarComoLeida,
  detenerNotificaciones
};
