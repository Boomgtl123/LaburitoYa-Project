# 🚀 Guía Rápida: Configuración de Seguridad

## ✅ Pasos Completados Automáticamente

Ya se han creado los siguientes archivos de seguridad:

1. ✅ `.gitignore` - Protege archivos sensibles
2. ✅ `.env` - Variables de entorno (con tus datos actuales)
3. ✅ `.env.example` - Plantilla para otros desarrolladores
4. ✅ `config.example.js` - Plantilla de configuración
5. ✅ `SECURITY.md` - Documentación completa de seguridad
6. ✅ `auth.js` - Actualizado para usar variables de entorno

---

## 🎯 Próximos Pasos IMPORTANTES

### **Paso 1: Verificar que Git ignore los archivos sensibles**

Ejecuta este comando para verificar:

```bash
git status
```

**Deberías ver:**
- ✅ `.gitignore` (nuevo archivo)
- ✅ `.env.example` (nuevo archivo)
- ✅ `config.example.js` (nuevo archivo)
- ✅ `SECURITY.md` (nuevo archivo)

**NO deberías ver:**
- ❌ `.env` 
- ❌ `config.js` (si tiene datos reales)

---

### **Paso 2: Hacer commit de los archivos seguros**

```bash
# Agregar solo los archivos seguros
git add .gitignore
git add .env.example
git add config.example.js
git add SECURITY.md
git add CONFIGURACION_SEGURIDAD.md
git add auth.js

# Hacer commit
git commit -m "🔒 Implementar medidas de seguridad: proteger credenciales y datos sensibles"

# Subir a GitHub
git push origin main
```

---

### **Paso 3: Verificar que .env NO se subió**

Después del push, verifica en GitHub que:
- ✅ `.gitignore` está presente
- ✅ `.env.example` está presente
- ❌ `.env` NO está presente
- ❌ `config.js` NO está presente (si tiene datos reales)

---

## ⚠️ IMPORTANTE: Limpiar Historial de Git

Si anteriormente subiste archivos con credenciales, necesitas limpiar el historial:

### **Opción 1: Usando BFG Repo-Cleaner (Recomendado)**

```bash
# 1. Descargar BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# 2. Hacer backup del repositorio
cp -r LaburitoYa LaburitoYa-backup

# 3. Limpiar archivos sensibles del historial
java -jar bfg.jar --delete-files config.js
java -jar bfg.jar --delete-files .env

# 4. Limpiar referencias
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Forzar push
git push origin --force --all
```

### **Opción 2: Manualmente con git filter-branch**

```bash
# Remover config.js del historial
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch config.js" \
  --prune-empty --tag-name-filter cat -- --all

# Remover .env del historial
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Limpiar y forzar push
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

---

## 🔐 Regenerar Credenciales de Firebase

**MUY IMPORTANTE:** Si tus credenciales ya estaban en GitHub, debes regenerarlas:

### **Pasos en Firebase Console:**

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto: `laburitoya-6e55d`
3. Ve a **Configuración del proyecto** (⚙️)
4. En la pestaña **General**, busca "Tus apps"
5. Haz clic en **Regenerar credenciales** o crea una nueva app
6. Copia las nuevas credenciales
7. Actualiza tu archivo `.env` local con las nuevas credenciales

### **Actualizar .env con nuevas credenciales:**

```env
FIREBASE_DATABASE_URL=https://TU-NUEVA-URL.firebaseio.com
FIREBASE_PROJECT_ID=tu-nuevo-project-id
ADMIN_EMAIL=laburitoya@gmail.com
```

---

## 🔥 Configurar Reglas de Seguridad en Firebase

### **Paso 1: Ir a Firebase Console**

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a **Realtime Database**
4. Haz clic en la pestaña **Reglas**

### **Paso 2: Copiar y pegar estas reglas**

```json
{
  "rules": {
    "usuarios": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && (auth.uid == $uid || root.child('usuarios').child(auth.uid).child('rol').val() == 'CEO')"
      }
    },
    "posts": {
      ".read": "auth != null",
      "$postId": {
        ".write": "auth != null && (!data.exists() || data.child('userId').val() == auth.uid || root.child('usuarios').child(auth.uid).child('rol').val() == 'CEO')"
      }
    },
    "mensajes": {
      "$chatId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "notificaciones": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null"
      }
    }
  }
}
```

### **Paso 3: Publicar las reglas**

Haz clic en **Publicar** para aplicar las reglas.

---

## 📋 Checklist Final

Marca cada item cuando lo completes:

### Configuración Básica:
- [ ] Verificar que `.gitignore` funciona correctamente
- [ ] Hacer commit de archivos seguros
- [ ] Verificar en GitHub que `.env` NO está presente
- [ ] Verificar en GitHub que `config.js` NO está presente

### Limpieza de Historial (si es necesario):
- [ ] Hacer backup del repositorio
- [ ] Limpiar archivos sensibles del historial de Git
- [ ] Forzar push de los cambios

### Regeneración de Credenciales:
- [ ] Regenerar credenciales en Firebase Console
- [ ] Actualizar archivo `.env` local
- [ ] Actualizar archivo `config.js` local
- [ ] Probar que la aplicación funciona con nuevas credenciales

### Configuración de Firebase:
- [ ] Configurar reglas de seguridad en Firebase
- [ ] Habilitar Firebase Authentication (recomendado)
- [ ] Configurar dominios autorizados
- [ ] Revisar logs de acceso

### Seguridad Adicional:
- [ ] Cambiar contraseña del correo admin
- [ ] Habilitar autenticación de dos factores
- [ ] Revisar permisos de usuarios en Firebase
- [ ] Configurar alertas de seguridad

---

## 🆘 Solución de Problemas

### **Problema: Git sigue mostrando .env o config.js**

```bash
# Remover del staging area
git rm --cached .env
git rm --cached config.js

# Hacer commit
git commit -m "Remover archivos sensibles del repositorio"
git push
```

### **Problema: La aplicación no funciona después de los cambios**

1. Verifica que `config.js` existe y tiene las credenciales correctas
2. Verifica que `.env` existe y tiene las credenciales correctas
3. Limpia la caché del navegador (Ctrl + Shift + R)
4. Revisa la consola del navegador por errores

### **Problema: Firebase rechaza las conexiones**

1. Verifica las reglas de seguridad en Firebase Console
2. Verifica que la URL de la base de datos es correcta
3. Verifica que el proyecto ID es correcto
4. Revisa los logs en Firebase Console

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas con algún paso:

1. Revisa el archivo `SECURITY.md` para más detalles
2. Consulta la documentación de Firebase
3. Revisa los logs de la consola del navegador
4. Contacta al equipo de desarrollo

---

## ✅ Confirmación Final

Una vez completados todos los pasos, tu repositorio estará seguro:

- ✅ Credenciales protegidas con `.gitignore`
- ✅ Variables de entorno configuradas
- ✅ Historial de Git limpio
- ✅ Credenciales regeneradas
- ✅ Reglas de seguridad configuradas en Firebase
- ✅ Documentación completa disponible

**¡Tu aplicación ahora es mucho más segura! 🎉**

---

**Fecha de creación:** Enero 2024  
**Última actualización:** Enero 2024
