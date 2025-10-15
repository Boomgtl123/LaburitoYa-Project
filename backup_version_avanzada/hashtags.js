// ========== SISTEMA DE HASHTAGS ==========

// Extraer hashtags de un texto
function extraerHashtags(texto) {
  const regex = /#[\wáéíóúñÁÉÍÓÚÑ]+/g;
  const hashtags = texto.match(regex);
  return hashtags ? hashtags.map(tag => tag.toLowerCase()) : [];
}

// Convertir hashtags en links clickeables
function convertirHashtagsEnLinks(texto) {
  const regex = /#[\wáéíóúñÁÉÍÓÚÑ]+/g;
  return texto.replace(regex, (hashtag) => {
    return `<span class="hashtag-link" data-hashtag="${hashtag.toLowerCase()}">${hashtag}</span>`;
  });
}

// Obtener todas las publicaciones con sus hashtags
async function obtenerTodasLasPublicaciones() {
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json");
    const data = await response.json();
    
    if (!data) return [];
    
    const posts = Object.entries(data).map(([id, post]) => ({
      id,
      ...post
    }));
    
    return posts;
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    return [];
  }
}

// Contar hashtags en todas las publicaciones
async function contarHashtags() {
  const posts = await obtenerTodasLasPublicaciones();
  const hashtagCount = {};
  
  posts.forEach(post => {
    if (post.hashtags && Array.isArray(post.hashtags)) {
      post.hashtags.forEach(hashtag => {
        const tag = hashtag.toLowerCase();
        hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
      });
    }
  });
  
  return hashtagCount;
}

// Obtener hashtags más populares
async function obtenerHashtagsPopulares(limite = 10) {
  const hashtagCount = await contarHashtags();
  
  // Convertir a array y ordenar por cantidad
  const hashtagsOrdenados = Object.entries(hashtagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limite)
    .map(([hashtag, count]) => ({ hashtag, count }));
  
  return hashtagsOrdenados;
}

// Filtrar publicaciones por hashtag
async function filtrarPorHashtag(hashtag) {
  const posts = await obtenerTodasLasPublicaciones();
  const hashtagLower = hashtag.toLowerCase();
  
  return posts.filter(post => {
    if (post.hashtags && Array.isArray(post.hashtags)) {
      return post.hashtags.some(tag => tag.toLowerCase() === hashtagLower);
    }
    return false;
  });
}

// Actualizar sidebar de tendencias
async function actualizarTendencias() {
  const trendsList = document.getElementById('trendsList');
  if (!trendsList) return;
  
  trendsList.innerHTML = '<div class="loading-trends">Cargando tendencias...</div>';
  
  const hashtags = await obtenerHashtagsPopulares(10);
  
  if (hashtags.length === 0) {
    trendsList.innerHTML = '<p class="no-trends">No hay tendencias aún. ¡Usa hashtags en tus publicaciones!</p>';
    return;
  }
  
  trendsList.innerHTML = '';
  
  hashtags.forEach((item, index) => {
    const trendItem = document.createElement('div');
    trendItem.className = 'trend-item';
    trendItem.innerHTML = `
      <p class="trend-category">Tendencia #${index + 1}</p>
      <p class="trend-title hashtag-link" data-hashtag="${item.hashtag}">${item.hashtag}</p>
      <p class="trend-stats">${item.count} ${item.count === 1 ? 'publicación' : 'publicaciones'}</p>
    `;
    trendsList.appendChild(trendItem);
  });
  
  // Agregar event listeners a los hashtags
  agregarEventListenersHashtags();
}

// Agregar event listeners a todos los hashtags clickeables
function agregarEventListenersHashtags() {
  const hashtagLinks = document.querySelectorAll('.hashtag-link');
  
  hashtagLinks.forEach(link => {
    link.addEventListener('click', function() {
      const hashtag = this.getAttribute('data-hashtag');
      if (hashtag) {
        aplicarFiltroHashtag(hashtag);
      }
    });
  });
}

