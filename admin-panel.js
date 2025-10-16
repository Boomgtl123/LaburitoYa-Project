// ========== VARIABLES GLOBALES ==========
let usuarioActual = null;
let rolActual = null;
let usuarioSeleccionado = null;
let anuncioEditando = null;

const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e0e0e0" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="40"%3E👤%3C/text%3E%3C/svg%3E';

// ========== INICIALIZACIÓN ==========
window.addEventListener('DOMContentLoaded', async function() {
  // Verificar sesión
  if (!auth.protegerPagina()) {
    return;
  }

  usuarioActual = auth.obtenerUsuarioActual();
  
  // Verificar si tiene permisos de administrador
  const esAdmin = await roles.esAdmin(usuarioActual.id);
  if (!esAdmin) {
    alert('No tienes permisos para acceder al panel de administración');
    window.location.href = 'home.html';
    return;
  }

  // Obtener rol del usuario
  rolActual = await roles.obtenerRolUsuario(usuarioActual.id);
  
  await inicializarPanel();
});

// ========== INICIALIZAR PANEL ==========
async function inicializarPanel() {
  // Actualizar información del usuario en navbar
  const navAvatar = document.getElementById('navAvatar');
  const navUserName = document.getElementById('navUserName');
  const navUserRole = document.getElementById('navUserRole');

  if (navAvatar) navAvatar.src = usuarioActual.foto || DEFAULT_AVATAR;
  if (navUserName) navUserName.textContent = usuarioActual.nombre;
  
  if (navUserRole) {
    if (auth.esCEO(usuarioActual)) {
      navUserRole.textContent = '👑 CEO';
      navUserRole.style.color = '#FFD700';
    } else if (rolActual && roles.ROLES[rolActual]) {
      const rolInfo = roles.ROLES[rolActual];
      navUserRole.textContent = `${rolInfo.icono} ${rolInfo.nombre}`;
      navUserRole.style.color = rolInfo.color;
    }
  }

  // Configurar menú lateral según permisos
  await configurarMenuLateral();

  // Configurar navegación
  configurarNavegacion();

  // Cargar dashboard inicial
  await cargarDashboard();

  // Configurar event listeners
  configurarEventListeners();
}

// ========== CONFIGURAR MENÚ LATERAL ==========
async function configurarMenuLateral() {
  const menuItems = document.querySelectorAll('.menu-item');
  
  for (const item of menuItems) {
    const permission = item.getAttribute('data-permission');
    
    // Dashboard siempre visible
    if (!permission) {
      continue;
    }

    // CEO tiene acceso a todo
    if (auth.esCEO(usuarioActual)) {
      continue;
    }

    // Verificar permisos
    const permisos = permission.split(',');
    let tieneAcceso = false;

    for (const permiso of permisos) {
      if (await roles.tienePermiso(usuarioActual.id, permiso.trim())) {
        tieneAcceso = true;
        break;
      }
    }

    if (!tieneAcceso) {
      item.style.display = 'none';
    }
  }
}

// ========== CONFIGURAR NAVEGACIÓN ==========
function configurarNavegacion() {
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach(item => {
    item.addEventListener('click', async function() {
      if (this.style.display === 'none') return;

      // Remover active de todos
      menuItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');

      // Ocultar todas las secciones
      document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
      });

      // Mostrar sección seleccionada
      const section = this.getAttribute('data-section');
      const sectionElement = document.getElementById(`section-${section}`);
      if (sectionElement) {
        sectionElement.classList.add('active');
        await cargarSeccion(section);
      }
    });
  });
}

