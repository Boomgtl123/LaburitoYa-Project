// ========== PERFIL PÚBLICO ESTILO INSTAGRAM - JAVASCRIPT ==========

let usuarioActual = null;
let usuarioPerfil = null;
let todasLasPublicaciones = [];
let userId = null;

// Avatar placeholder
const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23e0e0e0" width="150" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="60"%3E👤%3C/text%3E%3C/svg%3E';

// Banner por defecto
const DEFAULT_BANNER = 'linear-gradient(135deg, #0a66c2 0%, #1DA1F2 100%)';

// ========== INICIALIZACIÓN ==========
window.addEventListener('DOMContentLoaded', function() {
  // Proteger página
  if (!auth.protegerPagina()) {
    return;
  }
  
  usuarioActual = auth.obtenerUsuarioActual();
  
  // Obtener userId de la URL
  const urlParams = new URLSearchParams(window.location.search);
  userId = urlParams.get('userId');
  
  if (!userId) {
    alert('No se especificó un usuario');
    window.location.href = 'home.html';
    return;
  }
  
  // Si es el propio perfil, redirigir
  if (userId === usuarioActual.id) {
    window.location.href = 'profile.html';
    return;
  }
  
  if (usuarioActual) {
    inicializarPerfil();
  }
});

// ========== INICIALIZAR PERFIL ==========
async function inicializarPerfil() {
  await cargarUsuarioPerfil();
  if (usuarioPerfil) {
    cargarDatosPerfil();
    cargarPublicaciones();
    configurarEventListeners();
    
    // Inicializar notificaciones si está disponible
    if (window.notifications) {
      window.notifications.inicializarNotificaciones();
    }
  }
}

