// ========== VARIABLES GLOBALES ==========
let usuarioActual = null;
let usuarioViendo = null;
let userIdViendo = null;

// Avatar placeholder
const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e0e0e0" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="40"%3E👤%3C/text%3E%3C/svg%3E';

// ========== PROTEGER PÁGINA Y CARGAR USUARIO ==========
window.addEventListener('DOMContentLoaded', async function() {
  if (!auth.protegerPagina()) {
    return;
  }
  
  usuarioActual = auth.obtenerUsuarioActual();
  console.log('Usuario actual:', usuarioActual);
  
  if (usuarioActual) {
    // Obtener userId de la URL
    const urlParams = new URLSearchParams(window.location.search);
    userIdViendo = urlParams.get('userId');
    
    console.log('userId de la URL:', userIdViendo);
    console.log('URL completa:', window.location.href);
    
    if (!userIdViendo) {
      alert('No se especificó un usuario para ver');
      window.location.href = 'home.html';
      return;
    }
    
    // Si intenta ver su propio perfil, redirigir a profile.html
    if (userIdViendo === usuarioActual.id) {
      console.log('Redirigiendo a perfil propio');
      window.location.href = 'profile.html';
      return;
    }
    
    await inicializarPagina();
  }
});

// ========== INICIALIZAR PÁGINA ==========
async function inicializarPagina() {
  // Actualizar avatar del navbar
  const navAvatar = document.getElementById('navAvatar');
  if (navAvatar) {
    navAvatar.src = usuarioActual.foto || DEFAULT_AVATAR;
  }
  
  // Cargar datos del usuario que estamos viendo
  await cargarDatosUsuario();
  
  // Cargar estadísticas
  await cargarEstadisticas();
  
  // Cargar contadores de seguidores
  await cargarContadoresSeguidores();
  
  // Configurar event listeners
  configurarEventListeners();
  
  // Actualizar estado del botón seguir
  await actualizarBotonSeguir();
}

