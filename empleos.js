// ========== SISTEMA DE EMPLEOS ==========

let currentTab = 'recomendados';
let todosLosEmpleos = [];
let usuarioActual = null;

// Avatar placeholder
const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e0e0e0" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="40"%3E💼%3C/text%3E%3C/svg%3E';

// ========== INICIALIZAR ==========
window.addEventListener('DOMContentLoaded', function() {
  if (!auth.protegerPagina()) {
    return;
  }
  
  usuarioActual = auth.obtenerUsuarioActual();
  
  if (usuarioActual) {
    inicializarEmpleos();
  }
});

// ========== INICIALIZAR EMPLEOS ==========
function inicializarEmpleos() {
  console.log('💼 Inicializando sistema de empleos...');
  
  // Actualizar avatar en navbar
  const navAvatar = document.getElementById('navAvatar');
  if (navAvatar && usuarioActual) {
    navAvatar.src = usuarioActual.foto || DEFAULT_AVATAR;
  }
  
  // Event listeners para las tabs
  const tabs = document.querySelectorAll('.empleo-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remover active de todas las tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Agregar active a la tab clickeada
      this.classList.add('active');
      
      // Obtener el tipo de tab
      currentTab = this.getAttribute('data-tab');
      
      // Cargar empleos de esa tab
      cargarEmpleos(currentTab);
    });
  });
  
  // Event listener para cerrar sesión
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        auth.cerrarSesion();
      }
    });
  }
  
  // Cargar empleos iniciales
  cargarEmpleos('recomendados');
}

// ========== CARGAR EMPLEOS ==========
async function cargarEmpleos(tipo) {
  const container = document.getElementById('empleosContent');
  if (!container) return;
  
  container.innerHTML = '<div class="loading-empleos"><div class="spinner"></div><p>Cargando oportunidades...</p></div>';
  
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json");
    const data = await response.json();
    
    if (!data) {
      mostrarSinEmpleos(container);
      return;
    }
    
    // Filtrar solo publicaciones de EMPLEADORES
    let empleos = [];
    for (const id in data) {
      const post = data[id];
      if (post.userPerfil === 'Empleador') {
        empleos.push({
          id,
          ...post,
          likesCount: post.likes ? post.likes.length : 0,
          commentsCount: post.comentarios ? post.comentarios.length : 0
        });
      }
    }
    
    if (empleos.length === 0) {
      mostrarSinEmpleos(container);
      return;
    }
    
    // Ordenar según la tab activa
    switch(tipo) {
      case 'recomendados':
        empleos.sort((a, b) => b.likesCount - a.likesCount);
        break;
      case 'tendencias':
        empleos = ordenarPorTendencias(empleos);
        break;
      case 'recientes':
        empleos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        break;
      case 'zona':
        empleos = ordenarPorZona(empleos);
        break;
    }
    
    todosLosEmpleos = empleos;
    mostrarEmpleos(empleos, container);
    
  } catch (error) {
    console.error('Error al cargar empleos:', error);
    container.innerHTML = '<div class="no-empleos"><p>❌ Error al cargar empleos. Por favor recarga la página.</p></div>';
  }
}

// ========== ORDENAR POR TENDENCIAS ==========
function ordenarPorTendencias(empleos) {
  // Calcular score basado en likes, comentarios y recencia
  return empleos.map(empleo => {
    const diasDesdePublicacion = (new Date() - new Date(empleo.fecha)) / (1000 * 60 * 60 * 24);
    const factorRecencia = Math.max(0, 1 - (diasDesdePublicacion / 30)); // Decae en 30 días
    
    const score = (empleo.likesCount * 2 + empleo.commentsCount * 3) * (1 + factorRecencia);
    
    return { ...empleo, trendScore: score };
  }).sort((a, b) => b.trendScore - a.trendScore);
}

// ========== ORDENAR POR ZONA ==========
function ordenarPorZona(empleos) {
  // Agrupar por zona y ordenar alfabéticamente
  return empleos.sort((a, b) => {
    const zonaA = (a.userZona || 'Sin zona').toLowerCase();
    const zonaB = (b.userZona || 'Sin zona').toLowerCase();
    
    if (zonaA < zonaB) return -1;
    if (zonaA > zonaB) return 1;
    
    // Si son de la misma zona, ordenar por likes
    return b.likesCount - a.likesCount;
  });
}

