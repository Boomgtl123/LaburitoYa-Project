// ========== SISTEMA DE BÚSQUEDA DINÁMICA ==========

let searchTimeout = null;

// ========== INICIALIZAR BÚSQUEDA ==========
function inicializarBusqueda() {
  const usuarioActual = auth.obtenerUsuarioActual();
  
  // Inicializar búsqueda en dropdown +INFO
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value.trim();
      
      // Limpiar timeout anterior
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // Esperar 300ms antes de buscar
      if (query.length >= 2) {
        searchTimeout = setTimeout(() => {
          realizarBusqueda(query, 'searchResultsDropdown');
        }, 300);
      } else {
        ocultarResultados('searchResultsDropdown');
      }
    });
    
    // Cerrar resultados al hacer click fuera
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.search-box-dropdown') && !e.target.closest('#searchResultsDropdown')) {
        ocultarResultados('searchResultsDropdown');
      }
    });
  }
  
  // Inicializar búsqueda en dropdown del avatar
  const searchInputAvatar = document.getElementById('searchInputAvatar');
  if (searchInputAvatar) {
    searchInputAvatar.addEventListener('input', function(e) {
      const query = e.target.value.trim();
      
      // Limpiar timeout anterior
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // Esperar 300ms antes de buscar
      if (query.length >= 2) {
        searchTimeout = setTimeout(() => {
          realizarBusqueda(query, 'searchResultsDropdownAvatar');
        }, 300);
      } else {
        ocultarResultados('searchResultsDropdownAvatar');
      }
    });
    
    // Cerrar resultados al hacer click fuera
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.search-box-dropdown') && !e.target.closest('#searchResultsDropdownAvatar')) {
        ocultarResultados('searchResultsDropdownAvatar');
      }
    });
  }
}

// ========== REALIZAR BÚSQUEDA ==========
async function realizarBusqueda(query, containerId = 'searchResultsDropdown') {
  const queryLower = query.toLowerCase();
  
  try {
    // Buscar en publicaciones y usuarios en paralelo
    const [posts, usuarios] = await Promise.all([
      buscarPublicaciones(queryLower),
      buscarUsuarios(queryLower)
    ]);
    
    mostrarResultados(posts, usuarios, query, containerId);
    
  } catch (error) {
    console.error('Error en búsqueda:', error);
  }
}

// ========== FUNCIÓN PÚBLICA PARA BUSCAR ==========
function buscar(query, containerId = 'searchResultsDropdown') {
  if (query && query.trim().length >= 2) {
    realizarBusqueda(query.trim(), containerId);
  } else {
    ocultarResultados(containerId);
  }
}

// ========== BUSCAR PUBLICACIONES ==========
async function buscarPublicaciones(query) {
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json");
    const data = await response.json();
    
    if (!data) return [];
    
    const resultados = [];
    
    for (const id in data) {
      const post = data[id];
      
      // Buscar en contenido
      if (post.contenido && post.contenido.toLowerCase().includes(query)) {
        resultados.push({ id, ...post, tipo: 'post' });
      }
      
      // Buscar en hashtags
      if (post.hashtags && Array.isArray(post.hashtags)) {
        const hashtagMatch = post.hashtags.some(tag => 
          tag.toLowerCase().includes(query)
        );
        if (hashtagMatch && !resultados.find(r => r.id === id)) {
          resultados.push({ id, ...post, tipo: 'post' });
        }
      }
    }
    
    // Ordenar por fecha (más recientes primero)
    resultados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Limitar a 5 resultados
    return resultados.slice(0, 5);
    
  } catch (error) {
    console.error('Error al buscar publicaciones:', error);
    return [];
  }
}

// ========== BUSCAR USUARIOS ==========
async function buscarUsuarios(query) {
  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios.json");
    const data = await response.json();
    
    if (!data) return [];
    
    const resultados = [];
    const usuarioActual = auth.obtenerUsuarioActual();
    
    for (const id in data) {
      const usuario = data[id];
      
      // No incluir al usuario actual
      if (usuarioActual && id === usuarioActual.id) continue;
      
      // Buscar en nombre
      if (usuario.nombre && usuario.nombre.toLowerCase().includes(query)) {
        resultados.push({ id, ...usuario, tipo: 'usuario' });
      }
      
      // Buscar en username
      if (usuario.username && usuario.username.toLowerCase().includes(query)) {
        if (!resultados.find(r => r.id === id)) {
          resultados.push({ id, ...usuario, tipo: 'usuario' });
        }
      }
      
      // Buscar en zona
      if (usuario.zona && usuario.zona.toLowerCase().includes(query)) {
        if (!resultados.find(r => r.id === id)) {
          resultados.push({ id, ...usuario, tipo: 'usuario' });
        }
      }
      
      // Buscar en perfil
      if (usuario.perfil && usuario.perfil.toLowerCase().includes(query)) {
        if (!resultados.find(r => r.id === id)) {
          resultados.push({ id, ...usuario, tipo: 'usuario' });
        }
      }
    }
    
    // Limitar a 5 resultados
    return resultados.slice(0, 5);
    
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    return [];
  }
}

