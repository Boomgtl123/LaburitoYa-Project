// ========== GESTIÓN DE SESIÓN Y AUTENTICACIÓN ==========

// ========== GESTIÓN DE ROLES Y PERMISOS ==========

// Verificar si el usuario es CEO
function esCEO(usuario) {
  // El correo del CEO se obtiene de variables de entorno
  // Para mayor seguridad, también se puede verificar un campo 'rol' en la base de datos
  const ADMIN_EMAIL = window.ENV?.ADMIN_EMAIL || 'laburitoya@gmail.com';
  return usuario && (usuario.correo === ADMIN_EMAIL || usuario.rol === 'CEO' || usuario.esAdmin === true);
}

// Verificar si el usuario está verificado
function estaVerificado(usuario) {
  return usuario && usuario.verificado === true;
}

// Verificar si el usuario es Premium
async function esPremium(userId) {
  try {
    if (!userId) return false;
    
    // SIEMPRE verificar desde Firebase para tener datos actualizados
    try {
      const premiumRef = firebase.database().ref(`premiumUsers/${userId}`);
      const snapshot = await premiumRef.once('value');
      const premiumData = snapshot.val();
      
      const isPremium = premiumData && premiumData.isPremium === true;
      
      // Si es el usuario actual, actualizar sesión
      const usuario = obtenerUsuarioActual();
      if (usuario && usuario.id === userId) {
        actualizarSesion({ isPremium });
      }
      
      return isPremium;
    } catch (firebaseError) {
      // Si hay error de permisos, intentar desde el nodo de usuarios
      if (firebaseError.code === 'PERMISSION_DENIED') {
        const userRef = firebase.database().ref(`usuarios/${userId}/isPremium`);
        const userSnapshot = await userRef.once('value');
        return userSnapshot.val() === true;
      }
      
      // Como último recurso, usar sesión local solo si es el usuario actual
      const usuario = obtenerUsuarioActual();
      if (usuario && usuario.id === userId && usuario.isPremium !== undefined) {
        return usuario.isPremium === true;
      }
      
      return false;
    }
  } catch (error) {
    // Error silencioso - no mostrar en consola para no alarmar
    return false;
  }
}

// Verificar si el usuario es Premium (versión síncrona desde cache)
function esPremiumSync(usuario) {
  return usuario && usuario.isPremium === true;
}

// Verificar si un usuario está bloqueado por el CEO
function estaBloqueado(userId) {
  // Obtener lista de usuarios bloqueados del CEO
  const bloqueados = JSON.parse(localStorage.getItem('usuariosBloqueados') || '[]');
  return bloqueados.includes(userId);
}

// Bloquear usuario (solo CEO)
function bloquearUsuario(userId) {
  const usuarioActual = obtenerUsuarioActual();
  if (!esCEO(usuarioActual)) return false;

  const bloqueados = JSON.parse(localStorage.getItem('usuariosBloqueados') || '[]');
  if (!bloqueados.includes(userId)) {
    bloqueados.push(userId);
    localStorage.setItem('usuariosBloqueados', JSON.stringify(bloqueados));
  }
  return true;
}

// Desbloquear usuario (solo CEO)
function desbloquearUsuario(userId) {
  const usuarioActual = obtenerUsuarioActual();
  if (!esCEO(usuarioActual)) return false;

  const bloqueados = JSON.parse(localStorage.getItem('usuariosBloqueados') || '[]');
  const index = bloqueados.indexOf(userId);
  if (index > -1) {
    bloqueados.splice(index, 1);
    localStorage.setItem('usuariosBloqueados', JSON.stringify(bloqueados));
  }
  return true;
}

// Verificar usuario (solo CEO)
async function verificarUsuario(userId) {
  const usuarioActual = obtenerUsuarioActual();
  if (!esCEO(usuarioActual)) return false;

  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios/${userId}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ verificado: true })
    });
    return response.ok;
  } catch (error) {
    console.error('Error al verificar usuario:', error);
    return false;
  }
}

// Obtener todos los usuarios (solo CEO)
async function obtenerTodosLosUsuarios() {
  const usuarioActual = obtenerUsuarioActual();
  if (!esCEO(usuarioActual)) return [];

  try {
    const response = await fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios.json');
    const data = await response.json();
    return Object.entries(data).map(([id, user]) => ({ id, ...user }));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
}

// Guardar usuario en sesión
function guardarSesion(usuario) {
  localStorage.setItem('usuarioActual', JSON.stringify(usuario));
}

// Obtener usuario actual
function obtenerUsuarioActual() {
  const usuario = localStorage.getItem('usuarioActual');
  return usuario ? JSON.parse(usuario) : null;
}

// Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('usuarioActual');
  window.location.href = '../../index.html';
}

