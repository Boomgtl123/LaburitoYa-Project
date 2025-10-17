# 🚀 Instrucciones para Desplegar Firebase Functions

## Requisitos Previos

1. **Node.js y npm instalados**
   ```bash
   node --version  # Debe ser v18 o superior
   npm --version
   ```

2. **Firebase CLI instalado**
   ```bash
   npm install -g firebase-tools
   ```

3. **Iniciar sesión en Firebase**
   ```bash
   firebase login
   ```

## Pasos para Desplegar

### 1. Instalar Dependencias

```bash
cd functions
npm install
cd ..
```

### 2. Verificar Configuración

Asegúrate de que `.firebaserc` tenga el proyecto correcto:
```json
{
  "projects": {
    "default": "laburitoya-6e55d"
  }
}
```

### 3. Probar Localmente (Opcional)

```bash
# Iniciar emuladores locales
firebase emulators:start --only functions

# Las funciones estarán disponibles en:
# http://localhost:5001/laburitoya-6e55d/us-central1/mercadopagoWebhook
```

### 4. Desplegar a Producción

```bash
# Desplegar solo las funciones
firebase deploy --only functions

# O desplegar todo (hosting + functions + database rules)
firebase deploy
```

### 5. Verificar Despliegue

Después del despliegue, verás las URLs de las funciones:
```
✔  functions[mercadopagoWebhook(us-central1)]: Successful create operation.
Function URL: https://us-central1-laburitoya-6e55d.cloudfunctions.net/mercadopagoWebhook
```

## Configurar Webhook en Mercado Pago

### 1. Ir al Panel de Mercado Pago

1. Acceder a: https://www.mercadopago.com.ar/developers/panel
2. Ir a "Tus integraciones" → Seleccionar tu aplicación
3. Ir a "Webhooks"

### 2. Configurar URL del Webhook

**URL del Webhook:**
```
https://us-central1-laburitoya-6e55d.cloudfunctions.net/mercadopagoWebhook
```

**Eventos a suscribirse:**
- ✅ `payment` - Notificaciones de pagos
- ✅ `subscription` - Notificaciones de suscripciones
- ✅ `subscription_preapproval` - Notificaciones de pre-aprobaciones
- ✅ `subscription_authorized_payment` - Pagos autorizados de suscripciones

### 3. Probar Webhook

Mercado Pago tiene una opción para enviar un webhook de prueba. Úsala para verificar que todo funciona.

## Verificar Logs

### Ver logs en tiempo real:
```bash
firebase functions:log --only mercadopagoWebhook
```

### Ver logs en Firebase Console:
1. Ir a: https://console.firebase.google.com/project/laburitoya-6e55d/functions
2. Seleccionar la función
3. Ver "Logs"

## Estructura de Base de Datos

Las funciones crearán automáticamente estas estructuras en Firebase:

### `/subscriptions/{userId}`
```json
{
  "planId": "premium",
  "status": "active|pending|cancelled|failed|expired",
  "mercadopagoSubscriptionId": "xxx",
  "startDate": 1234567890,
  "nextBillingDate": "2025-02-17T00:00:00.000Z",
  "amount": 2000,
  "currency": "ARS"
}
```

### `/premiumUsers/{userId}`
```json
{
  "isPremium": true,
  "activatedAt": 1234567890,
  "expiresAt": "2025-02-17T00:00:00.000Z",
  "benefits": ["green_name", "verified_badge", ...]
}
```

### `/subscriptionLogs/{logId}`
```json
{
  "type": "payment_success|payment_failed|subscription_created|...",
  "userId": "xxx",
  "timestamp": 1234567890,
  "data": {...}
}
```

## Funciones Disponibles

### 1. `mercadopagoWebhook` (HTTP)
- **URL:** `https://us-central1-laburitoya-6e55d.cloudfunctions.net/mercadopagoWebhook`
- **Método:** POST
- **Descripción:** Recibe notificaciones de Mercado Pago

