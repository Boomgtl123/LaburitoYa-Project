# Sistema de Suscripciones LaburitoYa - Plan de Implementación

## 📋 Información del Proyecto

- **Dominio:** https://laburitoya.online/
- **Backend:** Firebase Functions
- **Plan Premium:** $2000 ARS/mes
- **Mercado Pago:**
  - Public Key: `APP_USR-aaeb1507-4edf-4214-a702-5d6dd077c9e2`
  - Access Token: `APP_USR-7755486415585411-101715-7ccc3b149d1a325b8ba922c16f531983-2927945637`

## 🎯 Objetivos

1. Sistema de suscripciones automáticas con Mercado Pago
2. Posteos gratuitos para todos
3. Solo CEO y rol "suscripciones" pueden gestionar el sistema
4. Renovación automática mensual
5. Beneficios Premium automáticos

## 📦 Estructura de Archivos a Crear

### Backend (Firebase Functions)
- `functions/index.js` - Funciones principales
- `functions/webhooks.js` - Manejo de webhooks de Mercado Pago
- `functions/subscriptions.js` - Lógica de suscripciones
- `functions/package.json` - Dependencias

### Frontend
- `src/js/subscriptions.js` - Cliente de suscripciones
- `src/js/mercadopago-client.js` - Integración con MP
- `src/pages/subscription.html` - Página de suscripción
- `src/pages/subscription-admin.html` - Panel admin
- `src/css/subscription.css` - Estilos

### Configuración
- `config/mercadopago.js` - Configuración de MP
- `config/subscription-plans.json` - Definición de planes

## 🔐 Roles y Permisos

### CEO
- Acceso total al sistema
- Ver métricas e ingresos
- Gestionar planes
- Asignar Premium manualmente
- Ver logs y auditoría

### Rol "suscripciones"
- Gestionar planes
- Ver suscriptores
- Ver métricas
- Gestionar pagos fallidos
- Ver logs

### Usuario Regular
- Ver planes disponibles
- Suscribirse a Premium
- Gestionar su suscripción
- Ver beneficios

## 💎 Beneficios Premium

1. **Nombre en VERDE** - Distintivo visual
2. **Prioridad en búsquedas** - Aparece primero
3. **Perfil verificado** - Badge especial
4. **Contacto directo** - Sin restricciones
5. **Estadísticas** - Vistas, interacciones
6. **Alertas de trabajos** - Notificaciones prioritarias
7. **Soporte prioritario** - Respuesta rápida

## 📊 Base de Datos (Firebase)

### /subscriptionPlans
```json
{
  "premium": {
    "id": "premium",
    "name": "Premium",
    "price": 2000,
    "currency": "ARS",
    "interval": "monthly",
    "benefits": [...],
    "active": true,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### /subscriptions
```json
{
  "userId": {
    "planId": "premium",
    "status": "active|cancelled|failed",
    "mercadopagoSubscriptionId": "xxx",
    "startDate": "timestamp",
    "nextBillingDate": "timestamp",
    "lastPaymentDate": "timestamp",
    "amount": 2000,
    "currency": "ARS"
  }
}
```

### /subscriptionLogs
```json
{
  "logId": {
    "userId": "xxx",
    "action": "payment_success|payment_failed|cancelled",
    "timestamp": "xxx",
    "details": {...},
    "webhookData": {...}
  }
}
```

### /premiumUsers
```json
{
  "userId": {
    "isPremium": true,
    "activatedAt": "timestamp",
    "expiresAt": "timestamp",
    "benefits": [...]
  }
}
```

## 🔄 Flujo de Suscripción

1. Usuario hace clic en "Suscribirse a Premium"
2. Se crea preferencia en Mercado Pago
3. Usuario completa el pago
4. Webhook notifica a Firebase Functions
5. Function actualiza estado del usuario
6. Se activan beneficios Premium
7. Usuario recibe confirmación

## 🔔 Webhooks de Mercado Pago

### Eventos a Manejar
- `payment.created` - Pago creado
- `payment.updated` - Pago actualizado
- `subscription.created` - Suscripción creada
- `subscription.updated` - Suscripción actualizada
- `subscription.cancelled` - Suscripción cancelada

### URL del Webhook
`https://us-central1-laburitoya-6e55d.cloudfunctions.net/mercadopagoWebhook`

## 📈 Métricas y Reportes

### Dashboard CEO
- Ingresos totales
- Ingresos mensuales
- Suscriptores activos
- Tasa de conversión
- Tasa de cancelación
- Pagos fallidos
- Gráficos de crecimiento

### Reportes Descargables
- CSV de suscriptores
- CSV de transacciones
- CSV de ingresos mensuales
- PDF de métricas

## 🛡️ Seguridad

1. Validación de firma de webhooks
2. Verificación de roles en cada acción
3. Logs de auditoría
4. Encriptación de datos sensibles
5. Rate limiting en endpoints

## 📝 Tareas de Implementación

### Fase 1: Configuración Base ✅
- [x] Crear rol "suscripciones"
- [x] Configurar credenciales de Mercado Pago
- [x] Crear estructura de base de datos

### Fase 2: Backend/Webhooks
- [ ] Configurar Firebase Functions
- [ ] Implementar webhook handler
- [ ] Procesar notificaciones de pago
- [ ] Actualizar estado de usuarios

### Fase 3: Panel de Administración
- [ ] Crear página de admin
- [ ] CRUD de planes
- [ ] Dashboard de métricas
- [ ] Lista de suscriptores
- [ ] Logs y auditoría

### Fase 4: Frontend Usuario
- [ ] Página de suscripción
- [ ] Integración con Mercado Pago
- [ ] Gestión de suscripción
- [ ] Visualización de beneficios

### Fase 5: Beneficios Premium
- [ ] Nombre en verde
- [ ] Prioridad en búsquedas
- [ ] Estadísticas de perfil
- [ ] Alertas de trabajos
- [ ] Soporte prioritario

### Fase 6: Testing y Deploy
- [ ] Pruebas de pago
- [ ] Pruebas de webhooks
- [ ] Pruebas de beneficios
- [ ] Deploy a producción

## 🚀 Próximos Pasos

1. Crear rol "suscripciones" en roles.js
2. Configurar Firebase Functions
3. Implementar webhook handler
4. Crear panel de administración
5. Implementar frontend de suscripción
6. Activar beneficios Premium
7. Testing completo
8. Deploy a producción

---

**Fecha de inicio:** 2025-01-17
**Estado:** En desarrollo