// ========== CARGAR DATOS DEL USUARIO ==========
async function cargarDatosUsuario() {
  try {
    console.log('Buscando usuario con ID:', userIdViendo);
    
    // Intentar en /usuarios/ primero (ruta más común)
    let response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios/${userIdViendo}.json`);
    let usuario = await response.json();
    
    console.log('Respuesta de /usuarios/:', usuario);
    
    // Si no se encuentra, intentar en /users/
    if (!usuario) {
      console.log('No encontrado en /usuarios/, intentando /users/...');
      response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/users/${userIdViendo}.json`);
      usuario = await response.json();
      console.log('Respuesta de /users/:', usuario);
    }
    
    // Si aún no se encuentra, buscar en todos los usuarios
    if (!usuario) {
      console.log('No encontrado directamente, buscando en todos los usuarios...');
      
      // Intentar en /usuarios/
      response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios.json`);
      let todosLosUsuarios = await response.json();
      
      if (todosLosUsuarios) {
        for (const [key, user] of Object.entries(todosLosUsuarios)) {
          if (key === userIdViendo || (user && user.id === userIdViendo)) {
            usuario = user;
            usuario.id = key;
            console.log('Usuario encontrado en /usuarios/:', usuario);
            break;
          }
        }
      }
      
      // Si aún no se encuentra, intentar en /users/
      if (!usuario) {
        response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/users.json`);
        todosLosUsuarios = await response.json();
        
        if (todosLosUsuarios) {
          for (const [key, user] of Object.entries(todosLosUsuarios)) {
            if (key === userIdViendo || (user && user.id === userIdViendo)) {
              usuario = user;
              usuario.id = key;
              console.log('Usuario encontrado en /users/:', usuario);
              break;
            }
          }
        }
      }
    }
    
    if (!usuario) {
      console.error('Usuario no encontrado en ninguna ruta:', userIdViendo);
      alert('Usuario no encontrado. El usuario puede haber sido eliminado o el ID es incorrecto.');
      window.location.href = 'home.html';
      return;
    }
    
    // Asegurar que el usuario tenga un ID
    if (!usuario.id) {
      usuario.id = userIdViendo;
    }
    
    console.log('Usuario cargado exitosamente:', usuario);
    
    usuarioViendo = usuario;
    
    // Actualizar interfaz
    const profilePhoto = document.getElementById('profilePhoto');
    const profileName = document.getElementById('profileName');
    const profileType = document.getElementById('profileType');
    const profileLocation = document.getElementById('profileLocation');
    const profileContact = document.getElementById('profileContact');
    
    if (profilePhoto) profilePhoto.src = usuario.foto || DEFAULT_AVATAR;
    if (profileName) profileName.innerHTML = auth.renderNombreConBadge(usuario.nombre || 'Usuario', usuario);
    if (profileType) {
      const perfilTexto = usuario.perfil === 'Trabajador' ? 'Buscando oportunidades laborales' : 'Buscando contratar personal';
      profileType.textContent = perfilTexto;
    }
    if (profileLocation) profileLocation.textContent = `📍 ${usuario.zona || 'Ubicación no especificada'}`;
    if (profileContact) profileContact.textContent = `📞 ${usuario.telefono || 'No disponible'}`;
    
    // Información adicional
    const viewPerfil = document.getElementById('viewPerfil');
    const viewZona = document.getElementById('viewZona');
    const viewFecha = document.getElementById('viewFecha');
    
    if (viewPerfil) viewPerfil.textContent = usuario.perfil || '-';
    if (viewZona) viewZona.textContent = usuario.zona || '-';
    if (viewFecha) {
      const fecha = usuario.fechaRegistro ? new Date(usuario.fechaRegistro).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '-';
      viewFecha.textContent = fecha;
    }
    
    // Biografía
    if (usuario.biografia) {
      const viewBiografia = document.getElementById('viewBiografia');
      const viewBiografiaContainer = document.getElementById('viewBiografiaContainer');
      if (viewBiografia) viewBiografia.textContent = usuario.biografia;
      if (viewBiografiaContainer) viewBiografiaContainer.style.display = 'flex';
    }
    
    // Redes sociales
    let tieneRedes = false;
    const redesSocialesContainer = document.getElementById('redesSocialesContainer');
    
    if (usuario.instagram) {
      const viewInstagram = document.getElementById('viewInstagram');
      const viewInstagramContainer = document.getElementById('viewInstagramContainer');
      if (viewInstagram) {
        viewInstagram.href = usuario.instagram;
        viewInstagram.textContent = usuario.instagram;
      }
      if (viewInstagramContainer) viewInstagramContainer.style.display = 'flex';
      tieneRedes = true;
    }
    
    if (usuario.twitter) {
      const viewTwitter = document.getElementById('viewTwitter');
      const viewTwitterContainer = document.getElementById('viewTwitterContainer');
      if (viewTwitter) {
        viewTwitter.href = usuario.twitter;
        viewTwitter.textContent = usuario.twitter;
      }
      if (viewTwitterContainer) viewTwitterContainer.style.display = 'flex';
      tieneRedes = true;
    }
    
    if (usuario.threads) {
      const viewThreads = document.getElementById('viewThreads');
      const viewThreadsContainer = document.getElementById('viewThreadsContainer');
      if (viewThreads) {
        viewThreads.href = usuario.threads;
        viewThreads.textContent = usuario.threads;
      }
      if (viewThreadsContainer) viewThreadsContainer.style.display = 'flex';
      tieneRedes = true;
    }
    
    if (usuario.facebook) {
      const viewFacebook = document.getElementById('viewFacebook');
      const viewFacebookContainer = document.getElementById('viewFacebookContainer');
      if (viewFacebook) {
        viewFacebook.href = usuario.facebook;
        viewFacebook.textContent = usuario.facebook;
      }
      if (viewFacebookContainer) viewFacebookContainer.style.display = 'flex';
      tieneRedes = true;
    }
    
    if (usuario.tiktok) {
      const viewTiktok = document.getElementById('viewTiktok');
      const viewTiktokContainer = document.getElementById('viewTiktokContainer');
      if (viewTiktok) {
        viewTiktok.href = usuario.tiktok;
        viewTiktok.textContent = usuario.tiktok;
      }
      if (viewTiktokContainer) viewTiktokContainer.style.display = 'flex';
      tieneRedes = true;
    }
    
    if (tieneRedes && redesSocialesContainer) {
      redesSocialesContainer.style.display = 'block';
    }
    
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error);
    alert('Error al cargar el perfil');
    window.location.href = 'home.html';
  }
}

// ========== CARGAR ESTADÍSTICAS ==========
async function cargarEstadisticas() {
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json");
    const data = await response.json();
    
    let contadorPosts = 0;
    let contadorLikes = 0;
    
    if (data) {
      for (const id in data) {
        const post = data[id];
        
        if (post.userId === userIdViendo) {
          contadorPosts++;
          
          if (post.likes && Array.isArray(post.likes)) {
            contadorLikes += post.likes.length;
          }
        }
      }
    }
    
    const statPosts = document.getElementById('statPosts');
    const statLikes = document.getElementById('statLikes');
    
    if (statPosts) statPosts.textContent = contadorPosts;
    if (statLikes) statLikes.textContent = contadorLikes;
    
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  }
}