// ========== CONFIGURAR EVENT LISTENERS ==========
function configurarEventListeners() {
  // Botón nuevo anuncio
  const btnNuevoAnuncio = document.getElementById('btnNuevoAnuncio');
  if (btnNuevoAnuncio) {
    btnNuevoAnuncio.addEventListener('click', abrirModalAnuncio);
  }

  // Formulario de anuncio
  const formAnuncio = document.getElementById('formAnuncio');
  if (formAnuncio) {
    formAnuncio.addEventListener('submit', guardarAnuncio);
  }

  // Búsqueda de usuarios
  const searchUsuarios = document.getElementById('searchUsuarios');
  if (searchUsuarios) {
    searchUsuarios.addEventListener('input', filtrarUsuarios);
  }

  // Botón asignar roles (solo CEO)
  const btnAsignarRoles = document.getElementById('btnAsignarRoles');
  if (btnAsignarRoles && auth.esCEO(usuarioActual)) {
    btnAsignarRoles.style.display = 'block';
  }

  // Tabs de verificación
  const verificationTabs = document.querySelectorAll('.verification-tabs .tab-btn');
  verificationTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      verificationTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      cargarVerificaciones(this.getAttribute('data-tab'));
    });
  });

  // Tabs de comunidad
  const comunidadTabs = document.querySelectorAll('.comunidad-tabs .tab-btn');
  comunidadTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      comunidadTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      cargarComunidad(this.getAttribute('data-tab'));
    });
  });

  // Filtros
  const filterTickets = document.getElementById('filterTickets');
  if (filterTickets) {
    filterTickets.addEventListener('change', () => cargarSoporte());
  }

  const filterLogs = document.getElementById('filterLogs');
  if (filterLogs) {
    filterLogs.addEventListener('change', () => cargarLogs());
  }

  // Select de rol
  const selectRol = document.getElementById('selectRol');
  if (selectRol) {
    selectRol.addEventListener('change', function() {
      const rolDescripcion = document.getElementById('rolDescripcion');
      const rolSeleccionado = this.value;
      
      if (rolSeleccionado && roles.ROLES[rolSeleccionado]) {
        const rolInfo = roles.ROLES[rolSeleccionado];
        rolDescripcion.innerHTML = `
          <div class="rol-info" style="padding: 15px; background: ${rolInfo.color}20; border-radius: 8px; margin-top: 10px;">
            <h4 style="margin: 0 0 8px 0; color: ${rolInfo.color};">${rolInfo.icono} ${rolInfo.nombre}</h4>
            <p style="margin: 0 0 10px 0; color: #666;">${rolInfo.descripcion}</p>
            <div style="font-size: 13px; color: #888;">
              <strong>Permisos:</strong>
              <ul style="margin: 5px 0 0 20px; padding: 0;">
                ${rolInfo.permisos.map(p => `<li>${p}</li>`).join('')}
              </ul>
            </div>
          </div>
        `;
      } else {
        rolDescripcion.innerHTML = '';
      }
    });
  }
}

// ========== CARGAR SECCIÓN ==========
async function cargarSeccion(section) {
  switch(section) {
    case 'dashboard':
      await cargarDashboard();
      break;
    case 'usuarios':
      await cargarUsuarios();
      break;
    case 'anuncios':
      await cargarAnuncios();
      break;
    case 'verificacion':
      await cargarVerificaciones('pendientes');
      break;
    case 'contenido':
      await cargarContenido();
      break;
    case 'empleos':
      await cargarEmpleos();
      break;
    case 'soporte':
      await cargarSoporte();
      break;
    case 'analytics':
      await cargarAnalytics();
      break;
    case 'comunidad':
      await cargarComunidad('eventos');
      break;
    case 'logs':
      await cargarLogs();
      break;
  }
}

// ========== DASHBOARD ==========
async function cargarDashboard() {
  try {
    const stats = await roles.obtenerEstadisticas();
    
    if (stats) {
      document.getElementById('statTotalUsuarios').textContent = stats.usuarios.total;
      document.getElementById('statUsuariosVerificados').textContent = stats.usuarios.verificados;
      document.getElementById('statTotalPosts').textContent = stats.posts.total;
      document.getElementById('statAnunciosActivos').textContent = stats.anuncios.activos;
    }

    // Cargar actividad reciente
    await cargarActividadReciente();

    // Cargar equipo administrativo
    await cargarEquipoAdmin();

  } catch (error) {
    console.error('Error al cargar dashboard:', error);
  }
}

