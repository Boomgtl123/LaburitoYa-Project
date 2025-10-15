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

  // Mostrar panel de administración si es CEO
  if (auth.esCEO(usuarioActual)) {
    mostrarPanelAdministracion();
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

  // Mostrar badge de verificación o CEO junto al nombre
  if (profileName) {
    profileName.innerHTML = auth.renderNombreConBadge(usuarioActual.nombre, usuarioActual);
  }

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
      <h4 class="follower-name">${auth.renderNombreConBadge(nombre, usuario)}</h4>
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

// ========== PANEL DE ADMINISTRACIÓN (SOLO CEO) ==========
async function mostrarPanelAdministracion() {
  // Crear el panel de administración
  const adminPanel = document.createElement('div');
  adminPanel.id = 'adminPanel';
  adminPanel.style.cssText = `
    margin-top: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #dee2e6;
  `;

  adminPanel.innerHTML = `
    <h3 style="color: #dc3545; margin-bottom: 20px;">🎯 Panel de Administración CEO</h3>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px;">
      <button id="btnVerUsuarios" style="padding: 12px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
        👥 Ver Todos los Usuarios
      </button>
      <button id="btnVerificarUsuario" style="padding: 12px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
        ✅ Verificar Usuario
      </button>
      <button id="btnBloquearUsuario" style="padding: 12px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
        🚫 Bloquear Usuario
      </button>
    </div>

    <div id="adminContent" style="display: none; margin-top: 20px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #dee2e6;">
      <!-- Contenido dinámico aquí -->
    </div>
  `;

  // Insertar el panel después del contenedor principal
  const mainContainer = document.querySelector('.profile-container') || document.body;
  mainContainer.appendChild(adminPanel);

  // Event listeners para los botones
  document.getElementById('btnVerUsuarios').addEventListener('click', mostrarListaUsuarios);
  document.getElementById('btnVerificarUsuario').addEventListener('click', mostrarFormularioVerificar);
  document.getElementById('btnBloquearUsuario').addEventListener('click', mostrarFormularioBloquear);
}

// ========== MOSTRAR LISTA DE USUARIOS ==========
async function mostrarListaUsuarios() {
  const adminContent = document.getElementById('adminContent');
  if (!adminContent) return;

  adminContent.style.display = 'block';
  adminContent.innerHTML = '<div style="text-align: center;">Cargando usuarios...</div>';

  try {
    const usuarios = await auth.obtenerTodosLosUsuarios();

    if (usuarios.length === 0) {
      adminContent.innerHTML = '<p>No hay usuarios registrados.</p>';
      return;
    }

    let html = '<h4 style="margin-bottom: 15px;">Lista de Todos los Usuarios</h4>';
    html += '<div style="max-height: 400px; overflow-y: auto;">';

    usuarios.forEach(usuario => {
      const esVerificado = auth.estaVerificado(usuario);
      const estaBloqueado = auth.estaBloqueado(usuario.id);

      html += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${usuario.foto || 'https://via.placeholder.com/32'}" style="width: 32px; height: 32px; border-radius: 50%;" />
            <div>
              <strong>${usuario.nombre}</strong>${esVerificado ? ' <span style="color: #1DA1F2;">✓</span>' : ''}
              <br><small style="color: #666;">${usuario.correo}</small>
            </div>
          </div>
          <div style="display: flex; gap: 5px;">
            ${estaBloqueado ? '<span style="color: #dc3545; font-weight: bold;">BLOQUEADO</span>' : ''}
            ${esVerificado ? '<span style="color: #28a745;">Verificado</span>' : '<button onclick="verificarUsuarioDesdeLista(\'' + usuario.id + '\')" style="padding: 4px 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Verificar</button>'}
            ${estaBloqueado ?
              '<button onclick="desbloquearUsuarioDesdeLista(\'' + usuario.id + '\')" style="padding: 4px 8px; background: #ffc107; color: black; border: none; border-radius: 4px; cursor: pointer;">Desbloquear</button>' :
              '<button onclick="bloquearUsuarioDesdeLista(\'' + usuario.id + '\')" style="padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Bloquear</button>'
            }
          </div>
        </div>
      `;
    });

    html += '</div>';
    adminContent.innerHTML = html;

  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    adminContent.innerHTML = '<p>Error al cargar la lista de usuarios.</p>';
  }
}

// ========== MOSTRAR FORMULARIO PARA VERIFICAR USUARIO ==========
function mostrarFormularioVerificar() {
  const adminContent = document.getElementById('adminContent');
  if (!adminContent) return;

  adminContent.style.display = 'block';
  adminContent.innerHTML = `
    <h4>Verificar Usuario</h4>
    <p>Ingresa el correo electrónico del usuario que deseas verificar:</p>
    <input type="email" id="correoVerificar" placeholder="usuario@email.com" style="width: 100%; padding: 8px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px;" />
    <button onclick="verificarUsuarioPorCorreo()" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Verificar Usuario</button>
  `;
}

// ========== MOSTRAR FORMULARIO PARA BLOQUEAR USUARIO ==========
function mostrarFormularioBloquear() {
  const adminContent = document.getElementById('adminContent');
  if (!adminContent) return;

  adminContent.style.display = 'block';
  adminContent.innerHTML = `
    <h4>Bloquear/Desbloquear Usuario</h4>
    <p>Ingresa el correo electrónico del usuario:</p>
    <input type="email" id="correoBloquear" placeholder="usuario@email.com" style="width: 100%; padding: 8px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px;" />
    <div style="display: flex; gap: 10px;">
      <button onclick="bloquearUsuarioPorCorreo()" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Bloquear</button>
      <button onclick="desbloquearUsuarioPorCorreo()" style="padding: 8px 16px; background: #ffc107; color: black; border: none; border-radius: 4px; cursor: pointer;">Desbloquear</button>
    </div>
  `;
}

// ========== FUNCIONES PARA ACCIONES DESDE LA LISTA ==========
async function verificarUsuarioDesdeLista(userId) {
  if (await auth.verificarUsuario(userId)) {
    mostrarNotificacion('✅ Usuario verificado exitosamente', 'success');
    mostrarListaUsuarios(); // Recargar lista
  } else {
    mostrarNotificacion('❌ Error al verificar usuario', 'error');
  }
}

async function bloquearUsuarioDesdeLista(userId) {
  if (auth.bloquearUsuario(userId)) {
    mostrarNotificacion('✅ Usuario bloqueado', 'success');
    mostrarListaUsuarios(); // Recargar lista
  } else {
    mostrarNotificacion('❌ Error al bloquear usuario', 'error');
  }
}

async function desbloquearUsuarioDesdeLista(userId) {
  if (auth.desbloquearUsuario(userId)) {
    mostrarNotificacion('✅ Usuario desbloqueado', 'success');
    mostrarListaUsuarios(); // Recargar lista
  } else {
    mostrarNotificacion('❌ Error al desbloquear usuario', 'error');
  }
}

// ========== FUNCIONES PARA ACCIONES POR CORREO ==========
async function verificarUsuarioPorCorreo() {
  const correo = document.getElementById('correoVerificar').value.trim();
  if (!correo) {
    mostrarNotificacion('❌ Ingresa un correo electrónico', 'error');
    return;
  }

  try {
    const usuario = await auth.obtenerUsuarioPorCorreo(correo);
    if (!usuario) {
      mostrarNotificacion('❌ Usuario no encontrado', 'error');
      return;
    }

    if (await auth.verificarUsuario(usuario.id)) {
      mostrarNotificacion('✅ Usuario verificado exitosamente', 'success');
      document.getElementById('correoVerificar').value = '';
    } else {
      mostrarNotificacion('❌ Error al verificar usuario', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('❌ Error al procesar la solicitud', 'error');
  }
}

async function bloquearUsuarioPorCorreo() {
  const correo = document.getElementById('correoBloquear').value.trim();
  if (!correo) {
    mostrarNotificacion('❌ Ingresa un correo electrónico', 'error');
    return;
  }

  try {
    const usuario = await auth.obtenerUsuarioPorCorreo(correo);
    if (!usuario) {
      mostrarNotificacion('❌ Usuario no encontrado', 'error');
      return;
    }

    if (auth.bloquearUsuario(usuario.id)) {
      mostrarNotificacion('✅ Usuario bloqueado', 'success');
      document.getElementById('correoBloquear').value = '';
    } else {
      mostrarNotificacion('❌ Error al bloquear usuario', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('❌ Error al procesar la solicitud', 'error');
  }
}

async function desbloquearUsuarioPorCorreo() {
  const correo = document.getElementById('correoBloquear').value.trim();
  if (!correo) {
    mostrarNotificacion('❌ Ingresa un correo electrónico', 'error');
    return;
  }

  try {
    const usuario = await auth.obtenerUsuarioPorCorreo(correo);
    if (!usuario) {
      mostrarNotificacion('❌ Usuario no encontrado', 'error');
      return;
    }

    if (auth.desbloquearUsuario(usuario.id)) {
      mostrarNotificacion('✅ Usuario desbloqueado', 'success');
      document.getElementById('correoBloquear').value = '';
    } else {
      mostrarNotificacion('❌ Error al desbloquear usuario', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('❌ Error al procesar la solicitud', 'error');
  }
}
