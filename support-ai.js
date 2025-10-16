// ========== SISTEMA DE SOPORTE CON IA ==========
// Base de conocimiento de LaburitoYa

const KNOWLEDGE_BASE = {
  // Información general
  general: {
    keywords: ['que es', 'qué es', 'laburitoya', 'plataforma', 'app', 'aplicacion', 'para que sirve'],
    response: `🏢 **LaburitoYa** es una plataforma social diseñada para conectar profesionales y trabajadores independientes.

📌 **Características principales:**
• Red social profesional
• Publicación de servicios y trabajos
• Sistema de mensajería directa
• Búsqueda por hashtags y rubros
• Verificación de perfiles
• Sistema de seguimiento entre usuarios

¿Necesitas ayuda con algo específico?`
  },

  // Registro y cuenta
  registro: {
    keywords: ['registrar', 'crear cuenta', 'sign up', 'registro', 'nueva cuenta', 'unirse'],
    response: `📝 **Crear una cuenta en LaburitoYa:**

1. Ve a la página de registro
2. Completa tus datos:
   • Nombre completo
   • Correo electrónico
   • Contraseña segura
   • Perfil profesional (ej: Plomero, Electricista)
   • Zona de trabajo
3. Haz clic en "Registrarse"
4. ¡Listo! Ya puedes empezar a usar LaburitoYa

💡 **Tip:** Completa tu perfil con foto y descripción para generar más confianza.`
  },

  // Inicio de sesión
  login: {
    keywords: ['iniciar sesion', 'login', 'entrar', 'acceder', 'ingresar', 'contraseña olvidada'],
    response: `🔐 **Iniciar sesión:**

1. Ve a la página de inicio
2. Ingresa tu correo electrónico
3. Ingresa tu contraseña
4. Haz clic en "Iniciar sesión"

❓ **¿Olvidaste tu contraseña?**
Por ahora, contacta al soporte para recuperarla. Pronto tendremos recuperación automática.

⚠️ **Problemas para entrar:**
• Verifica que tu correo esté escrito correctamente
• Asegúrate de usar la contraseña correcta
• Limpia la caché de tu navegador`
  },

  // Publicaciones
  publicaciones: {
    keywords: ['publicar', 'post', 'crear publicacion', 'compartir', 'subir', 'foto'],
    response: `📢 **Crear una publicación:**

1. En la página de inicio, ve al cuadro "¿En qué estás trabajando?"
2. Escribe tu mensaje
3. Usa hashtags para categorizar (ej: #Plomero #Electricista)
4. (Opcional) Agrega hasta 3 fotos
5. Haz clic en "Publicar"

💡 **Tips para publicaciones efectivas:**
• Usa hashtags relevantes a tu rubro
• Agrega fotos de tu trabajo
• Sé claro y profesional
• Incluye tu zona de trabajo

📸 **Fotos:** Máximo 3 imágenes por publicación`
  },

  // Hashtags
  hashtags: {
    keywords: ['hashtag', 'etiqueta', '#', 'como usar hashtags', 'rubros', 'categorias'],
    response: `#️⃣ **Sistema de Hashtags:**

Los hashtags te ayudan a categorizar tus servicios y ser encontrado fácilmente.

**Cómo usarlos:**
• Escribe # seguido del rubro (ej: #Plomero)
• Puedes usar varios hashtags
• Aparecen en "Tendencias" cuando son populares

**Hashtags comunes:**
• #Plomero
• #Electricista  
• #Pintor
• #Carpintero
• #Jardinero
• #Limpieza
• #Construccion
• #Mecanico
• #Gasista

💡 Haz clic en un hashtag para ver todas las publicaciones de ese rubro.`
  },

  // Mensajes
  mensajes: {
    keywords: ['mensaje', 'chat', 'mensajeria', 'contactar', 'hablar', 'escribir'],
    response: `💬 **Sistema de Mensajería:**

**Enviar un mensaje:**
1. Ve al perfil de la persona
2. Haz clic en "Enviar mensaje"
3. Escribe tu mensaje
4. Presiona Enter o clic en enviar

**Ver tus mensajes:**
• Haz clic en "MENSAJES" en el menú superior
• Verás todas tus conversaciones
• Los mensajes nuevos aparecen con notificación

⚡ **Los mensajes son en tiempo real**

🔔 **Notificaciones:**
Recibirás una notificación cuando alguien te escriba.`
  },

  // Perfil
  perfil: {
    keywords: ['perfil', 'editar perfil', 'foto', 'biografia', 'actualizar', 'cambiar datos'],
    response: `👤 **Gestionar tu Perfil:**

**Ver tu perfil:**
• Haz clic en tu foto de perfil
• O ve a "Ver perfil completo"

**Editar tu perfil:**
1. Ve a tu perfil
2. Haz clic en "Editar perfil"
3. Actualiza:
   • Foto de perfil
   • Nombre
   • Título profesional
   • Biografía
   • Zona de trabajo
   • Redes sociales
4. Guarda los cambios

✨ **Perfil completo = Más confianza**

Un perfil bien completado genera más contactos y oportunidades.`
  },

  // Verificación
  verificacion: {
    keywords: ['verificar', 'verificado', 'check azul', 'verificacion', 'badge'],
    response: `✓ **Verificación de Perfil:**

El badge de verificación (✓) indica que un perfil es auténtico.

**¿Cómo verificarme?**
La verificación es otorgada por los administradores después de revisar:
• Perfil completo
• Actividad en la plataforma
• Autenticidad de la información

**Beneficios:**
• Mayor confianza de otros usuarios
• Destacas en búsquedas
• Acceso a funciones premium (próximamente)

📝 Los administradores revisan solicitudes periódicamente.`
  },

  // Búsqueda
  busqueda: {
    keywords: ['buscar', 'encontrar', 'search', 'como busco', 'busqueda'],
    response: `🔍 **Buscar en LaburitoYa:**

**Buscar personas o servicios:**
1. Haz clic en "+ INFO" en el menú
2. Usa el cuadro de búsqueda
3. Escribe:
   • Nombre de persona
   • Rubro o servicio
   • Hashtag

**Buscar por hashtag:**
• Haz clic en cualquier hashtag
• O ve a "Tendencias" en la columna derecha
• Verás todas las publicaciones de ese rubro

💡 **Tip:** Los hashtags son la mejor forma de encontrar servicios específicos.`
  },

  // Seguidores
  seguidores: {
    keywords: ['seguir', 'seguidor', 'followers', 'follow', 'dejar de seguir'],
    response: `👥 **Sistema de Seguidores:**

**Seguir a alguien:**
1. Ve al perfil de la persona
2. Haz clic en "Seguir"
3. Verás sus publicaciones en tu feed

**Dejar de seguir:**
1. Ve al perfil
2. Haz clic en "Dejar de seguir"

**Ver seguidores:**
• En tu perfil verás cuántos seguidores tienes
• Puedes ver la lista de seguidores y seguidos

💡 Seguir a profesionales de tu rubro te mantiene actualizado.`
  },

  // Empleos
  empleos: {
    keywords: ['empleo', 'trabajo', 'oferta', 'vacante', 'busco trabajo', 'contratar'],
    response: `💼 **Sección de Empleos:**

**Ver ofertas de trabajo:**
1. Haz clic en "EMPLEOS" en el menú
2. Explora las ofertas disponibles
3. Filtra por categoría o ubicación

**Publicar una oferta:**
(Próximamente disponible)

**Postularse:**
1. Haz clic en la oferta que te interesa
2. Lee los detalles
3. Contacta al empleador por mensaje

💡 Mantén tu perfil actualizado para mejores oportunidades.`
  },

  // Notificaciones
  notificaciones: {
    keywords: ['notificacion', 'notificaciones', 'alertas', 'avisos'],
    response: `🔔 **Notificaciones:**

**Ver notificaciones:**
• Haz clic en el ícono de campana (🔔)
• Verás 3 pestañas:
  - ⭐ Destacadas
  - 📈 Tendencias
  - 🕐 Recientes

**Tipos de notificaciones:**
• Nuevos seguidores
• Likes en tus publicaciones
• Comentarios
• Mensajes nuevos
• Menciones

**Marcar como leídas:**
• Haz clic en "Marcar todas como leídas"

Las notificaciones se actualizan en tiempo real.`
  },

  // Problemas técnicos
  problemas: {
    keywords: ['error', 'no funciona', 'problema', 'bug', 'falla', 'no carga', 'lento'],
    response: `⚠️ **Problemas Técnicos:**

**Soluciones rápidas:**

1. **Recarga la página** (Ctrl+R o Cmd+R)
2. **Limpia la caché:**
   • Chrome: Ctrl+Shift+Delete
   • Safari: Cmd+Option+E
3. **Cierra sesión y vuelve a entrar**
4. **Prueba en otro navegador**

**Si el problema persiste:**
Crea un ticket de soporte describiendo:
• Qué estabas haciendo
• Qué error apareció
• Navegador que usas

Nuestro equipo te ayudará lo antes posible.`
  },

  // Seguridad
  seguridad: {
    keywords: ['seguridad', 'privacidad', 'datos', 'contraseña', 'cuenta hackeada', 'robo'],
    response: `🔒 **Seguridad y Privacidad:**

**Protege tu cuenta:**
• Usa una contraseña fuerte
• No compartas tu contraseña
• Cierra sesión en dispositivos públicos

**Privacidad:**
• Tu información personal está protegida
• Solo compartes lo que publicas
• Puedes controlar quién te contacta

**¿Cuenta comprometida?**
Si crees que alguien accedió a tu cuenta:
1. Cambia tu contraseña inmediatamente
2. Revisa tu actividad reciente
3. Contacta al soporte

📋 Lee nuestras Políticas de Privacidad para más información.`
  },

  // Contacto y soporte
  soporte: {
    keywords: ['ayuda', 'soporte', 'contacto', 'support', 'help', 'asistencia'],
    response: `🆘 **Soporte y Ayuda:**

**Formas de obtener ayuda:**

1. **Chat de soporte** (este chat)
   • Respuestas inmediatas
   • Disponible 24/7

2. **Tickets de soporte**
   • Para problemas complejos
   • Respuesta en 24-48 horas

3. **Políticas y FAQ**
   • Haz clic en "+ INFO" → "Políticas"

**Crear un ticket:**
Si no puedo resolver tu consulta, puedes crear un ticket y nuestro equipo te contactará.

¿En qué más puedo ayudarte?`
  }
};

