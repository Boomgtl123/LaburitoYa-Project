// ========== VARIABLES GLOBALES ==========
let usuarioActual = null;
let modoEdicion = false;

// ========== PROTEGER PÁGINA Y CARGAR USUARIO ==========
window.addEventListener('DOMContentLoaded', function() {
  // Verificar sesión
  if (!auth.protegerPagina()) {
    return;
  }
  
  // Obtener usuario actual
  usuarioActual = auth.obtenerUsuarioActual();
  
  if (usuarioActual) {
    inicializarPagina();
  }
});

// ========== INICIALIZAR PÁGINA ==========
function inicializarPagina() {
  // Cargar datos del usuario
  cargarDatosUsuario();
  
  // Cargar estadísticas
  cargarEstadisticas();
  
  // Cargar contadores de seguidores
  if (window.followers) {
    cargarContadoresSeguidores();
  }
  
  // Event listeners
  configurarEventListeners();
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
  
  // Event listeners para seguidores
  const statSeguidoresBox = document.getElementById('statSeguidoresBox');
  const statSeguidosBox = document.getElementById('statSeguidosBox');
  const btnCloseFollowers = document.getElementById('btnCloseFollowers');
  const tabSeguidores = document.getElementById('tabSeguidores');
  const tabSeguidos = document.getElementById('tabSeguidos');
  
  if (statSeguidoresBox) {
    statSeguidoresBox.addEventListener('click', () => mostrarSeguidores('seguidores'));
  }
  
  if (statSeguidosBox) {
    statSeguidosBox.addEventListener('click', () => mostrarSeguidores('seguidos'));
  }
  
  if (btnCloseFollowers) {
    btnCloseFollowers.addEventListener('click', cerrarSeguidores);
  }
  
  if (tabSeguidores) {
    tabSeguidores.addEventListener('click', () => cambiarTab('seguidores'));
  }
  
  if (tabSeguidos) {
    tabSeguidos.addEventListener('click', () => cambiarTab('seguidos'));
  }
  
  // Botón toggle edición
  const btnToggleEdit = document.getElementById('btnToggleEdit');
  if (btnToggleEdit) {
    btnToggleEdit.addEventListener('click', toggleModoEdicion);
  }
  
  // Botón cancelar
  const btnCancel = document.getElementById('btnCancel');
  if (btnCancel) {
    btnCancel.addEventListener('click', function() {
      toggleModoEdicion();
      cargarDatosUsuario(); // Recargar datos originales
    });
  }
  
  // Formulario de perfil
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', guardarCambios);
  }
  
  // Botón cambiar foto
  const btnChangePhoto = document.getElementById('btnChangePhoto');
  const photoInput = document.getElementById('photoInput');
  
  if (btnChangePhoto && photoInput) {
    btnChangePhoto.addEventListener('click', function() {
      photoInput.click();
    });
    
    photoInput.addEventListener('change', cambiarFoto);
  }
  
  // Dropdown de perfil
  const navPerfil = document.getElementById('navPerfil');
  if (navPerfil) {
    navPerfil.addEventListener('click', function(e) {
      if (!e.target.closest('.dropdown-menu')) {
        this.classList.toggle('active');
      }
    });
  }
  
  // Cerrar dropdown al hacer click fuera
  document.addEventListener('click', function(e) {
    const navPerfil = document.getElementById('navPerfil');
    if (navPerfil && !navPerfil.contains(e.target)) {
      navPerfil.classList.remove('active');
    }
  });
}

