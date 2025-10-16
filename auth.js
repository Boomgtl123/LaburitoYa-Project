// ========== GESTIÓN DE SESIÓN Y AUTENTICACIÓN ==========

// ========== GESTIÓN DE ROLES Y PERMISOS ==========

// Verificar si el usuario es CEO
function esCEO(usuario) {
  return usuario && usuario.correo === 'laburitoya@gmail.com';
}

// Verificar si el usuario está verificado
function estaVerificado(usuario) {
  return usuario && usuario.verificado === true;
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
  window.location.href = 'index.html';
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
    const mostrarBadge = estaVerificado(usuario) || esCEO(usuario);
    return `${nombre}${mostrarBadge ? ' <img src="verificado.png" alt="Verificado" class="verified-badge" />' : ''}`;
  } catch (e) {
    return nombre;
  }
}

/* Cache simple de usuarios por ID */
async function getUsuarioPorIdCacheado(userId) {
  try {
    if (!userId) return null;
    window._usuarioCache = window._usuarioCache || {};
    if (window._usuarioCache[userId]) {
      return window._usuarioCache[userId];
    }
    const data = await obtenerUsuarioPorId(userId);
    if (data) {
      const usuario = { id: userId, ...data };
      window._usuarioCache[userId] = usuario;
      return usuario;
    }
    return null;
  } catch (e) {
    console.error('Error en getUsuarioPorIdCacheado:', e);
    return null;
  }
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
  estaBloqueado,
  bloquearUsuario,
  desbloquearUsuario,
  verificarUsuario,
  obtenerTodosLosUsuarios,
  renderNombreConBadge,
  getUsuarioPorIdCacheado
};
