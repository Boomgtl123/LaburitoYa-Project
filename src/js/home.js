// ========== VARIABLES GLOBALES ==========
let postsVisibles = 10;
const POSTS_POR_PAGINA = 10;
let todosLosPosts = [];
let usuarioActual = null;

// Avatar placeholder como SVG inline (evita errores de red)
const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e0e0e0" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="40"%3E👤%3C/text%3E%3C/svg%3E';

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
    navAvatar.src = usuarioActual.foto || DEFAULT_AVATAR;
  }
  
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const sidebarNombre = document.getElementById('sidebarNombre');
  const sidebarPerfil = document.getElementById('sidebarPerfil');
  const sidebarBio = document.getElementById('sidebarBio');
  
  if (sidebarAvatar) sidebarAvatar.src = usuarioActual.foto || DEFAULT_AVATAR;
  if (sidebarNombre) sidebarNombre.innerHTML = auth.renderNombreConBadge(usuarioActual.nombre, usuarioActual);
  if (sidebarPerfil) {
    const perfilTexto = usuarioActual.perfil === 'Trabajador' ? 'Buscando oportunidades laborales' : 'Buscando contratar personal';
    sidebarPerfil.textContent = perfilTexto;
  }
  if (sidebarBio && usuarioActual.biografia) {
    sidebarBio.textContent = usuarioActual.biografia;
    sidebarBio.style.display = 'block';
  }
  
  // Aplicar banner del usuario
  const profileHeader = document.querySelector('.profile-header');
  if (profileHeader && usuarioActual.bannerColor) {
    profileHeader.style.background = usuarioActual.bannerColor;
  }
  
  const postFormAvatar = document.getElementById('postFormAvatar');
  if (postFormAvatar) {
    postFormAvatar.src = usuarioActual.foto || DEFAULT_AVATAR;
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
  
  // Configurar input de fotos
  const inputFotos = document.getElementById('inputFotos');
  if (inputFotos) {
    inputFotos.addEventListener('change', manejarSeleccionFotos);
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
  
  // Dropdown de +INFO
  const navInfo = document.getElementById('navInfo');
  if (navInfo) {
    navInfo.addEventListener('click', function(e) {
      if (!e.target.closest('.dropdown-menu')) {
        this.classList.toggle('active');
      }
    });
  }
  
  // Cerrar dropdowns al hacer click fuera
  document.addEventListener('click', function(e) {
    const navInfo = document.getElementById('navInfo');
    if (navInfo && !navInfo.contains(e.target)) {
      navInfo.classList.remove('active');
    }
  });
}

// ========== MANEJAR SELECCIÓN DE FOTOS ==========
let fotosSeleccionadas = [];

function manejarSeleccionFotos(e) {
  const files = Array.from(e.target.files);
  const previewContainer = document.getElementById('previewFotos');
  
  // Limitar a 3 fotos
  if (files.length > 3) {
    alert('Solo puedes subir máximo 3 fotos');
    e.target.value = '';
    return;
  }
  
  fotosSeleccionadas = files;
  previewContainer.innerHTML = '';
  
  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const previewDiv = document.createElement('div');
      previewDiv.style.position = 'relative';
      previewDiv.style.display = 'inline-block';
      
      const img = document.createElement('img');
      img.src = event.target.result;
      img.style.width = '100px';
      img.style.height = '100px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '8px';
      img.style.border = '2px solid #ddd';
      
      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = '✕';
      btnEliminar.type = 'button';
      btnEliminar.style.position = 'absolute';
      btnEliminar.style.top = '-8px';
      btnEliminar.style.right = '-8px';
      btnEliminar.style.background = '#ff4444';
      btnEliminar.style.color = 'white';
      btnEliminar.style.border = 'none';
      btnEliminar.style.borderRadius = '50%';
      btnEliminar.style.width = '24px';
      btnEliminar.style.height = '24px';
      btnEliminar.style.cursor = 'pointer';
      btnEliminar.style.fontSize = '14px';
      btnEliminar.style.lineHeight = '1';
      
      btnEliminar.onclick = function() {
        fotosSeleccionadas.splice(index, 1);
        previewDiv.remove();
        // Actualizar el input
        const dt = new DataTransfer();
        fotosSeleccionadas.forEach(f => dt.items.add(f));
        document.getElementById('inputFotos').files = dt.files;
      };
      
      previewDiv.appendChild(img);
      previewDiv.appendChild(btnEliminar);
      previewContainer.appendChild(previewDiv);
    };
    reader.readAsDataURL(file);
  });
}