// ========== CARGAR DATOS DEL USUARIO ==========
function cargarDatosUsuario() {
  // Navbar avatar
  const navAvatar = document.getElementById('navAvatar');
  if (navAvatar) {
    navAvatar.src = usuarioActual.foto || 'https://via.placeholder.com/32';
  }
  
  // Foto de perfil grande
  const profilePhoto = document.getElementById('profilePhoto');
  if (profilePhoto) {
    profilePhoto.src = usuarioActual.foto || 'https://via.placeholder.com/150';
  }
  
  // Información del header
  const profileName = document.getElementById('profileName');
  const profileType = document.getElementById('profileType');
  const profileLocation = document.getElementById('profileLocation');
  const profileContact = document.getElementById('profileContact');
  
  if (profileName) profileName.textContent = usuarioActual.nombre;
  if (profileType) {
    const tipoTexto = usuarioActual.perfil === 'Trabajador' ? 'Buscando oportunidades laborales' : 'Buscando contratar personal';
    profileType.textContent = tipoTexto;
  }
  if (profileLocation) profileLocation.textContent = `📍 ${usuarioActual.zona}`;
  if (profileContact) profileContact.textContent = `📞 ${usuarioActual.telefono}`;
  
  // Vista de solo lectura
  const viewNombre = document.getElementById('viewNombre');
  const viewUsername = document.getElementById('viewUsername');
  const viewPerfil = document.getElementById('viewPerfil');
  const viewTelefono = document.getElementById('viewTelefono');
  const viewZona = document.getElementById('viewZona');
  const viewBiografia = document.getElementById('viewBiografia');
  const viewCorreo = document.getElementById('viewCorreo');
  const viewFecha = document.getElementById('viewFecha');
  
  if (viewNombre) viewNombre.textContent = usuarioActual.nombre;
  if (viewUsername) viewUsername.textContent = usuarioActual.username ? `@${usuarioActual.username}` : 'No asignado';
  if (viewPerfil) viewPerfil.textContent = usuarioActual.perfil === 'Trabajador' ? 'Busco trabajo' : 'Busco contratar';
  if (viewTelefono) viewTelefono.textContent = usuarioActual.telefono;
  if (viewZona) viewZona.textContent = usuarioActual.zona;
  if (viewBiografia) viewBiografia.textContent = usuarioActual.biografia || 'Sin biografía';
  if (viewCorreo) viewCorreo.textContent = usuarioActual.correo;
  if (viewFecha) {
    const fecha = new Date(usuarioActual.fecha);
    viewFecha.textContent = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  
  // Redes sociales - Vista
  const redesSociales = usuarioActual.redesSociales || {};
  
  mostrarRedSocial('Instagram', redesSociales.instagram);
  mostrarRedSocial('Twitter', redesSociales.twitter);
  mostrarRedSocial('Threads', redesSociales.threads);
  mostrarRedSocial('Facebook', redesSociales.facebook);
  mostrarRedSocial('Tiktok', redesSociales.tiktok);
  
  // Campos del formulario
  const editNombre = document.getElementById('editNombre');
  const editPerfil = document.getElementById('editPerfil');
  const editTelefono = document.getElementById('editTelefono');
  const editZona = document.getElementById('editZona');
  const editBiografia = document.getElementById('editBiografia');
  const editCorreo = document.getElementById('editCorreo');
  const editUsername = document.getElementById('editUsername');
  
  if (editNombre) editNombre.value = usuarioActual.nombre;
  if (editPerfil) editPerfil.value = usuarioActual.perfil;
  if (editTelefono) editTelefono.value = usuarioActual.telefono;
  if (editZona) editZona.value = usuarioActual.zona;
  if (editBiografia) editBiografia.value = usuarioActual.biografia || '';
  if (editCorreo) editCorreo.value = usuarioActual.correo;
  if (editUsername) editUsername.value = usuarioActual.username || '';
  
  // Redes sociales - Formulario
  const editInstagram = document.getElementById('editInstagram');
  const editTwitter = document.getElementById('editTwitter');
  const editThreads = document.getElementById('editThreads');
  const editFacebook = document.getElementById('editFacebook');
  const editTiktok = document.getElementById('editTiktok');
  
  if (editInstagram) editInstagram.value = redesSociales.instagram || '';
  if (editTwitter) editTwitter.value = redesSociales.twitter || '';
  if (editThreads) editThreads.value = redesSociales.threads || '';
  if (editFacebook) editFacebook.value = redesSociales.facebook || '';
  if (editTiktok) editTiktok.value = redesSociales.tiktok || '';
}

// ========== MOSTRAR RED SOCIAL ==========
function mostrarRedSocial(nombre, url) {
  const container = document.getElementById(`view${nombre}Container`);
  const link = document.getElementById(`view${nombre}`);
  
  if (container && link) {
    if (url && url.trim() !== '') {
      link.href = url;
      link.textContent = url;
      container.style.display = 'flex';
    } else {
      container.style.display = 'none';
    }
  }
}

// ========== TOGGLE MODO EDICIÓN ==========
function toggleModoEdicion() {
  modoEdicion = !modoEdicion;
  
  const profileForm = document.getElementById('profileForm');
  const profileView = document.getElementById('profileView');
  const btnToggleEdit = document.getElementById('btnToggleEdit');
  
  if (modoEdicion) {
    if (profileForm) profileForm.style.display = 'flex';
    if (profileView) profileView.style.display = 'none';
    if (btnToggleEdit) btnToggleEdit.textContent = '❌ Cancelar';
  } else {
    if (profileForm) profileForm.style.display = 'none';
    if (profileView) profileView.style.display = 'flex';
    if (btnToggleEdit) btnToggleEdit.textContent = '✏️ Editar';
    
    // Limpiar mensaje
    const mensajePerfil = document.getElementById('mensajePerfil');
    if (mensajePerfil) {
      mensajePerfil.textContent = '';
      mensajePerfil.className = 'mensaje-perfil';
    }
  }
}

// ========== GUARDAR CAMBIOS ==========
async function guardarCambios(e) {
  e.preventDefault();
  
  const mensajePerfil = document.getElementById('mensajePerfil');
  
  // Obtener valores del formulario
  const nombre = document.getElementById('editNombre').value.trim();
  const perfil = document.getElementById('editPerfil').value;
  const telefono = document.getElementById('editTelefono').value.trim();
  const zona = document.getElementById('editZona').value.trim();
  const biografia = document.getElementById('editBiografia').value.trim();
  
  // Redes sociales
  const instagram = document.getElementById('editInstagram').value.trim();
  const twitter = document.getElementById('editTwitter').value.trim();
  const threads = document.getElementById('editThreads').value.trim();
  const facebook = document.getElementById('editFacebook').value.trim();
  const tiktok = document.getElementById('editTiktok').value.trim();
  
  if (!nombre || !perfil || !telefono || !zona) {
    if (mensajePerfil) {
      mensajePerfil.textContent = '❌ Por favor completa todos los campos obligatorios.';
      mensajePerfil.className = 'mensaje-perfil error';
    }
    return;
  }
  
  // Mostrar loading
  if (mensajePerfil) {
    mensajePerfil.textContent = 'Guardando cambios...';
    mensajePerfil.className = 'mensaje-perfil';
  }
  
  const datosActualizados = {
    nombre,
    perfil,
    telefono,
    zona,
    biografia,
    redesSociales: {
      instagram,
      twitter,
      threads,
      facebook,
      tiktok
    }
  };
  
  try {
    // Actualizar en Firebase
    const success = await auth.actualizarUsuarioEnFirebase(usuarioActual.id, datosActualizados);
    
    if (success) {
      // Actualizar usuario actual
      usuarioActual = { ...usuarioActual, ...datosActualizados };
      
      // Recargar datos en la interfaz
      cargarDatosUsuario();
      
      // Salir del modo edición
      toggleModoEdicion();
      
      // Mostrar mensaje de éxito
      mostrarNotificacion('✅ Perfil actualizado exitosamente', 'success');
      
    } else {
      if (mensajePerfil) {
        mensajePerfil.textContent = '❌ Error al guardar los cambios.';
        mensajePerfil.className = 'mensaje-perfil error';
      }
    }
  } catch (error) {
    console.error('Error al guardar cambios:', error);
    if (mensajePerfil) {
      mensajePerfil.textContent = '❌ Error de conexión.';
      mensajePerfil.className = 'mensaje-perfil error';
    }
  }
}

// ========== CAMBIAR FOTO ==========
function cambiarFoto(e) {
  const file = e.target.files[0];
  
  if (!file) return;
  
  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona una imagen válida.');
    return;
  }
  
  // Validar tamaño (máximo 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('La imagen es muy grande. Por favor selecciona una imagen menor a 2MB.');
    return;
  }
  
  // Leer archivo y convertir a base64
  const reader = new FileReader();
  
  reader.onload = async function(event) {
    const fotoBase64 = event.target.result;
    
    try {
      // Actualizar foto en Firebase
      const success = await auth.actualizarUsuarioEnFirebase(usuarioActual.id, { foto: fotoBase64 });
      
      if (success) {
        // Actualizar usuario actual
        usuarioActual.foto = fotoBase64;
        
        // Actualizar foto en la interfaz
        const profilePhoto = document.getElementById('profilePhoto');
        const navAvatar = document.getElementById('navAvatar');
        
        if (profilePhoto) profilePhoto.src = fotoBase64;
        if (navAvatar) navAvatar.src = fotoBase64;
        
        mostrarNotificacion('✅ Foto actualizada exitosamente', 'success');
      } else {
        alert('Error al actualizar la foto. Por favor intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error al cambiar foto:', error);
      alert('Error al actualizar la foto. Por favor intenta de nuevo.');
    }
  };
  
  reader.onerror = function() {
    alert('Error al leer la imagen. Por favor intenta de nuevo.');
  };
  
  reader.readAsDataURL(file);
}