// Aplicar filtro de hashtag
function aplicarFiltroHashtag(hashtag) {
  // Mostrar el filtro activo
  const hashtagFilter = document.getElementById('hashtagFilter');
  const hashtagActivo = document.getElementById('hashtagActivo');
  
  if (hashtagFilter && hashtagActivo) {
    hashtagFilter.style.display = 'flex';
    hashtagActivo.textContent = hashtag;
  }
  
  // Guardar el filtro activo
  window.hashtagFiltroActivo = hashtag;
  
  // Recargar publicaciones con el filtro
  if (window.cargarPosts) {
    window.cargarPosts();
  }
  
  // Scroll al inicio del feed
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Limpiar filtro de hashtag
function limpiarFiltroHashtag() {
  const hashtagFilter = document.getElementById('hashtagFilter');
  
  if (hashtagFilter) {
    hashtagFilter.style.display = 'none';
  }
  
  // Limpiar el filtro activo
  window.hashtagFiltroActivo = null;
  
  // Recargar todas las publicaciones
  if (window.cargarPosts) {
    window.cargarPosts();
  }
}

// Sugerencias de hashtags mientras se escribe
function mostrarSugerenciasHashtags(texto) {
  const sugerenciasContainer = document.getElementById('hashtagSuggestions');
  if (!sugerenciasContainer) return;
  
  const palabras = texto.split(/\s+/);
  const ultimaPalabra = palabras[palabras.length - 1];
  
  // Si la última palabra empieza con #
  if (ultimaPalabra.startsWith('#') && ultimaPalabra.length > 1) {
    const hashtagsComunes = [
      '#Trabajo', '#Empleo', '#Plomero', '#Electricista', '#Carpintero',
      '#Albañil', '#Pintor', '#Jardinero', '#Limpieza', '#Cocinero',
      '#Panadero', '#Mecánico', '#Soldador', '#Construcción', '#Mantenimiento',
      '#Delivery', '#Chofer', '#Niñera', '#Cuidador', '#Profesor'
    ];
    
    const sugerencias = hashtagsComunes.filter(tag => 
      tag.toLowerCase().includes(ultimaPalabra.toLowerCase())
    );
    
    if (sugerencias.length > 0) {
      sugerenciasContainer.innerHTML = sugerencias
        .slice(0, 5)
        .map(tag => `<span class="hashtag-suggestion" data-tag="${tag}">${tag}</span>`)
        .join('');
      sugerenciasContainer.style.display = 'flex';
      
      // Agregar event listeners a las sugerencias
      document.querySelectorAll('.hashtag-suggestion').forEach(suggestion => {
        suggestion.addEventListener('click', function() {
          const tag = this.getAttribute('data-tag');
          const textarea = document.getElementById('contenido');
          if (textarea) {
            const palabras = textarea.value.split(/\s+/);
            palabras[palabras.length - 1] = tag;
            textarea.value = palabras.join(' ') + ' ';
            textarea.focus();
            sugerenciasContainer.style.display = 'none';
          }
        });
      });
    } else {
      sugerenciasContainer.style.display = 'none';
    }
  } else {
    sugerenciasContainer.style.display = 'none';
  }
}

// Inicializar sistema de hashtags
function inicializarHashtags() {
  // Actualizar tendencias
  actualizarTendencias();
  
  // Event listener para el botón de limpiar filtro
  const btnClearFilter = document.getElementById('btnClearFilter');
  if (btnClearFilter) {
    btnClearFilter.addEventListener('click', limpiarFiltroHashtag);
  }
  
  // Event listener para sugerencias de hashtags
  const contenidoTextarea = document.getElementById('contenido');
  if (contenidoTextarea) {
    contenidoTextarea.addEventListener('input', function() {
      mostrarSugerenciasHashtags(this.value);
    });
    
    // Ocultar sugerencias al hacer blur
    contenidoTextarea.addEventListener('blur', function() {
      setTimeout(() => {
        const sugerenciasContainer = document.getElementById('hashtagSuggestions');
        if (sugerenciasContainer) {
          sugerenciasContainer.style.display = 'none';
        }
      }, 200);
    });
  }
}

// Exportar funciones para uso global
window.hashtags = {
  extraerHashtags,
  convertirHashtagsEnLinks,
  obtenerTodasLasPublicaciones,
  contarHashtags,
  obtenerHashtagsPopulares,
  filtrarPorHashtag,
  actualizarTendencias,
  agregarEventListenersHashtags,
  aplicarFiltroHashtag,
  limpiarFiltroHashtag,
  mostrarSugerenciasHashtags,
  inicializarHashtags
};
