// ========== PERFIL ESTILO INSTAGRAM - JAVASCRIPT ==========

let usuarioActual = null;
let todasLasPublicaciones = [];
let bannerColorSeleccionado = 'linear-gradient(135deg, #0a66c2 0%, #1DA1F2 100%)';

// Avatar placeholder
const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23e0e0e0" width="150" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="60"%3E👤%3C/text%3E%3C/svg%3E';

// Paleta de colores para el banner
const BANNER_COLORS = {
  solidos: [
    '#0a66c2', '#1DA1F2', '#4A90E2', '#5DADE2',
    '#2ecc71', '#27ae60', '#16a085', '#00b894',
    '#e74c3c', '#c0392b', '#d63031', '#ff6b6b',
    '#9b59b6', '#8e44ad', '#6c5ce7', '#a29bfe',
    '#e67e22', '#d35400', '#fd79a8', '#fdcb6e',
    '#95a5a6', '#7f8c8d', '#2c3e50', '#34495e'
  ],
  gradientes: [
    { nombre: 'Atardecer', valor: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' },
    { nombre: 'Océano', valor: 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)' },
    { nombre: 'Bosque', valor: 'linear-gradient(135deg, #00b894 0%, #55efc4 100%)' },
    { nombre: 'Fuego', valor: 'linear-gradient(135deg, #d63031 0%, #fdcb6e 100%)' },
    { nombre: 'Noche', valor: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)' },
    { nombre: 'Aurora', valor: 'linear-gradient(135deg, #a29bfe 0%, #fd79a8 100%)' },
    { nombre: 'Tropical', valor: 'linear-gradient(135deg, #00b894 0%, #fdcb6e 100%)' },
    { nombre: 'Cielo', valor: 'linear-gradient(135deg, #74b9ff 0%, #a29bfe 100%)' }
  ]
};

// ========== INICIALIZACIÓN ==========
window.addEventListener('DOMContentLoaded', function() {
  // Proteger página
  if (!auth.protegerPagina()) {
    return;
  }
  
  usuarioActual = auth.obtenerUsuarioActual();
  
  if (usuarioActual) {
    inicializarPerfil();
  }
});

// ========== INICIALIZAR PERFIL ==========
function inicializarPerfil() {
  cargarDatosPerfil();
  cargarPublicaciones();
  configurarEventListeners();
  inicializarSelectorBanner();
  
  // Inicializar notificaciones si está disponible
  if (window.notifications) {
    window.notifications.inicializarNotificaciones();
  }
}

// ========== CARGAR DATOS DEL PERFIL ==========
function cargarDatosPerfil() {
  // Banner
  const profileBanner = document.getElementById('profileBanner');
  if (profileBanner) {
    const bannerColor = usuarioActual.bannerColor || 'linear-gradient(135deg, #0a66c2 0%, #1DA1F2 100%)';
    profileBanner.style.background = bannerColor;
    bannerColorSeleccionado = bannerColor;
  }

  // Foto de perfil
  const profilePhoto = document.getElementById('profilePhoto');
  const navAvatar = document.getElementById('navAvatar');
  if (profilePhoto) {
    profilePhoto.src = usuarioActual.foto || DEFAULT_AVATAR;
  }
  if (navAvatar) {
    navAvatar.src = usuarioActual.foto || DEFAULT_AVATAR;
  }
  
  // Nombre completo (primero)
  const profileFullName = document.getElementById('profileFullName');
  if (profileFullName) {
    profileFullName.innerHTML = auth.renderNombreConBadge(usuarioActual.nombre, usuarioActual);
  }
  
  // Username (debajo, más pequeño)
  const username = usuarioActual.username || generarUsername(usuarioActual.nombre);
  document.getElementById('profileUsername').textContent = `@${username}`;
  
  // Bio
  const profileBio = document.getElementById('profileBio');
  if (profileBio) {
    if (usuarioActual.biografia) {
      profileBio.textContent = usuarioActual.biografia;
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
    const tipoTexto = usuarioActual.perfil === 'Trabajador' ? 'Buscando oportunidades' : 'Buscando contratar';
    profileType.innerHTML = `💼 ${tipoTexto}`;
  }
  
  // Ubicación
  const profileLocation = document.getElementById('profileLocation');
  if (profileLocation) {
    profileLocation.innerHTML = `📍 ${usuarioActual.zona || 'Sin ubicación'}`;
  }
  
  // Contacto
  const profileContact = document.getElementById('profileContact');
  if (profileContact) {
    profileContact.innerHTML = `📞 ${usuarioActual.telefono || 'Sin teléfono'}`;
  }
  
  // Generar botones de redes sociales
  generarBotonesRedesSociales();
  
  // Cargar estadísticas
  cargarEstadisticas();
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
      url: usuarioActual.redesSociales?.instagram,
      baseUrl: 'https://instagram.com/'
    },
    {
      nombre: 'facebook',
      icono: '👤',
      url: usuarioActual.redesSociales?.facebook,
      baseUrl: 'https://facebook.com/'
    },
    {
      nombre: 'twitter',
      icono: '🐦',
      url: usuarioActual.redesSociales?.twitter,
      baseUrl: 'https://twitter.com/'
    },
    {
      nombre: 'linkedin',
      icono: '💼',
      url: usuarioActual.redesSociales?.linkedin,
      baseUrl: 'https://linkedin.com/in/'
    },
    {
      nombre: 'whatsapp',
      icono: '💬',
      url: usuarioActual.telefono,
      baseUrl: 'https://wa.me/'
    },
    {
      nombre: 'email',
      icono: '✉️',
      url: usuarioActual.correo,
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
  
  // Convertir a minúsculas, quitar acentos y espacios
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
        if (data[id].userId === usuarioActual.id) {
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
    if (window.followers) {
      const seguidores = await window.followers.obtenerSeguidores(usuarioActual.id);
      const seguidos = await window.followers.obtenerSeguidos(usuarioActual.id);
      
      document.getElementById('statSeguidores').textContent = seguidores.length;
      document.getElementById('statSeguidos').textContent = seguidos.length;
    }
    
    // Guardar para el modal de estadísticas
    window.profileStats = {
      posts: contadorPosts,
      likes: contadorLikes,
      comentarios: contadorComentarios,
      seguidores: 0,
      seguidos: 0,
      vistas: usuarioActual.vistasPerfil || 0
    };
    
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  }
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
    
    // Filtrar publicaciones del usuario actual
    const posts = Object.entries(data)
      .map(([id, post]) => ({ id, ...post }))
      .filter(post => post.userId === usuarioActual.id)
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
      <p>Cuando publiques fotos y videos, aparecerán aquí.</p>
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
    // Configurar imagen
    const imagenUrl = (post.fotos && post.fotos.length > 0) 
      ? post.fotos[0] 
      : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="800"%3E%3Crect fill="%23f0f0f0" width="800" height="800"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="120"%3E📝%3C/text%3E%3C/svg%3E';
    
    modalImage.src = imagenUrl;
    
    if (modalAvatar) {
      modalAvatar.src = usuarioActual.foto || DEFAULT_AVATAR;
    }
    
    if (modalUsername) {
      const username = usuarioActual.username || generarUsername(usuarioActual.nombre);
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

// ========== INICIALIZAR SELECTOR DE BANNER ==========
function inicializarSelectorBanner() {
  const solidColorsGrid = document.getElementById('solidColorsGrid');
  const gradientsGrid = document.getElementById('gradientsGrid');
  
  if (solidColorsGrid) {
    // Generar colores sólidos
    BANNER_COLORS.solidos.forEach(color => {
      const colorOption = document.createElement('div');
      colorOption.className = 'profile-color-option';
      colorOption.style.background = color;
      colorOption.setAttribute('data-color', color);
      
      colorOption.addEventListener('click', () => seleccionarColorBanner(color, false));
      
      solidColorsGrid.appendChild(colorOption);
    });
  }
  
  if (gradientsGrid) {
    // Generar gradientes
    BANNER_COLORS.gradientes.forEach(gradiente => {
      const gradientOption = document.createElement('div');
      gradientOption.className = 'profile-gradient-option';
      gradientOption.style.background = gradiente.valor;
      gradientOption.setAttribute('data-gradient', gradiente.valor);
      gradientOption.title = gradiente.nombre;
      
      gradientOption.addEventListener('click', () => seleccionarColorBanner(gradiente.valor, true));
      
      gradientsGrid.appendChild(gradientOption);
    });
  }
  
  // Marcar color actual como seleccionado
  marcarColorSeleccionado(bannerColorSeleccionado);
}

// ========== SELECCIONAR COLOR DEL BANNER ==========
function seleccionarColorBanner(color, esGradiente) {
  bannerColorSeleccionado = color;
  
  // Actualizar preview
  const bannerPreview = document.getElementById('bannerPreview');
  if (bannerPreview) {
    bannerPreview.style.background = color;
  }
  
  // Marcar como seleccionado
  marcarColorSeleccionado(color);
}

// ========== MARCAR COLOR SELECCIONADO ==========
function marcarColorSeleccionado(color) {
  // Remover clase active de todos
  document.querySelectorAll('.profile-color-option, .profile-gradient-option').forEach(el => {
    el.classList.remove('active');
  });
  
  // Agregar clase active al seleccionado
  const selectedElement = document.querySelector(`[data-color="${color}"], [data-gradient="${color}"]`);
  if (selectedElement) {
    selectedElement.classList.add('active');
  }
}

// ========== ABRIR MODAL DE EDICIÓN ==========
function abrirModalEdicion() {
  const modal = document.getElementById('profileEditModal');
  
  // Prellenar formulario
  document.getElementById('editNombre').value = usuarioActual.nombre || '';
  document.getElementById('editUsername').value = usuarioActual.username || generarUsername(usuarioActual.nombre);
  document.getElementById('editBio').value = usuarioActual.biografia || '';
  document.getElementById('editPerfil').value = usuarioActual.perfil || 'Trabajador';
  document.getElementById('editZona').value = usuarioActual.zona || '';
  document.getElementById('editTelefono').value = usuarioActual.telefono || '';
  document.getElementById('editCorreo').value = usuarioActual.correo || '';
  
  // Actualizar preview del banner
  const bannerPreview = document.getElementById('bannerPreview');
  if (bannerPreview) {
    bannerPreview.style.background = bannerColorSeleccionado;
  }
  
  // Marcar color actual
  marcarColorSeleccionado(bannerColorSeleccionado);
  
  // Actualizar contador de bio
  actualizarContadorBio();
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// ========== CERRAR MODAL DE EDICIÓN ==========
function cerrarModalEdicion() {
  const modal = document.getElementById('profileEditModal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// ========== ACTUALIZAR CONTADOR DE BIO ==========
function actualizarContadorBio() {
  const bioTextarea = document.getElementById('editBio');
  const bioCounter = document.getElementById('bioCounter');
  
  if (bioTextarea && bioCounter) {
    const length = bioTextarea.value.length;
    bioCounter.textContent = `${length} / 150`;
    
    if (length > 150) {
      bioCounter.style.color = '#d32f2f';
    } else {
      bioCounter.style.color = '#8e8e8e';
    }
  }
}

// ========== GUARDAR PERFIL ==========
async function guardarPerfil(e) {
  e.preventDefault();
  
  const btnSave = document.getElementById('btnSaveProfile');
  btnSave.disabled = true;
  btnSave.textContent = 'Guardando...';
  
  try {
    const datosActualizados = {
      nombre: document.getElementById('editNombre').value.trim(),
      biografia: document.getElementById('editBio').value.trim(),
      perfil: document.getElementById('editPerfil').value,
      zona: document.getElementById('editZona').value.trim(),
      telefono: document.getElementById('editTelefono').value.trim(),
      bannerColor: bannerColorSeleccionado
    };
    
    // Actualizar en Firebase
    const success = await auth.actualizarUsuarioEnFirebase(usuarioActual.id, datosActualizados);
    
    if (success) {
      // Actualizar usuario actual
      Object.assign(usuarioActual, datosActualizados);
      auth.guardarSesion(usuarioActual);
      
      // Actualizar banner inmediatamente
      const profileBanner = document.getElementById('profileBanner');
      if (profileBanner) {
        profileBanner.style.background = bannerColorSeleccionado;
      }
      
      // Recargar datos del perfil
      cargarDatosPerfil();
      
      // Cerrar modal
      cerrarModalEdicion();
      
      // Mostrar notificación
      mostrarNotificacion('✅ Perfil actualizado correctamente', 'success');
    } else {
      mostrarNotificacion('❌ Error al actualizar perfil', 'error');
    }
    
  } catch (error) {
    console.error('Error al guardar perfil:', error);
    mostrarNotificacion('❌ Error al actualizar perfil', 'error');
  } finally {
    btnSave.disabled = false;
    btnSave.textContent = 'Guardar';
  }
}

// ========== CAMBIAR FOTO DE PERFIL ==========
async function cambiarFoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validar tamaño (máx 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('La imagen es muy grande. Máximo 2MB.');
    return;
  }
  
  // Validar tipo
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona una imagen válida.');
    return;
  }
  
  try {
    // Convertir a base64
    const reader = new FileReader();
    reader.onload = async function(event) {
      const fotoBase64 = event.target.result;
      
      // Actualizar en Firebase
      const success = await auth.actualizarUsuarioEnFirebase(usuarioActual.id, { foto: fotoBase64 });
      
      if (success) {
        usuarioActual.foto = fotoBase64;
        auth.guardarSesion(usuarioActual);
        
        // Actualizar UI
        document.getElementById('profilePhoto').src = fotoBase64;
        document.getElementById('navAvatar').src = fotoBase64;
        
        mostrarNotificacion('✅ Foto actualizada correctamente', 'success');
      } else {
        mostrarNotificacion('❌ Error al actualizar foto', 'error');
      }
    };
    reader.readAsDataURL(file);
    
  } catch (error) {
    console.error('Error al cambiar foto:', error);
    mostrarNotificacion('❌ Error al actualizar foto', 'error');
  }
}

// ========== COMPARTIR PERFIL ==========
function compartirPerfil() {
  const username = usuarioActual.username || generarUsername(usuarioActual.nombre);
  const url = `${window.location.origin}/public-profile.html?userId=${usuarioActual.id}`;
  
  if (navigator.share) {
    navigator.share({
      title: `Perfil de @${username} - LaburitoYa`,
      text: `Mira el perfil de ${usuarioActual.nombre} en LaburitoYa`,
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
        if (data[id].userId === usuarioActual.id) {
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
      const seguidoresData = await window.followers.obtenerSeguidores(usuarioActual.id);
      const seguidosData = await window.followers.obtenerSeguidos(usuarioActual.id);
      seguidores = seguidoresData.length;
      seguidos = seguidosData.length;
    }
    
    // Actualizar modal
    document.getElementById('statsDetailPosts').textContent = formatearNumero(contadorPosts);
    document.getElementById('statsDetailLikes').textContent = formatearNumero(contadorLikes);
    document.getElementById('statsDetailComments').textContent = formatearNumero(contadorComentarios);
    document.getElementById('statsDetailViews').textContent = formatearNumero(usuarioActual.vistasPerfil || 0);
    document.getElementById('statsDetailFollowers').textContent = formatearNumero(seguidores);
    document.getElementById('statsDetailFollowing').textContent = formatearNumero(seguidos);
    
    // Fecha de registro
    const fechaRegistro = usuarioActual.fechaRegistro || new Date().toISOString();
    document.getElementById('statsDetailMemberSince').textContent = formatearFecha(fechaRegistro);
    
    // Última actividad
    const ultimaActividad = usuarioActual.ultimaActividad || new Date().toISOString();
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

// ========== CONFIGURAR EVENT LISTENERS ==========
function configurarEventListeners() {
  // Botón editar perfil
  const btnEditProfile = document.getElementById('btnEditProfile');
  if (btnEditProfile) {
    btnEditProfile.addEventListener('click', abrirModalEdicion);
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
  
  // Botón compartir perfil
  const btnShareProfile = document.getElementById('btnShareProfile');
  if (btnShareProfile) {
    btnShareProfile.addEventListener('click', compartirPerfil);
  }
  
  // Cerrar modal de edición
  const btnCloseEditModal = document.getElementById('btnCloseEditModal');
  if (btnCloseEditModal) {
    btnCloseEditModal.addEventListener('click', cerrarModalEdicion);
  }
  
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', cerrarModalEdicion);
  }
  
  // Cerrar modal al hacer click fuera
  const profileEditModal = document.getElementById('profileEditModal');
  if (profileEditModal) {
    profileEditModal.addEventListener('click', function(e) {
      if (e.target === this) {
        cerrarModalEdicion();
      }
    });
  }
  
  // Guardar perfil
  const profileEditForm = document.getElementById('profileEditForm');
  if (profileEditForm) {
    profileEditForm.addEventListener('submit', guardarPerfil);
  }
  
  // Contador de bio
  const editBio = document.getElementById('editBio');
  if (editBio) {
    editBio.addEventListener('input', actualizarContadorBio);
  }
  
  // Cambiar foto
  const btnChangePhoto = document.getElementById('btnChangePhoto');
  const photoInput = document.getElementById('photoInput');
  if (btnChangePhoto && photoInput) {
    btnChangePhoto.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', cambiarFoto);
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
  
  // Cerrar modales con ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      cerrarModalEdicion();
      cerrarModalPost();
      cerrarModalEstadisticas();
    }
  });
  
  // Tabs
  const tabs = document.querySelectorAll('.profile-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      const tabType = this.getAttribute('data-tab');
      if (tabType === 'posts') {
        cargarPublicaciones();
      } else if (tabType === 'saved') {
        mostrarGuardados();
      }
    });
  });
  
  // Estadísticas clickeables
  const statSeguidoresBox = document.getElementById('statSeguidoresBox');
  const statSeguidosBox = document.getElementById('statSeguidosBox');
  
  if (statSeguidoresBox) {
    statSeguidoresBox.addEventListener('click', () => {
      // Aquí se puede abrir un modal con la lista de seguidores
      console.log('Ver seguidores');
    });
  }
  
  if (statSeguidosBox) {
    statSeguidosBox.addEventListener('click', () => {
      // Aquí se puede abrir un modal con la lista de seguidos
      console.log('Ver seguidos');
    });
  }
}

// ========== MOSTRAR GUARDADOS ==========
function mostrarGuardados() {
  const gridContainer = document.getElementById('profilePostsGrid');
  gridContainer.innerHTML = `
    <div class="profile-no-posts">
      <div class="profile-no-posts-icon">🔖</div>
      <h3>No hay publicaciones guardadas</h3>
      <p>Guarda publicaciones para verlas más tarde.</p>
    </div>
  `;
}

// Exportar funciones
window.profileInstagram = {
  cargarPublicaciones,
  abrirModalPost,
  cerrarModalPost,
  abrirModalEdicion,
  cerrarModalEdicion,
  compartirPerfil,
  abrirModalEstadisticas,
  cerrarModalEstadisticas,
  seleccionarColorBanner
};

console.log('✅ profile-instagram.js cargado correctamente');