// ========== CARGAR ESTADÍSTICAS ==========
async function cargarEstadisticas() {
  try {
    // Obtener todas las publicaciones
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json");
    const data = await response.json();
    
    let contadorPosts = 0;
    let contadorLikes = 0;
    
    if (data) {
      for (const id in data) {
        const post = data[id];
        
        // Contar publicaciones del usuario
        if (post.userId === usuarioActual.id) {
          contadorPosts++;
          
          // Contar likes en las publicaciones del usuario
          if (post.likes && Array.isArray(post.likes)) {
            contadorLikes += post.likes.length;
          }
        }
      }
    }
    
    // Actualizar estadísticas en la interfaz
    const statPosts = document.getElementById('statPosts');
    const statLikes = document.getElementById('statLikes');
    
    if (statPosts) statPosts.textContent = contadorPosts;
    if (statLikes) statLikes.textContent = contadorLikes;
    
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
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

// ========== CARGAR CONTADORES DE SEGUIDORES ==========
async function cargarContadoresSeguidores() {
  try {
    const contadores = await window.followers.obtenerContadores(usuarioActual.id);
    
    const statSeguidores = document.getElementById('statSeguidores');
    const statSeguidos = document.getElementById('statSeguidos');
    
    if (statSeguidores) statSeguidores.textContent = contadores.seguidores;
    if (statSeguidos) statSeguidos.textContent = contadores.seguidos;
    
  } catch (error) {
    console.error('Error al cargar contadores de seguidores:', error);
  }
}

// ========== MOSTRAR SEGUIDORES/SEGUIDOS ==========
async function mostrarSeguidores(tipo) {
  const followersCard = document.getElementById('followersCard');
  const followersTitle = document.getElementById('followersTitle');
  const followersList = document.getElementById('followersList');
  const tabSeguidores = document.getElementById('tabSeguidores');
  const tabSeguidos = document.getElementById('tabSeguidos');
  
  if (!followersCard || !followersList) return;
  
  // Mostrar card
  followersCard.style.display = 'block';
  
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
  
  // Mostrar loading
  followersList.innerHTML = '<div class="loading-followers">Cargando...</div>';
  
  try {
    let userIds;
    if (tipo === 'seguidores') {
      userIds = await window.followers.obtenerSeguidores(usuarioActual.id);
    } else {
      userIds = await window.followers.obtenerSeguidos(usuarioActual.id);
    }
    
    if (userIds.length === 0) {
      followersList.innerHTML = `<div class="no-followers">No tienes ${tipo === 'seguidores' ? 'seguidores' : 'usuarios seguidos'} aún</div>`;
      return;
    }
    
    // Obtener datos de los usuarios
    const usuarios = await window.followers.obtenerDatosUsuarios(userIds);
    
    // Renderizar lista
    followersList.innerHTML = '';
    usuarios.forEach(usuario => {
      const userItem = crearItemUsuario(usuario);
      followersList.appendChild(userItem);
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
  
  const avatar = usuario.foto || 'https://via.placeholder.com/50';
  const nombre = usuario.nombre || 'Usuario';
  const perfil = usuario.perfil === 'Trabajador' ? 'Busco trabajo' : 'Busco contratar';
  const zona = usuario.zona || 'Sin ubicación';
  
  div.innerHTML = `
    <img src="${avatar}" alt="${nombre}" class="follower-avatar" onerror="this.src='https://via.placeholder.com/50'" />
    <div class="follower-info">
      <h4 class="follower-name">${nombre}</h4>
      <p class="follower-details">${perfil} • ${zona}</p>
    </div>
    <a href="messages.html?user=${usuario.id}" class="btn-message-follower">
      💬 Mensaje
    </a>
  `;
  
  return div;
}

// ========== CAMBIAR TAB ==========
async function cambiarTab(tipo) {
  await mostrarSeguidores(tipo);
}

// ========== CERRAR SEGUIDORES ==========
function cerrarSeguidores() {
  const followersCard = document.getElementById('followersCard');
  if (followersCard) {
    followersCard.style.display = 'none';
  }
}
