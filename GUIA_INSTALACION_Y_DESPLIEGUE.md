# 🚀 Guía Completa de Instalación y Despliegue - LaburitoYa Suscripciones

## ⚠️ Requisitos Detectados

Tu sistema actualmente **NO tiene instalado**:
- ❌ Node.js
- ❌ npm
- ❌ Firebase CLI

**Necesitamos instalar estos componentes antes de desplegar.**

---

## 📋 PASO 1: Instalar Homebrew (si no lo tienes)

Homebrew es el gestor de paquetes para macOS.

```bash
# Verificar si Homebrew está instalado
brew --version

# Si no está instalado, ejecutar:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

---

## 📋 PASO 2: Instalar Node.js y npm

### Opción A: Usando Homebrew (Recomendado)

```bash
# Instalar Node.js (incluye npm)
brew install node

# Verificar instalación
node --version    # Debe mostrar v18.x.x o superior
npm --version     # Debe mostrar 9.x.x o superior
```

### Opción B: Descarga Directa

1. Ir a: https://nodejs.org/
2. Descargar la versión LTS (Long Term Support)
3. Ejecutar el instalador
4. Seguir las instrucciones
5. Reiniciar la terminal

### Verificar Instalación

```bash
# Abrir una nueva terminal y ejecutar:
node --version
npm --version
```

---

## 📋 PASO 3: Instalar Firebase CLI

```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Verificar instalación
firebase --version
```

---

## 📋 PASO 4: Iniciar Sesión en Firebase

```bash
# Iniciar sesión con tu cuenta de Google
firebase login

# Esto abrirá un navegador para autenticarte
# Selecciona la cuenta asociada a laburitoya-6e55d
```

---

## 📋 PASO 5: Verificar Proyecto Firebase

```bash
# Navegar al directorio del proyecto
cd /Users/boomdigital/Desktop/LaburitoYa

# Verificar que el proyecto está configurado
firebase projects:list

# Debe mostrar: laburitoya-6e55d
```

---

## 📋 PASO 6: Instalar Dependencias del Proyecto

```bash
# Navegar a la carpeta functions
cd functions

# Instalar todas las dependencias
npm install

# Esto instalará:
# - firebase-admin
# - firebase-functions
# - axios
```

---

## 📋 PASO 7: Configurar Plan de Facturación

**IMPORTANTE:** Firebase Functions requiere el plan Blaze (pago por uso).

### Verificar Plan Actual:

1. Ir a: https://console.firebase.google.com/project/laburitoya-6e55d/usage
2. Verificar el plan actual

### Si estás en el plan Spark (gratuito):

1. Hacer clic en "Actualizar proyecto"
2. Seleccionar plan "Blaze"
3. Agregar método de pago
4. **Nota:** El plan incluye:
   - 2M de invocaciones gratis/mes
   - 400,000 GB-segundos gratis/mes
   - Solo pagas si excedes estos límites

### Costos Estimados:

Con el sistema de suscripciones:
- **0-100 suscriptores:** $0 USD/mes (dentro del plan gratuito)
- **100-1000 suscriptores:** $0-5 USD/mes
- **1000+ suscriptores:** $5-20 USD/mes

---

## 📋 PASO 8: Desplegar Firebase Functions

```bash
# Volver a la raíz del proyecto
cd ..

# Desplegar SOLO las functions
firebase deploy --only functions

# O desplegar todo (hosting + functions + database)
firebase deploy
```

### Salida Esperada:

```
=== Deploying to 'laburitoya-6e55d'...

i  deploying functions
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
✔  functions: required API cloudbuild.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (XX.XX KB) for uploading
✔  functions: functions folder uploaded successfully

i  functions: creating Node.js 18 function mercadopagoWebhook(us-central1)...
✔  functions[mercadopagoWebhook(us-central1)]: Successful create operation.
Function URL: https://us-central1-laburitoya-6e55d.cloudfunctions.net/mercadopagoWebhook

i  functions: creating Node.js 18 function createSubscription(us-central1)...
✔  functions[createSubscription(us-central1)]: Successful create operation.

i  functions: creating Node.js 18 function cancelSubscription(us-central1)...
✔  functions[cancelSubscription(us-central1)]: Successful create operation.

i  functions: creating Node.js 18 function getSubscriptionStatus(us-central1)...
✔  functions[getSubscriptionStatus(us-central1)]: Successful create operation.

i  functions: creating Node.js 18 function assignPremiumManual(us-central1)...
✔  functions[assignPremiumManual(us-central1)]: Successful create operation.

i  functions: creating Node.js 18 function getSubscriptionMetrics(us-central1)...
✔  functions[getSubscriptionMetrics(us-central1)]: Successful create operation.

