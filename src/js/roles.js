// ========== SISTEMA DE ROLES Y PERMISOS ==========

// Definición de roles y sus permisos
const ROLES = {
  CEO: {
    nombre: 'CEO',
    descripcion: 'Control total del sistema',
    permisos: ['*'], // Todos los permisos
    color: '#FFD700',
    icono: '👑'
  },
  MODERADOR: {
    nombre: 'Moderador',
    descripcion: 'Gestión de usuarios y contenido',
    permisos: [
      'bannear_usuarios',
      'desbloquear_usuarios',
      'eliminar_posts',
      'eliminar_comentarios',
      'ver_reportes'
    ],
    color: '#FF6B6B',
    icono: '🛡️'
  },
  GESTOR_ANUNCIOS: {
    nombre: 'Gestor de Anuncios',
    descripcion: 'Crear y gestionar anuncios',
    permisos: [
      'crear_anuncios',
      'editar_anuncios',
      'eliminar_anuncios',
      'ver_estadisticas_anuncios'
    ],
    color: '#4ECDC4',
    icono: '📢'
  },
  VERIFICADOR: {
    nombre: 'Verificador',
    descripcion: 'Gestionar verificaciones de usuarios',
    permisos: [
      'verificar_usuarios',
      'quitar_verificacion',
      'ver_solicitudes_verificacion'
    ],
    color: '#0A66C2',
    icono: '✓'
  },
  SOPORTE: {
    nombre: 'Soporte',
    descripcion: 'Atención al usuario',
    permisos: [
      'ver_tickets',
      'responder_tickets',
      'cerrar_tickets',
      'ver_usuarios'
    ],
    color: '#95E1D3',
    icono: '💬'
  },
  ANALISTA: {
    nombre: 'Analista',
    descripcion: 'Acceso a estadísticas y reportes',
    permisos: [
      'ver_estadisticas',
      'ver_analytics',
      'exportar_reportes',
      'ver_metricas'
    ],
    color: '#F38181',
    icono: '📊'
  },
  EDITOR_CONTENIDO: {
    nombre: 'Editor de Contenido',
    descripcion: 'Gestionar contenido destacado',
    permisos: [
      'destacar_posts',
      'quitar_destacado',
      'editar_contenido',
      'moderar_contenido'
    ],
    color: '#AA96DA',
    icono: '✨'
  },
  GESTOR_EMPLEOS: {
    nombre: 'Gestor de Empleos',
    descripcion: 'Gestionar ofertas de empleo',
    permisos: [
      'destacar_empleos',
      'quitar_destacado_empleo',
      'moderar_empleos',
      'ver_estadisticas_empleos'
    ],
    color: '#FCBAD3',
    icono: '💼'
  },
  COMMUNITY_MANAGER: {
    nombre: 'Community Manager',
    descripcion: 'Gestionar comunidad y eventos',
    permisos: [
      'crear_eventos',
      'enviar_notificaciones',
      'gestionar_comunidad',
      'crear_encuestas'
    ],
    color: '#FFFFD2',
    icono: '🎉'
  },
  INSPECTOR_CALIDAD: {
    nombre: 'Inspector de Calidad',
    descripcion: 'Revisar y aprobar perfiles',
    permisos: [
      'revisar_perfiles',
      'aprobar_perfiles',
      'rechazar_perfiles',
      'solicitar_cambios'
    ],
    color: '#A8D8EA',
    icono: '🔍'
  },
  SUSCRIPCIONES: {
    nombre: 'Gestor de Suscripciones',
    descripcion: 'Gestionar planes, pagos y usuarios Premium',
    permisos: [
      'gestionar_planes',
      'ver_suscriptores',
      'ver_metricas_suscripciones',
      'gestionar_pagos',
      'ver_logs_suscripciones',
      'asignar_premium_manual',
      'cancelar_suscripciones',
      'ver_reportes_ingresos',
      'gestionar_webhooks'
    ],
    color: '#9B59B6',
    icono: '💎'
  }
};

