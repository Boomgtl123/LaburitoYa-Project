// ========== SISTEMA DE CARGA DE ARCHIVOS ==========

// Configuración
const CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedDocTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// ========== INICIALIZAR SISTEMA DE ARCHIVOS ==========
function inicializarFileUpload() {
  // Agregar botones de adjuntar a los formularios de comentarios
  agregarBotonesAdjuntar();
}

// ========== AGREGAR BOTONES DE ADJUNTAR ==========
function agregarBotonesAdjuntar() {
  // Observar cambios en el DOM para agregar botones a nuevos comentarios
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        agregarBotonesAComentarios();
      }
    });
  });
  
  const postList = document.getElementById('postList');
  if (postList) {
    observer.observe(postList, { childList: true, subtree: true });
  }
  
  // Agregar a comentarios existentes
  agregarBotonesAComentarios();
}

// ========== AGREGAR BOTONES A COMENTARIOS ==========
function agregarBotonesAComentarios() {
  const commentForms = document.querySelectorAll('.comment-form');
  
  commentForms.forEach(form => {
    // Verificar si ya tiene el botón
    if (form.querySelector('.attach-file-btn')) return;
    
    const input = form.querySelector('input[type="text"]');
    const button = form.querySelector('button');
    
    if (input && button) {
      // Crear contenedor de archivos adjuntos
      const attachmentContainer = document.createElement('div');
      attachmentContainer.className = 'attachment-container';
      attachmentContainer.style.display = 'none';
      
      // Crear botón de adjuntar
      const attachBtn = document.createElement('button');
      attachBtn.type = 'button';
      attachBtn.className = 'attach-file-btn';
      attachBtn.innerHTML = '📎';
      attachBtn.title = 'Adjuntar archivo';
      
      // Crear input file oculto
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = [...CONFIG.allowedImageTypes, ...CONFIG.allowedDocTypes].join(',');
      fileInput.style.display = 'none';
      fileInput.className = 'file-input-hidden';
      
      // Event listener para el botón
      attachBtn.addEventListener('click', function() {
        fileInput.click();
      });
      
      // Event listener para el input file
      fileInput.addEventListener('change', function(e) {
        handleFileSelect(e, attachmentContainer, form);
      });
      
      // Insertar elementos
      form.insertBefore(attachBtn, button);
      form.insertBefore(fileInput, button);
      form.insertBefore(attachmentContainer, button);
    }
  });
}

// ========== MANEJAR SELECCIÓN DE ARCHIVO ==========
function handleFileSelect(e, container, form) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validar tipo de archivo
  const isImage = CONFIG.allowedImageTypes.includes(file.type);
  const isDoc = CONFIG.allowedDocTypes.includes(file.type);
  
  if (!isImage && !isDoc) {
    alert('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, WEBP) y documentos (PDF, DOC, DOCX).');
    e.target.value = '';
    return;
  }
  
  // Validar tamaño
  if (file.size > CONFIG.maxFileSize) {
    alert(`El archivo es muy grande. El tamaño máximo es ${CONFIG.maxFileSize / (1024 * 1024)}MB.`);
    e.target.value = '';
    return;
  }
  
  // Leer archivo
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const fileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      data: event.target.result
    };
    
    mostrarPreview(fileData, container, form);
  };
  
  reader.onerror = function() {
    alert('Error al leer el archivo. Por favor intenta de nuevo.');
    e.target.value = '';
  };
  
  reader.readAsDataURL(file);
}