// ========== CONVERTIR IMÁGENES A BASE64 ==========
async function convertirImagenesABase64(files) {
  const promises = Array.from(files).map(file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  });
  return Promise.all(promises);
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
    userFoto: usuarioActual.foto || DEFAULT_AVATAR,
    userPerfil: usuarioActual.perfil,
    userTelefono: usuarioActual.telefono,
    userZona: usuarioActual.zona,
    userVerificado: auth.estaVerificado(usuarioActual),
    hashtags: hashtags,
    likes: [],
    comentarios: [],
    fotos: []
  };
  
  // Agregar fotos si hay
  if (fotosSeleccionadas.length > 0) {
    try {
      data.fotos = await convertirImagenesABase64(fotosSeleccionadas);
    } catch (error) {
      console.error('Error al convertir imágenes:', error);
      alert('Error al procesar las imágenes. Intenta de nuevo.');
      return;
    }
  }
  
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json", {
      method: "POST",
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      document.getElementById('contenido').value = '';
      
      // Limpiar fotos
      fotosSeleccionadas = [];
      document.getElementById('inputFotos').value = '';
      document.getElementById('previewFotos').innerHTML = '';
      
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
    // Agregar timeout de 10 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json", {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

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

    // Filtrar posts de usuarios bloqueados (excepto para CEO)
    if (!auth.esCEO(usuarioActual)) {
      posts = posts.filter(post => !auth.estaBloqueado(post.userId));
    }

    if (window.hashtagFiltroActivo) {
      posts = posts.filter(post => {
        if (post.hashtags && Array.isArray(post.hashtags)) {
          return post.hashtags.some(tag => tag.toLowerCase() === window.hashtagFiltroActivo.toLowerCase());
        }
        return false;
      });
    }

    todosLosPosts = posts;

    // Obtener anuncios activos si el sistema de roles está disponible
    let anunciosActivos = [];
    if (window.roles) {
      try {
        anunciosActivos = await window.roles.obtenerAnunciosActivos();
      } catch (error) {
        console.error('Error al cargar anuncios:', error);
      }
    }
    
    // Construir caché de usuarios (autores y comentaristas) para mostrar badge verificado/CEO
    try {
      const userIdsSet = new Set();
      posts.forEach(p => {
        if (p.userId) userIdsSet.add(p.userId);
        if (Array.isArray(p.comentarios)) {
          p.comentarios.forEach(c => { if (c && c.userId) userIdsSet.add(c.userId); });
        }
      });
      window._usuariosPosts = window._usuariosPosts || {};
      const ids = Array.from(userIdsSet);
      await Promise.all(ids.map(async (uid) => {
        try {
          const data = await auth.obtenerUsuarioPorId(uid);
          if (data) {
            window._usuariosPosts[uid] = { id: uid, ...data };
          }
        } catch (e) {
          console.error('Error al cachear usuario', uid, e);
        }
      }));
    } catch (e) {
      console.error('Error construyendo caché de usuarios para badges:', e);
    }

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
    
    // Insertar posts con anuncios intercalados
    postsAMostrar.forEach((post, index) => {
      const postElement = crearElementoPost(post);
      postList.appendChild(postElement);

      // Insertar anuncio cada 5 posts
      if (anunciosActivos.length > 0 && (index + 1) % 5 === 0) {
        const anuncioIndex = Math.floor(index / 5) % anunciosActivos.length;
        const anuncioElement = crearElementoAnuncio(anunciosActivos[anuncioIndex]);
        postList.appendChild(anuncioElement);
      }
      
      // Inicializar estado del carrusel si tiene múltiples fotos
      if (post.fotos && post.fotos.length > 1) {
        window.carouselStates[post.id] = { 
          currentIndex: 0, 
          totalFotos: post.fotos.length 
        };
      }
    });
    
    // Agregar event listeners a los botones del carrusel
    document.querySelectorAll('.carousel-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const postId = this.getAttribute('data-post-id');
        const direction = parseInt(this.getAttribute('data-direction'));
        navegarCarrusel(postId, direction);
      });
    });
    
    // Agregar event listeners para imágenes del carrusel
    document.querySelectorAll('.carousel-image').forEach(img => {
      img.addEventListener('click', function() {
        const postId = this.getAttribute('data-post-id');
        const index = parseInt(this.getAttribute('data-index'));
        const post = todosLosPosts.find(p => p.id === postId);
        if (post && post.fotos) {
          abrirModalImagen(this.src, index, post.fotos);
        }
      });
    });
    
    // Agregar event listeners para imágenes individuales
    document.querySelectorAll('.post-image-single').forEach(img => {
      img.addEventListener('click', function() {
        const postId = this.getAttribute('data-post-id');
        const post = todosLosPosts.find(p => p.id === postId);
        if (post && post.fotos) {
          abrirModalImagen(this.src, 0, post.fotos);
        }
      });
    });
    
    // Agregar event listeners para hover (pausar/reanudar auto-rotación)
    document.querySelectorAll('.post-carousel').forEach(carousel => {
      const postId = carousel.getAttribute('data-post-id');
      
      carousel.addEventListener('mouseenter', function() {
        pausarAutoRotacionHover(postId);
      });
      
      carousel.addEventListener('mouseleave', function() {
        reanudarAutoRotacionHover(postId);
      });
      
      // Iniciar auto-rotación para este carrusel
      setTimeout(() => {
        iniciarAutoRotacion(postId);
      }, 100);
    });
    
    // Agregar event listeners para botones de seguir
    if (window.followers) {
      actualizarBotonesSeguir();
    }
    
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
      const errorMsg = err.name === 'AbortError' 
        ? '⏱️ La carga está tardando mucho. Verifica tu conexión e intenta de nuevo.'
        : '❌ Error al cargar publicaciones. Por favor recarga la página.';
      noPostsMessage.innerHTML = `<p>${errorMsg}</p>`;
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

  // Obtener usuario del post desde caché (incluye verificado/CEO si está en caché)
  const usuarioDelPost = (window._usuariosPosts && window._usuariosPosts[post.userId]) || null;
  const nombreConBadge = auth.renderNombreConBadge(post.userName, usuarioDelPost || { verificado: post.userVerificado });

  div.innerHTML = `
    <div class="post-header">
      <img src="${post.userFoto || DEFAULT_AVATAR}" alt="${post.userName}" class="post-avatar" loading="lazy" onerror="this.src='${DEFAULT_AVATAR}'" style="cursor: pointer;" onclick="verPerfil('${post.userId}')" />
      <div class="post-info">
        <div style="display: flex; align-items: center; gap: 8px;">
          <h4 class="post-username" style="cursor: pointer; color: #000000e6; transition: color 0.2s;" onclick="verPerfil('${post.userId}')" onmouseover="this.style.color='#0a66c2'" onmouseout="this.style.color='#000000e6'">
            ${nombreConBadge}
          </h4>
          ${post.userId !== usuarioActual.id ? `
            <button class="btn-follow" data-user-id="${post.userId}" style="padding: 4px 12px; font-size: 13px; border: 1px solid #0a66c2; background: white; color: #0a66c2; border-radius: 16px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
              Seguir
            </button>
          ` : ''}
        </div>
        <p class="post-subtitle">${post.userPerfil || 'Usuario'} • ${tiempoTranscurrido}</p>
      </div>
      ${post.userId === usuarioActual.id || auth.esCEO(usuarioActual) ? `
        <button class="post-delete-btn" onclick="eliminarPost('${post.id}')" title="Eliminar publicación">
          🗑️
        </button>
      ` : ''}
    </div>
    <div class="post-content">
      <p>${contenidoConHashtags}</p>
      ${post.fotos && post.fotos.length > 0 ? (
        post.fotos.length === 1 ? `
          <div class="post-images" style="margin-top: 15px;">
            <img src="${post.fotos[0]}" alt="Imagen del post" class="post-image-single" data-post-id="${post.id}" data-index="0" style="width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 8px; cursor: pointer;" loading="lazy" />
          </div>
        ` : `
          <div class="post-carousel post-carousel-${post.id}" data-post-id="${post.id}" style="position: relative; margin-top: 15px; overflow: hidden; border-radius: 8px;">
            <div class="carousel-container-${post.id}" style="display: flex; transition: transform 0.3s ease;">
              ${post.fotos.map((foto, index) => `
                <img src="${foto}" alt="Imagen ${index + 1}" class="carousel-image" data-post-id="${post.id}" data-index="${index}" style="width: 100%; aspect-ratio: 1/1; object-fit: cover; flex-shrink: 0; cursor: pointer;" loading="lazy" />
              `).join('')}
            </div>
            <button class="carousel-btn carousel-prev" data-post-id="${post.id}" data-direction="-1" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 35px; height: 35px; font-size: 18px; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center;">&#10094;</button>
            <button class="carousel-btn carousel-next" data-post-id="${post.id}" data-direction="1" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 35px; height: 35px; font-size: 18px; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center;">&#10095;</button>
            <div class="carousel-indicators" style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; z-index: 10;">
              ${post.fotos.map((_, index) => `
                <div class="indicator-${post.id}-${index}" style="width: 8px; height: 8px; border-radius: 50%; background: ${index === 0 ? 'white' : 'rgba(255,255,255,0.5)'}; transition: background 0.3s;"></div>
              `).join('')}
            </div>
          </div>
        `
      ) : ''}
    </div>
    <div class="post-contact-info">
      <span>📍 ${post.userZona || 'Ubicación no especificada'}</span>
      <span>📞 ${post.userTelefono || 'Teléfono no disponible'}</span>
    </div>
    <div class="post-stats">
      ${likeCount > 0 ? `<span>${likeCount} ${likeCount === 1 ? 'recomendación' : 'recomendaciones'}</span>` : ''}
      ${commentCount > 0 ? `<span onclick="toggleComentarios('${post.id}')" style="cursor: pointer;">${commentCount} ${commentCount === 1 ? 'comentario' : 'comentarios'}</span>` : ''}
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
        <img src="${usuarioActual.foto || DEFAULT_AVATAR}" alt="Tu foto" class="comment-avatar" loading="lazy" onerror="this.src='${DEFAULT_AVATAR}'" />
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
        <img src="${comentario.userFoto || DEFAULT_AVATAR}" alt="${comentario.userName}" class="comment-avatar" loading="lazy" onerror="this.src='${DEFAULT_AVATAR}'" />
        <div class="comment-content">
          <p class="comment-author">${auth.renderNombreConBadge(comentario.userName, (window._usuariosPosts && window._usuariosPosts[comentario.userId]) || null)}</p>
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
      userFoto: usuarioActual.foto || DEFAULT_AVATAR,
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
  // Verificar permisos: solo el autor o CEO pueden eliminar
  const post = todosLosPosts.find(p => p.id === postId);
  if (!post) return;

  const puedeEliminar = post.userId === usuarioActual.id || auth.esCEO(usuarioActual);
  if (!puedeEliminar) {
    mostrarNotificacion('❌ No tienes permisos para eliminar esta publicación', 'error');
    return;
  }

  const mensajeConfirmacion = auth.esCEO(usuarioActual) && post.userId !== usuarioActual.id
    ? '¿Estás seguro que deseas eliminar esta publicación como CEO?'
    : '¿Estás seguro que deseas eliminar esta publicación?';

  if (!confirm(mensajeConfirmacion)) {
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
  const url = `${window.location.origin}/src/pages/home.html?post=${postId}`;
  
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

// ========== VER PERFIL ==========
function verPerfil(userId) {
  if (userId === usuarioActual.id) {
    window.location.href = 'profile.html';
  } else {
    window.location.href = `public-profile.html?userId=${userId}`;
  }
}

// ========== MODAL DE IMAGEN ==========
function abrirModalImagen(imagenUrl, indiceActual, todasLasFotos) {
  // Crear modal si no existe
  let modal = document.getElementById('modalImagen');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modalImagen';
    modal.style.cssText = `
      display: none;
      position: fixed;
      z-index: 10000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.95);
      justify-content: center;
      align-items: center;
    `;
    
    modal.innerHTML = `
      <div style="position: relative; max-width: 90%; max-height: 90%; display: flex; align-items: center; justify-content: center;">
        <button id="btnCerrarModal" style="position: absolute; top: -40px; right: 0; background: transparent; border: none; color: white; font-size: 40px; cursor: pointer; z-index: 10001;">&times;</button>
        <button id="btnAnterior" style="position: absolute; left: -50px; background: rgba(255,255,255,0.3); border: none; color: white; font-size: 30px; padding: 10px 20px; cursor: pointer; border-radius: 5px; z-index: 10001;">&#10094;</button>
        <img id="imagenModal" src="" style="max-width: 100%; max-height: 90vh; object-fit: contain; border-radius: 8px;" />
        <button id="btnSiguiente" style="position: absolute; right: -50px; background: rgba(255,255,255,0.3); border: none; color: white; font-size: 30px; padding: 10px 20px; cursor: pointer; border-radius: 5px; z-index: 10001;">&#10095;</button>
        <div id="contadorFotos" style="position: absolute; bottom: -40px; color: white; font-size: 16px;"></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('btnCerrarModal').onclick = cerrarModalImagen;
    modal.onclick = function(e) {
      if (e.target === modal) cerrarModalImagen();
    };
    
    // Cerrar con ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        cerrarModalImagen();
      }
    });
  }
  
  // Mostrar modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Configurar navegación
  let indice = indiceActual;
  const fotos = todasLasFotos;
  
  function mostrarFoto() {
    document.getElementById('imagenModal').src = fotos[indice];
    document.getElementById('contadorFotos').textContent = `${indice + 1} / ${fotos.length}`;
    
    // Mostrar/ocultar botones de navegación
    const btnAnterior = document.getElementById('btnAnterior');
    const btnSiguiente = document.getElementById('btnSiguiente');
    
    if (fotos.length <= 1) {
      btnAnterior.style.display = 'none';
      btnSiguiente.style.display = 'none';
    } else {
      btnAnterior.style.display = indice > 0 ? 'block' : 'none';
      btnSiguiente.style.display = indice < fotos.length - 1 ? 'block' : 'none';
    }
  }
  
  document.getElementById('btnAnterior').onclick = function() {
    if (indice > 0) {
      indice--;
      mostrarFoto();
    }
  };
  
  document.getElementById('btnSiguiente').onclick = function() {
    if (indice < fotos.length - 1) {
      indice++;
      mostrarFoto();
    }
  };
  
  // Navegación con teclado
  const navegarConTeclado = function(e) {
    if (modal.style.display === 'flex') {
      if (e.key === 'ArrowLeft' && indice > 0) {
        indice--;
        mostrarFoto();
      } else if (e.key === 'ArrowRight' && indice < fotos.length - 1) {
        indice++;
        mostrarFoto();
      }
    }
  };
  
  document.removeEventListener('keydown', navegarConTeclado);
  document.addEventListener('keydown', navegarConTeclado);
  
  mostrarFoto();
}