// ========== FUNCIONES DE GESTIÓN DE ROLES ==========

// Obtener rol de un usuario
async function obtenerRolUsuario(userId) {
  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios/${userId}/rol.json`);
    const rol = await response.json();
    return rol || null;
  } catch (error) {
    console.error('Error al obtener rol:', error);
    return null;
  }
}

// Asignar rol a usuario (solo CEO)
async function asignarRol(userId, rolNombre) {
  const usuarioActual = window.auth ? window.auth.obtenerUsuarioActual() : null;
  
  if (!usuarioActual || !window.auth.esCEO(usuarioActual)) {
    console.error('Solo el CEO puede asignar roles');
    return false;
  }

  if (!ROLES[rolNombre]) {
    console.error('Rol no válido:', rolNombre);
    return false;
  }

  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios/${userId}/rol.json`, {
      method: 'PUT',
      body: JSON.stringify(rolNombre)
    });

    if (response.ok) {
      // Registrar en logs
      await registrarAccion('asignar_rol', {
        usuarioId: userId,
        rol: rolNombre,
        asignadoPor: usuarioActual.id
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al asignar rol:', error);
    return false;
  }
}

// Quitar rol de usuario (solo CEO)
async function quitarRol(userId) {
  const usuarioActual = window.auth ? window.auth.obtenerUsuarioActual() : null;
  
  if (!usuarioActual || !window.auth.esCEO(usuarioActual)) {
    console.error('Solo el CEO puede quitar roles');
    return false;
  }

  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios/${userId}/rol.json`, {
      method: 'DELETE'
    });

    if (response.ok) {
      await registrarAccion('quitar_rol', {
        usuarioId: userId,
        quitadoPor: usuarioActual.id
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al quitar rol:', error);
    return false;
  }
}

// Verificar si usuario tiene un permiso específico
async function tienePermiso(userId, permiso) {
  try {
    // CEO tiene todos los permisos
    const usuario = await window.auth.obtenerUsuarioPorId(userId);
    if (window.auth.esCEO(usuario)) {
      return true;
    }

    const rol = await obtenerRolUsuario(userId);
    if (!rol || !ROLES[rol]) {
      return false;
    }

    const permisos = ROLES[rol].permisos;
    return permisos.includes('*') || permisos.includes(permiso);
  } catch (error) {
    console.error('Error al verificar permiso:', error);
    return false;
  }
}

// Verificar si usuario tiene algún rol administrativo
async function esAdmin(userId) {
  try {
    const usuario = await window.auth.obtenerUsuarioPorId(userId);
    if (window.auth.esCEO(usuario)) {
      return true;
    }

    const rol = await obtenerRolUsuario(userId);
    return rol !== null && ROLES[rol] !== undefined;
  } catch (error) {
    console.error('Error al verificar admin:', error);
    return false;
  }
}

// Obtener todos los usuarios con roles
async function obtenerUsuariosConRoles() {
  const usuarioActual = window.auth ? window.auth.obtenerUsuarioActual() : null;
  
  if (!usuarioActual || !window.auth.esCEO(usuarioActual)) {
    return [];
  }

  try {
    const response = await fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios.json');
    const data = await response.json();
    
    if (!data) return [];

    const usuariosConRoles = [];
    for (const [id, usuario] of Object.entries(data)) {
      if (usuario.rol || window.auth.esCEO(usuario)) {
        usuariosConRoles.push({
          id,
          ...usuario,
          rolInfo: usuario.rol ? ROLES[usuario.rol] : ROLES.CEO
        });
      }
    }

    return usuariosConRoles;
  } catch (error) {
    console.error('Error al obtener usuarios con roles:', error);
    return [];
  }
}

// ========== SISTEMA DE ANUNCIOS ==========

// Crear anuncio (requiere permiso)
async function crearAnuncio(anuncio) {
  const usuarioActual = window.auth ? window.auth.obtenerUsuarioActual() : null;
  
  if (!usuarioActual) {
    console.error('No hay usuario autenticado');
    return { success: false, error: 'No hay usuario autenticado' };
  }

  // Verificar permisos
  const puedeCrear = await tienePermiso(usuarioActual.id, 'crear_anuncios');
  if (!puedeCrear) {
    console.error('Usuario sin permisos para crear anuncios');
    return { success: false, error: 'No tienes permisos para crear anuncios' };
  }

  // Validar datos del anuncio
  if (!anuncio.titulo || !anuncio.contenido || !anuncio.tipo) {
    console.error('Datos del anuncio incompletos');
    return { success: false, error: 'Datos del anuncio incompletos' };
  }

  try {
    const nuevoAnuncio = {
      ...anuncio,
      creadoPor: usuarioActual.id,
      creadoPorNombre: usuarioActual.nombre,
      fechaCreacion: new Date().toISOString(),
      activo: true
    };

    console.log('Creando anuncio:', { titulo: nuevoAnuncio.titulo, tipo: nuevoAnuncio.tipo });

    const response = await fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/anuncios.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevoAnuncio)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en respuesta de Firebase:', response.status, errorText);
      return { success: false, error: `Error del servidor: ${response.status}` };
    }

    const data = await response.json();
    
    if (!data || !data.name) {
      console.error('Respuesta de Firebase sin ID');
      return { success: false, error: 'Error al obtener ID del anuncio' };
    }

    console.log('Anuncio creado exitosamente:', data.name);

    // Registrar acción
    await registrarAccion('crear_anuncio', {
      anuncioId: data.name,
      titulo: anuncio.titulo
    });
    
    return { success: true, id: data.name };
  } catch (error) {
    console.error('Error al crear anuncio:', error);
    return { success: false, error: `Error de conexión: ${error.message}` };
  }
}

// Obtener anuncios activos
async function obtenerAnunciosActivos() {
  try {
    const response = await fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/anuncios.json');
    const data = await response.json();
    
    if (!data) return [];

    return Object.entries(data)
      .filter(([_, anuncio]) => anuncio.activo)
      .map(([id, anuncio]) => ({ id, ...anuncio }))
      .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
  } catch (error) {
    console.error('Error al obtener anuncios:', error);
    return [];
  }
}

// Editar anuncio
async function editarAnuncio(anuncioId, cambios) {
  const usuarioActual = window.auth ? window.auth.obtenerUsuarioActual() : null;
  
  if (!usuarioActual) {
    console.error('No hay usuario autenticado');
    return { success: false, error: 'No hay usuario autenticado' };
  }

  const puedeEditar = await tienePermiso(usuarioActual.id, 'editar_anuncios');
  if (!puedeEditar) {
    console.error('Usuario sin permisos para editar anuncios');
    return { success: false, error: 'No tienes permisos para editar anuncios' };
  }

  if (!anuncioId) {
    console.error('ID de anuncio no proporcionado');
    return { success: false, error: 'ID de anuncio no válido' };
  }

  try {
    console.log('Editando anuncio:', anuncioId);

    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/anuncios/${anuncioId}.json`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...cambios,
        editadoPor: usuarioActual.id,
        fechaEdicion: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en respuesta de Firebase:', response.status, errorText);
      return { success: false, error: `Error del servidor: ${response.status}` };
    }

    console.log('Anuncio editado exitosamente');

    await registrarAccion('editar_anuncio', { anuncioId });
    return { success: true };
  } catch (error) {
    console.error('Error al editar anuncio:', error);
    return { success: false, error: `Error de conexión: ${error.message}` };
  }
}