// ========== CARGAR USUARIO DEL PERFIL ==========
async function cargarUsuarioPerfil() {
  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios/${userId}.json`);
    const data = await response.json();
    
    if (!data) {
      alert('Usuario no encontrado');
      window.location.href = 'home.html';
      return;
    }
    
    usuarioPerfil = { id: userId, ...data };
    
  } catch (error) {
    console.error('Error al cargar usuario:', error);
    alert('Error al cargar el perfil');
    window.location.href = 'home.html';
  }
}

// ========== CARGAR DATOS DEL PERFIL ==========
function cargarDatosPerfil() {
  // Banner
  const profileBanner = document.getElementById('profileBanner');
  if (profileBanner) {
    const bannerColor = usuarioPerfil.bannerColor || DEFAULT_BANNER;
    profileBanner.style.background = bannerColor;
  }

  // Foto de perfil
  const profilePhoto = document.getElementById('profilePhoto');
  const navAvatar = document.getElementById('navAvatar');
  if (profilePhoto) {
    profilePhoto.src = usuarioPerfil.foto || DEFAULT_AVATAR;
  }
  if (navAvatar) {
    navAvatar.src = usuarioActual.foto || DEFAULT_AVATAR;
  }
  
  // Nombre completo (primero)
  const profileFullName = document.getElementById('profileFullName');
  if (profileFullName) {
    profileFullName.innerHTML = auth.renderNombreConBadge(usuarioPerfil.nombre, usuarioPerfil);
  }
  
  // Username (debajo, más pequeño)
  const username = usuarioPerfil.username || generarUsername(usuarioPerfil.nombre);
  document.getElementById('profileUsername').textContent = `@${username}`;
  
  // Bio
  const profileBio = document.getElementById('profileBio');
  if (profileBio) {
    if (usuarioPerfil.biografia) {
      profileBio.textContent = usuarioPerfil.biografia;
      profileBio.style.display = 'block';
    } else {
      profileBio.textContent = 'Sin biografía';
      profileBio.style.display = 'block';
      profileBio.style.color = '#8e8e8e';
    }
  }
  
  // Tipo de perfil
  const profileType = document.getElementById('profileType');
  if (profileType) {
    const tipoTexto = usuarioPerfil.perfil === 'Trabajador' ? 'Buscando oportunidades' : 'Buscando contratar';
    profileType.innerHTML = `💼 ${tipoTexto}`;
  }
  
  // Ubicación
  const profileLocation = document.getElementById('profileLocation');
  if (profileLocation) {
    profileLocation.innerHTML = `📍 ${usuarioPerfil.zona || 'Sin ubicación'}`;
  }
  
  // Contacto
  const profileContact = document.getElementById('profileContact');
  if (profileContact) {
    profileContact.innerHTML = `📞 ${usuarioPerfil.telefono || 'Sin teléfono'}`;
  }
  
  // Generar botones de redes sociales
  generarBotonesRedesSociales();
  
  // Cargar estadísticas
  cargarEstadisticas();
  
  // Verificar si ya sigue al usuario
  verificarSeguimiento();
}

// ========== GENERAR BOTONES DE REDES SOCIALES ==========
function generarBotonesRedesSociales() {
  const socialLinksContainer = document.getElementById('profileSocialLinks');
  if (!socialLinksContainer) return;
  
  socialLinksContainer.innerHTML = '';
  
  // Definir redes sociales disponibles
  const redesSociales = [
    {
      nombre: 'instagram',
      icono: '📷',
      url: usuarioPerfil.redesSociales?.instagram,
      baseUrl: 'https://instagram.com/'
    },
    {
      nombre: 'facebook',
      icono: '👤',
      url: usuarioPerfil.redesSociales?.facebook,
      baseUrl: 'https://facebook.com/'
    },
    {
      nombre: 'twitter',
      icono: '🐦',
      url: usuarioPerfil.redesSociales?.twitter,
      baseUrl: 'https://twitter.com/'
    },
    {
      nombre: 'linkedin',
      icono: '💼',
      url: usuarioPerfil.redesSociales?.linkedin,
      baseUrl: 'https://linkedin.com/in/'
    },
    {
      nombre: 'whatsapp',
      icono: '💬',
      url: usuarioPerfil.telefono,
      baseUrl: 'https://wa.me/'
    },
    {
      nombre: 'email',
      icono: '✉️',
      url: usuarioPerfil.correo,
      baseUrl: 'mailto:'
    }
  ];
  
  // Generar botones solo para redes que tengan información
  redesSociales.forEach(red => {
    if (red.url && red.url.trim() !== '') {
      const btn = document.createElement('a');
      btn.className = `profile-social-btn ${red.nombre}`;
      btn.href = red.nombre === 'email' ? `${red.baseUrl}${red.url}` : 
                 red.nombre === 'whatsapp' ? `${red.baseUrl}${red.url.replace(/\D/g, '')}` :
                 red.url.startsWith('http') ? red.url : `${red.baseUrl}${red.url}`;
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      btn.innerHTML = red.icono;
      btn.title = red.nombre.charAt(0).toUpperCase() + red.nombre.slice(1);
      
      socialLinksContainer.appendChild(btn);
    }
  });
  
  // Si no hay redes sociales, ocultar el contenedor
  if (socialLinksContainer.children.length === 0) {
    socialLinksContainer.style.display = 'none';
  } else {
    socialLinksContainer.style.display = 'flex';
  }
}

// ========== GENERAR USERNAME ==========
function generarUsername(nombre) {
  if (!nombre) return 'usuario';
  
  let username = nombre.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  
  return username || 'usuario';
}

// ========== CARGAR ESTADÍSTICAS ==========
async function cargarEstadisticas() {
  try {
    // Contar publicaciones
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json");
    const data = await response.json();
    
    let contadorPosts = 0;
    let contadorLikes = 0;
    let contadorComentarios = 0;
    
    if (data) {
      for (const id in data) {
        if (data[id].userId === userId) {
          contadorPosts++;
          if (data[id].likes) {
            contadorLikes += data[id].likes.length;
          }
          if (data[id].comentarios) {
            contadorComentarios += data[id].comentarios.length;
          }
        }
      }
    }
    
    document.getElementById('statPosts').textContent = contadorPosts;
    
    // Cargar seguidores y seguidos
    let seguidores = 0;
    let seguidos = 0;
    if (window.followers) {
      const seguidoresData = await window.followers.obtenerSeguidores(userId);
      const seguidosData = await window.followers.obtenerSeguidos(userId);
      seguidores = seguidoresData.length;
      seguidos = seguidosData.length;
      
      document.getElementById('statSeguidores').textContent = seguidores;
      document.getElementById('statSeguidos').textContent = seguidos;
    }
    
    // Guardar para el modal de estadísticas
    window.profileStats = {
      posts: contadorPosts,
      likes: contadorLikes,
      comentarios: contadorComentarios,
      seguidores: seguidores,
      seguidos: seguidos,
      vistas: usuarioPerfil.vistasPerfil || 0
    };
    
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  }
}

// ========== VERIFICAR SEGUIMIENTO ==========
async function verificarSeguimiento() {
  if (!window.followers) return;
  
  const siguiendo = await window.followers.estaSiguiendo(userId);
  const btnSeguir = document.getElementById('btnSeguir');
  const btnSeguirIcon = document.getElementById('btnSeguirIcon');
  const btnSeguirText = document.getElementById('btnSeguirText');
  
  if (siguiendo) {
    btnSeguir.classList.remove('profile-btn-primary');
    btnSeguir.classList.add('profile-btn-secondary');
    btnSeguirIcon.textContent = '✓';
    btnSeguirText.textContent = 'Siguiendo';
  } else {
    btnSeguir.classList.add('profile-btn-primary');
    btnSeguir.classList.remove('profile-btn-secondary');
    btnSeguirIcon.textContent = '➕';
    btnSeguirText.textContent = 'Seguir';
  }
}

// ========== TOGGLE SEGUIR ==========
async function toggleSeguir() {
  if (!window.followers) {
    alert('Sistema de seguidores no disponible');
    return;
  }
  
  const btnSeguir = document.getElementById('btnSeguir');
  const btnSeguirIcon = document.getElementById('btnSeguirIcon');
  const btnSeguirText = document.getElementById('btnSeguirText');
  
  const estabaSiguiendo = btnSeguirText.textContent === 'Siguiendo';
  
  // Deshabilitar botón temporalmente
  btnSeguir.disabled = true;
  btnSeguirText.textContent = '...';
  
  const success = await window.followers.toggleSeguir(userId);
  
  if (success) {
    if (estabaSiguiendo) {
      // Dejó de seguir
      btnSeguir.classList.add('profile-btn-primary');
      btnSeguir.classList.remove('profile-btn-secondary');
      btnSeguirIcon.textContent = '➕';
      btnSeguirText.textContent = 'Seguir';
      mostrarNotificacion('Dejaste de seguir a este usuario', 'info');
    } else {
      // Comenzó a seguir
      btnSeguir.classList.remove('profile-btn-primary');
      btnSeguir.classList.add('profile-btn-secondary');
      btnSeguirIcon.textContent = '✓';
      btnSeguirText.textContent = 'Siguiendo';
      mostrarNotificacion('✅ Ahora sigues a este usuario', 'success');
    }
    
    // Actualizar contador
    cargarEstadisticas();
  } else {
    mostrarNotificacion('❌ Error al actualizar seguimiento', 'error');
  }
  
  btnSeguir.disabled = false;
}

// ========== CARGAR PUBLICACIONES ==========
async function cargarPublicaciones() {
  const gridContainer = document.getElementById('profilePostsGrid');
  
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json");
    const data = await response.json();
    
    if (!data) {
      mostrarSinPublicaciones();
      return;
    }
    
    // Filtrar publicaciones del usuario del perfil
    const posts = Object.entries(data)
      .map(([id, post]) => ({ id, ...post }))
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    todasLasPublicaciones = posts;
    
    if (posts.length === 0) {
      mostrarSinPublicaciones();
      return;
    }
    
    // Renderizar grid
    gridContainer.innerHTML = '';
    posts.forEach(post => {
      const postElement = crearElementoPost(post);
      gridContainer.appendChild(postElement);
    });
    
  } catch (error) {
    console.error('Error al cargar publicaciones:', error);
    gridContainer.innerHTML = '<div class="profile-no-posts"><p>Error al cargar publicaciones</p></div>';
  }
}

// ========== CREAR ELEMENTO DE POST PARA GRID ==========
function crearElementoPost(post) {
  const div = document.createElement('div');
  div.className = 'profile-post-item';
  div.setAttribute('data-post-id', post.id);
  
  // Obtener primera imagen o placeholder
  let imagenUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="80"%3E📝%3C/text%3E%3C/svg%3E';
  
  if (post.fotos && post.fotos.length > 0) {
    imagenUrl = post.fotos[0];
  }
  
  const likeCount = post.likes ? post.likes.length : 0;
  const commentCount = post.comentarios ? post.comentarios.length : 0;
  const hasMultiplePhotos = post.fotos && post.fotos.length > 1;
  
  div.innerHTML = `
    <img src="${imagenUrl}" alt="Publicación" class="profile-post-image" loading="lazy" />
    ${hasMultiplePhotos ? '<div class="profile-post-multiple">📷</div>' : ''}
    <div class="profile-post-overlay">
      <div class="profile-post-stat">
        <span class="profile-post-stat-icon">❤️</span>
        <span>${likeCount}</span>
      </div>
      <div class="profile-post-stat">
        <span class="profile-post-stat-icon">💬</span>
        <span>${commentCount}</span>
      </div>
    </div>
  `;
  
  // Click para abrir modal
  div.addEventListener('click', () => abrirModalPost(post));
  
  return div;
}

// ========== MOSTRAR SIN PUBLICACIONES ==========
function mostrarSinPublicaciones() {
  const gridContainer = document.getElementById('profilePostsGrid');
  gridContainer.innerHTML = `
    <div class="profile-no-posts">
      <div class="profile-no-posts-icon">📷</div>
      <h3>No hay publicaciones aún</h3>
      <p>Este usuario aún no ha publicado nada.</p>
    </div>
  `;
}

// ========== ABRIR MODAL DE PUBLICACIÓN ==========
function abrirModalPost(post) {
  const modal = document.getElementById('profilePostModal');
  const modalImage = document.getElementById('postModalImage');
  const modalAvatar = document.getElementById('postModalAvatar');
  const modalUsername = document.getElementById('postModalUsername');
  
  if (modal && modalImage) {
    const imagenUrl = (post.fotos && post.fotos.length > 0) 
      ? post.fotos[0] 
      : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="800"%3E%3Crect fill="%23f0f0f0" width="800" height="800"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="120"%3E📝%3C/text%3E%3C/svg%3E';
    
    modalImage.src = imagenUrl;
    
    if (modalAvatar) {
      modalAvatar.src = usuarioPerfil.foto || DEFAULT_AVATAR;
    }
    
    if (modalUsername) {
      const username = usuarioPerfil.username || generarUsername(usuarioPerfil.nombre);
      modalUsername.textContent = `@${username}`;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// ========== CERRAR MODAL DE PUBLICACIÓN ==========
function cerrarModalPost() {
  const modal = document.getElementById('profilePostModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// ========== ENVIAR MENSAJE ==========
function enviarMensaje() {
  window.location.href = `messages.html?user=${userId}`;
}

// ========== COMPARTIR PERFIL ==========
function compartirPerfil() {
  const username = usuarioPerfil.username || generarUsername(usuarioPerfil.nombre);
  const url = `${window.location.origin}/public-profile.html?userId=${userId}`;
  
  if (navigator.share) {
    navigator.share({
      title: `Perfil de @${username} - LaburitoYa`,
      text: `Mira el perfil de ${usuarioPerfil.nombre} en LaburitoYa`,
      url: url
    }).catch(err => console.log('Error al compartir:', err));
  } else {
    navigator.clipboard.writeText(url).then(() => {
      mostrarNotificacion('✅ Link copiado al portapapeles', 'success');
    }).catch(() => {
      alert(`Comparte este link:\n${url}`);
    });
  }
}

// ========== ABRIR MODAL DE ESTADÍSTICAS ==========
function abrirModalEstadisticas() {
  const modal = document.getElementById('profileStatsModal');
  
  // Cargar estadísticas detalladas
  cargarEstadisticasDetalladas();
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// ========== CERRAR MODAL DE ESTADÍSTICAS ==========
function cerrarModalEstadisticas() {
  const modal = document.getElementById('profileStatsModal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// ========== CARGAR ESTADÍSTICAS DETALLADAS ==========
async function cargarEstadisticasDetalladas() {
  try {
    // Obtener datos actualizados
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json");
    const data = await response.json();
    
    let contadorPosts = 0;
    let contadorLikes = 0;
    let contadorComentarios = 0;
    
    if (data) {
      for (const id in data) {
        if (data[id].userId === usuarioPerfil.id) {
          contadorPosts++;
          if (data[id].likes) {
            contadorLikes += data[id].likes.length;
          }
          if (data[id].comentarios) {
            contadorComentarios += data[id].comentarios.length;
          }
        }
      }
    }
    
    // Obtener seguidores
    let seguidores = 0;
    let seguidos = 0;
    if (window.followers) {
      const seguidoresData = await window.followers.obtenerSeguidores(usuarioPerfil.id);
      const seguidosData = await window.followers.obtenerSeguidos(usuarioPerfil.id);
      seguidores = seguidoresData.length;
      seguidos = seguidosData.length;
    }
    
    // Actualizar modal
    document.getElementById('statsDetailPosts').textContent = formatearNumero(contadorPosts);
    document.getElementById('statsDetailLikes').textContent = formatearNumero(contadorLikes);
    document.getElementById('statsDetailComments').textContent = formatearNumero(contadorComentarios);
    document.getElementById('statsDetailViews').textContent = formatearNumero(usuarioPerfil.vistasPerfil || 0);
    document.getElementById('statsDetailFollowers').textContent = formatearNumero(seguidores);
    document.getElementById('statsDetailFollowing').textContent = formatearNumero(seguidos);
    
    // Fecha de registro
    const fechaRegistro = usuarioPerfil.fechaRegistro || new Date().toISOString();
    document.getElementById('statsDetailMemberSince').textContent = formatearFecha(fechaRegistro);
    
    // Última actividad
    const ultimaActividad = usuarioPerfil.ultimaActividad || new Date().toISOString();
    document.getElementById('statsDetailLastActivity').textContent = formatearTiempoRelativo(ultimaActividad);
    
  } catch (error) {
    console.error('Error al cargar estadísticas detalladas:', error);
  }
}

// ========== FORMATEAR NÚMERO ==========
function formatearNumero(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// ========== FORMATEAR FECHA ==========
function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

// ========== FORMATEAR TIEMPO RELATIVO ==========
function formatearTiempoRelativo(fechaISO) {
  const ahora = new Date();
  const fecha = new Date(fechaISO);
  const diferencia = ahora - fecha;
  
  const minutos = Math.floor(diferencia / 60000);
  const horas = Math.floor(diferencia / 3600000);
  const dias = Math.floor(diferencia / 86400000);
  
  if (minutos < 1) return 'Ahora mismo';
  if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
  if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} semana${Math.floor(dias / 7) > 1 ? 's' : ''}`;
  return formatearFecha(fechaISO);
}