// Verificar si hay sesión activa
function verificarSesion() {
  const usuario = obtenerUsuarioActual();
  if (!usuario) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Proteger página (usar en páginas que requieren login)
function protegerPagina() {
  if (!verificarSesion()) {
    return false;
  }
  return true;
}

// Obtener ID del usuario actual
function obtenerIdUsuarioActual() {
  const usuario = obtenerUsuarioActual();
  return usuario ? usuario.id : null;
}

// Actualizar datos del usuario en sesión
function actualizarSesion(nuevosDatos) {
  const usuario = obtenerUsuarioActual();
  if (usuario) {
    const usuarioActualizado = { ...usuario, ...nuevosDatos };
    guardarSesion(usuarioActualizado);
  }
}

// Verificar si el usuario está logueado (para navbar)
function estaLogueado() {
  return obtenerUsuarioActual() !== null;
}

// Obtener datos del usuario desde Firebase por ID
async function obtenerUsuarioPorId(userId) {
  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios/${userId}.json`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
}

// Obtener datos del usuario desde Firebase por correo
async function obtenerUsuarioPorCorreo(correo) {
  try {
    const response = await fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios.json');
    const data = await response.json();
    
    for (const id in data) {
      if (data[id].correo === correo) {
        return { id, ...data[id] };
      }
    }
    return null;
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    return null;
  }
}

// Actualizar datos del usuario en Firebase
async function actualizarUsuarioEnFirebase(userId, datos) {
  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios/${userId}.json`, {
      method: 'PATCH',
      body: JSON.stringify(datos)
    });
    
    if (response.ok) {
      // Actualizar también la sesión local
      actualizarSesion(datos);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return false;
  }
}

// Inicializar navbar con datos del usuario
function inicializarNavbar() {
  const usuario = obtenerUsuarioActual();
  if (usuario) {
    // Actualizar foto de perfil en navbar si existe
    const navAvatar = document.querySelector('.nav-item.profile-nav img');
    if (navAvatar && usuario.foto) {
      navAvatar.src = usuario.foto;
    }
    
    // Actualizar nombre si existe
    const navNombre = document.querySelector('.nav-item.profile-nav .nav-name');
    if (navNombre && usuario.nombre) {
      navNombre.textContent = usuario.nombre;
    }
  }
}

/* Utilidad: renderizar nombre con badge de verificado o CEO */
function renderNombreConBadge(nombre, usuario) {
  try {
    const isPremium = esPremiumSync(usuario);
    const isVerificado = estaVerificado(usuario);
    const isCEO = esCEO(usuario);
    
    // Si es Premium, aplicar color verde al nombre
    const nombreHTML = isPremium 
      ? `<span style="color: #00C853; font-weight: 600;">${nombre}</span>`
      : nombre;
    
    // Construir badges
    let badges = '';
    
    // Badge de verificado (si aplica)
    if (isVerificado || isCEO) {
      badges += ' <img src="../../assets/images/verificado.png" alt="Verificado" class="verified-badge" style="width: 18px; height: 18px; vertical-align: middle;" />';
    }
    
    // Badge Premium (si aplica)
    if (isPremium) {
      badges += ' <span class="premium-badge" style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; margin-left: 6px; vertical-align: middle;">💎</span>';
    }
    
    return nombreHTML + badges;
  } catch (e) {
    console.error('Error en renderNombreConBadge:', e);
    return nombre;
  }
}

/* Utilidad: obtener clase CSS para nombre según tipo de usuario */
function getNombreClase(usuario) {
  if (esPremiumSync(usuario)) {
    return 'nombre-premium'; // Verde
  }
  if (esCEO(usuario)) {
    return 'nombre-ceo'; // Puede ser dorado o especial
  }
  return 'nombre-normal';
}

/* Utilidad: aplicar estilo Premium a elemento de nombre */
function aplicarEstiloPremium(elemento, usuario) {
  if (!elemento) return;
  
  if (esPremiumSync(usuario)) {
    elemento.style.color = '#00C853';
    elemento.style.fontWeight = '600';
    elemento.classList.add('premium-user');
  }
}