// ========== CARGAR CONTADORES DE SEGUIDORES ==========
async function cargarContadoresSeguidores() {
  if (!window.followers) return;
  
  try {
    const contadores = await window.followers.obtenerContadores(userIdViendo);
    
    const statSeguidores = document.getElementById('statSeguidores');
    const statSeguidos = document.getElementById('statSeguidos');
    
    if (statSeguidores) statSeguidores.textContent = contadores.seguidores;
    if (statSeguidos) statSeguidos.textContent = contadores.siguiendo;
    
  } catch (error) {
    console.error('Error al cargar contadores de seguidores:', error);
  }
}

// ========== CONFIGURAR EVENT LISTENERS ==========
function configurarEventListeners() {
  // Botón cerrar sesión
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        auth.cerrarSesion();
      }
    });
  }
  
  // Botón seguir
  const btnSeguir = document.getElementById('btnSeguir');
  if (btnSeguir) {
    btnSeguir.addEventListener('click', toggleSeguir);
  }
  
  // Botón mensaje
  const btnMensaje = document.getElementById('btnMensaje');
  if (btnMensaje) {
    btnMensaje.addEventListener('click', function() {
      window.location.href = `messages.html?user=${userIdViendo}`;
    });
  }
  
  // Estadísticas clickeables
  const statSeguidoresBox = document.getElementById('statSeguidoresBox');
  const statSeguidosBox = document.getElementById('statSeguidosBox');
  
  if (statSeguidoresBox) {
    statSeguidoresBox.addEventListener('click', () => mostrarSeguidores('seguidores'));
  }
  
  if (statSeguidosBox) {
    statSeguidosBox.addEventListener('click', () => mostrarSeguidores('seguidos'));
  }
  
  // Cerrar modal de seguidores
  const btnCloseFollowers = document.getElementById('btnCloseFollowers');
  if (btnCloseFollowers) {
    btnCloseFollowers.addEventListener('click', cerrarSeguidores);
  }
  
  // Tabs de seguidores
  const tabSeguidores = document.getElementById('tabSeguidores');
  const tabSeguidos = document.getElementById('tabSeguidos');
  
  if (tabSeguidores) {
    tabSeguidores.addEventListener('click', () => cambiarTab('seguidores'));
  }
  
  if (tabSeguidos) {
    tabSeguidos.addEventListener('click', () => cambiarTab('seguidos'));
  }
  
  // Dropdown perfil
  const navPerfil = document.getElementById('navPerfil');
  if (navPerfil) {
    navPerfil.addEventListener('click', function(e) {
      if (!e.target.closest('.dropdown-menu')) {
        this.classList.toggle('active');
      }
    });
  }
  
  document.addEventListener('click', function(e) {
    const navPerfil = document.getElementById('navPerfil');
    if (navPerfil && !navPerfil.contains(e.target)) {
      navPerfil.classList.remove('active');
    }
  });
}

// ========== ACTUALIZAR BOTÓN SEGUIR ==========
async function actualizarBotonSeguir() {
  if (!window.followers) return;
  
  const btnSeguir = document.getElementById('btnSeguir');
  const btnSeguirIcon = document.getElementById('btnSeguirIcon');
  const btnSeguirText = document.getElementById('btnSeguirText');
  
  if (!btnSeguir) return;
  
  const siguiendo = await window.followers.estaSiguiendo(userIdViendo);
  
  if (siguiendo) {
    btnSeguirIcon.textContent = '✓';
    btnSeguirText.textContent = 'Siguiendo';
    btnSeguir.classList.add('following');
  } else {
    btnSeguirIcon.textContent = '➕';
    btnSeguirText.textContent = 'Seguir';
    btnSeguir.classList.remove('following');
  }
}

// ========== TOGGLE SEGUIR ==========
async function toggleSeguir() {
  if (!window.followers) return;
  
  const btnSeguir = document.getElementById('btnSeguir');
  const btnSeguirIcon = document.getElementById('btnSeguirIcon');
  const btnSeguirText = document.getElementById('btnSeguirText');
  
  // Deshabilitar botón temporalmente
  btnSeguir.disabled = true;
  btnSeguirText.textContent = '...';
  
  const success = await window.followers.toggleSeguir(userIdViendo);
  
  if (success) {
    await actualizarBotonSeguir();
    await cargarContadoresSeguidores();
    
    const siguiendo = await window.followers.estaSiguiendo(userIdViendo);
    if (siguiendo) {
      mostrarNotificacion('✅ Ahora sigues a este usuario', 'success');
    } else {
      mostrarNotificacion('Dejaste de seguir a este usuario', 'info');
    }
  } else {
    mostrarNotificacion('❌ Error al actualizar seguimiento', 'error');
  }
  
  btnSeguir.disabled = false;
}

