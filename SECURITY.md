# 🔒 Guía de Seguridad - LaburitoYa

## ⚠️ INFORMACIÓN IMPORTANTE

Este documento contiene información crítica sobre la seguridad del proyecto. Por favor, léelo cuidadosamente antes de trabajar con el código.

---

## 🚨 Datos Sensibles Protegidos

Los siguientes datos **NUNCA** deben ser compartidos públicamente o subidos a GitHub:

### 1. **Credenciales de Firebase**
- ❌ URL de la base de datos
- ❌ Project ID
- ❌ API Keys
- ❌ Tokens de autenticación

### 2. **Información de Administradores**
- ❌ Correos electrónicos de administradores
- ❌ Contraseñas
- ❌ Tokens de sesión

### 3. **Datos de Usuarios**
- ❌ Contraseñas (deben estar encriptadas)
- ❌ Información personal
- ❌ Tokens de acceso

---

## 📁 Archivos Protegidos

Los siguientes archivos están en `.gitignore` y **NO se suben a GitHub**:

```
.env                    # Variables de entorno con credenciales reales
config.js              # Configuración con datos sensibles
*.log                  # Archivos de log
backup/                # Carpetas de respaldo
```

---

## 🛠️ Configuración Inicial

### Para Nuevos Desarrolladores:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/LaburitoYa.git
   cd LaburitoYa
   ```

2. **Crear archivo de configuración:**
   ```bash
   cp .env.example .env
   cp config.example.js config.js
   ```

3. **Editar `.env` con tus credenciales:**
   ```env
   FIREBASE_DATABASE_URL=https://tu-proyecto.firebaseio.com
   FIREBASE_PROJECT_ID=tu-proyecto-id
   ADMIN_EMAIL=tu-email@ejemplo.com
   ```

4. **Editar `config.js` con tus credenciales de Firebase**

5. **NUNCA subir estos archivos a GitHub**

---

## 🔐 Mejores Prácticas de Seguridad

### ✅ Hacer:

1. **Usar variables de entorno** para datos sensibles
2. **Encriptar contraseñas** antes de guardarlas
3. **Validar todas las entradas** del usuario
4. **Implementar autenticación** en Firebase
5. **Configurar reglas de seguridad** en Firebase Console
6. **Revisar el código** antes de hacer commit
7. **Usar HTTPS** en producción
8. **Implementar rate limiting** para prevenir ataques
9. **Mantener dependencias actualizadas**
10. **Hacer backups regulares** de la base de datos

### ❌ NO Hacer:

1. **NO hardcodear** credenciales en el código
2. **NO subir** archivos `.env` o `config.js` a GitHub
3. **NO compartir** credenciales por email o chat
4. **NO usar** la misma contraseña para todo
5. **NO exponer** la base de datos sin autenticación
6. **NO guardar** contraseñas en texto plano
7. **NO ignorar** advertencias de seguridad
8. **NO usar** credenciales de producción en desarrollo

---

## 🔥 Configuración de Firebase

### Reglas de Seguridad Recomendadas:

```json
{
  "rules": {
    "usuarios": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "posts": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "mensajes": {
      "$chatId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

### Pasos para Configurar:

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a **Realtime Database** → **Reglas**
4. Copia y pega las reglas de seguridad
5. Haz clic en **Publicar**

---

## 🚀 Implementación de Autenticación

### Actualmente el proyecto usa:
- ❌ Autenticación básica con localStorage
- ❌ Contraseñas en texto plano
- ❌ Sin tokens de sesión

### Se recomienda migrar a:
- ✅ Firebase Authentication
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Tokens JWT para sesiones
- ✅ OAuth para login social

---

## 📊 Checklist de Seguridad

Antes de hacer deploy a producción:

- [ ] Todas las credenciales están en variables de entorno
- [ ] El archivo `.env` NO está en el repositorio
- [ ] Las reglas de Firebase están configuradas
- [ ] Las contraseñas están encriptadas
- [ ] Se implementó autenticación con tokens
- [ ] Se validaron todas las entradas de usuario
- [ ] Se probó la aplicación en busca de vulnerabilidades
- [ ] Se configuró HTTPS
- [ ] Se implementó rate limiting
- [ ] Se hizo backup de la base de datos

---

## 🆘 ¿Qué hacer si se expusieron credenciales?

Si accidentalmente subiste credenciales a GitHub:

1. **Inmediatamente:**
   - Regenera todas las credenciales en Firebase Console
   - Cambia todas las contraseñas
   - Revoca tokens de acceso

2. **Limpia el historial de Git:**
   ```bash
   # Usar BFG Repo-Cleaner o git filter-branch
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch config.js" \
   --prune-empty --tag-name-filter cat -- --all
   ```

3. **Notifica al equipo:**
   - Informa a todos los desarrolladores
   - Actualiza las credenciales en todos los entornos

4. **Monitorea:**
   - Revisa logs de Firebase por accesos sospechosos
   - Monitorea la base de datos por cambios no autorizados

---

## 📞 Contacto de Seguridad

Si encuentras una vulnerabilidad de seguridad:

1. **NO la publiques públicamente**
2. Contacta al equipo de desarrollo
3. Proporciona detalles del problema
4. Espera respuesta antes de divulgar

---

## 📚 Recursos Adicionales

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Best Practices](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Git Security](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage)

---

## 📝 Historial de Cambios

- **2024-01-XX**: Implementación inicial de seguridad
  - Creación de .gitignore
  - Implementación de variables de entorno
  - Documentación de seguridad

---

**Última actualización:** Enero 2024  
**Mantenido por:** Equipo de Desarrollo LaburitoYa