function cerrarModalImagen() {
  const modal = document.getElementById('modalImagen');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
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

// ========== FUNCIONES DE CARRUSEL ==========

// Almacenar intervalos de auto-rotación
if (!window.carouselIntervals) {
  window.carouselIntervals = {};
}

if (!window.carouselStates) {
  window.carouselStates = {};
}

// Navegar en el carrusel (manual)
function navegarCarrusel(postId, direccion) {
  console.log('navegarCarrusel llamado:', postId, direccion);
  const state = window.carouselStates[postId];
  if (!state) {
    console.error('No se encontró estado para:', postId);
    return;
  }
  
  // Calcular nuevo índice
  let nuevoIndice = state.currentIndex + direccion;
  
  // Circular: si llega al final, vuelve al inicio y viceversa
  if (nuevoIndice >= state.totalFotos) {
    nuevoIndice = 0;
  } else if (nuevoIndice < 0) {
    nuevoIndice = state.totalFotos - 1;
  }
  
  console.log('Moviendo de', state.currentIndex, 'a', nuevoIndice);
  
  // Actualizar estado
  state.currentIndex = nuevoIndice;
  
  // Mover el carrusel
  const container = document.querySelector(`.carousel-container-${postId}`);
  if (container) {
    container.style.transform = `translateX(-${nuevoIndice * 100}%)`;
    console.log('Carrusel movido a:', nuevoIndice);
  } else {
    console.error('No se encontró contenedor para:', postId);
  }
  
  // Actualizar indicadores
  actualizarIndicadores(postId, nuevoIndice);
  
  // Reiniciar auto-rotación
  reiniciarAutoRotacion(postId);
}

// Actualizar indicadores visuales
function actualizarIndicadores(postId, indiceActivo) {
  const state = window.carouselStates[postId];
  if (!state) return;
  
  for (let i = 0; i < state.totalFotos; i++) {
    const indicator = document.querySelector(`.indicator-${postId}-${i}`);
    if (indicator) {
      indicator.style.background = i === indiceActivo ? 'white' : 'rgba(255,255,255,0.5)';
    }
  }
}

// Iniciar auto-rotación para un carrusel
function iniciarAutoRotacion(postId) {
  const state = window.carouselStates[postId];
  if (!state || state.totalFotos <= 1) return;
  
  // Limpiar intervalo existente si hay
  if (window.carouselIntervals[postId]) {
    clearInterval(window.carouselIntervals[postId]);
  }
  
  console.log('Iniciando auto-rotación para:', postId);
  
  // Crear nuevo intervalo (cambiar cada 4 segundos)
  window.carouselIntervals[postId] = setInterval(() => {
    navegarCarrusel(postId, 1);
  }, 4000);
}

// Detener auto-rotación
function detenerAutoRotacion(postId) {
  if (window.carouselIntervals[postId]) {
    clearInterval(window.carouselIntervals[postId]);
    delete window.carouselIntervals[postId];
    console.log('Auto-rotación detenida para:', postId);
  }
}

// Reiniciar auto-rotación (útil después de navegación manual)
function reiniciarAutoRotacion(postId) {
  detenerAutoRotacion(postId);
  iniciarAutoRotacion(postId);
}

// Pausar auto-rotación al hacer hover
function pausarAutoRotacionHover(postId) {
  console.log('Pausando hover:', postId);
  detenerAutoRotacion(postId);
}

// Reanudar auto-rotación al quitar hover
function reanudarAutoRotacionHover(postId) {
  console.log('Reanudando hover:', postId);
  iniciarAutoRotacion(postId);
}

// ========== ACTUALIZAR BOTONES DE SEGUIR ==========
async function actualizarBotonesSeguir() {
  const botonesSeguir = document.querySelectorAll('.btn-follow');
  
  for (const boton of botonesSeguir) {
    const userId = boton.getAttribute('data-user-id');
    
    // Verificar si ya sigo a este usuario
    const siguiendo = await window.followers.estaSiguiendo(userId);
    
    if (siguiendo) {
      boton.textContent = 'Siguiendo';
      boton.style.background = '#0a66c2';
      boton.style.color = 'white';
      boton.style.border = '1px solid #0a66c2';
    } else {
      boton.textContent = 'Seguir';
      boton.style.background = 'white';
      boton.style.color = '#0a66c2';
      boton.style.border = '1px solid #0a66c2';
    }
    
    // Agregar event listener
    boton.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const userId = this.getAttribute('data-user-id');
      const estabaSiguiendo = this.textContent === 'Siguiendo';
      
      // Deshabilitar botón temporalmente
      this.disabled = true;
      this.textContent = '...';
      
      // Toggle seguir
      const success = await window.followers.toggleSeguir(userId);
      
      if (success) {
        if (estabaSiguiendo) {
          // Dejó de seguir
          this.textContent = 'Seguir';
          this.style.background = 'white';
          this.style.color = '#0a66c2';
          this.style.border = '1px solid #0a66c2';
          mostrarNotificacion('Dejaste de seguir a este usuario', 'info');
        } else {
          // Comenzó a seguir
          this.textContent = 'Siguiendo';
          this.style.background = '#0a66c2';
          this.style.color = 'white';
          this.style.border = '1px solid #0a66c2';
          mostrarNotificacion('✅ Ahora sigues a este usuario', 'success');
        }
      } else {
        // Restaurar estado anterior
        this.textContent = estabaSiguiendo ? 'Siguiendo' : 'Seguir';
        mostrarNotificacion('❌ Error al actualizar seguimiento', 'error');
      }
      
      // Rehabilitar botón
      this.disabled = false;
    });
    
    // Efecto hover
    boton.addEventListener('mouseenter', function() {
      if (this.textContent === 'Siguiendo') {
        this.textContent = 'Dejar de seguir';
        this.style.background = '#dc3545';
        this.style.borderColor = '#dc3545';
        this.style.color = 'white';
      }
    });
    
    boton.addEventListener('mouseleave', function() {
      if (this.textContent === 'Dejar de seguir') {
        this.textContent = 'Siguiendo';
        this.style.background = '#0a66c2';
        this.style.borderColor = '#0a66c2';
        this.style.color = 'white';
      }
    });
  }
}

