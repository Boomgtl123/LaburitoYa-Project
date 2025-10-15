# Verificación: Palomita Azul al lado del nombre (solo Verificados y CEO)

Plan y seguimiento de tareas para mostrar la palomita azul consistente en toda la app.

## Estado

- [x] Utilidad global en auth.js:
  - [x] renderNombreConBadge(nombre, usuario)
  - [x] getUsuarioPorIdCacheado(userId)
- [x] home.js:
  - [x] Sidebar: nombre con badge usando auth.renderNombreConBadge
  - [x] Post header: nombre con badge usando caché de usuarios y fallback a post.userVerificado
  - [x] Comentarios: nombre con badge usando caché
  - [x] Pre-carga de caché de usuarios (autores y comentaristas)
- [ ] profile.js:
  - [ ] profileName: usar auth.renderNombreConBadge
  - [ ] Seguidores/Seguidos (crearItemUsuario): nombre con badge
- [ ] public-profile.js:
  - [ ] profileName: usar auth.renderNombreConBadge
  - [ ] Seguidores/Seguidos (crearItemUsuario): nombre con badge
- [ ] search.js:
  - [ ] Personas (crearItemUsuario): nombre con badge
  - [ ] Publicaciones (crearItemPost): nombre con badge (usando userId -> caché si existe, fallback a post.userVerificado)
- [ ] messages.js:
  - [ ] Lista de conversaciones (crearElementoConversacion): nombre con badge
  - [ ] Header de chat (chatUserName): nombre con badge
- [ ] styles.css:
  - [ ] Agregar clase global .verified-badge (color #1DA1F2, font-weight: bold, margin-left: 4px)

## Notas de implementación

- La lógica para mostrar el badge es centralizada: `estaVerificado(usuario) || esCEO(usuario)`.
- Donde no exista el objeto usuario completo, se utiliza fallback como `{ verificado: post.userVerificado }`.
- Se añadió caché ligero para reducir llamadas repetidas al backend.

## Pruebas sugeridas

- Home:
  - Verificar palomita en posts del verificado/CEO y en comentarios.
  - Verificar palomita en nombre del sidebar del usuario actual si aplica.
- Perfil (profile.html) y Perfil público:
  - Verificar palomita junto al nombre principal y en las listas de seguidores/seguidos.
- Búsqueda:
  - Verificar palomita en resultados de personas y, si es posible, en posts (dependiendo de disponibilidad de userId/flags).
- Mensajes:
  - Verificar palomita en lista de conversaciones y cabecera del chat.
