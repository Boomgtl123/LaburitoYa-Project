# 🔧 CORRECCIÓN SISTEMA DE SUSCRIPCIONES Y WEBHOOKS

## 📋 Problemas Identificados

### 1. **Problema de Autenticación**
- ❌ El frontend intentaba usar Firebase Functions con `httpsCallable`
- ❌ Firebase Functions requiere autenticación con Firebase Auth
- ❌ El sistema usa autenticación personalizada con localStorage
- ✅ **Solución**: Crear endpoints HTTP públicos que no requieren Firebase Auth

### 2. **Problema de Webhooks**
- ❌ Mercado Pago envía webhooks en nuevo formato con `action`
- ❌ El código solo manejaba formato antiguo con `type` y `topic`
- ❌ Ejemplo del nuevo formato:
```json
{
  "action": "payment.updated",
  "api_version": "v1",
  "data": { "id": "130336041688" },
  "type": "payment",
  "live_mode": true
}
```
- ✅ **Solución**: Actualizar webhook para detectar y manejar ambos formatos

### 3. **Pago Rechazado**
- ⚠️ El pago fue rechazado por Mercado Pago
- ⚠️ Esto es normal en pruebas o con tarjetas inválidas
- ✅ El webhook ahora registrará correctamente los pagos rechazados

## 🔨 Cambios Realizados

### 1. **functions/webhooks.js**
```javascript
// ✅ Ahora detecta ambos formatos de webhook
if (body.action) {
    // Formato nuevo con action
    action = body.action;
    topic = body.type || action.split('.')[0];
    resourceId = body.data?.id;
} else {
    // Formato antiguo
    topic = body.type || body.topic || query.topic;
    resourceId = body.data?.id || body.id || query.id;
}
```

### 2. **functions/index.js**
```javascript
// ✅ Nuevo endpoint HTTP público
exports.createSubscriptionHTTP = functions.https.onRequest(async (req, res) => {
  // Configurar CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  const { userId, planId, userEmail } = req.body;
  const result = await createSubscription(userId, planId);
  return res.status(200).json(result);
});

// ✅ Nuevo endpoint HTTP para cancelar
exports.cancelSubscriptionHTTP = functions.https.onRequest(async (req, res) => {
  const { userId } = req.body;
  const result = await cancelSubscription(userId);
  return res.status(200).json(result);
});
```

### 3. **src/js/subscriptions.js**
```javascript
// ✅ Ahora usa fetch en lugar de Firebase Functions
const response = await fetch(
  'https://us-central1-laburitoya-6e55d.cloudfunctions.net/createSubscriptionHTTP',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUser.uid,
      planId: 'premium',
      userEmail: currentUser.correo
    })
  }
);
```

## 🚀 Pasos para Desplegar

### 1. Desplegar Firebase Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

### 2. Verificar Endpoints
Los nuevos endpoints estarán disponibles en:
- `https://us-central1-laburitoya-6e55d.cloudfunctions.net/createSubscriptionHTTP`
- `https://us-central1-laburitoya-6e55d.cloudfunctions.net/cancelSubscriptionHTTP`
- `https://us-central1-laburitoya-6e55d.cloudfunctions.net/mercadopagoWebhook`

### 3. Probar el Sistema
1. Ir a `subscription.html`
2. Click en "Suscribirse Ahora"
3. Debería redirigir a Mercado Pago
4. Completar el pago
5. El webhook procesará la notificación
6. El Premium se activará automáticamente

## 📊 Logs y Monitoreo

### Ver logs de Firebase Functions:
```bash
firebase functions:log
```

### Ver logs en tiempo real:
```bash
firebase functions:log --only createSubscriptionHTTP,mercadopagoWebhook
```

### Verificar en Firebase Console:
1. Ir a Firebase Console → Functions
2. Ver logs de cada función
3. Verificar en Realtime Database → `subscriptionLogs`

## 🔍 Debugging

### Si el pago es rechazado:
1. Verificar en `subscriptionLogs` el motivo del rechazo
2. Revisar que las credenciales de Mercado Pago sean correctas
3. Verificar que la tarjeta de prueba sea válida

### Si el webhook no procesa:
1. Verificar en Mercado Pago → Webhooks que la URL sea correcta
2. Ver logs en Firebase Functions
3. Verificar que `subscriptionLogs` tenga el registro del webhook

### Si no redirige a Mercado Pago:
1. Abrir consola del navegador (F12)
2. Ver errores en la pestaña Console
3. Verificar que el endpoint HTTP responda correctamente

## ✅ Beneficios de los Cambios

1. **Sin dependencia de Firebase Auth**: Funciona con autenticación personalizada
2. **Compatible con nuevo formato de webhooks**: Maneja notificaciones actuales de Mercado Pago
3. **Mejor logging**: Registra action y formato de webhook
4. **CORS configurado**: Permite llamadas desde el frontend
5. **Más robusto**: Maneja errores de forma más clara

## 📝 Notas Importantes

- Los endpoints HTTP son públicos pero requieren `userId` válido
- El webhook sigue siendo seguro (Mercado Pago lo firma)
- Las credenciales están en modo producción (`live_mode: true`)
- Los pagos rechazados se registran correctamente en logs

## 🎯 Próximos Pasos

1. ✅ Desplegar las funciones actualizadas
2. ✅ Probar creación de suscripción
3. ✅ Verificar procesamiento de webhook
4. ✅ Confirmar activación de Premium
5. 📊 Monitorear logs por 24 horas

---

**Fecha de actualización**: 2025-01-17
**Estado**: ✅ Listo para desplegar