// ========== MOSTRAR RESULTADOS ==========
function mostrarResultados(posts, usuarios, query, containerId = 'searchResultsDropdown') {
  // Obtener contenedor de resultados en el dropdown
  let searchResults = document.getElementById(containerId);
  
  if (!searchResults) {
    console.error(`No se encontró el contenedor de resultados: ${containerId}`);
    return;
  }
  
  // Limpiar resultados anteriores
  searchResults.innerHTML = '';
  
  if (posts.length === 0 && usuarios.length === 0) {
    searchResults.innerHTML = `
      <div class="search-no-results">
        <p>No se encontraron resultados para "${query}"</p>
      </div>
    `;
    searchResults.style.display = 'block';
    return;
  }
  
  // Mostrar usuarios
  if (usuarios.length > 0) {
    const usuariosSection = document.createElement('div');
    usuariosSection.className = 'search-section';
    usuariosSection.innerHTML = '<h4 class="search-section-title">👥 Personas</h4>';
    
    usuarios.forEach(usuario => {
      const item = crearItemUsuario(usuario);
      usuariosSection.appendChild(item);
    });
    
    searchResults.appendChild(usuariosSection);
  }
  
  // Mostrar publicaciones
  if (posts.length > 0) {
    const postsSection = document.createElement('div');
    postsSection.className = 'search-section';
    postsSection.innerHTML = '<h4 class="search-section-title">📝 Publicaciones</h4>';
    
    posts.forEach(post => {
      const item = crearItemPost(post, query);
      postsSection.appendChild(item);
    });
    
    searchResults.appendChild(postsSection);
  }
  
  searchResults.style.display = 'block';
}

// ========== CREAR ITEM DE USUARIO ==========
function crearItemUsuario(usuario) {
  const div = document.createElement('div');
  div.className = 'search-result-item';
  
  div.innerHTML = `
    <img src="${usuario.foto || 'https://via.placeholder.com/40'}" alt="${usuario.nombre}" class="search-result-avatar" />
    <div class="search-result-info">
      <p class="search-result-name">${auth.renderNombreConBadge(usuario.nombre, usuario)}</p>
      <p class="search-result-subtitle">
        ${usuario.username ? `@${usuario.username} • ` : ''}${usuario.perfil || 'Usuario'}
      </p>
      <p class="search-result-location">📍 ${usuario.zona || 'Ubicación no especificada'}</p>
    </div>
  `;
  
  div.addEventListener('click', function() {
    window.location.href = `public-profile.html?userId=${usuario.id}`;
  });
  
  return div;
}

// ========== CREAR ITEM DE POST ==========
function crearItemPost(post, query) {
  const div = document.createElement('div');
  div.className = 'search-result-item';
  
  // Resaltar query en el contenido
  let contenidoResaltado = post.contenido;
  const regex = new RegExp(`(${query})`, 'gi');
  contenidoResaltado = contenidoResaltado.replace(regex, '<mark>$1</mark>');
  
  // Truncar contenido si es muy largo
  if (contenidoResaltado.length > 150) {
    contenidoResaltado = contenidoResaltado.substring(0, 150) + '...';
  }
  
  const tiempo = calcularTiempoTranscurrido(post.fecha);
  
  div.innerHTML = `
    <img src="${post.userFoto || 'https://via.placeholder.com/40'}" alt="${post.userName}" class="search-result-avatar" />
    <div class="search-result-info">
      <p class="search-result-name">${auth.renderNombreConBadge(post.userName, { verificado: post.userVerificado })}</p>
      <p class="search-result-content">${contenidoResaltado}</p>
      <p class="search-result-time">${tiempo}</p>
    </div>
  `;
  
  // Intento de mejora del badge con datos reales del usuario (CEO o verificado)
  if (post.userId && window.auth && typeof window.auth.getUsuarioPorIdCacheado === 'function') {
    window.auth.getUsuarioPorIdCacheado(post.userId).then(u => {
      if (u) {
        const nameEl = div.querySelector('.search-result-name');
        if (nameEl) {
          nameEl.innerHTML = window.auth.renderNombreConBadge(post.userName, u);
        }
      }
    }).catch(() => {});
  }

  div.addEventListener('click', function() {
    window.location.href = `home.html?post=${post.id}`;
  });
  
  return div;
}

// ========== OCULTAR RESULTADOS ==========
function ocultarResultados(containerId = 'searchResultsDropdown') {
  const searchResults = document.getElementById(containerId);
  if (searchResults) {
    searchResults.style.display = 'none';
    searchResults.innerHTML = '';
  }
}

// ========== VER TODOS LOS RESULTADOS ==========
function verTodosResultados(query) {
  window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
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
window.search = {
  inicializarBusqueda,
  buscar,
  verTodosResultados
};

// Hacer función global para el onclick
window.verTodosResultados = verTodosResultados;

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Inicializando búsqueda...');
    inicializarBusqueda();
  });
} else {
  // DOM ya está listo
  console.log('🔍 Inicializando búsqueda (DOM ya listo)...');
  inicializarBusqueda();
}

console.log('✅ search.js cargado correctamente');
