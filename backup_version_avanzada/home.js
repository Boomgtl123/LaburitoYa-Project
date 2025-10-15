// ========== VARIABLES GLOBALES ==========
let postsVisibles = 10;
const POSTS_POR_PAGINA = 10;
let todosLosPosts = [];
let usuarioActual = null;

// ========== PROTEGER PÁGINA Y CARGAR USUARIO ==========
window.addEventListener('DOMContentLoaded', function() {
  if (!auth.protegerPagina()) {
    return;
  }
  
  usuarioActual = auth.obtenerUsuarioActual();
  
  if (usuarioActual) {
    inicializarPagina();
  }
});

// ========== INICIALIZAR PÁGINA ==========
function inicializarPagina() {
  actualizarDatosUsuario();
  cargarPosts();
  
  if (window.hashtags) {
    window.hashtags.inicializarHashtags();
  }
  
  // Inicializar notificaciones
  if (window.notifications) {
    window.notifications.inicializarNotificaciones();
  }
  
  // Inicializar búsqueda
  if (window.search) {
    window.search.inicializarBusqueda();
  }
  
  // Inicializar sistema de archivos
  if (window.fileUpload) {
    window.fileUpload.inicializarFileUpload();
  }
  
  configurarEventListeners();
}

// ========== ACTUALIZAR DATOS DEL USUARIO EN LA INTERFAZ ==========
function actualizarDatosUsuario() {
  const navAvatar = document.getElementById('navAvatar');
  if (navAvatar) {
    navAvatar.src = usuarioActual.foto || 'https://via.placeholder.com/32';
  }
  
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const sidebarNombre = document.getElementById('sidebarNombre');
  const sidebarPerfil = document.getElementById('sidebarPerfil');
  const sidebarBio = document.getElementById('sidebarBio');
  
  if (sidebarAvatar) sidebarAvatar.src = usuarioActual.foto || 'https://via.placeholder.com/70';
  if (sidebarNombre) sidebarNombre.textContent = usuarioActual.nombre;
  if (sidebarPerfil) {
    const perfilTexto = usuarioActual.perfil === 'Trabajador' ? 'Buscando oportunidades laborales' : 'Buscando contratar personal';
    sidebarPerfil.textContent = perfilTexto;
  }
  if (sidebarBio && usuarioActual.biografia) {
    sidebarBio.textContent = usuarioActual.biografia;
    sidebarBio.style.display = 'block';
  }
  
  const postFormAvatar = document.getElementById('postFormAvatar');
  if (postFormAvatar) {
    postFormAvatar.src = usuarioActual.foto || 'https://via.placeholder.com/48';
  }
  
  actualizarEstadisticas();
}

// ========== ACTUALIZAR ESTADÍSTICAS ==========
async function actualizarEstadisticas() {
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json");
    const data = await response.json();
    
    let contadorPosts = 0;
    if (data) {
      for (const id in data) {
        if (data[id].userId === usuarioActual.id) {
          contadorPosts++;
        }
      }
    }
    
    const statPublicaciones = document.getElementById('statPublicaciones');
    if (statPublicaciones) {
      statPublicaciones.textContent = contadorPosts;
    }
    
    const statVistas = document.getElementById('statVistas');
    if (statVistas) {
      const vistas = Math.floor(Math.random() * 100) + contadorPosts * 5;
      statVistas.textContent = vistas;
    }
  } catch (error) {
    console.error('Error al actualizar estadísticas:', error);
  }
}

// ========== CONFIGURAR EVENT LISTENERS ==========
function configurarEventListeners() {
  const postForm = document.getElementById('postForm');
  if (postForm) {
    postForm.addEventListener('submit', crearPublicacion);
  }
  
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        // Detener notificaciones
        if (window.notifications) {
          window.notifications.detenerNotificaciones();
        }
        auth.cerrarSesion();
      }
    });
  }
  
  const btnLoadMore = document.getElementById('btnLoadMore');
  if (btnLoadMore) {
    btnLoadMore.addEventListener('click', cargarMasPosts);
  }
  
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