// ========== MOSTRAR PREVIEW ==========
function mostrarPreview(fileData, container, form) {
  container.innerHTML = '';
  container.style.display = 'flex';
  
  const preview = document.createElement('div');
  preview.className = 'file-preview';
  
  const isImage = CONFIG.allowedImageTypes.includes(fileData.type);
  
  if (isImage) {
    // Preview de imagen
    preview.innerHTML = `
      <div class="file-preview-image">
        <img src="${fileData.data}" alt="${fileData.name}" />
      </div>
      <div class="file-preview-info">
        <p class="file-name">${fileData.name}</p>
        <p class="file-size">${formatFileSize(fileData.size)}</p>
      </div>
      <button type="button" class="file-remove-btn" title="Eliminar archivo">✕</button>
    `;
  } else {
    // Preview de documento
    const icon = getDocIcon(fileData.type);
    preview.innerHTML = `
      <div class="file-preview-doc">
        <span class="doc-icon">${icon}</span>
      </div>
      <div class="file-preview-info">
        <p class="file-name">${fileData.name}</p>
        <p class="file-size">${formatFileSize(fileData.size)}</p>
      </div>
      <button type="button" class="file-remove-btn" title="Eliminar archivo">✕</button>
    `;
  }
  
  // Guardar datos del archivo en el formulario
  form.dataset.attachedFile = JSON.stringify(fileData);
  
  // Event listener para eliminar
  const removeBtn = preview.querySelector('.file-remove-btn');
  removeBtn.addEventListener('click', function() {
    container.innerHTML = '';
    container.style.display = 'none';
    delete form.dataset.attachedFile;
    
    // Limpiar input file
    const fileInput = form.querySelector('.file-input-hidden');
    if (fileInput) fileInput.value = '';
  });
  
  container.appendChild(preview);
}

// ========== OBTENER ARCHIVO ADJUNTO ==========
function getAttachedFile(form) {
  if (form.dataset.attachedFile) {
    return JSON.parse(form.dataset.attachedFile);
  }
  return null;
}

// ========== LIMPIAR ARCHIVO ADJUNTO ==========
function clearAttachedFile(form) {
  delete form.dataset.attachedFile;
  
  const container = form.querySelector('.attachment-container');
  if (container) {
    container.innerHTML = '';
    container.style.display = 'none';
  }
  
  const fileInput = form.querySelector('.file-input-hidden');
  if (fileInput) fileInput.value = '';
}

// ========== FORMATEAR TAMAÑO DE ARCHIVO ==========
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ========== OBTENER ICONO DE DOCUMENTO ==========
function getDocIcon(type) {
  if (type === 'application/pdf') return '📄';
  if (type.includes('word')) return '📝';
  return '📎';
}

// ========== RENDERIZAR ARCHIVO EN COMENTARIO ==========
function renderAttachment(attachment) {
  if (!attachment) return '';
  
  const isImage = CONFIG.allowedImageTypes.includes(attachment.type);
  
  if (isImage) {
    return `
      <div class="comment-attachment">
        <img src="${attachment.data}" alt="${attachment.name}" class="comment-attachment-image" onclick="openImageModal('${attachment.data}')" />
      </div>
    `;
  } else {
    const icon = getDocIcon(attachment.type);
    return `
      <div class="comment-attachment comment-attachment-doc">
        <span class="doc-icon">${icon}</span>
        <div class="doc-info">
          <p class="doc-name">${attachment.name}</p>
          <p class="doc-size">${formatFileSize(attachment.size)}</p>
        </div>
        <a href="${attachment.data}" download="${attachment.name}" class="doc-download-btn">⬇️</a>
      </div>
    `;
  }
}

// ========== ABRIR MODAL DE IMAGEN ==========
function openImageModal(imageSrc) {
  // Crear modal
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.innerHTML = `
    <div class="image-modal-content">
      <button class="image-modal-close">✕</button>
      <img src="${imageSrc}" alt="Imagen" />
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Mostrar modal
  setTimeout(() => modal.classList.add('show'), 10);
  
  // Event listeners
  const closeBtn = modal.querySelector('.image-modal-close');
  closeBtn.addEventListener('click', () => closeImageModal(modal));
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeImageModal(modal);
    }
  });
}

// ========== CERRAR MODAL DE IMAGEN ==========
function closeImageModal(modal) {
  modal.classList.remove('show');
  setTimeout(() => modal.remove(), 300);
}

// Exportar funciones
window.fileUpload = {
  inicializarFileUpload,
  getAttachedFile,
  clearAttachedFile,
  renderAttachment
};

// Hacer función global
window.openImageModal = openImageModal;