// Eliminar anuncio
async function eliminarAnuncio(anuncioId) {
  const usuarioActual = window.auth ? window.auth.obtenerUsuarioActual() : null;
  
  if (!usuarioActual) {
    return { success: false, error: 'No hay usuario autenticado' };
  }

  const puedeEliminar = await tienePermiso(usuarioActual.id, 'eliminar_anuncios');
  if (!puedeEliminar) {
    return { success: false, error: 'No tienes permisos para eliminar anuncios' };
  }

  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/anuncios/${anuncioId}.json`, {
      method: 'DELETE'
    });

    if (response.ok) {
      await registrarAccion('eliminar_anuncio', { anuncioId });
      return { success: true };
    }
    return { success: false, error: 'Error al eliminar anuncio' };
  } catch (error) {
    console.error('Error al eliminar anuncio:', error);
    return { success: false, error: error.message };
  }
}

// ========== SISTEMA DE LOGS ==========

// Registrar acción administrativa
async function registrarAccion(tipo, datos) {
  const usuarioActual = window.auth ? window.auth.obtenerUsuarioActual() : null;
  
  if (!usuarioActual) return;

  try {
    const log = {
      tipo,
      usuarioId: usuarioActual.id,
      usuarioNombre: usuarioActual.nombre,
      fecha: new Date().toISOString(),
      datos
    };

    await fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/logs.json', {
      method: 'POST',
      body: JSON.stringify(log)
    });
  } catch (error) {
    console.error('Error al registrar acción:', error);
  }
}

// Obtener logs (solo CEO y Analista)
async function obtenerLogs(limite = 100) {
  const usuarioActual = window.auth ? window.auth.obtenerUsuarioActual() : null;
  
  if (!usuarioActual) return [];

  const puedeVer = window.auth.esCEO(usuarioActual) || await tienePermiso(usuarioActual.id, 'ver_estadisticas');
  if (!puedeVer) return [];

  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/logs.json?orderBy="$key"&limitToLast=${limite}`);
    const data = await response.json();
    
    if (!data) return [];

    return Object.entries(data)
      .map(([id, log]) => ({ id, ...log }))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  } catch (error) {
    console.error('Error al obtener logs:', error);
    return [];
  }
}