/* Cache simple de usuarios por ID */
async function getUsuarioPorIdCacheado(userId, forzarRecarga = false) {
  try {
    if (!userId) return null;
    window._usuarioCache = window._usuarioCache || {};
    
    // Si se fuerza la recarga, eliminar del caché
    if (forzarRecarga && window._usuarioCache[userId]) {
      delete window._usuarioCache[userId];
    }
    
    if (window._usuarioCache[userId]) {
      return window._usuarioCache[userId];
    }
    const data = await obtenerUsuarioPorId(userId);
    if (data) {
      // Verificar si es Premium (con manejo de errores silencioso)
      let isPremium = false;
      try {
        isPremium = await esPremium(userId);
      } catch (e) {
        // Si falla, usar el valor del usuario si existe
        isPremium = data.isPremium === true;
      }
      const usuario = { id: userId, ...data, isPremium };
      window._usuarioCache[userId] = usuario;
      return usuario;
    }
    return null;
  } catch (e) {
    // Error silencioso
    return null;
  }
}

/* Limpiar caché de un usuario específico */
function limpiarCacheUsuario(userId) {
  if (window._usuarioCache && window._usuarioCache[userId]) {
    delete window._usuarioCache[userId];
    console.log('🗑️ Caché limpiado para usuario:', userId);
  }
}

/* Limpiar todo el caché de usuarios */
function limpiarTodoCacheUsuarios() {
  window._usuarioCache = {};
  console.log('🗑️ Todo el caché de usuarios ha sido limpiado');
}

/* Cargar estado Premium del usuario actual */
async function cargarEstadoPremium() {
  try {
    const usuario = obtenerUsuarioActual();
    if (!usuario || !usuario.id) {
      console.log('⚠️ No hay usuario actual para verificar Premium');
      return;
    }
    
    console.log('🔍 Verificando estado Premium para:', usuario.nombre, '(ID:', usuario.id, ')');
    
    const isPremium = await esPremium(usuario.id);
    
    console.log('📊 Resultado verificación Premium:', isPremium);
    
    if (isPremium) {
      console.log('✅ Usuario tiene Premium activo - Actualizando sesión');
      // Actualizar sesión con estado Premium
      actualizarSesion({ isPremium: true });
      
      // Aplicar estilos Premium en la página actual
      aplicarEstilosPremiumGlobal();
      
      // Recargar posts si estamos en home para actualizar badges
      if (typeof window.cargarPosts === 'function') {
        console.log('🔄 Recargando posts para mostrar badge Premium');
        setTimeout(() => {
          window.cargarPosts();
        }, 500);
      }
    } else {
      console.log('⚠️ Usuario NO tiene Premium');
      // Asegurar que isPremium esté en false
      actualizarSesion({ isPremium: false });
    }
  } catch (error) {
    console.error('❌ Error al cargar estado Premium:', error);
  }
}

/* Aplicar estilos Premium globalmente */
function aplicarEstilosPremiumGlobal() {
  // Agregar clase al body
  document.body.classList.add('usuario-premium');
  
  // Aplicar estilos a elementos de nombre del usuario
  const nombreElements = document.querySelectorAll('.user-name, .nombre-usuario, .profile-name');
  nombreElements.forEach(el => {
    el.style.color = '#00C853';
    el.style.fontWeight = '600';
  });
  
  // Agregar badge Premium si no existe
  const profileContainers = document.querySelectorAll('.profile-header, .user-info');
  profileContainers.forEach(container => {
    if (!container.querySelector('.premium-badge')) {
      const badge = document.createElement('span');
      badge.className = 'premium-badge';
      badge.innerHTML = '💎 Premium';
      badge.style.cssText = 'background: linear-gradient(135deg, #00C853 0%, #00E676 100%); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; margin-left: 10px;';
      container.appendChild(badge);
    }
  });
}

// Exportar funciones para uso global
window.auth = {
  guardarSesion,
  obtenerUsuarioActual,
  cerrarSesion,
  verificarSesion,
  protegerPagina,
  obtenerIdUsuarioActual,
  actualizarSesion,
  estaLogueado,
  obtenerUsuarioPorId,
  obtenerUsuarioPorCorreo,
  actualizarUsuarioEnFirebase,
  inicializarNavbar,
  esCEO,
  estaVerificado,
  esPremium,
  esPremiumSync,
  estaBloqueado,
  bloquearUsuario,
  desbloquearUsuario,
  verificarUsuario,
  obtenerTodosLosUsuarios,
  renderNombreConBadge,
  getNombreClase,
  aplicarEstiloPremium,
  getUsuarioPorIdCacheado,
  limpiarCacheUsuario,
  limpiarTodoCacheUsuarios,
  cargarEstadoPremium,
  aplicarEstilosPremiumGlobal
};

// Cargar estado Premium al iniciar
if (typeof firebase !== 'undefined' && firebase.auth) {
  try {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        cargarEstadoPremium();
      }
    });
  } catch (error) {
    console.log('Firebase Auth no disponible en este contexto');
  }
}
