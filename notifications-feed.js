// ========== SISTEMA DE NOTIFICACIONES FEED ==========

let currentTab = 'destacadas';

// ========== INICIALIZAR NOTIFICACIONES FEED ==========
function inicializarNotificacionesFeed() {
  console.log('📢 Inicializando sistema de notificaciones feed...');
  
  // Event listener para abrir/cerrar dropdown
  const navNotificaciones = document.getElementById('navNotificaciones');
  if (navNotificaciones) {
    navNotificaciones.addEventListener('click', function(e) {
      if (!e.target.closest('.dropdown-menu')) {
        this.classList.toggle('active');
        if (this.classList.contains('active')) {
          cargarNotificaciones(currentTab);
        }
      }
    });
  }
  
  // Event listeners para las tabs
  const tabs = document.querySelectorAll('.notif-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remover active de todas las tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Agregar active a la tab clickeada
      this.classList.add('active');
      
      // Obtener el tipo de tab
      currentTab = this.getAttribute('data-tab');
      
      // Cargar notificaciones de esa tab
      cargarNotificaciones(currentTab);
    });
  });
  
  // Event listener para marcar todas como leídas
  const btnMarkAllRead = document.getElementById('btnMarkAllRead');
  if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener('click', marcarTodasComoLeidas);
  }
  
  // Cerrar dropdown al hacer click fuera
  document.addEventListener('click', function(e) {
    const navNotificaciones = document.getElementById('navNotificaciones');
    if (navNotificaciones && !navNotificaciones.contains(e.target)) {
      navNotificaciones.classList.remove('active');
    }
  });
  
  // Cargar notificaciones iniciales
  cargarNotificaciones('destacadas');
}

// ========== CARGAR NOTIFICACIONES ==========
async function cargarNotificaciones(tipo) {
  const container = document.getElementById('notificationsContent');
  if (!container) return;
  
  container.innerHTML = '<div class="loading-notifications">Cargando...</div>';
  
  try {
    let notificaciones = [];
    
    switch(tipo) {
      case 'destacadas':
        notificaciones = await obtenerDestacadas();
        break;
      case 'tendencias':
        notificaciones = await obtenerTendencias();
        break;
      case 'recientes':
        notificaciones = await obtenerRecientes();
        break;
    }
    
    mostrarNotificaciones(notificaciones, tipo);
    
  } catch (error) {
    console.error('Error al cargar notificaciones:', error);
    container.innerHTML = '<div class="no-notifications"><p>Error al cargar notificaciones</p></div>';
  }
}

// ========== OBTENER DESTACADAS ==========
async function obtenerDestacadas() {
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json");
    const data = await response.json();
    
    if (!data) return [];
    
    const posts = [];
    
    for (const id in data) {
      const post = data[id];
      const likesCount = post.likes ? post.likes.length : 0;
      const commentsCount = post.comentarios ? post.comentarios.length : 0;
      
      // Solo posts con al menos 2 likes o 1 comentario
      if (likesCount >= 2 || commentsCount >= 1) {
        posts.push({
          id,
          ...post,
          likesCount,
          commentsCount,
          score: likesCount * 2 + commentsCount * 3 // Puntaje para ordenar
        });
      }
    }
    
    // Ordenar por score (más destacados primero)
    posts.sort((a, b) => b.score - a.score);
    
    // Limitar a 10 resultados
    return posts.slice(0, 10);
    
  } catch (error) {
    console.error('Error al obtener destacadas:', error);
    return [];
  }
}

// ========== OBTENER TENDENCIAS ==========
async function obtenerTendencias() {
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json");
    const data = await response.json();
    
    if (!data) return [];
    
    const hashtagCount = {};
    const hashtagPosts = {};
    
    // Contar hashtags
    for (const id in data) {
      const post = data[id];
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach(tag => {
          const tagLower = tag.toLowerCase();
          hashtagCount[tagLower] = (hashtagCount[tagLower] || 0) + 1;
          
          if (!hashtagPosts[tagLower]) {
            hashtagPosts[tagLower] = [];
          }
          hashtagPosts[tagLower].push({ id, ...post });
        });
      }
    }
    
    // Convertir a array y ordenar
    const tendencias = Object.entries(hashtagCount)
      .map(([hashtag, count]) => ({
        hashtag,
        count,
        posts: hashtagPosts[hashtag]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return tendencias;
    
  } catch (error) {
    console.error('Error al obtener tendencias:', error);
    return [];
  }
}

// ========== OBTENER RECIENTES ==========
async function obtenerRecientes() {
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json");
    const data = await response.json();
    
    if (!data) return [];
    
    const posts = [];
    
    for (const id in data) {
      const post = data[id];
      posts.push({
        id,
        ...post,
        likesCount: post.likes ? post.likes.length : 0,
        commentsCount: post.comentarios ? post.comentarios.length : 0
      });
    }
    
    // Ordenar por fecha (más recientes primero)
    posts.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Limitar a 15 resultados
    return posts.slice(0, 15);
    
  } catch (error) {
    console.error('Error al obtener recientes:', error);
    return [];
  }
}