// ========== CREAR PUBLICACIÓN ==========
async function crearPublicacion(e) {
  e.preventDefault();
  
  const contenido = document.getElementById('contenido').value.trim();
  
  if (!contenido) {
    alert('Por favor escribe algo antes de publicar.');
    return;
  }
  
  const hashtags = window.hashtags ? window.hashtags.extraerHashtags(contenido) : [];
  
  const data = {
    contenido,
    fecha: new Date().toISOString(),
    userId: usuarioActual.id,
    userName: usuarioActual.nombre,
    userFoto: usuarioActual.foto || 'https://via.placeholder.com/48',
    userPerfil: usuarioActual.perfil,
    userTelefono: usuarioActual.telefono,
    userZona: usuarioActual.zona,
    hashtags: hashtags,
    likes: [],
    comentarios: []
  };
  
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json", {
      method: "POST",
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      document.getElementById('contenido').value = '';
      
      const hashtagSuggestions = document.getElementById('hashtagSuggestions');
      if (hashtagSuggestions) {
        hashtagSuggestions.style.display = 'none';
      }
      
      postsVisibles = 10;
      await cargarPosts();
      
      if (window.hashtags) {
        window.hashtags.actualizarTendencias();
      }
      
      actualizarEstadisticas();
      mostrarNotificacion('✅ Publicación creada exitosamente', 'success');
    }
  } catch (err) {
    console.error("Error al publicar:", err);
    mostrarNotificacion('❌ Error al crear la publicación', 'error');
  }
}

// ========== CARGAR PUBLICACIONES ==========
async function cargarPosts() {
  const postList = document.getElementById('postList');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const noPostsMessage = document.getElementById('noPostsMessage');
  const loadMoreContainer = document.getElementById('loadMoreContainer');
  
  if (!postList) return;
  
  if (loadingSpinner) loadingSpinner.style.display = 'flex';
  if (noPostsMessage) noPostsMessage.style.display = 'none';
  if (loadMoreContainer) loadMoreContainer.style.display = 'none';
  
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json");
    const data = await response.json();
    
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    
    if (!data || Object.keys(data).length === 0) {
      if (noPostsMessage) noPostsMessage.style.display = 'block';
      postList.innerHTML = '';
      return;
    }
    
    let posts = Object.entries(data).map(([id, post]) => ({
      id,
      ...post
    })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    if (window.hashtagFiltroActivo) {
      posts = posts.filter(post => {
        if (post.hashtags && Array.isArray(post.hashtags)) {
          return post.hashtags.some(tag => tag.toLowerCase() === window.hashtagFiltroActivo.toLowerCase());
        }
        return false;
      });
    }
    
    todosLosPosts = posts;
    
    if (posts.length === 0) {
      if (noPostsMessage) {
        noPostsMessage.innerHTML = '<p>📝 No hay publicaciones con este hashtag.</p>';
        noPostsMessage.style.display = 'block';
      }
      postList.innerHTML = '';
      return;
    }
    
    const postsAMostrar = posts.slice(0, postsVisibles);
    
    postList.innerHTML = '';
    
    postsAMostrar.forEach(post => {
      const postElement = crearElementoPost(post);
      postList.appendChild(postElement);
    });
    
    if (window.hashtags) {
      window.hashtags.agregarEventListenersHashtags();
    }
    
    if (loadMoreContainer) {
      if (posts.length > postsVisibles) {
        loadMoreContainer.style.display = 'block';
        const btnLoadMore = document.getElementById('btnLoadMore');
        if (btnLoadMore) {
          btnLoadMore.textContent = `Ver más publicaciones (${posts.length - postsVisibles} restantes)`;
        }
      } else {
        loadMoreContainer.style.display = 'none';
      }
    }
    
  } catch (err) {
    console.error("Error al cargar publicaciones:", err);
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (noPostsMessage) {
      noPostsMessage.innerHTML = '<p>❌ Error al cargar publicaciones. Por favor recarga la página.</p>';
      noPostsMessage.style.display = 'block';
    }
  }
}

// ========== CARGAR MÁS POSTS ==========
function cargarMasPosts() {
  postsVisibles += POSTS_POR_PAGINA;
  cargarPosts();
}