async function cargarActividadReciente() {
  const container = document.getElementById('actividadReciente');
  
  try {
    const logs = await roles.obtenerLogs(10);
    
    if (logs.length === 0) {
      container.innerHTML = '<p class="empty-state">No hay actividad reciente</p>';
      return;
    }

    container.innerHTML = logs.map(log => `
      <div class="activity-item">
        <div class="activity-icon">${getIconoAccion(log.tipo)}</div>
        <div class="activity-details">
          <p class="activity-text">${log.usuarioNombre} ${getTextoAccion(log.tipo)}</p>
          <span class="activity-time">${formatearTiempo(log.fecha)}</span>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error al cargar actividad:', error);
    container.innerHTML = '<p class="error-state">Error al cargar actividad</p>';
  }
}

async function cargarEquipoAdmin() {
  const container = document.getElementById('equipoAdmin');
  
  try {
    const equipo = await roles.obtenerUsuariosConRoles();
    
    if (equipo.length === 0) {
      container.innerHTML = '<p class="empty-state">No hay miembros del equipo</p>';
      return;
    }

    container.innerHTML = equipo.map(usuario => `
      <div class="team-member">
        <img src="${usuario.foto || DEFAULT_AVATAR}" alt="${usuario.nombre}" class="team-avatar" />
        <div class="team-info">
          <p class="team-name">${usuario.nombre}</p>
          <span class="team-role" style="color: ${usuario.rolInfo.color};">
            ${usuario.rolInfo.icono} ${usuario.rolInfo.nombre}
          </span>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error al cargar equipo:', error);
    container.innerHTML = '<p class="error-state">Error al cargar equipo</p>';
  }
}

// ========== USUARIOS ==========
async function cargarUsuarios() {
  const tbody = document.getElementById('usuariosTableBody');
  
  try {
    const usuarios = await auth.obtenerTodosLosUsuarios();
    
    if (usuarios.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay usuarios</td></tr>';
      return;
    }

    // Verificar permisos una vez
    const puedeBloquear = await roles.tienePermiso(usuarioActual.id, 'bannear_usuarios');
    const puedeVerificar = await roles.tienePermiso(usuarioActual.id, 'verificar_usuarios');
    const esCEOActual = auth.esCEO(usuarioActual);

    tbody.innerHTML = usuarios.map(usuario => {
      const bloqueado = auth.estaBloqueado(usuario.id);
      const verificado = auth.estaVerificado(usuario);
      const esCEO = auth.esCEO(usuario);
      
      return `
        <tr data-user-id="${usuario.id}">
          <td>
            <div class="user-cell">
              <img src="${usuario.foto || DEFAULT_AVATAR}" alt="${usuario.nombre}" class="table-avatar" />
              <span>${usuario.nombre}${verificado || esCEO ? ' <img src="verificado.png" class="verified-badge" />' : ''}</span>
            </div>
          </td>
          <td>${usuario.correo}</td>
          <td>${usuario.perfil || 'N/A'}</td>
          <td>
            <span class="badge ${bloqueado ? 'badge-danger' : 'badge-success'}">
              ${bloqueado ? 'Bloqueado' : 'Activo'}
            </span>
          </td>
          <td>
            ${esCEO ? '<span class="badge badge-gold">👑 CEO</span>' : 
              (usuario.rol ? `<span class="badge" style="background: ${roles.ROLES[usuario.rol].color}20; color: ${roles.ROLES[usuario.rol].color};">${roles.ROLES[usuario.rol].icono} ${roles.ROLES[usuario.rol].nombre}</span>` : 
              '<span class="badge badge-secondary">Sin rol</span>')}
          </td>
          <td>
            <div class="action-buttons">
              ${!esCEO && puedeBloquear ? `
                <button class="btn-action btn-${bloqueado ? 'success' : 'danger'}" onclick="toggleBloqueo('${usuario.id}', ${bloqueado})">
                  ${bloqueado ? '✓ Desbloquear' : '🚫 Bloquear'}
                </button>
              ` : ''}
              ${!esCEO && puedeVerificar ? `
                <button class="btn-action btn-primary" onclick="toggleVerificacion('${usuario.id}', ${verificado})">
                  ${verificado ? '✗ Quitar verificación' : '✓ Verificar'}
                </button>
              ` : ''}
              ${!esCEO && esCEOActual ? `
                <button class="btn-action btn-warning" onclick="abrirModalRol('${usuario.id}', '${usuario.nombre}', '${usuario.rol || ''}')">
                  👑 Asignar Rol
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    tbody.innerHTML = '<tr><td colspan="6" class="error-state">Error al cargar usuarios</td></tr>';
  }
}

function filtrarUsuarios() {
  const searchTerm = document.getElementById('searchUsuarios').value.toLowerCase();
  const rows = document.querySelectorAll('#usuariosTableBody tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

// ========== ANUNCIOS ==========
async function cargarAnuncios() {
  const container = document.getElementById('anunciosList');
  
  try {
    const response = await fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/anuncios.json');
    const data = await response.json();
    
    if (!data || Object.keys(data).length === 0) {
      container.innerHTML = '<p class="empty-state">No hay anuncios creados</p>';
      return;
    }

    const anuncios = Object.entries(data).map(([id, anuncio]) => ({ id, ...anuncio }));
    
    container.innerHTML = anuncios.map(anuncio => {
      // Generar preview de media si existe
      let mediaPreview = '';
      if (anuncio.media) {
        const isVideo = anuncio.media.type && anuncio.media.type.startsWith('video/');
        if (isVideo) {
          mediaPreview = `
            <div style="margin: 10px 0;">
              <video controls style="width: 100%; max-height: 150px; border-radius: 8px; object-fit: cover;">
                <source src="${anuncio.media.data}" type="${anuncio.media.type}">
              </video>
            </div>
          `;
        } else {
          mediaPreview = `
            <div style="margin: 10px 0;">
              <img src="${anuncio.media.data}" alt="${anuncio.titulo}" style="width: 100%; max-height: 150px; border-radius: 8px; object-fit: cover;" />
            </div>
          `;
        }
      }

      return `
        <div class="anuncio-card ${anuncio.activo ? '' : 'inactive'}">
          <div class="anuncio-header">
            <span class="anuncio-tipo ${anuncio.tipo}">${getTipoAnuncioIcon(anuncio.tipo)} ${anuncio.tipo}</span>
            <span class="anuncio-estado ${anuncio.activo ? 'activo' : 'inactivo'}">
              ${anuncio.activo ? '● Activo' : '○ Inactivo'}
            </span>
          </div>
          <h3>${anuncio.titulo}</h3>
          <p>${anuncio.contenido}</p>
          ${mediaPreview}
          <div class="anuncio-footer">
            <span class="anuncio-autor">Por: ${anuncio.creadoPorNombre}</span>
            <span class="anuncio-fecha">${formatearFecha(anuncio.fechaCreacion)}</span>
          </div>
          <div class="anuncio-actions">
            <button class="btn-action btn-primary" onclick="editarAnuncio('${anuncio.id}')">
              ✏️ Editar
            </button>
            <button class="btn-action btn-${anuncio.activo ? 'warning' : 'success'}" onclick="toggleAnuncio('${anuncio.id}', ${anuncio.activo})">
              ${anuncio.activo ? '⏸ Desactivar' : '▶ Activar'}
            </button>
            <button class="btn-action btn-danger" onclick="eliminarAnuncioConfirm('${anuncio.id}')">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Error al cargar anuncios:', error);
    container.innerHTML = '<p class="error-state">Error al cargar anuncios</p>';
  }
}

function abrirModalAnuncio() {
  anuncioEditando = null;
  document.getElementById('modalAnuncioTitle').textContent = 'Crear Anuncio';
  document.getElementById('formAnuncio').reset();
  document.getElementById('previewAnuncioMedia').innerHTML = '';
  document.getElementById('modalAnuncio').style.display = 'flex';
  
  // Event listener para preview de media
  const inputMedia = document.getElementById('anuncioMedia');
  inputMedia.addEventListener('change', previewAnuncioMedia);
}

function cerrarModalAnuncio() {
  document.getElementById('modalAnuncio').style.display = 'none';
  anuncioEditando = null;
  document.getElementById('previewAnuncioMedia').innerHTML = '';
}

function previewAnuncioMedia(e) {
  const file = e.target.files[0];
  const preview = document.getElementById('previewAnuncioMedia');
  
  if (!file) {
    preview.innerHTML = '';
    return;
  }

  // Validar tamaño (10MB máximo)
  if (file.size > 10 * 1024 * 1024) {
    mostrarNotificacion('❌ El archivo es muy grande. Máximo 10MB', 'error');
    e.target.value = '';
    preview.innerHTML = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    const isVideo = file.type.startsWith('video/');
    
    if (isVideo) {
      preview.innerHTML = `
        <video controls style="max-width: 100%; max-height: 200px; border-radius: 8px;">
          <source src="${event.target.result}" type="${file.type}">
        </video>
        <button type="button" onclick="document.getElementById('anuncioMedia').value=''; document.getElementById('previewAnuncioMedia').innerHTML='';" style="margin-top: 5px; padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Eliminar video
        </button>
      `;
    } else {
      preview.innerHTML = `
        <img src="${event.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: contain;" />
        <button type="button" onclick="document.getElementById('anuncioMedia').value=''; document.getElementById('previewAnuncioMedia').innerHTML='';" style="margin-top: 5px; padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Eliminar imagen
        </button>
      `;
    }
  };
  reader.readAsDataURL(file);
}

async function guardarAnuncio(e) {
  e.preventDefault();
  
  const anuncio = {
    titulo: document.getElementById('anuncioTitulo').value,
    contenido: document.getElementById('anuncioContenido').value,
    tipo: document.getElementById('anuncioTipo').value,
    destacado: document.getElementById('anuncioDestacado').checked
  };

  // Procesar imagen/video si existe
  const mediaInput = document.getElementById('anuncioMedia');
  if (mediaInput.files && mediaInput.files[0]) {
    try {
      const file = mediaInput.files[0];
      const reader = new FileReader();
      
      const mediaData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      anuncio.media = {
        data: mediaData,
        type: file.type,
        name: file.name
      };
    } catch (error) {
      console.error('Error al procesar media:', error);
      mostrarNotificacion('❌ Error al procesar imagen/video', 'error');
      return;
    }
  }

  try {
    if (anuncioEditando) {
      const result = await roles.editarAnuncio(anuncioEditando, anuncio);
      if (result.success) {
        mostrarNotificacion('✅ Anuncio actualizado correctamente', 'success');
        cerrarModalAnuncio();
        await cargarAnuncios();
      } else {
        mostrarNotificacion('❌ ' + result.error, 'error');
      }
    } else {
      const result = await roles.crearAnuncio(anuncio);
      if (result.success) {
        mostrarNotificacion('✅ Anuncio creado correctamente', 'success');
        cerrarModalAnuncio();
        await cargarAnuncios();
      } else {
        mostrarNotificacion('❌ ' + result.error, 'error');
      }
    }
  } catch (error) {
    console.error('Error al guardar anuncio:', error);
    mostrarNotificacion('❌ Error al guardar anuncio', 'error');
  }
}

async function editarAnuncio(anuncioId) {
  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/anuncios/${anuncioId}.json`);
    const anuncio = await response.json();
    
    if (anuncio) {
      anuncioEditando = anuncioId;
      document.getElementById('modalAnuncioTitle').textContent = 'Editar Anuncio';
      document.getElementById('anuncioTitulo').value = anuncio.titulo;
      document.getElementById('anuncioContenido').value = anuncio.contenido;
      document.getElementById('anuncioTipo').value = anuncio.tipo;
      document.getElementById('anuncioDestacado').checked = anuncio.destacado || false;
      
      // Mostrar preview de media si existe
      const preview = document.getElementById('previewAnuncioMedia');
      if (anuncio.media) {
        const isVideo = anuncio.media.type.startsWith('video/');
        if (isVideo) {
          preview.innerHTML = `
            <video controls style="max-width: 100%; max-height: 200px; border-radius: 8px;">
              <source src="${anuncio.media.data}" type="${anuncio.media.type}">
            </video>
            <p style="font-size: 12px; color: #666; margin-top: 5px;">Video actual (puedes subir uno nuevo para reemplazarlo)</p>
          `;
        } else {
          preview.innerHTML = `
            <img src="${anuncio.media.data}" style="max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: contain;" />
            <p style="font-size: 12px; color: #666; margin-top: 5px;">Imagen actual (puedes subir una nueva para reemplazarla)</p>
          `;
        }
      }
      
      document.getElementById('modalAnuncio').style.display = 'flex';
      
      // Event listener para preview de media
      const inputMedia = document.getElementById('anuncioMedia');
      inputMedia.addEventListener('change', previewAnuncioMedia);
    }
  } catch (error) {
    console.error('Error al cargar anuncio:', error);
    mostrarNotificacion('❌ Error al cargar anuncio', 'error');
  }
}

async function toggleAnuncio(anuncioId, estadoActual) {
  try {
    const result = await roles.editarAnuncio(anuncioId, { activo: !estadoActual });
    if (result.success) {
      mostrarNotificacion(`✅ Anuncio ${!estadoActual ? 'activado' : 'desactivado'}`, 'success');
      await cargarAnuncios();
    } else {
      mostrarNotificacion('❌ ' + result.error, 'error');
    }
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    mostrarNotificacion('❌ Error al cambiar estado', 'error');
  }
}

async function eliminarAnuncioConfirm(anuncioId) {
  if (!confirm('¿Estás seguro de eliminar este anuncio?')) return;
  
  try {
    const result = await roles.eliminarAnuncio(anuncioId);
    if (result.success) {
      mostrarNotificacion('✅ Anuncio eliminado', 'success');
      await cargarAnuncios();
    } else {
      mostrarNotificacion('❌ ' + result.error, 'error');
    }
  } catch (error) {
    console.error('Error al eliminar anuncio:', error);
    mostrarNotificacion('❌ Error al eliminar anuncio', 'error');
  }
}

// ========== VERIFICACIÓN ==========
async function cargarVerificaciones(tab) {
  const container = document.getElementById('verificacionContent');
  
  try {
    const usuarios = await auth.obtenerTodosLosUsuarios();
    let usuariosFiltrados;

    if (tab === 'pendientes') {
      usuariosFiltrados = usuarios.filter(u => !auth.estaVerificado(u) && !auth.esCEO(u));
    } else {
      usuariosFiltrados = usuarios.filter(u => auth.estaVerificado(u) || auth.esCEO(u));
    }

    if (usuariosFiltrados.length === 0) {
      container.innerHTML = `<p class="empty-state">No hay usuarios ${tab === 'pendientes' ? 'pendientes' : 'verificados'}</p>`;
      return;
    }

    container.innerHTML = usuariosFiltrados.map(usuario => `
      <div class="verification-card">
        <img src="${usuario.foto || DEFAULT_AVATAR}" alt="${usuario.nombre}" class="verification-avatar" />
        <div class="verification-info">
          <h4>${usuario.nombre}</h4>
          <p>${usuario.correo}</p>
          <p class="verification-perfil">${usuario.perfil || 'N/A'} • ${usuario.zona || 'Sin ubicación'}</p>
        </div>
        <div class="verification-actions">
          ${tab === 'pendientes' ? `
            <button class="btn-action btn-success" onclick="verificarUsuario('${usuario.id}')">
              ✓ Verificar
            </button>
          ` : `
            <button class="btn-action btn-danger" onclick="quitarVerificacion('${usuario.id}')">
              ✗ Quitar Verificación
            </button>
          `}
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error al cargar verificaciones:', error);
    container.innerHTML = '<p class="error-state">Error al cargar verificaciones</p>';
  }
}

async function verificarUsuario(userId) {
  if (!confirm('¿Verificar este usuario?')) return;
  
  try {
    const success = await auth.verificarUsuario(userId);
    if (success) {
      mostrarNotificacion('✅ Usuario verificado', 'success');
      await cargarVerificaciones('pendientes');
    } else {
      mostrarNotificacion('❌ Error al verificar usuario', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('❌ Error al verificar usuario', 'error');
  }
}

async function quitarVerificacion(userId) {
  if (!confirm('¿Quitar verificación a este usuario?')) return;
  
  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios/${userId}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ verificado: false })
    });
    
    if (response.ok) {
      await roles.registrarAccion('quitar_verificacion', { usuarioId: userId });
      mostrarNotificacion('✅ Verificación removida', 'success');
      await cargarVerificaciones('verificados');
    } else {
      mostrarNotificacion('❌ Error al quitar verificación', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('❌ Error al quitar verificación', 'error');
  }
}

// ========== CONTENIDO ==========
async function cargarContenido() {
  const container = document.getElementById('contenidoList');
  
  try {
    const response = await fetch('https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts.json');
    const data = await response.json();
    
    if (!data) {
      container.innerHTML = '<p class="empty-state">No hay publicaciones</p>';
      return;
    }

    const posts = Object.entries(data)
      .map(([id, post]) => ({ id, ...post }))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 20);

    container.innerHTML = posts.map(post => `
      <div class="post-card ${post.destacado ? 'destacado' : ''}">
        <div class="post-card-header">
          <img src="${post.userFoto || DEFAULT_AVATAR}" alt="${post.userName}" class="post-card-avatar" />
          <div>
            <h4>${post.userName}</h4>
            <span>${formatearTiempo(post.fecha)}</span>
          </div>
          ${post.destacado ? '<span class="badge badge-warning">✨ Destacado</span>' : ''}
        </div>
        <p class="post-card-content">${post.contenido.substring(0, 150)}${post.contenido.length > 150 ? '...' : ''}</p>
        <div class="post-card-stats">
          <span>❤️ ${post.likes ? post.likes.length : 0}</span>
          <span>💬 ${post.comentarios ? post.comentarios.length : 0}</span>
        </div>
        <div class="post-card-actions">
          <button class="btn-action btn-${post.destacado ? 'warning' : 'primary'}" onclick="toggleDestacado('${post.id}', ${post.destacado || false})">
            ${post.destacado ? '✗ Quitar destacado' : '✨ Destacar'}
          </button>
          <button class="btn-action btn-danger" onclick="eliminarPostAdmin('${post.id}')">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error al cargar contenido:', error);
    container.innerHTML = '<p class="error-state">Error al cargar contenido</p>';
  }
}

async function toggleDestacado(postId, estadoActual) {
  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts/${postId}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ destacado: !estadoActual })
    });
    
    if (response.ok) {
      await roles.registrarAccion('destacar_post', { postId, destacado: !estadoActual });
      mostrarNotificacion(`✅ Post ${!estadoActual ? 'destacado' : 'quitado de destacados'}`, 'success');
      await cargarContenido();
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('❌ Error al cambiar estado', 'error');
  }
}

async function eliminarPostAdmin(postId) {
  if (!confirm('¿Eliminar esta publicación?')) return;
  
  try {
    const response = await fetch(`https://laburitoya-6e55d-default-rtdb.firebaseio.com/posts/${postId}.json`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await roles.registrarAccion('eliminar_post', { postId });
      mostrarNotificacion('✅ Publicación eliminada', 'success');
      await cargarContenido();
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('❌ Error al eliminar', 'error');
  }
}

// ========== EMPLEOS ==========
async function cargarEmpleos() {
  const container = document.getElementById('empleosList');
  container.innerHTML = '<p class="info-state">Funcionalidad de empleos en desarrollo...</p>';
}

// ========== SOPORTE ==========
async function cargarSoporte() {
  const container = document.getElementById('ticketsList');
  container.innerHTML = '<p class="info-state">Sistema de soporte en desarrollo...</p>';
}

// ========== ANALYTICS ==========
async function cargarAnalytics() {
  const chartUsuarios = document.getElementById('chartUsuarios');
  const chartPosts = document.getElementById('chartPosts');
  
  chartUsuarios.innerHTML = '<p class="info-state">Gráficos en desarrollo...</p>';
  chartPosts.innerHTML = '<p class="info-state">Gráficos en desarrollo...</p>';
}

// ========== COMUNIDAD ==========
async function cargarComunidad(tab) {
  const container = document.getElementById('comunidadContent');
  container.innerHTML = '<p class="info-state">Gestión de comunidad en desarrollo...</p>';
}

// ========== LOGS ==========
async function cargarLogs() {
  const tbody = document.getElementById('logsTableBody');
  
  try {
    const filterValue = document.getElementById('filterLogs').value;
    let logs = await roles.obtenerLogs(100);
    
    if (filterValue !== 'todos') {
      logs = logs.filter(log => log.tipo === filterValue);
    }

    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No hay logs registrados</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(log => `
      <tr>
        <td>${formatearFecha(log.fecha)}</td>
        <td>${log.usuarioNombre}</td>
        <td>
          <span class="badge badge-info">${getIconoAccion(log.tipo)} ${formatearTipoAccion(log.tipo)}</span>
        </td>
        <td>${formatearDetallesLog(log)}</td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Error al cargar logs:', error);
    tbody.innerHTML = '<tr><td colspan="4" class="error-state">Error al cargar logs</td></tr>';
  }
}

// ========== GESTIÓN DE ROLES ==========
function abrirModalRol(userId, userName, rolActual) {
  usuarioSeleccionado = userId;
  document.getElementById('rolUsuarioNombre').textContent = userName;
  
  const selectRol = document.getElementById('selectRol');
  selectRol.innerHTML = '<option value="">Sin rol</option>';
  
  Object.entries(roles.ROLES).forEach(([key, rol]) => {
    if (key !== 'CEO') {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = `${rol.icono} ${rol.nombre}`;
      if (key === rolActual) {
        option.selected = true;
      }
      selectRol.appendChild(option);
    }
  });
  
  if (rolActual) {
    selectRol.dispatchEvent(new Event('change'));
  }
  
  document.getElementById('modalAsignarRol').style.display = 'flex';
}

function cerrarModalRol() {
  document.getElementById('modalAsignarRol').style.display = 'none';
  usuarioSeleccionado = null;
}

async function confirmarAsignarRol() {
  const rolSeleccionado = document.getElementById('selectRol').value;
  
  if (!usuarioSeleccionado) return;

  try {
    let success;
    if (rolSeleccionado) {
      success = await roles.asignarRol(usuarioSeleccionado, rolSeleccionado);
    } else {
      success = await roles.quitarRol(usuarioSeleccionado);
    }

    if (success) {
      mostrarNotificacion('✅ Rol actualizado correctamente', 'success');
      cerrarModalRol();
      await cargarUsuarios();
      await cargarEquipoAdmin();
    } else {
      mostrarNotificacion('❌ Error al actualizar rol', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('❌ Error al actualizar rol', 'error');
  }
}

// ========== ACCIONES DE USUARIOS ==========
async function toggleBloqueo(userId, estaBloqueado) {
  const accion = estaBloqueado ? 'desbloquear' : 'bloquear';
  if (!confirm(`¿Estás seguro de ${accion} este usuario?`)) return;

  try {
    let success;
    if (estaBloqueado) {
      success = auth.desbloquearUsuario(userId);
    } else {
      success = auth.bloquearUsuario(userId);
    }

    if (success) {
      await roles.registrarAccion(estaBloqueado ? 'desbloquear_usuario' : 'bannear_usuario', { usuarioId: userId });
      mostrarNotificacion(`✅ Usuario ${estaBloqueado ? 'desbloqueado' : 'bloqueado'}`, 'success');
      await cargarUsuarios();
    } else {
      mostrarNotificacion('❌ Error al cambiar estado', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('❌ Error al cambiar estado', 'error');
  }
}

async function toggleVerificacion(userId, estaVerificado) {
  if (estaVerificado) {
    await quitarVerificacion(userId);
  } else {
    await verificarUsuario(userId);
  }
  await cargarUsuarios();
}

// ========== UTILIDADES ==========
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

function formatearFecha(fecha) {
  const date = new Date(fecha);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getIconoAccion(tipo) {
  const iconos = {
    'asignar_rol': '👑',
    'quitar_rol': '❌',
    'crear_anuncio': '📢',
    'editar_anuncio': '✏️',
    'eliminar_anuncio': '🗑️',
    'verificar_usuario': '✓',
    'quitar_verificacion': '✗',
    'bannear_usuario': '🚫',
    'desbloquear_usuario': '✓',
    'destacar_post': '✨',
    'eliminar_post': '🗑️'
  };
  return iconos[tipo] || '📝';
}

function getTextoAccion(tipo) {
  const textos = {
    'asignar_rol': 'asignó un rol',
    'quitar_rol': 'quitó un rol',
    'crear_anuncio': 'creó un anuncio',
    'editar_anuncio': 'editó un anuncio',
    'eliminar_anuncio': 'eliminó un anuncio',
    'verificar_usuario': 'verificó un usuario',
    'quitar_verificacion': 'quitó verificación',
    'bannear_usuario': 'bloqueó un usuario',
    'desbloquear_usuario': 'desbloqueó un usuario',
    'destacar_post': 'destacó una publicación',
    'eliminar_post': 'eliminó una publicación'
  };
  return textos[tipo] || 'realizó una acción';
}

function formatearTipoAccion(tipo) {
  return tipo.split('_').map(palabra => 
    palabra.charAt(0).toUpperCase() + palabra.slice(1)
  ).join(' ');
}

function formatearDetallesLog(log) {
  if (!log.datos) return 'Sin detalles';
  
  const detalles = [];
  if (log.datos.usuarioId) detalles.push(`Usuario: ${log.datos.usuarioId.substring(0, 8)}...`);
  if (log.datos.rol) detalles.push(`Rol: ${log.datos.rol}`);
  if (log.datos.titulo) detalles.push(`Título: ${log.datos.titulo}`);
  if (log.datos.anuncioId) detalles.push(`Anuncio: ${log.datos.anuncioId.substring(0, 8)}...`);
  if (log.datos.postId) detalles.push(`Post: ${log.datos.postId.substring(0, 8)}...`);
  
  return detalles.join(' • ') || 'Sin detalles';
}

function getTipoAnuncioIcon(tipo) {
  const iconos = {
    'info': 'ℹ️',
    'promocion': '🎁',
    'alerta': '⚠️',
    'evento': '📅'
  };
  return iconos[tipo] || 'ℹ️';
}

function mostrarNotificacion(mensaje, tipo = 'info') {
  const notificacion = document.createElement('div');
  notificacion.className = `notification notification-${tipo}`;
  notificacion.textContent = mensaje;
  notificacion.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notificacion);
  
  setTimeout(() => {
    notificacion.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notificacion.remove(), 300);
  }, 3000);
}

// Cerrar modales al hacer clic fuera
window.addEventListener('click', function(e) {
  const modalAnuncio = document.getElementById('modalAnuncio');
  const modalRol = document.getElementById('modalAsignarRol');
  
  if (e.target === modalAnuncio) {
    cerrarModalAnuncio();
  }
  if (e.target === modalRol) {
    cerrarModalRol();
  }
});

// Exportar funciones globales
window.toggleBloqueo = toggleBloqueo;
window.toggleVerificacion = toggleVerificacion;
window.abrirModalRol = abrirModalRol;
window.cerrarModalRol = cerrarModalRol;
window.confirmarAsignarRol = confirmarAsignarRol;
window.verificarUsuario = verificarUsuario;
window.quitarVerificacion = quitarVerificacion;
window.editarAnuncio = editarAnuncio;
window.toggleAnuncio = toggleAnuncio;
window.eliminarAnuncioConfirm = eliminarAnuncioConfirm;
window.toggleDestacado = toggleDestacado;
window.eliminarPostAdmin = eliminarPostAdmin;
window.cerrarModalAnuncio = cerrarModalAnuncio;

console.log('✅ Panel de administración cargado correctamente');