// ========== MOSTRAR NOTIFICACIÓN ==========
function mostrarNotificacion(mensaje, tipo = 'info') {
  const notificacion = document.createElement('div');
  notificacion.className = `notification notification-${tipo}`;
  notificacion.textContent = mensaje;
  notificacion.style.cssText = `
    position: fixed;
    top: 80px;
    right: 24px;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    opacity: 0;
    transform: translateX(400px);
    transition: all 0.3s ease;
    max-width: 350px;
  `;
  
  if (tipo === 'success') {
    notificacion.style.borderLeft = '4px solid #2e7d32';
    notificacion.style.color = '#2e7d32';
  } else if (tipo === 'error') {
    notificacion.style.borderLeft = '4px solid #d32f2f';
    notificacion.style.color = '#d32f2f';
  }
  
  document.body.appendChild(notificacion);
  
  setTimeout(() => {
    notificacion.style.opacity = '1';
    notificacion.style.transform = 'translateX(0)';
  }, 10);
  
  setTimeout(() => {
    notificacion.style.opacity = '0';
    notificacion.style.transform = 'translateX(400px)';
    setTimeout(() => {
      notificacion.remove();
    }, 300);
  }, 3000);
}

// ========== CONFIGURAR EVENT LISTENERS ==========
function configurarEventListeners() {
  // Botón seguir
  const btnSeguir = document.getElementById('btnSeguir');
  if (btnSeguir) {
    btnSeguir.addEventListener('click', toggleSeguir);
  }
  
  // Botón mensaje
  const btnMensaje = document.getElementById('btnMensaje');
  if (btnMensaje) {
    btnMensaje.addEventListener('click', enviarMensaje);
  }
  
  // Botón compartir perfil
  const btnShareProfile = document.getElementById('btnShareProfile');
  if (btnShareProfile) {
    btnShareProfile.addEventListener('click', compartirPerfil);
  }
  
  // Botón ver estadísticas
  const btnViewStats = document.getElementById('btnViewStats');
  if (btnViewStats) {
    btnViewStats.addEventListener('click', abrirModalEstadisticas);
  }
  
  // Cerrar modal de estadísticas
  const btnCloseStatsModal = document.getElementById('btnCloseStatsModal');
  if (btnCloseStatsModal) {
    btnCloseStatsModal.addEventListener('click', cerrarModalEstadisticas);
  }
  
  const profileStatsModal = document.getElementById('profileStatsModal');
  if (profileStatsModal) {
    profileStatsModal.addEventListener('click', function(e) {
      if (e.target === this) {
        cerrarModalEstadisticas();
      }
    });
  }
  
  // Cerrar modal de publicación
  const btnClosePostModal = document.getElementById('btnClosePostModal');
  if (btnClosePostModal) {
    btnClosePostModal.addEventListener('click', cerrarModalPost);
  }
  
  const profilePostModal = document.getElementById('profilePostModal');
  if (profilePostModal) {
    profilePostModal.addEventListener('click', function(e) {
      if (e.target === this) {
        cerrarModalPost();
      }
    });
  }
  
  // Cerrar modal con ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      cerrarModalPost();
      cerrarModalEstadisticas();
    }
  });
  
  // Estadísticas clickeables
  const statSeguidoresBox = document.getElementById('statSeguidoresBox');
  const statSeguidosBox = document.getElementById('statSeguidosBox');
  
  if (statSeguidoresBox) {
    statSeguidoresBox.addEventListener('click', () => {
      console.log('Ver seguidores');
    });
  }
  
  if (statSeguidosBox) {
    statSeguidosBox.addEventListener('click', () => {
      console.log('Ver seguidos');
    });
  }
}

// Exportar funciones
window.publicProfileInstagram = {
  cargarPublicaciones,
  abrirModalPost,
  cerrarModalPost,
  toggleSeguir,
  compartirPerfil,
  abrirModalEstadisticas,
  cerrarModalEstadisticas,
  generarBotonesRedesSociales
};

console.log('✅ public-profile-instagram.js cargado correctamente');
