// ========== GESTIÓN DE SESIÓN Y AUTENTICACIÓN ==========

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
  inicializarNavbar
};
