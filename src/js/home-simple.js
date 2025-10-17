// ========== VERSIÓN SIMPLIFICADA PARA DEBUG ==========
console.log('🚀 home-simple.js cargado');

let usuarioActual = null;

// ========== CARGAR AL INICIO ==========
window.addEventListener('DOMContentLoaded', async function() {
  console.log('📄 DOM cargado');
  
  // Verificar sesión
  const userData = localStorage.getItem('usuarioActual');
  if (!userData) {
    console.error('❌ No hay sesión activa');
    alert('No hay sesión activa. Redirigiendo a login...');
    window.location.href = 'login.html';
    return;
  }
  
  try {
    usuarioActual = JSON.parse(userData);
    console.log('✅ Usuario cargado:', usuarioActual);
  } catch (e) {
    console.error('❌ Error al parsear usuario:', e);
    alert('Error en la sesión. Redirigiendo a login...');
    window.location.href = 'login.html';
    return;
  }
  
  // Inicializar
  console.log('🔧 Inicializando página...');
  actualizarDatosUsuario();
  await cargarPosts();
  configurarEventListeners();
});

// ========== ACTUALIZAR DATOS DEL USUARIO ==========
function actualizarDatosUsuario() {
  console.log('👤 Actualizando datos del usuario...');
  
  // Navbar avatar
  const navAvatar = document.getElementById('navAvatar');
  if (navAvatar) {
    navAvatar.src = usuarioActual.foto || 'https://via.placeholder.com/32';
    navAvatar.onerror = function() {
      console.warn('⚠️ Error cargando avatar navbar, usando placeholder');
      this.src = 'https://via.placeholder.com/32';
    };
  }
  
  // Sidebar
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  if (sidebarAvatar) {
    sidebarAvatar.src = usuarioActual.foto || 'https://via.placeholder.com/70';
    sidebarAvatar.onerror = function() {
      console.warn('⚠️ Error cargando avatar sidebar, usando placeholder');
      this.src = 'https://via.placeholder.com/70';
    };
  }
  
  const sidebarNombre = document.getElementById('sidebarNombre');
  if (sidebarNombre) sidebarNombre.textContent = usuarioActual.nombre;
  
  const sidebarPerfil = document.getElementById('sidebarPerfil');
  if (sidebarPerfil) {
    const perfilTexto = usuarioActual.perfil === 'Trabajador' 
      ? 'Buscando oportunidades laborales' 
      : 'Buscando contratar personal';
    sidebarPerfil.textContent = perfilTexto;
  }
  
  // Avatar del formulario
  const postFormAvatar = document.getElementById('postFormAvatar');
  if (postFormAvatar) {
    postFormAvatar.src = usuarioActual.foto || 'https://via.placeholder.com/48';
    postFormAvatar.onerror = function() {
      console.warn('⚠️ Error cargando avatar formulario, usando placeholder');
      this.src = 'https://via.placeholder.com/48';
    };
  }
  
  console.log('✅ Datos del usuario actualizados');
}