// ========== MOSTRAR SEGUIDORES ==========
async function mostrarSeguidores(tipo) {
  if (!window.followers) return;
  
  const followersCard = document.getElementById('followersCard');
  const followersTitle = document.getElementById('followersTitle');
  const followersList = document.getElementById('followersList');
  const tabSeguidores = document.getElementById('tabSeguidores');
  const tabSeguidos = document.getElementById('tabSeguidos');
  
  if (!followersCard || !followersList) return;
  
  followersCard.style.display = 'block';
  followersList.innerHTML = '<div class="loading-followers">Cargando...</div>';
  
  // Actualizar título y tabs
  if (tipo === 'seguidores') {
    followersTitle.textContent = 'Seguidores';
    tabSeguidores.classList.add('active');
    tabSeguidos.classList.remove('active');
  } else {
    followersTitle.textContent = 'Siguiendo';
    tabSeguidos.classList.add('active');
    tabSeguidores.classList.remove('active');
  }
  
  try {
    let userIds = [];
    
    if (tipo === 'seguidores') {
      userIds = await window.followers.obtenerSeguidores(userIdViendo);
    } else {
      userIds = await window.followers.obtenerSeguidos(userIdViendo);
    }
    
    if (userIds.length === 0) {
      followersList.innerHTML = `<div class="no-followers">No hay ${tipo === 'seguidores' ? 'seguidores' : 'usuarios seguidos'} aún</div>`;
      return;
    }
    
    const usuarios = await window.followers.obtenerDatosUsuarios(userIds);
    
    followersList.innerHTML = '';
    
    usuarios.forEach(usuario => {
      const item = crearItemUsuario(usuario);
      followersList.appendChild(item);
    });
    
  } catch (error) {
    console.error('Error al cargar seguidores:', error);
    followersList.innerHTML = '<div class="error-followers">Error al cargar la lista</div>';
  }
}

// ========== CREAR ITEM DE USUARIO ==========
function crearItemUsuario(usuario) {
  const div = document.createElement('div');
  div.className = 'follower-item';
  
  const perfilTexto = usuario.perfil === 'Trabajador' ? 'Buscando oportunidades' : 'Buscando contratar';
  
  div.innerHTML = `
    <img src="${usuario.foto || DEFAULT_AVATAR}" alt="${usuario.nombre}" class="follower-avatar" onerror="this.src='${DEFAULT_AVATAR}'" />
    <div class="follower-info">
      <p class="follower-name">${auth.renderNombreConBadge(usuario.nombre, usuario)}</p>
      <p class="follower-details">${perfilTexto} • ${usuario.zona || 'Ubicación no especificada'}</p>
    </div>
    <a href="messages.html?user=${usuario.id}" class="btn-message-follower">💬 Mensaje</a>
  `;
  
  // Hacer clickeable el nombre para ver su perfil
  const nombreElement = div.querySelector('.follower-name');
  nombreElement.style.cursor = 'pointer';
  nombreElement.style.color = '#0a66c2';
  nombreElement.addEventListener('click', function() {
    if (usuario.id === usuarioActual.id) {
      window.location.href = 'profile.html';
    } else {
      window.location.href = `public-profile.html?userId=${usuario.id}`;
    }
  });
  
  return div;
}

// ========== CAMBIAR TAB ==========
function cambiarTab(tipo) {
  mostrarSeguidores(tipo);
}

// ========== CERRAR SEGUIDORES ==========
function cerrarSeguidores() {
  const followersCard = document.getElementById('followersCard');
  if (followersCard) {
    followersCard.style.display = 'none';
  }
}

// ========== MOSTRAR NOTIFICACIÓN ==========
function mostrarNotificacion(mensaje, tipo = 'info') {
  const notificacion = document.createElement('div');
  notificacion.className = `notification notification-${tipo}`;
  notificacion.textContent = mensaje;
  
  document.body.appendChild(notificacion);
  
  setTimeout(() => {
    notificacion.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notificacion.classList.remove('show');
    setTimeout(() => {
      notificacion.remove();
    }, 300);
  }, 3000);
}

console.log('✅ public-profile.js cargado correctamente');
