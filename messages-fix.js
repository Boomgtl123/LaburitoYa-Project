// ========== FIX TEMPORAL PARA FORZAR CARGA DE CONVERSACIONES ==========

console.log('🔧 [FIX] Script de fix cargado');

// Esperar a que el DOM esté listo
window.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 [FIX] DOM cargado, esperando 2 segundos...');
  
  // Esperar 2 segundos para asegurar que todo esté cargado
  setTimeout(() => {
    console.log('🔧 [FIX] Intentando forzar carga de conversaciones...');
    
    // Verificar si la función existe
    if (typeof window.cargarConversaciones === 'function') {
      console.log('✅ [FIX] Función cargarConversaciones encontrada, ejecutando...');
      window.cargarConversaciones();
    } else {
      console.error('❌ [FIX] Función cargarConversaciones NO encontrada');
      console.log('🔍 [FIX] Funciones disponibles:', Object.keys(window).filter(k => k.includes('cargar')));
      
      // Intentar cargar manualmente
      cargarConversacionesManual();
    }
  }, 2000);
});

// Función de respaldo para cargar conversaciones manualmente
async function cargarConversacionesManual() {
  console.log('🔧 [FIX] Intentando carga manual de conversaciones...');
  
  const conversationsList = document.getElementById('conversationsList');
  if (!conversationsList) {
    console.error('❌ [FIX] No se encontró conversationsList');
    return;
  }
  
  // Obtener usuario actual
  const usuarioActualStr = localStorage.getItem('usuarioActual');
  if (!usuarioActualStr) {
    console.error('❌ [FIX] No hay usuario en sesión');
    conversationsList.innerHTML = '<p style="padding: 20px; text-align: center;">No hay sesión activa. <a href="login.html">Iniciar sesión</a></p>';
    return;
  }
  
  const usuarioActual = JSON.parse(usuarioActualStr);
  console.log('✅ [FIX] Usuario:', usuarioActual.nombre);
  
  // Mostrar loading
  conversationsList.innerHTML = `
    <div class="loading-conversations">
      <div class="spinner-small"></div>
      <p>Cargando conversaciones (FIX)...</p>
    </div>
  `;
  
  try {
    // Obtener mensajes
    const response = await fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/mensajes.json');
    const data = await response.json();
    
    console.log('📊 [FIX] Datos recibidos:', data ? 'Sí' : 'No');
    
    if (!data) {
      conversationsList.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">No hay mensajes aún</p>';
      return;
    }
    
    // Agrupar por conversación
    const conversaciones = {};
    for (const id in data) {
      const mensaje = data[id];
      if (mensaje.de === usuarioActual.id || mensaje.para === usuarioActual.id) {
        const otroUsuarioId = mensaje.de === usuarioActual.id ? mensaje.para : mensaje.de;
        
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
    
    console.log('📊 [FIX] Conversaciones encontradas:', Object.keys(conversaciones).length);
    
    if (Object.keys(conversaciones).length === 0) {
      conversationsList.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">No tienes conversaciones aún</p>';
      return;
    }
    
    // Ordenar por fecha
    const conversacionesOrdenadas = Object.entries(conversaciones).sort((a, b) => {
      return new Date(b[1].ultimoMensaje.fecha) - new Date(a[1].ultimoMensaje.fecha);
    });
    
    // Renderizar
    conversationsList.innerHTML = '';
    
    for (const [userId, conv] of conversacionesOrdenadas) {
      // Obtener datos del usuario
      const userResponse = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios/${userId}.json`);
      const usuario = await userResponse.json();
      
      if (!usuario) continue;
      
      const ultimoMensaje = conv.ultimoMensaje;
      const esEnviado = ultimoMensaje.de === usuarioActual.id;
      const textoMensaje = esEnviado ? `Tú: ${ultimoMensaje.mensaje}` : ultimoMensaje.mensaje;
      
      // Contar no leídos
      const noLeidos = conv.mensajes.filter(m => 
        m.para === usuarioActual.id && !m.leido
      ).length;
      
      const tiempo = calcularTiempo(ultimoMensaje.fecha);
      
      const div = document.createElement('div');
      div.className = 'conversation-item';
      if (noLeidos > 0) div.classList.add('unread');
      
      div.innerHTML = `
        <img src="${usuario.foto || 'https://via.placeholder.com/48'}" alt="${usuario.nombre}" class="conversation-avatar" />
        <div class="conversation-info">
          <p class="conversation-name">${usuario.nombre}${usuario.verificado ? ' <span class="verified-badge">✓</span>' : ''}</p>
          <p class="conversation-last-message">${textoMensaje}</p>
        </div>
        <span class="conversation-time">${tiempo}</span>
        ${noLeidos > 0 ? `<span class="unread-badge">${noLeidos}</span>` : ''}
      `;
      
      div.addEventListener('click', () => {
        alert(`Conversación con ${usuario.nombre}\nEsta es una versión de prueba.`);
      });
      
      conversationsList.appendChild(div);
    }
    
    console.log('✅ [FIX] Conversaciones renderizadas exitosamente');
    
  } catch (error) {
    console.error('❌ [FIX] Error:', error);
    conversationsList.innerHTML = `
      <p style="padding: 20px; text-align: center; color: #d32f2f;">
        Error al cargar conversaciones: ${error.message}
      </p>
    `;
  }
}

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

console.log('✅ [FIX] Script de fix completamente cargado');