// ========== CARGAR PUBLICACIONES ==========
async function cargarPosts() {
  console.log('📱 Iniciando carga de publicaciones...');
  
  const postList = document.getElementById('postList');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const noPostsMessage = document.getElementById('noPostsMessage');
  
  if (!postList) {
    console.error('❌ No se encontró el elemento postList');
    return;
  }
  
  // Mostrar spinner
  if (loadingSpinner) loadingSpinner.style.display = 'flex';
  if (noPostsMessage) noPostsMessage.style.display = 'none';
  
  try {
    console.log('🔄 Haciendo fetch a Firebase...');
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json");
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📦 Datos recibidos:', data);
    
    // Ocultar spinner
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    
    if (!data || Object.keys(data).length === 0) {
      console.warn('⚠️ No hay publicaciones');
      if (noPostsMessage) {
        noPostsMessage.innerHTML = '<p>📝 No hay publicaciones aún. ¡Sé el primero en publicar!</p>';
        noPostsMessage.style.display = 'block';
      }
      postList.innerHTML = '';
      return;
    }
    
    // Convertir a array y ordenar
    let posts = Object.entries(data).map(([id, post]) => ({
      id,
      ...post
    })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    console.log(`✅ ${posts.length} publicaciones encontradas`);
    
    // Limpiar lista
    postList.innerHTML = '';
    
    // Crear elementos
    posts.forEach((post, index) => {
      console.log(`📝 Creando post ${index + 1}/${posts.length}:`, post.userName);
      const postElement = crearElementoPost(post);
      postList.appendChild(postElement);
    });
    
    console.log('✅ Publicaciones renderizadas');
    
  } catch (error) {
    console.error('❌ Error al cargar publicaciones:', error);
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (noPostsMessage) {
      noPostsMessage.innerHTML = '<p>❌ Error al cargar publicaciones. Por favor recarga la página.</p>';
      noPostsMessage.style.display = 'block';
    }
  }
}

// ========== CREAR ELEMENTO DE POST ==========
function crearElementoPost(post) {
  const div = document.createElement('div');
  div.className = 'post';
  
  const tiempoTranscurrido = calcularTiempoTranscurrido(post.fecha);
  const likeCount = post.likes ? post.likes.length : 0;
  const commentCount = post.comentarios ? post.comentarios.length : 0;
  
  // Asegurar que la foto tenga un valor válido
  const fotoUrl = post.userFoto || 'https://via.placeholder.com/48';
  console.log(`🖼️ Foto del post de ${post.userName}: ${fotoUrl}`);
  
  div.innerHTML = `
    <div class="post-header">
      <img src="${fotoUrl}" 
           alt="${post.userName}" 
           class="post-avatar"
           onerror="console.error('Error cargando imagen:', this.src); this.src='https://via.placeholder.com/48';" />
      <div class="post-info">
        <h4 class="post-username">${post.userName}</h4>
        <p class="post-subtitle">${post.userPerfil || 'Usuario'} • ${tiempoTranscurrido}</p>
      </div>
    </div>
    <div class="post-content">
      <p>${post.contenido}</p>
    </div>
    <div class="post-contact-info">
      <span>📍 ${post.userZona || 'Ubicación no especificada'}</span>
      <span>📞 ${post.userTelefono || 'Teléfono no disponible'}</span>
    </div>
    <div class="post-stats">
      ${likeCount > 0 ? `<span>${likeCount} ${likeCount === 1 ? 'recomendación' : 'recomendaciones'}</span>` : ''}
      ${commentCount > 0 ? `<span>${commentCount} ${commentCount === 1 ? 'comentario' : 'comentarios'}</span>` : ''}
    </div>
    <div class="post-actions">
      <button class="post-action-btn">
        <span>🤍</span>
        <span>Recomendar</span>
      </button>
      <button class="post-action-btn">
        <span>💬</span>
        <span>Comentar</span>
      </button>
      <button class="post-action-btn">
        <span>🔄</span>
        <span>Compartir</span>
      </button>
      <button class="post-action-btn">
        <span>📤</span>
        <span>Contactar</span>
      </button>
    </div>
  `;
  
  return div;
}

// ========== CONFIGURAR EVENT LISTENERS ==========
function configurarEventListeners() {
  console.log('🎯 Configurando event listeners...');
  
  const postForm = document.getElementById('postForm');
  if (postForm) {
    postForm.addEventListener('submit', crearPublicacion);
    console.log('✅ Listener del formulario configurado');
  }
  
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        localStorage.removeItem('usuarioActual');
        window.location.href = '../../index.html';
      }
    });
    console.log('✅ Listener de cerrar sesión configurado');
  }
}

// ========== CREAR PUBLICACIÓN ==========
async function crearPublicacion(e) {
  e.preventDefault();
  console.log('📝 Creando publicación...');
  
  const contenido = document.getElementById('contenido').value.trim();
  
  if (!contenido) {
    alert('Por favor escribe algo antes de publicar.');
    return;
  }
  
  const data = {
    contenido,
    fecha: new Date().toISOString(),
    userId: usuarioActual.id,
    userName: usuarioActual.nombre,
    userFoto: usuarioActual.foto || 'https://via.placeholder.com/48',
    userPerfil: usuarioActual.perfil,
    userTelefono: usuarioActual.telefono,
    userZona: usuarioActual.zona,
    hashtags: [],
    likes: [],
    comentarios: []
  };
  
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json", {
      method: "POST",
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      console.log('✅ Publicación creada');
      document.getElementById('contenido').value = '';
      await cargarPosts();
      alert('✅ Publicación creada exitosamente');
    }
  } catch (err) {
    console.error("❌ Error al publicar:", err);
    alert('❌ Error al crear la publicación');
  }
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
  
  if (dias > 0) return `${dias}d`;
  if (horas > 0) return `${horas}h`;
  if (minutos > 0) return `${minutos}m`;
  return 'Ahora';
}

console.log('✅ home-simple.js completamente cargado');
