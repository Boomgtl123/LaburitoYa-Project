# 📋 PLAN DE INTEGRACIÓN FRONTEND - SISTEMA DE SUSCRIPCIONES

## 🎯 OBJETIVO
Integrar el sistema de suscripciones Premium en el frontend de LaburitoYa

---

## ✅ COMPLETADO
1. ✅ Firebase Functions desplegadas (7 funciones)
2. ✅ Webhook URL generada
3. ✅ Backend 100% funcional

---

## 🔧 PENDIENTE - FRONTEND

### 1. PERFIL DE USUARIO (profile.html)

#### Cambios necesarios:
- [ ] Agregar botón "⭐ Hazte Premium" en la sección de acciones del perfil
- [ ] Mostrar badge "Premium" si el usuario tiene suscripción activa
- [ ] Agregar indicador visual de estado Premium (nombre verde, badge verificado)
- [ ] Botón para gestionar suscripción (si ya es Premium)

#### Ubicación:
```html
<!-- En profile-instagram-actions, después de btnEditProfile -->
<button class="profile-btn profile-btn-premium" id="btnGetPremium">
  <span class="profile-btn-icon">⭐</span>
  <span>Hazte Premium</span>
</button>
```

#### Funcionalidad:
- Al hacer clic → Redirigir a `/src/pages/subscription.html`
- Si ya es Premium → Mostrar "Gestionar Suscripción"

---

### 2. PANEL DE ADMINISTRACIÓN (admin-panel.html)

#### Cambios necesarios:
- [ ] Agregar nueva sección "Suscripciones" en el sidebar
- [ ] Crear vista de gestión de suscripciones
- [ ] Mostrar métricas de suscripciones
- [ ] Permitir asignar Premium manualmente (solo CEO/SUSCRIPCIONES)
- [ ] Ver historial de pagos y suscripciones

#### Ubicación en sidebar:
```html
<button class="menu-item" data-section="suscripciones" data-permission="gestionar_suscripciones">
  <span class="menu-icon">👑</span>
  <span class="menu-text">Suscripciones</span>
</button>
```

#### Contenido de la sección:
1. **Métricas principales:**
   - Total suscripciones activas
   - Ingresos mensuales
   - Tasa de conversión
   - Suscripciones canceladas

2. **Tabla de suscripciones:**
   - Usuario
   - Plan
   - Estado
   - Fecha de inicio
   - Próximo pago
   - Acciones (cancelar, renovar)

3. **Asignación manual:**
   - Buscar usuario
   - Seleccionar duración (1, 3, 6, 12 meses)
   - Asignar Premium

---

### 3. PÁGINA DE SUSCRIPCIÓN (subscription.html)

#### Estado actual:
✅ Ya existe la página
✅ Diseño completo
✅ Integración con Mercado Pago

#### Verificar:
- [ ] Conexión con Firebase Functions
- [ ] Llamada correcta a `createSubscription`
- [ ] Manejo de respuestas del webhook
- [ ] Redirecciones correctas (success, failure, pending)

---

### 4. NAVBAR GLOBAL

#### Cambios necesarios:
- [ ] Agregar indicador Premium en el avatar del usuario
- [ ] Mostrar badge "⭐ Premium" en el menú desplegable
- [ ] Link rápido a "Gestionar Suscripción" (si es Premium)

---

### 5. HOME (home.html)

#### Cambios necesarios:
- [ ] Banner promocional de Premium (para usuarios no Premium)
- [ ] Destacar usuarios Premium en el feed
- [ ] Mostrar beneficios Premium en lugares estratégicos

---

## 📝 ARCHIVOS A MODIFICAR

### HTML:
1. `src/pages/profile.html` - Agregar botón Premium
2. `src/pages/admin-panel.html` - Agregar sección Suscripciones
3. `src/pages/home.html` - Banner promocional (opcional)

### JavaScript:
1. `src/js/profile-instagram.js` - Lógica del botón Premium
2. `src/js/admin-panel.js` - Gestión de suscripciones
3. `src/js/subscriptions.js` - Ya existe, verificar integración
4. Crear: `src/js/subscription-admin.js` - Panel admin de suscripciones

### CSS:
1. `src/css/profile-instagram.css` - Estilos del botón Premium
2. `src/css/admin-panel.css` - Estilos de sección Suscripciones
3. `src/css/subscription.css` - Ya existe

---

## 🔗 INTEGRACIÓN CON FIREBASE FUNCTIONS

### Funciones a usar en el frontend:

```javascript
// 1. Crear suscripción
const functions = firebase.functions();
const createSub = functions.httpsCallable('createSubscription');
const result = await createSub({ planId: 'premium' });

// 2. Obtener estado
const getStatus = functions.httpsCallable('getSubscriptionStatus');
const status = await getStatus();

// 3. Cancelar suscripción
const cancelSub = functions.httpsCallable('cancelSubscription');
await cancelSub();

// 4. Asignar Premium manual (solo admin)
const assignPremium = functions.httpsCallable('assignPremiumManual');
await assignPremium({ 
  targetUserId: 'userId', 
  durationMonths: 3 
});

// 5. Obtener métricas (solo admin)
const getMetrics = functions.httpsCallable('getSubscriptionMetrics');
const metrics = await getMetrics();
```

---

## 🎨 DISEÑO Y UX

### Botón Premium en Perfil:
```css
.profile-btn-premium {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.profile-btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
```

### Badge Premium:
```css
.premium-badge {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #000;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Perfil de Usuario
- [ ] Agregar botón "Hazte Premium"
- [ ] Verificar estado de suscripción al cargar perfil
- [ ] Mostrar badge Premium si aplica
- [ ] Implementar redirección a subscription.html
- [ ] Probar flujo completo

### Fase 2: Panel de Administración
- [ ] Agregar sección "Suscripciones" en sidebar
- [ ] Crear vista de métricas
- [ ] Implementar tabla de suscripciones
- [ ] Agregar formulario de asignación manual
- [ ] Conectar con Firebase Functions
- [ ] Probar permisos (solo CEO/SUSCRIPCIONES)

### Fase 3: Verificación y Testing
- [ ] Probar creación de suscripción
- [ ] Verificar activación de Premium
- [ ] Probar cancelación
- [ ] Verificar asignación manual
- [ ] Comprobar métricas en admin
- [ ] Testing en móvil y desktop

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **Modificar profile.html** - Agregar botón Premium
2. **Modificar admin-panel.html** - Agregar sección Suscripciones
3. **Actualizar JavaScript** - Conectar con Firebase Functions
4. **Testing completo** - Verificar todo el flujo

---

## 📞 CONFIGURACIÓN ADICIONAL REQUERIDA

### En Mercado Pago:
- [ ] Configurar webhook URL en la cuenta
- [ ] Verificar credenciales de producción
- [ ] Probar pagos de prueba

### En Firebase:
- [ ] Verificar reglas de seguridad
- [ ] Configurar índices si es necesario
- [ ] Monitorear logs de Functions

---

*Este plan cubre toda la integración frontend del sistema de suscripciones*