// ========== ESTADÍSTICAS ==========

// Obtener estadísticas generales
async function obtenerEstadisticas() {
  const usuarioActual = window.auth ? window.auth.obtenerUsuarioActual() : null;
  
  if (!usuarioActual) return null;

  const puedeVer = await tienePermiso(usuarioActual.id, 'ver_estadisticas');
  if (!puedeVer) return null;

  try {
    // Obtener usuarios
    const usuariosRes = await fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios.json');
    const usuarios = await usuariosRes.json();
    const totalUsuarios = usuarios ? Object.keys(usuarios).length : 0;
    const usuariosVerificados = usuarios ? Object.values(usuarios).filter(u => u.verificado).length : 0;

    // Obtener posts
    const postsRes = await fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json');
    const posts = await postsRes.json();
    const totalPosts = posts ? Object.keys(posts).length : 0;

    // Calcular posts de hoy
    const hoy = new Date().toDateString();
    const postsHoy = posts ? Object.values(posts).filter(p => {
      const fechaPost = new Date(p.fecha).toDateString();
      return fechaPost === hoy;
    }).length : 0;

    // Obtener anuncios
    const anunciosRes = await fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/anuncios.json');
    const anuncios = await anunciosRes.json();
    const totalAnuncios = anuncios ? Object.keys(anuncios).length : 0;
    const anunciosActivos = anuncios ? Object.values(anuncios).filter(a => a.activo).length : 0;

    return {
      usuarios: {
        total: totalUsuarios,
        verificados: usuariosVerificados,
        sinVerificar: totalUsuarios - usuariosVerificados
      },
      posts: {
        total: totalPosts,
        hoy: postsHoy
      },
      anuncios: {
        total: totalAnuncios,
        activos: anunciosActivos
      }
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return null;
  }
}

// ========== EXPORTAR FUNCIONES ==========

window.roles = {
  ROLES,
  obtenerRolUsuario,
  asignarRol,
  quitarRol,
  tienePermiso,
  esAdmin,
  obtenerUsuariosConRoles,
  crearAnuncio,
  obtenerAnunciosActivos,
  editarAnuncio,
  eliminarAnuncio,
  registrarAccion,
  obtenerLogs,
  obtenerEstadisticas
};

console.log('✅ Sistema de roles cargado correctamente');
