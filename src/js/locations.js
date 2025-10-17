// ========== DATOS DE UBICACIONES ==========

const LOCATIONS = {
  Argentina: {
    distritos: {
      "Guaminí": {
        localidades: [
          "Guaminí (ciudad)",
          "Arroyo Venado",
          "Casbas",
          "Garré",
          "Laguna Alsina"
        ]
      }
    }
  },
  Peru: {
    distritos: {
      "Comas": {
        localidades: [
          "Año Nuevo",
          "Carabayllo",
          "Chacra Cerro",
          "Collique",
          "El Retablo",
          "La Libertad",
          "Pascana",
          "Punchauca",
          "San Felipe",
          "Santa Luzmila",
          "Túpac Amaru",
          "Villa Esperanza",
          "Zona Alta",
          "Zona Baja"
        ]
      }
    }
  }
};

// ========== INICIALIZAR SELECTORES DE UBICACIÓN ==========
function inicializarUbicaciones() {
  const paisSelect = document.getElementById('pais');
  const distritoSelect = document.getElementById('distrito');
  const localidadSelect = document.getElementById('localidad');
  
  if (!paisSelect || !distritoSelect || !localidadSelect) return;
  
  // Evento al cambiar país
  paisSelect.addEventListener('change', function() {
    const pais = this.value;
    
    // Resetear y mostrar distrito
    distritoSelect.innerHTML = '<option value="" disabled selected>Selecciona tu distrito</option>';
    localidadSelect.innerHTML = '<option value="" disabled selected>Selecciona tu localidad</option>';
    localidadSelect.style.display = 'none';
    
    if (pais && LOCATIONS[pais]) {
      const distritos = Object.keys(LOCATIONS[pais].distritos);
      
      distritos.forEach(distrito => {
        const option = document.createElement('option');
        option.value = distrito;
        option.textContent = distrito;
        distritoSelect.appendChild(option);
      });
      
      distritoSelect.style.display = 'block';
    } else {
      distritoSelect.style.display = 'none';
    }
  });
  
  // Evento al cambiar distrito
  distritoSelect.addEventListener('change', function() {
    const pais = paisSelect.value;
    const distrito = this.value;
    
    // Resetear y mostrar localidad
    localidadSelect.innerHTML = '<option value="" disabled selected>Selecciona tu localidad</option>';
    
    if (pais && distrito && LOCATIONS[pais].distritos[distrito]) {
      const localidades = LOCATIONS[pais].distritos[distrito].localidades;
      
      localidades.forEach(localidad => {
        const option = document.createElement('option');
        option.value = localidad;
        option.textContent = localidad;
        localidadSelect.appendChild(option);
      });
      
      localidadSelect.style.display = 'block';
    } else {
      localidadSelect.style.display = 'none';
    }
  });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarUbicaciones);
} else {
  inicializarUbicaciones();
}

// Exportar para uso global
window.LOCATIONS = LOCATIONS;