// ========== CREAR ELEMENTO DE POST ==========
function crearElementoPost(post) {
  const div = document.createElement('div');
  div.className = 'post';
  div.setAttribute('data-post-id', post.id);
  
  const tiempoTranscurrido = calcularTiempoTranscurrido(post.fecha);
  
  let contenidoConHashtags = post.contenido;
  if (window.hashtags) {
    contenidoConHashtags = window.hashtags.convertirHashtagsEnLinks(post.contenido);
  }
  
  const usuarioLike = post.likes && post.likes.includes(usuarioActual.id);
  const likeClass = usuarioLike ? 'liked' : '';
  const likeIcon = usuarioLike ? '❤️' : '🤍';
  const likeCount = post.likes ? post.likes.length : 0;
  const commentCount = post.comentarios ? post.comentarios.length : 0;
  
  div.innerHTML = `
    <div class="post-header">
      <img src="${post.userFoto || 'https://via.placeholder.com/48'}" alt="${post.userName}" class="post-avatar" />
      <div class="post-info">
        <h4 class="post-username">${post.userName}</h4>
        <p class="post-subtitle">${post.userPerfil || 'Usuario'} • ${tiempoTranscurrido}</p>
      </div>
      ${post.userId === usuarioActual.id ? `
        <button class="post-delete-btn" onclick="eliminarPost('${post.id}')" title="Eliminar publicación">
          🗑️
        </button>
      ` : ''}
    </div>
    <div class="post-content">
      <p>${contenidoConHashtags}</p>
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
      <button class="post-action-btn ${likeClass}" onclick="toggleLike('${post.id}', '${post.userId}')">
        <span>${likeIcon}</span>
        <span>Recomendar</span>
      </button>
      <button class="post-action-btn" onclick="toggleComentarios('${post.id}')">
        <span>💬</span>
        <span>Comentar</span>
      </button>
      <button class="post-action-btn" onclick="compartirPost('${post.id}')">
        <span>🔄</span>
        <span>Compartir</span>
      </button>
      <button class="post-action-btn" onclick="enviarMensaje('${post.userId}')">
        <span>📤</span>
        <span>Contactar</span>
      </button>
    </div>
    <div class="post-comments" id="comments-${post.id}" style="display: none;">
      <div class="comments-list" id="comments-list-${post.id}">
        ${renderizarComentarios(post.comentarios || [])}
      </div>
      <div class="comment-form">
        <img src="${usuarioActual.foto || 'https://via.placeholder.com/32'}" alt="Tu foto" class="comment-avatar" />
        <input type="text" placeholder="Escribe un comentario..." id="comment-input-${post.id}" />
        <button onclick="agregarComentario('${post.id}', '${post.userId}')">Enviar</button>
      </div>
    </div>
  `;
  
  return div;
}