// ========== MOSTRAR EMPLEOS ==========
function mostrarEmpleos(empleos, container) {
  container.innerHTML = '';
  
  empleos.forEach((empleo, index) => {
    const card = crearCardEmpleo(empleo, index);
    container.appendChild(card);
  });
}

// ========== CREAR CARD DE EMPLEO ==========
function crearCardEmpleo(empleo, index) {
  const div = document.createElement('div');
  div.className = 'empleo-card';
  
  const tiempo = calcularTiempoTranscurrido(empleo.fecha);
  
  // Determinar badge según posición
  let badge = '';
  if (currentTab === 'recomendados' && index < 3) {
    const badges = ['🥇 Top 1', '🥈 Top 2', '🥉 Top 3'];
    badge = `<div class="empleo-badge">${badges[index]}</div>`;
  } else if (currentTab === 'tendencias' && index < 3) {
    badge = `<div class="empleo-badge" style="background: #ff6b35;">🔥 Trending</div>`;
  } else if (currentTab === 'recientes' && index === 0) {
    badge = `<div class="empleo-badge" style="background: #2e7d32;">🆕 Nuevo</div>`;
  }
  
  // Extraer hashtags
  let hashtagsHTML = '';
  if (empleo.hashtags && empleo.hashtags.length > 0) {
    hashtagsHTML = `
      <div class="empleo-hashtags">
        ${empleo.hashtags.slice(0, 5).map(tag => `
          <span class="empleo-hashtag">#${tag}</span>
        `).join('')}
      </div>
    `;
  }
  
  div.innerHTML = `
    ${badge}
    <div class="empleo-card-header">
      <img src="${empleo.userFoto || DEFAULT_AVATAR}" alt="${empleo.userName}" class="empleo-avatar" />
      <div class="empleo-info">
        <h3 class="empleo-empresa">${empleo.userName}</h3>
        <p class="empleo-tipo">💼 Empleador</p>
        <p class="empleo-ubicacion">
          <span>📍</span>
          <span>${empleo.userZona || 'Ubicación no especificada'}</span>
        </p>
      </div>
    </div>
    
    <div class="empleo-descripcion">${empleo.contenido}</div>
    
    ${hashtagsHTML}
    
    <div class="empleo-stats">
      <div class="empleo-stat">
        <span class="empleo-stat-icon">❤️</span>
        <span>${empleo.likesCount} recomendaciones</span>
      </div>
      <div class="empleo-stat">
        <span class="empleo-stat-icon">💬</span>
        <span>${empleo.commentsCount} comentarios</span>
      </div>
      <div class="empleo-stat">
        <span class="empleo-stat-icon">🕐</span>
        <span>${tiempo}</span>
      </div>
      <div class="empleo-stat">
        <span class="empleo-stat-icon">📞</span>
        <span>${empleo.userTelefono || 'No disponible'}</span>
      </div>
    </div>
  `;
  
  // Event listener para ver detalles
  div.addEventListener('click', function() {
    window.location.href = `home.html?post=${empleo.id}`;
  });
  
  return div;
}

// ========== MOSTRAR SIN EMPLEOS ==========
function mostrarSinEmpleos(container) {
  container.innerHTML = `
    <div class="no-empleos">
      <div class="no-empleos-icon">📭</div>
      <h3>No hay empleos disponibles</h3>
      <p>No se encontraron publicaciones de empleadores en este momento.</p>
      <p style="margin-top: 12px;">Vuelve más tarde para ver nuevas oportunidades.</p>
    </div>
  `;
}

// ========== CALCULAR TIEMPO TRANSCURRIDO ==========
function calcularTiempoTranscurrido(fecha) {
  const ahora = new Date();
  const fechaPost = new Date(fecha);
  const diferencia = ahora - fechaPost;
  
  const segundos = Math.floor(diferencia / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  
  if (dias > 0) return `Hace ${dias}d`;
  if (horas > 0) return `Hace ${horas}h`;
  if (minutos > 0) return `Hace ${minutos}m`;
  return 'Ahora';
}

console.log('✅ empleos.js cargado correctamente');