// ========== MOSTRAR NOTIFICACIONES ==========
function mostrarNotificaciones(notificaciones, tipo) {
  const container = document.getElementById('notificationsContent');
  if (!container) return;
  
  if (notificaciones.length === 0) {
    container.innerHTML = `
      <div class="no-notifications">
        <div class="no-notifications-icon">📭</div>
        <p>No hay notificaciones en este momento</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  
  if (tipo === 'tendencias') {
    // Mostrar tendencias
    notificaciones.forEach(tendencia => {
      const item = crearItemTendencia(tendencia);
      container.appendChild(item);
    });
  } else {
    // Mostrar posts (destacadas o recientes)
    notificaciones.forEach(post => {
      const item = crearItemNotificacion(post, tipo);
      container.appendChild(item);
    });
  }
}

// ========== CREAR ITEM DE NOTIFICACIÓN ==========
function crearItemNotificacion(post, tipo) {
  const div = document.createElement('div');
  div.className = 'notification-item';
  
  const tiempo = calcularTiempoTranscurrido(post.fecha);
  
  let icon = '📝';
  let title = '';
  
  if (tipo === 'destacadas') {
    if (post.likesCount > post.commentsCount) {
      icon = '❤️';
      title = `${post.likesCount} recomendaciones`;
    } else {
      icon = '💬';
      title = `${post.commentsCount} comentarios`;
    }
  } else {
    icon = '🆕';
    title = 'Nueva publicación';
  }
  
  // Truncar contenido
  let contenido = post.contenido;
  if (contenido.length > 100) {
    contenido = contenido.substring(0, 100) + '...';
  }
  
  div.innerHTML = `
    <div class="notification-icon">${icon}</div>
    <div class="notification-content-wrapper">
      <p class="notification-title">${title}</p>
      <p class="notification-description">
        <strong>${post.userName}</strong>: ${contenido}
      </p>
      <div class="notification-meta">
        <span class="notification-time">🕐 ${tiempo}</span>
        ${post.likesCount > 0 ? `<span class="notification-stats">❤️ ${post.likesCount}</span>` : ''}
        ${post.commentsCount > 0 ? `<span class="notification-stats">💬 ${post.commentsCount}</span>` : ''}
      </div>
    </div>
  `;
  
  div.addEventListener('click', function() {
    window.location.href = `home.html?post=${post.id}`;
  });
  
  return div;
}

// ========== CREAR ITEM DE TENDENCIA ==========
function crearItemTendencia(tendencia) {
  const div = document.createElement('div');
  div.className = 'trending-item';
  
  div.innerHTML = `
    <p class="trending-hashtag">#${tendencia.hashtag}</p>
    <p class="trending-count">${tendencia.count} ${tendencia.count === 1 ? 'publicación' : 'publicaciones'}</p>
  `;
  
  div.addEventListener('click', function() {
    // Filtrar por hashtag en home
    if (window.hashtags && window.hashtags.filtrarPorHashtag) {
      window.location.href = `home.html`;
      setTimeout(() => {
        window.hashtags.filtrarPorHashtag(tendencia.hashtag);
      }, 500);
    } else {
      window.location.href = `home.html`;
    }
  });
  
  return div;
}

// ========== MARCAR TODAS COMO LEÍDAS ==========
function marcarTodasComoLeidas() {
  const badge = document.getElementById('notificationsBadgeIcon');
  if (badge) {
    badge.style.display = 'none';
  }
  
  // Remover clase unread de todos los items
  const items = document.querySelectorAll('.notification-item.unread');
  items.forEach(item => item.classList.remove('unread'));
  
  console.log('✅ Todas las notificaciones marcadas como leídas');
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

// Exportar funciones
window.notificationsFeed = {
  inicializarNotificacionesFeed,
  cargarNotificaciones
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('📢 Inicializando notificaciones feed...');
    inicializarNotificacionesFeed();
  });
} else {
  console.log('📢 Inicializando notificaciones feed (DOM ya listo)...');
  inicializarNotificacionesFeed();
}

console.log('✅ notifications-feed.js cargado correctamente');