### 2. `createSubscription` (Callable)
- **Uso desde frontend:**
  ```javascript
  const createSubscription = firebase.functions().httpsCallable('createSubscription');
  const result = await createSubscription({ planId: 'premium' });
  ```

### 3. `cancelSubscription` (Callable)
- **Uso desde frontend:**
  ```javascript
  const cancelSubscription = firebase.functions().httpsCallable('cancelSubscription');
  const result = await cancelSubscription();
  ```

### 4. `getSubscriptionStatus` (Callable)
- **Uso desde frontend:**
  ```javascript
  const getStatus = firebase.functions().httpsCallable('getSubscriptionStatus');
  const result = await getStatus();
  ```

### 5. `assignPremiumManual` (Callable - Solo CEO/SUSCRIPCIONES)
- **Uso desde frontend:**
  ```javascript
  const assignPremium = firebase.functions().httpsCallable('assignPremiumManual');
  const result = await assignPremium({ 
    targetUserId: 'xxx', 
    durationMonths: 1 
  });
  ```

### 6. `getSubscriptionMetrics` (Callable - Solo CEO/SUSCRIPCIONES)
- **Uso desde frontend:**
  ```javascript
  const getMetrics = firebase.functions().httpsCallable('getSubscriptionMetrics');
  const result = await getMetrics();
  ```

### 7. `checkExpiredSubscriptions` (Scheduled)
- **Ejecución:** Automática todos los días a medianoche (Argentina)
- **Descripción:** Verifica y desactiva suscripciones expiradas

## Troubleshooting

### Error: "Permission denied"
```bash
firebase login --reauth
```

### Error: "Functions did not deploy properly"
```bash
# Verificar logs
firebase functions:log

# Verificar sintaxis
cd functions
npm run lint
```

### Error: "Billing account not configured"
Firebase Functions requiere una cuenta de facturación configurada:
1. Ir a: https://console.firebase.google.com/project/laburitoya-6e55d/usage
2. Configurar plan Blaze (pago por uso)
3. Nota: El plan gratuito incluye 2M de invocaciones/mes

### Webhook no recibe notificaciones
1. Verificar que la URL esté correctamente configurada en Mercado Pago
2. Verificar logs: `firebase functions:log --only mercadopagoWebhook`
3. Probar con webhook de prueba desde panel de Mercado Pago
4. Verificar que la función esté desplegada: `firebase functions:list`

## Costos Estimados

Con el plan Blaze de Firebase:
- **Invocaciones:** 2M gratis/mes, luego $0.40 por millón
- **Tiempo de ejecución:** 400,000 GB-segundos gratis/mes
- **Salida de red:** 5GB gratis/mes

**Estimación para LaburitoYa:**
- Con 1000 suscriptores activos
- ~30,000 invocaciones/mes (webhooks + llamadas)
- Costo estimado: **$0-5 USD/mes**

## Monitoreo

### Dashboard de Firebase
https://console.firebase.google.com/project/laburitoya-6e55d/functions

### Métricas importantes:
- ✅ Invocaciones exitosas
- ❌ Errores
- ⏱️ Tiempo de ejecución
- 💰 Costos

## Seguridad

### Variables de Entorno (Opcional)
Para mayor seguridad, puedes mover el Access Token a variables de entorno:

```bash
firebase functions:config:set mercadopago.access_token="APP_USR-xxx"
```

Luego en el código:
```javascript
const accessToken = functions.config().mercadopago.access_token;
```

## Próximos Pasos

1. ✅ Desplegar funciones
2. ✅ Configurar webhook en Mercado Pago
3. ✅ Probar con pago de prueba
4. ✅ Verificar logs
5. ✅ Implementar frontend de suscripciones
6. ✅ Probar flujo completo

---

**Última actualización:** 2025-01-17
**Documentación completa:** Ver `PLAN_SUSCRIPCIONES.md`