i  functions: creating Node.js 18 function checkExpiredSubscriptions(us-central1)...
✔  functions[checkExpiredSubscriptions(us-central1)]: Successful create operation.

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/laburitoya-6e55d/overview
```

---

## 📋 PASO 9: Verificar el Despliegue

### Opción 1: Listar Functions

```bash
firebase functions:list
```

Debe mostrar las 7 functions:
- mercadopagoWebhook
- createSubscription
- cancelSubscription
- getSubscriptionStatus
- assignPremiumManual
- getSubscriptionMetrics
- checkExpiredSubscriptions

### Opción 2: Ver en Firebase Console

1. Ir a: https://console.firebase.google.com/project/laburitoya-6e55d/functions
2. Verificar que todas las functions aparecen con estado "Activo" (verde)

### Opción 3: Probar el Webhook

```bash
curl -X POST \
  https://us-central1-laburitoya-6e55d.cloudfunctions.net/mercadopagoWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "updated",
    "type": "subscription_preapproval",
    "data": {"id": "123456"}
  }'
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

---

## 📋 PASO 10: Configurar Webhook en Mercado Pago

Ahora que las functions están desplegadas:

1. Ir a: https://www.mercadopago.com.ar/developers/panel
2. Seleccionar tu aplicación (ID: 7755486415585411)
3. Ir a "Webhooks"
4. Agregar nueva URL:
   ```
   https://us-central1-laburitoya-6e55d.cloudfunctions.net/mercadopagoWebhook
   ```
5. Seleccionar eventos:
   - ✅ payment
   - ✅ subscription
   - ✅ subscription_preapproval
   - ✅ subscription_authorized_payment
6. Guardar
7. Hacer clic en "Probar" o "Test"
8. **Ahora debe responder 200 OK** (en lugar de 404)

---

## 📋 PASO 11: Probar el Sistema Completo

### 1. Probar Página de Suscripción

```bash
# Abrir en navegador
open https://laburitoya.online/src/pages/subscription.html
```

### 2. Probar Panel de Administración

```bash
# Abrir en navegador
open https://laburitoya.online/src/pages/subscription-admin.html
```

### 3. Probar Flujo de Suscripción

1. Ir a la página de suscripción
2. Hacer clic en "Suscribirse a Premium"
3. Usar tarjeta de prueba de Mercado Pago:
   - **Tarjeta:** 5031 7557 3453 0604
   - **Vencimiento:** 11/25
   - **CVV:** 123
   - **Nombre:** APRO (para aprobar)
4. Completar el pago
5. Verificar que redirige a subscription-success.html
6. Verificar que el usuario tiene nombre verde
7. Verificar que aparece primero en búsquedas

---

## 📋 PASO 12: Monitorear Logs

### Ver logs en tiempo real:

```bash
# Logs del webhook
firebase functions:log --only mercadopagoWebhook

# Logs de todas las functions
firebase functions:log

# Logs con filtro
firebase functions:log --only mercadopagoWebhook --lines 50
```

### Ver logs en Firebase Console:

1. Ir a: https://console.firebase.google.com/project/laburitoya-6e55d/functions
2. Seleccionar una function
3. Hacer clic en "Logs"
4. Ver logs en tiempo real

---

## ⚠️ Solución de Problemas

### Problema: "Billing account not configured"

**Solución:**
1. Ir a: https://console.firebase.google.com/project/laburitoya-6e55d/usage
2. Actualizar a plan Blaze
3. Agregar método de pago

### Problema: "Permission denied"

**Solución:**
```bash
firebase login --reauth
```

### Problema: "Functions did not deploy properly"

**Solución:**
```bash
# Ver logs de error
firebase functions:log

# Verificar sintaxis
cd functions
npm run lint
```

### Problema: Error en dependencias

**Solución:**
```bash
cd functions
rm -rf node_modules
rm package-lock.json
npm install
cd ..
firebase deploy --only functions
```

---

## 📊 Verificación Final

### Checklist de Despliegue:

- [ ] Node.js instalado (v18+)
- [ ] npm instalado
- [ ] Firebase CLI instalado
- [ ] Sesión iniciada en Firebase
- [ ] Plan Blaze activado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Functions desplegadas (`firebase deploy --only functions`)
- [ ] Webhook configurado en Mercado Pago
- [ ] Webhook responde 200 OK
- [ ] Página de suscripción funciona
- [ ] Panel admin funciona
- [ ] Logs visibles en Firebase Console

---

## 🎯 Resumen de Comandos

```bash
# 1. Instalar Homebrew (si no lo tienes)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Instalar Node.js
brew install node

# 3. Instalar Firebase CLI
npm install -g firebase-tools

# 4. Iniciar sesión
firebase login

# 5. Navegar al proyecto
cd /Users/boomdigital/Desktop/LaburitoYa

# 6. Instalar dependencias
cd functions && npm install && cd ..

# 7. Desplegar
firebase deploy --only functions

# 8. Verificar
firebase functions:list

# 9. Ver logs
firebase functions:log
```

---

## 📞 Soporte

Si encuentras algún problema:

1. **Ver logs:**
   ```bash
   firebase functions:log
   ```

2. **Verificar estado:**
   ```bash
   firebase functions:list
   ```

3. **Revisar Firebase Console:**
   https://console.firebase.google.com/project/laburitoya-6e55d/functions

---

**Tiempo estimado total:** 30-45 minutos (incluyendo instalaciones)

**Una vez completado, el sistema estará 100% operativo y listo para generar ingresos.**

---

**Última actualización:** 2025-01-17
**Proyecto:** LaburitoYa - Sistema de Suscripciones Premium
