// ========== VALIDACIÓN DE USERNAME EN TIEMPO REAL ==========
let usernameTimeout;

const usernameInput = document.getElementById("username");
if (usernameInput) {
  usernameInput.addEventListener("input", function() {
    const username = this.value.trim();
    const usernameAvailable = document.getElementById("usernameAvailable");
    
    // Limpiar timeout anterior
    clearTimeout(usernameTimeout);
    
    if (username.length < 3) {
      usernameAvailable.style.display = "none";
      return;
    }
    
    // Validar formato (solo letras, números, guiones y guiones bajos)
    const regex = /^[a-zA-Z0-9_-]+$/;
    if (!regex.test(username)) {
      usernameAvailable.textContent = "❌ Solo letras, números, guiones y guiones bajos";
      usernameAvailable.style.color = "#d32f2f";
      usernameAvailable.style.display = "block";
      return;
    }
    
    // Verificar disponibilidad después de 500ms
    usernameTimeout = setTimeout(async () => {
      try {
        const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios.json");
        const usuarios = await response.json();
        
        let disponible = true;
        if (usuarios) {
          for (const id in usuarios) {
            if (usuarios[id].username && usuarios[id].username.toLowerCase() === username.toLowerCase()) {
              disponible = false;
              break;
            }
          }
        }
        
        if (disponible) {
          usernameAvailable.textContent = "✅ Username disponible";
          usernameAvailable.style.color = "#2e7d32";
          usernameAvailable.style.display = "block";
        } else {
          usernameAvailable.textContent = "❌ Username no disponible";
          usernameAvailable.style.color = "#d32f2f";
          usernameAvailable.style.display = "block";
        }
      } catch (error) {
        console.error("Error al verificar username:", error);
      }
    }, 500);
  });
}

// ========== REGISTRO ==========
document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const perfil = document.getElementById("perfil").value;
  const nombre = document.getElementById("nombre").value.trim();
  const username = document.getElementById("username").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const pais = document.getElementById("pais").value;
  const distrito = document.getElementById("distrito").value;
  const localidad = document.getElementById("localidad").value;
  const contrasena = document.getElementById("contrasena").value;
  const mensaje = document.getElementById("mensajeRegistro");

  // Validaciones
  if (!perfil || !nombre || !username || !correo || !telefono || !pais || !distrito || !localidad || !contrasena) {
    mensaje.textContent = "❌ Por favor completa todos los campos.";
    mensaje.style.color = "red";
    return;
  }

  // Validar formato de username
  const regex = /^[a-zA-Z0-9_-]+$/;
  if (!regex.test(username)) {
    mensaje.textContent = "❌ Username inválido. Solo letras, números, guiones y guiones bajos.";
    mensaje.style.color = "red";
    return;
  }

  if (username.length < 3) {
    mensaje.textContent = "❌ El username debe tener al menos 3 caracteres.";
    mensaje.style.color = "red";
    return;
  }

  // Mostrar loading
  mensaje.textContent = "Creando tu cuenta...";
  mensaje.style.color = "#0a66c2";

  try {
    // Verificar si el correo o username ya existen
    const checkResponse = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios.json");
    const usuarios = await checkResponse.json();
    
    if (usuarios) {
      for (const id in usuarios) {
        if (usuarios[id].correo === correo) {
          mensaje.textContent = "❌ Este correo ya está registrado.";
          mensaje.style.color = "red";
          return;
        }
        if (usuarios[id].username && usuarios[id].username.toLowerCase() === username.toLowerCase()) {
          mensaje.textContent = "❌ Este username ya está en uso.";
          mensaje.style.color = "red";
          return;
        }
      }
    }

    // Crear zona completa
    const zonaCompleta = `${localidad}, ${distrito}, ${pais}`;

    const data = {
      perfil,
      nombre,
      username,
      correo,
      telefono,
      pais,
      distrito,
      localidad,
      zona: zonaCompleta,
      contrasena,
      fecha: new Date().toISOString(),
      foto: 'https://via.placeholder.com/150',
      biografia: '',
      redesSociales: {
        instagram: "",
        twitter: "",
        threads: "",
        facebook: "",
        tiktok: ""
      }
    };

    // Registrar nuevo usuario
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios.json", {
      method: "POST",
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.json();
      const userId = result.name;

      // Guardar sesión con todos los datos del usuario
      const usuarioCompleto = {
        id: userId,
        ...data
      };

      // Guardar en localStorage usando auth.js
      if (window.auth) {
        window.auth.guardarSesion(usuarioCompleto);
      } else {
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioCompleto));
      }

      mensaje.textContent = "✅ Registro exitoso. Redirigiendo...";
      mensaje.style.color = "limegreen";

      setTimeout(() => {
        window.location.href = "home.html";
      }, 1000);
    } else {
      mensaje.textContent = "❌ Error al registrar.";
      mensaje.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    mensaje.textContent = "❌ Error de red.";
    mensaje.style.color = "red";
  }
});