// ========== RENDERIZAR COMENTARIOS ==========
function renderizarComentarios(comentarios) {
  if (!comentarios || comentarios.length === 0) {
    return '<p class="no-comments">No hay comentarios aún. ¡Sé el primero en comentar!</p>';
  }
  
  return comentarios.map(comentario => {
    const attachmentHTML = comentario.attachment && window.fileUpload 
      ? window.fileUpload.renderAttachment(comentario.attachment) 
      : '';
    
    return `
      <div class="comment-item">
        <img src="${comentario.userFoto || 'https://via.placeholder.com/32'}" alt="${comentario.userName}" class="comment-avatar" />
        <div class="comment-content">
          <p class="comment-author">${comentario.userName}</p>
          <p class="comment-text">${comentario.texto}</p>
          ${attachmentHTML}
          <span class="comment-time">${calcularTiempoTranscurrido(comentario.fecha)}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ========== TOGGLE LIKE ==========
async function toggleLike(postId, postUserId) {
  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts/${postId}.json`);
    const post = await response.json();
    
    if (!post) return;
    
    let likes = post.likes || [];
    const usuarioIndex = likes.indexOf(usuarioActual.id);
    
    if (usuarioIndex > -1) {
      likes.splice(usuarioIndex, 1);
    } else {
      likes.push(usuarioActual.id);
      
      // Crear notificación si no es el propio usuario
      if (postUserId !== usuarioActual.id && window.notifications) {
        window.notifications.crearNotificacion(
          'like',
          postUserId,
          `${usuarioActual.nombre} recomendó tu publicación`,
          postId
        );
      }
    }
    
    await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts/${postId}/likes.json`, {
      method: 'PUT',
      body: JSON.stringify(likes)
    });
    
    await cargarPosts();
    
  } catch (error) {
    console.error('Error al dar like:', error);
    mostrarNotificacion('❌ Error al dar like', 'error');
  }
}

// ========== TOGGLE COMENTARIOS ==========
function toggleComentarios(postId) {
  const commentsSection = document.getElementById(`comments-${postId}`);
  if (commentsSection) {
    const isVisible = commentsSection.style.display !== 'none';
    commentsSection.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
      const commentInput = document.getElementById(`comment-input-${postId}`);
      if (commentInput) {
        setTimeout(() => commentInput.focus(), 100);
      }
    }
  }
}

// ========== AGREGAR COMENTARIO ==========
async function agregarComentario(postId, postUserId) {
  const commentInput = document.getElementById(`comment-input-${postId}`);
  if (!commentInput) return;
  
  const texto = commentInput.value.trim();
  
  // Obtener formulario para verificar archivo adjunto
  const form = commentInput.closest('.comment-form');
  const attachedFile = window.fileUpload ? window.fileUpload.getAttachedFile(form) : null;
  
  if (!texto && !attachedFile) {
    alert('Por favor escribe un comentario o adjunta un archivo.');
    return;
  }
  
  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts/${postId}.json`);
    const post = await response.json();
    
    if (!post) return;
    
    const comentarios = post.comentarios || [];
    
    const nuevoComentario = {
      userId: usuarioActual.id,
      userName: usuarioActual.nombre,
      userFoto: usuarioActual.foto || 'https://via.placeholder.com/32',
      texto: texto || '',
      fecha: new Date().toISOString()
    };
    
    // Agregar archivo adjunto si existe
    if (attachedFile) {
      nuevoComentario.attachment = attachedFile;
    }
    
    comentarios.push(nuevoComentario);
    
    await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts/${postId}/comentarios.json`, {
      method: 'PUT',
      body: JSON.stringify(comentarios)
    });
    
    // Crear notificación si no es el propio usuario
    if (postUserId !== usuarioActual.id && window.notifications) {
      let mensajeNotif = `${usuarioActual.nombre} comentó`;
      if (texto) {
        mensajeNotif += `: "${texto.substring(0, 50)}${texto.length > 50 ? '...' : ''}"`;
      } else if (attachedFile) {
        mensajeNotif += ` con un archivo adjunto`;
      }
      
      window.notifications.crearNotificacion(
        'comentario',
        postUserId,
        mensajeNotif,
        postId
      );
    }
    
    commentInput.value = '';
    
    // Limpiar archivo adjunto
    if (window.fileUpload) {
      window.fileUpload.clearAttachedFile(form);
    }
    
    await cargarPosts();
    toggleComentarios(postId);
    
    mostrarNotificacion('✅ Comentario agregado', 'success');
    
  } catch (error) {
    console.error('Error al agregar comentario:', error);
    mostrarNotificacion('❌ Error al agregar comentario', 'error');
  }
}

// ========== ELIMINAR POST ==========
async function eliminarPost(postId) {
  if (!confirm('¿Estás seguro que deseas eliminar esta publicación?')) {
    return;
  }
  
  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts/${postId}.json`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await cargarPosts();
      
      if (window.hashtags) {
        window.hashtags.actualizarTendencias();
      }
      
      actualizarEstadisticas();
      mostrarNotificacion('✅ Publicación eliminada', 'success');
    }
  } catch (error) {
    console.error('Error al eliminar post:', error);
    mostrarNotificacion('❌ Error al eliminar publicación', 'error');
  }
}

// ========== COMPARTIR POST ==========
function compartirPost(postId) {
  const url = `${window.location.origin}/home.html?post=${postId}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'LaburitoYa - Publicación',
      text: 'Mira esta publicación en LaburitoYa',
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

// ========== ENVIAR MENSAJE ==========
function enviarMensaje(userId) {
  if (userId === usuarioActual.id) {
    alert('No puedes enviarte mensajes a ti mismo.');
    return;
  }
  
  window.location.href = `messages.html?user=${userId}`;
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

// Exportar funciones para uso global
window.cargarPosts = cargarPosts;
window.toggleLike = toggleLike;
window.toggleComentarios = toggleComentarios;
window.agregarComentario = agregarComentario;
window.eliminarPost = eliminarPost;
window.compartirPost = compartirPost;
window.enviarMensaje = enviarMensaje;