// Respuestas para cuando no se encuentra coincidencia
const DEFAULT_RESPONSES = [
  `🤔 No estoy seguro de cómo ayudarte con eso específicamente.

¿Podrías reformular tu pregunta? Por ejemplo:
• "¿Cómo publico en LaburitoYa?"
• "¿Cómo busco electricistas?"
• "¿Cómo verifico mi perfil?"

O puedo crear un **ticket de soporte** para que un agente humano te ayude. ¿Quieres crear un ticket?`,

  `💭 Hmm, no tengo información específica sobre eso en mi base de conocimiento.

**Puedo ayudarte con:**
• Crear cuenta y perfil
• Publicar y usar hashtags
• Mensajería y notificaciones
• Búsqueda de servicios
• Problemas técnicos

¿Quieres que cree un **ticket de soporte** para que un agente te ayude personalmente?`
];

// Saludos
const GREETINGS = {
  keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'hi', 'hello'],
  responses: [
    `¡Hola! 👋 Soy el asistente virtual de LaburitoYa.

Estoy aquí para ayudarte con:
• Cómo usar la plataforma
• Resolver problemas
• Responder tus preguntas

¿En qué puedo ayudarte hoy?`,
    
    `¡Bienvenido! 😊 

Soy tu asistente de soporte en LaburitoYa. Puedo ayudarte con cualquier duda sobre la plataforma.

¿Qué necesitas saber?`
  ]
};

