document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value;
  const mensaje = document.getElementById("mensajeLogin");

  if (!correo || !contrasena) {
    mensaje.textContent = "Por favor completa todos los campos.";
    mensaje.style.color = "red";
    return;
  }

  mensaje.textContent = "Iniciando sesión...";
  mensaje.style.color = "white";

  try {
    const response = await fetch("https://laburitoya-6e55d-default-rtdb.firebaseio.com/usuarios.json");
    const usuarios = await response.json();

    if (!usuarios) {
      mensaje.textContent = "No hay usuarios registrados.";
      mensaje.style.color = "red";
      return;
    }

    let usuarioEncontrado = null;
    let userId = null;

    for (const id in usuarios) {
      if (usuarios[id].correo === correo && usuarios[id].contrasena === contrasena) {
        usuarioEncontrado = usuarios[id];
        userId = id;
        break;
      }
    }

    if (usuarioEncontrado) {
      // Guardar sesión
      const usuarioCompleto = {
        id: userId,
        ...usuarioEncontrado
      };
      localStorage.setItem('usuarioActual', JSON.stringify(usuarioCompleto));

      mensaje.textContent = "Inicio de sesión exitoso. Redirigiendo...";
      mensaje.style.color = "limegreen";

      setTimeout(() => {
        window.location.href = "home.html";
      }, 1000);
    } else {
      mensaje.textContent = "Correo o contraseña incorrectos.";
      mensaje.style.color = "red";
      alert("❌ Error de inicio de sesión\n\nEl correo o la contraseña que ingresaste son incorrectos. Por favor verifica tus datos e intenta nuevamente.");
    }
  } catch (err) {
    console.error(err);
    mensaje.textContent = "Error de red.";
    mensaje.style.color = "red";
    alert("❌ Error de conexión\n\nNo se pudo conectar con el servidor. Por favor verifica tu conexión a internet e intenta nuevamente.");
  }
});
