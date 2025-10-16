// ========== PLACEHOLDER AVATAR - SOLUCIÓN LOCAL ==========
// Reemplaza via.placeholder.com con imágenes generadas localmente

/**
 * Genera un avatar placeholder con las iniciales del usuario
 * @param {string} nombre - Nombre del usuario
 * @param {number} size - Tamaño del avatar (32, 40, 48, 70, 150)
 * @returns {string} Data URI del avatar generado
 */
function generarAvatarPlaceholder(nombre = 'U', size = 48) {
  // Crear canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Obtener iniciales
  const iniciales = obtenerIniciales(nombre);
  
  // Color de fondo basado en el nombre (consistente)
  const color = obtenerColorPorNombre(nombre);
  
  // Dibujar círculo de fondo
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Dibujar iniciales
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.4}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(iniciales, size / 2, size / 2);
  
  // Convertir a data URI
  return canvas.toDataURL('image/png');
}

/**
 * Obtiene las iniciales de un nombre
 * @param {string} nombre - Nombre completo
 * @returns {string} Iniciales (máximo 2 caracteres)
 */
function obtenerIniciales(nombre) {
  if (!nombre || nombre === 'U') return 'U';
  
  const palabras = nombre.trim().split(' ').filter(p => p.length > 0);
  
  if (palabras.length === 0) return 'U';
  if (palabras.length === 1) return palabras[0].charAt(0).toUpperCase();
  
  // Primera letra del primer nombre y primera letra del apellido
  return (palabras[0].charAt(0) + palabras[palabras.length - 1].charAt(0)).toUpperCase();
}

/**
 * Genera un color consistente basado en el nombre
 * @param {string} nombre - Nombre del usuario
 * @returns {string} Color en formato hex
 */
function obtenerColorPorNombre(nombre) {
  const colores = [
    '#0a66c2', // Azul LinkedIn
    '#10b981', // Verde
    '#f59e0b', // Naranja
    '#ef4444', // Rojo
    '#8b5cf6', // Púrpura
    '#ec4899', // Rosa
    '#06b6d4', // Cyan
    '#84cc16', // Lima
  ];
  
  // Generar índice basado en el nombre
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colores.length;
  return colores[index];
}

/**
 * Obtiene la URL del avatar del usuario o genera un placeholder
 * @param {object} usuario - Objeto usuario con foto y nombre
 * @param {number} size - Tamaño del avatar
 * @returns {string} URL del avatar o data URI del placeholder
 */
function obtenerAvatar(usuario, size = 48) {
  if (usuario && usuario.foto && usuario.foto.trim() !== '') {
    return usuario.foto;
  }
  
  const nombre = usuario ? usuario.nombre : 'Usuario';
  return generarAvatarPlaceholder(nombre, size);
}

/**
 * Placeholder simple sin iniciales (para casos donde no hay usuario)
 * @param {number} size - Tamaño del avatar
 * @returns {string} Data URI del avatar genérico
 */
function avatarGenerico(size = 48) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Fondo gris
  ctx.fillStyle = '#e5e7eb';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Icono de usuario simple
  ctx.fillStyle = '#9ca3af';
  
  // Cabeza
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.35, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  
  // Cuerpo
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.75, size * 0.25, 0, Math.PI, true);
  ctx.fill();
  
  return canvas.toDataURL('image/png');
}

// Exponer funciones globalmente
if (typeof window !== 'undefined') {
  window.generarAvatarPlaceholder = generarAvatarPlaceholder;
  window.obtenerAvatar = obtenerAvatar;
  window.avatarGenerico = avatarGenerico;
  
  console.log('✅ [PLACEHOLDER] Sistema de avatares placeholder cargado');
}