// Despedidas
const FAREWELLS = {
  keywords: ['gracias', 'adios', 'chau', 'bye', 'hasta luego', 'ok', 'perfecto', 'listo'],
  responses: [
    `¡De nada! 😊 Si necesitas más ayuda, aquí estaré.

¡Que tengas un excelente día!`,
    
    `¡Un placer ayudarte! 👍

Si tienes más preguntas, no dudes en escribirme.

¡Éxitos en LaburitoYa!`
  ]
};

// ========== FUNCIONES PRINCIPALES ==========

// Buscar respuesta en la base de conocimiento
function buscarRespuesta(mensaje) {
  const mensajeLower = mensaje.toLowerCase().trim();
  
  // Verificar saludos
  for (const keyword of GREETINGS.keywords) {
    if (mensajeLower.includes(keyword)) {
      return {
        found: true,
        response: GREETINGS.responses[Math.floor(Math.random() * GREETINGS.responses.length)],
        category: 'greeting'
      };
    }
  }
  
  // Verificar despedidas
  for (const keyword of FAREWELLS.keywords) {
    if (mensajeLower === keyword || mensajeLower === keyword + '!' || mensajeLower === keyword + '.') {
      return {
        found: true,
        response: FAREWELLS.responses[Math.floor(Math.random() * FAREWELLS.responses.length)],
        category: 'farewell'
      };
    }
  }
  
  // Buscar en la base de conocimiento
  let bestMatch = null;
  let maxMatches = 0;
  
  for (const [category, data] of Object.entries(KNOWLEDGE_BASE)) {
    let matches = 0;
    
    for (const keyword of data.keywords) {
      if (mensajeLower.includes(keyword.toLowerCase())) {
        matches++;
      }
    }
    
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = { category, response: data.response };
    }
  }
  
  // Si encontramos coincidencias
  if (bestMatch && maxMatches > 0) {
    return {
      found: true,
      response: bestMatch.response,
      category: bestMatch.category
    };
  }
  
  // No se encontró respuesta
  return {
    found: false,
    response: DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)],
    category: 'unknown'
  };
}

// Obtener sugerencias de preguntas
function obtenerSugerencias() {
  return [
    "¿Cómo publico en LaburitoYa?",
    "¿Cómo busco profesionales?",
    "¿Cómo uso los hashtags?",
    "¿Cómo envío mensajes?",
    "¿Cómo edito mi perfil?",
    "Tengo un problema técnico"
  ];
}

// Exportar funciones
window.supportAI = {
  buscarRespuesta,
  obtenerSugerencias,
  KNOWLEDGE_BASE
};

console.log('✅ Sistema de IA de soporte cargado correctamente');