// Exportar funciones para uso global INMEDIATAMENTE
window.navegarCarrusel = navegarCarrusel;
window.actualizarIndicadores = actualizarIndicadores;
window.iniciarAutoRotacion = iniciarAutoRotacion;
window.detenerAutoRotacion = detenerAutoRotacion;
window.pausarAutoRotacionHover = pausarAutoRotacionHover;
window.reanudarAutoRotacionHover = reanudarAutoRotacionHover;

// Exportar otras funciones para uso global
window.cargarPosts = cargarPosts;
window.toggleLike = toggleLike;
window.toggleComentarios = toggleComentarios;
window.agregarComentario = agregarComentario;
window.eliminarPost = eliminarPost;
window.compartirPost = compartirPost;
window.enviarMensaje = enviarMensaje;
window.verPerfil = verPerfil;
window.abrirModalImagen = abrirModalImagen;
window.cerrarModalImagen = cerrarModalImagen;
window.actualizarBotonesSeguir = actualizarBotonesSeguir;

// ========== CREAR ELEMENTO DE ANUNCIO ==========
function crearElementoAnuncio(anuncio) {
  const div = document.createElement('div');
  div.className = 'post anuncio-post';
  div.setAttribute('data-anuncio-id', anuncio.id);

  const tipoIcons = {
    'info': 'ℹ️',
    'promocion': '🎁',
    'alerta': '⚠️',
    'evento': '📅'
  };

  const tipoColors = {
    'info': '#2196F3',
    'promocion': '#4CAF50',
    'alerta': '#ff9800',
    'evento': '#9c27b0'
  };

  const icono = tipoIcons[anuncio.tipo] || 'ℹ️';
  const color = tipoColors[anuncio.tipo] || '#2196F3';

  // Generar HTML para media si existe
  let mediaHTML = '';
  if (anuncio.media) {
    const isVideo = anuncio.media.type && anuncio.media.type.startsWith('video/');
    if (isVideo) {
      mediaHTML = `
        <div style="margin-top: 15px;">
          <video controls style="width: 100%; max-height: 400px; border-radius: 8px; object-fit: contain;">
            <source src="${anuncio.media.data}" type="${anuncio.media.type}">
            Tu navegador no soporta videos.
          </video>
        </div>
      `;
    } else {
      mediaHTML = `
        <div style="margin-top: 15px;">
          <img src="${anuncio.media.data}" alt="${anuncio.titulo}" style="width: 100%; max-height: 400px; border-radius: 8px; object-fit: contain; cursor: pointer;" onclick="abrirModalImagen('${anuncio.media.data}', 0, ['${anuncio.media.data}'])" />
        </div>
      `;
    }
  }

  div.innerHTML = `
    <div class="anuncio-header" style="background: ${color}20; padding: 15px; border-radius: 8px 8px 0 0; border-left: 4px solid ${color};">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 24px;">${icono}</span>
        <div>
          <span style="font-size: 12px; font-weight: 600; color: ${color}; text-transform: uppercase;">
            ${anuncio.tipo === 'info' ? 'Información' : 
              anuncio.tipo === 'promocion' ? 'Promoción' : 
              anuncio.tipo === 'alerta' ? 'Alerta' : 'Evento'}
          </span>
          <h3 style="margin: 5px 0 0 0; font-size: 18px; font-weight: 700;">${anuncio.titulo}</h3>
        </div>
      </div>
    </div>
    <div class="post-content" style="padding: 20px;">
      <p style="font-size: 15px; line-height: 1.6; color: #333;">${anuncio.contenido}</p>
      ${mediaHTML}
      ${anuncio.destacado ? '<span style="display: inline-block; margin-top: 10px; padding: 4px 12px; background: #FFD70020; color: #FFD700; border-radius: 12px; font-size: 12px; font-weight: 600;">✨ Destacado</span>' : ''}
    </div>
    <div class="post-footer" style="padding: 15px 20px; background: #f5f5f5; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
      <span>📢 Anuncio oficial • ${formatearTiempo(anuncio.fechaCreacion)}</span>
    </div>
  `;

  // Agregar estilos especiales para anuncios
  div.style.border = `2px solid ${color}40`;
  div.style.background = 'linear-gradient(to bottom, ' + color + '05, white)';

  return div;
}

// Función auxiliar para formatear tiempo (si no existe)
function formatearTiempo(fecha) {
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

console.log('✅ home.js cargado correctamente');
console.log('✅ Funciones de carrusel disponibles:', {
  navegarCarrusel: typeof window.navegarCarrusel,
  pausarAutoRotacionHover: typeof window.pausarAutoRotacionHover,
  reanudarAutoRotacionHover: typeof window.reanudarAutoRotacionHover
});
