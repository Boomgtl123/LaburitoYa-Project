# 🔧 Solución al Error 404 del Webhook de Mercado Pago

## ❌ Problema Actual

Mercado Pago está intentando enviar notificaciones al webhook:
```
https://us-central1-laburitoya-6e55d.cloudfunctions.net/mercadopagoWebhook
```

Pero recibe un error **404 - Not Found** porque **las Firebase Functions aún no están desplegadas**.

### Solicitud de Prueba de Mercado Pago:
```json
{
  "action": "updated",
  "application_id": "7755486415585411",
  "data": {"id":"123456"},
  "date": "2021-11-01T02:02:02Z",
  "entity": "preapproval",
  "id": "123456",
  "type": "subscription_preapproval",
  "version": 8
}
```

### Respuesta Actual:
```
404 - Not Found
Descripción: No encontramos la URL ingresada.
```

---

## ✅ SOLUCIÓN: Desplegar Firebase Functions

### Paso 1: Verificar Requisitos Previos

```bash
# 1. Verificar Node.js (debe ser v18 o superior)
node --version

# 2. Verificar Firebase CLI
firebase --version

# 3. Si no está instalado:
npm install -g firebase-tools

# 4. Iniciar sesión en Firebase
firebase login
```

### Paso 2: Instalar Dependencias

```bash
# Navegar a la carpeta functions
cd functions

# Instalar todas las dependencias
npm install

# Verificar que se instalaron correctamente
npm list
```

### Paso 3: Verificar Configuración del Proyecto

```bash
# Volver a la raíz del proyecto
cd ..

# Verificar que .firebaserc tiene el proyecto correcto
cat .firebaserc
```

Debe mostrar:
```json
{
  "projects": {
    "default": "laburitoya-6e55d"
  }
}
```

### Paso 4: Desplegar las Functions

```bash
# Desplegar SOLO las functions (no hosting ni database)
firebase deploy --only functions

# O si quieres desplegar todo:
firebase deploy
```

### Paso 5: Verificar el Despliegue

Después del despliegue exitoso, verás algo como:

```
✔  functions[mercadopagoWebhook(us-central1)]: Successful create operation.
Function URL: https://us-central1-laburitoya-6e55d.cloudfunctions.net/mercadopagoWebhook

✔  functions[createSubscription(us-central1)]: Successful create operation.
✔  functions[cancelSubscription(us-central1)]: Successful create operation.
✔  functions[getSubscriptionStatus(us-central1)]: Successful create operation.
✔  functions[assignPremiumManual(us-central1)]: Successful create operation.
✔  functions[getSubscriptionMetrics(us-central1)]: Successful create operation.
✔  functions[checkExpiredSubscriptions(us-central1)]: Successful create operation.

✔  Deploy complete!
```

### Paso 6: Probar el Webhook Nuevamente

1. Ir a: https://www.mercadopago.com.ar/developers/panel
2. Seleccionar tu aplicación
3. Ir a "Webhooks"
4. Hacer clic en "Probar" o "Test"
5. Ahora debería responder **200 OK** en lugar de 404

---

## 🔍 Verificar que las Functions Están Activas

### Opción 1: Desde la Terminal
```bash
# Listar todas las functions desplegadas
firebase functions:list

# Ver logs en tiempo real
firebase functions:log --only mercadopagoWebhook
```

### Opción 2: Desde Firebase Console
1. Ir a: https://console.firebase.google.com/project/laburitoya-6e55d/functions
2. Verificar que aparezcan las 7 functions
3. Verificar que el estado sea "Activo" (verde)

### Opción 3: Probar Directamente con cURL
```bash
# Probar el webhook con una solicitud POST
curl -X POST \
  https://us-central1-laburitoya-6e55d.cloudfunctions.net/mercadopagoWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "updated",
    "type": "subscription_preapproval",
    "data": {"id": "123456"}
  }'
```

Si está funcionando, debería responder:
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

---

## ⚠️ Posibles Problemas y Soluciones

### Problema 1: "Billing account not configured"
**Solución:**
1. Ir a: https://console.firebase.google.com/project/laburitoya-6e55d/usage
2. Actualizar a plan Blaze (pago por uso)
3. Nota: El plan gratuito incluye 2M de invocaciones/mes

### Problema 2: "Permission denied"
**Solución:**
```bash
firebase login --reauth
```

### Problema 3: "Functions did not deploy properly"
**Solución:**
```bash
# Ver logs de error
firebase functions:log

# Verificar sintaxis
cd functions
npm run lint
```

### Problema 4: Error en package.json
**Solución:**
Verificar que `functions/package.json` tenga:
```json
{
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "firebase-admin": "^11.8.0",
    "firebase-functions": "^4.3.1",
    "axios": "^1.6.0"
  }
}
```

---

## 📊 Después del Despliegue

### 1. Configurar el Webhook en Mercado Pago

Una vez que las functions estén desplegadas:

1. Ir a: https://www.mercadopago.com.ar/developers/panel
2. Seleccionar tu aplicación
3. Ir a "Webhooks"
4. Agregar URL: `https://us-central1-laburitoya-6e55d.cloudfunctions.net/mercadopagoWebhook`
5. Seleccionar eventos:
   - ✅ payment
   - ✅ subscription
   - ✅ subscription_preapproval
   - ✅ subscription_authorized_payment
6. Guardar
7. Probar con "Test" - Ahora debería responder **200 OK**

### 2. Verificar Logs en Firebase

```bash
# Ver logs en tiempo real
firebase functions:log --only mercadopagoWebhook

# Ver logs de todas las functions
firebase functions:log
```

### 3. Probar el Flujo Completo

1. Ir a: https://laburitoya.online/src/pages/subscription.html
2. Hacer clic en "Suscribirse a Premium"
3. Completar el pago con tarjeta de prueba
4. Verificar que se activa Premium
5. Verificar logs en Firebase Console

---

## 🎯 Resumen

### Estado Actual:
❌ **Webhook devuelve 404** porque las Firebase Functions no están desplegadas

### Solución:
✅ **Desplegar Firebase Functions** con el comando:
```bash
cd functions && npm install && cd .. && firebase deploy --only functions
```

### Resultado Esperado:
✅ Webhook responde **200 OK**
✅ Sistema de suscripciones completamente funcional
✅ Activación automática de Premium al pagar

---

## 📞 Soporte

Si encuentras algún problema durante el despliegue:

1. **Ver logs de error:**
   ```bash
   firebase functions:log
   ```

2. **Verificar estado de las functions:**
   ```bash
   firebase functions:list
   ```

3. **Revisar Firebase Console:**
   https://console.firebase.google.com/project/laburitoya-6e55d/functions

---

**Nota Importante:** El error 404 es completamente normal antes del despliegue. Una vez que despliegues las Firebase Functions, el webhook funcionará correctamente y el sistema estará 100% operativo.

---

**Última actualización:** 2025-01-17
**Proyecto:** LaburitoYa - Sistema de Suscripciones
