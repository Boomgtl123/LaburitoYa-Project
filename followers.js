// ========== MÓDULO DE SEGUIDORES ==========

const FIREBASE_URL = "https://laburitoya-6e55d-default-rtdb.firebaseio.com";

// ========== SEGUIR USUARIO ==========
async function seguirUsuario(userIdASeguir) {
  const usuarioActual = auth.obtenerUsuarioActual();
  if (!usuarioActual) return false;
  
  const miId = usuarioActual.id;
  
  if (miId === userIdASeguir) {
    console.log('No puedes seguirte a ti mismo');
    return false;
  }
  
  try {
    // Obtener datos actuales de seguidores
    const [misSeguidos, susSeguidores] = await Promise.all([
      obtenerSeguidos(miId),
      obtenerSeguidores(userIdASeguir)
    ]);
    
    // Verificar si ya lo sigo
    if (misSeguidos.includes(userIdASeguir)) {
      console.log('Ya sigues a este usuario');
      return false;
    }
    
    // Agregar a mi lista de seguidos
    misSeguidos.push(userIdASeguir);
    
    // Agregar a su lista de seguidores
    susSeguidores.push(miId);
    
    // Actualizar en Firebase
    await Promise.all([
      fetch(`${FIREBASE_URL}/followers/${miId}/following.json`, {
        method: 'PUT',
        body: JSON.stringify(misSeguidos)
      }),
      fetch(`${FIREBASE_URL}/followers/${userIdASeguir}/followers.json`, {
        method: 'PUT',
        body: JSON.stringify(susSeguidores)
      })
    ]);
    
    console.log('Usuario seguido exitosamente');
    return true;
    
  } catch (error) {
    console.error('Error al seguir usuario:', error);
    return false;
  }
}

// ========== DEJAR DE SEGUIR USUARIO ==========
async function dejarDeSeguir(userIdADejarDeSeguir) {
  const usuarioActual = auth.obtenerUsuarioActual();
  if (!usuarioActual) return false;
  
  const miId = usuarioActual.id;
  
  try {
    // Obtener datos actuales de seguidores
    const [misSeguidos, susSeguidores] = await Promise.all([
      obtenerSeguidos(miId),
      obtenerSeguidores(userIdADejarDeSeguir)
    ]);
    
    // Verificar si lo sigo
    if (!misSeguidos.includes(userIdADejarDeSeguir)) {
      console.log('No sigues a este usuario');
      return false;
    }
    
    // Remover de mi lista de seguidos
    const nuevosSeguidos = misSeguidos.filter(id => id !== userIdADejarDeSeguir);
    
    // Remover de su lista de seguidores
    const nuevosSeguidores = susSeguidores.filter(id => id !== miId);
    
    // Actualizar en Firebase
    await Promise.all([
      fetch(`${FIREBASE_URL}/followers/${miId}/following.json`, {
        method: 'PUT',
        body: JSON.stringify(nuevosSeguidos)
      }),
      fetch(`${FIREBASE_URL}/followers/${userIdADejarDeSeguir}/followers.json`, {
        method: 'PUT',
        body: JSON.stringify(nuevosSeguidores)
      })
    ]);
    
    console.log('Dejaste de seguir al usuario');
    return true;
    
  } catch (error) {
    console.error('Error al dejar de seguir usuario:', error);
    return false;
  }
}

// ========== OBTENER SEGUIDORES DE UN USUARIO ==========
async function obtenerSeguidores(userId) {
  try {
    const response = await fetch(`${FIREBASE_URL}/followers/${userId}/followers.json`);
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error al obtener seguidores:', error);
    return [];
  }
}

// ========== OBTENER SEGUIDOS DE UN USUARIO ==========
async function obtenerSeguidos(userId) {
  try {
    const response = await fetch(`${FIREBASE_URL}/followers/${userId}/following.json`);
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error al obtener seguidos:', error);
    return [];
  }
}

// ========== VERIFICAR SI SIGO A UN USUARIO ==========
async function estaSiguiendo(userId) {
  const usuarioActual = auth.obtenerUsuarioActual();
  if (!usuarioActual) return false;
  
  const misSeguidos = await obtenerSeguidos(usuarioActual.id);
  return misSeguidos.includes(userId);
}

// ========== OBTENER CONTADORES ==========
async function obtenerContadores(userId) {
  try {
    const [seguidores, seguidos] = await Promise.all([
      obtenerSeguidores(userId),
      obtenerSeguidos(userId)
    ]);
    
    return {
      seguidores: seguidores.length,
      seguidos: seguidos.length
    };
  } catch (error) {
    console.error('Error al obtener contadores:', error);
    return { seguidores: 0, seguidos: 0 };
  }
}

// ========== OBTENER DATOS DE USUARIOS ==========
async function obtenerDatosUsuarios(userIds) {
  if (!userIds || userIds.length === 0) return [];
  
  try {
    const response = await fetch(`${FIREBASE_URL}/users.json`);
    const todosLosUsuarios = await response.json();
    
    if (!todosLosUsuarios) return [];
    
    const usuarios = [];
    for (const id in todosLosUsuarios) {
      if (userIds.includes(id)) {
        usuarios.push({
          id,
          ...todosLosUsuarios[id]
        });
      }
    }
    
    return usuarios;
  } catch (error) {
    console.error('Error al obtener datos de usuarios:', error);
    return [];
  }
}

// ========== TOGGLE SEGUIR/DEJAR DE SEGUIR ==========
async function toggleSeguir(userId) {
  const siguiendo = await estaSiguiendo(userId);
  
  if (siguiendo) {
    return await dejarDeSeguir(userId);
  } else {
    return await seguirUsuario(userId);
  }
}

// Exportar funciones
window.followers = {
  seguirUsuario,
  dejarDeSeguir,
  obtenerSeguidores,
  obtenerSeguidos,
  estaSiguiendo,
  obtenerContadores,
  obtenerDatosUsuarios,
  toggleSeguir
};

console.log('✅ followers.js cargado correctamente');
