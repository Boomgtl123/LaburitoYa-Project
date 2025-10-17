const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { handleMercadoPagoWebhook } = require('./webhooks');
const { 
  createSubscription, 
  cancelSubscription, 
  updateSubscriptionStatus,
  checkExpiredSubscriptions 
} = require('./subscriptions');

// Inicializar Firebase Admin
admin.initializeApp();

// ========== WEBHOOK DE MERCADO PAGO ==========
// Endpoint para recibir notificaciones de Mercado Pago
exports.mercadopagoWebhook = functions.https.onRequest(async (req, res) => {
  console.log('📥 Webhook recibido de Mercado Pago');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query:', req.query);

  // Mercado Pago envía notificaciones por POST
  if (req.method !== 'POST') {
    console.log('❌ Método no permitido:', req.method);
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const result = await handleMercadoPagoWebhook(req.body, req.query);
    
    if (result.success) {
      console.log('✅ Webhook procesado exitosamente');
      return res.status(200).json({ success: true, message: 'Webhook processed' });
    } else {
      console.log('⚠️ Webhook procesado con advertencias:', result.message);
      return res.status(200).json({ success: true, message: result.message });
    }
  } catch (error) {
    console.error('❌ Error al procesar webhook:', error);
    
    // Registrar error en Firebase
    await admin.database().ref('subscriptionLogs').push({
      type: 'webhook_error',
      error: error.message,
      stack: error.stack,
      body: req.body,
      query: req.query,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });
    
    // Siempre devolver 200 para que Mercado Pago no reintente
    return res.status(200).json({ success: false, error: error.message });
  }
});

// ========== CREAR SUSCRIPCIÓN (CALLABLE - con Firebase Auth) ==========
// Función para crear una suscripción desde el frontend con Firebase Auth
exports.createSubscription = functions.https.onCall(async (data, context) => {
  console.log('📝 Creando suscripción (callable)');
  console.log('Data recibida:', data);
  console.log('Context auth:', context.auth?.uid);
  
  // Obtener userId desde context.auth o desde data (para autenticación personalizada)
  let userId = context.auth?.uid || data.userId;
  
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado - falta userId');
  }

  const { planId, paymentMethodId } = data;

  if (!planId) {
    throw new functions.https.HttpsError('invalid-argument', 'Plan ID es requerido');
  }

  console.log('📝 Creando suscripción para usuario:', userId);

  try {
    const result = await createSubscription(userId, planId, paymentMethodId);
    return result;
  } catch (error) {
    console.error('❌ Error al crear suscripción:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ========== CREAR SUSCRIPCIÓN (HTTP - sin autenticación Firebase) ==========
// Endpoint HTTP público para crear suscripciones sin Firebase Auth
exports.createSubscriptionHTTP = functions.https.onRequest(async (req, res) => {
  // Configurar CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

  console.log('📝 Creando suscripción (HTTP)');
  console.log('Body:', req.body);

  const { userId, planId, userEmail, paymentMethodId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId es requerido' });
  }

  if (!planId) {
    return res.status(400).json({ success: false, error: 'planId es requerido' });
  }

  console.log('📝 Creando suscripción para usuario:', userId);

  try {
    const result = await createSubscription(userId, planId, paymentMethodId);
    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error al crear suscripción:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Error al crear suscripción' 
    });
  }
});

// ========== CANCELAR SUSCRIPCIÓN (CALLABLE) ==========
// Función para cancelar una suscripción con Firebase Auth
exports.cancelSubscription = functions.https.onCall(async (data, context) => {
  console.log('🚫 Cancelando suscripción (callable)');
  
  // Obtener userId desde context.auth o desde data
  let userId = context.auth?.uid || data.userId;
  
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado - falta userId');
  }

  console.log('🚫 Cancelando suscripción para usuario:', userId);

  try {
    const result = await cancelSubscription(userId);
    return result;
  } catch (error) {
    console.error('❌ Error al cancelar suscripción:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ========== CANCELAR SUSCRIPCIÓN (HTTP) ==========
// Endpoint HTTP público para cancelar suscripciones sin Firebase Auth
exports.cancelSubscriptionHTTP = functions.https.onRequest(async (req, res) => {
  // Configurar CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

  console.log('🚫 Cancelando suscripción (HTTP)');
  console.log('Body:', req.body);

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId es requerido' });
  }

  console.log('🚫 Cancelando suscripción para usuario:', userId);

  try {
    const result = await cancelSubscription(userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error al cancelar suscripción:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Error al cancelar suscripción' 
    });
  }
});

// ========== OBTENER ESTADO DE SUSCRIPCIÓN ==========
// Función para obtener el estado actual de la suscripción
exports.getSubscriptionStatus = functions.https.onCall(async (data, context) => {
  // Obtener userId desde context.auth o desde data
  let userId = context.auth?.uid || data.userId;
  
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado - falta userId');
  }

  try {
    const snapshot = await admin.database().ref(`subscriptions/${userId}`).once('value');
    const subscription = snapshot.val();

    if (!subscription) {
      return { 
        hasPremium: false, 
        status: 'none',
        message: 'No tiene suscripción activa' 
      };
    }

    return {
      hasPremium: subscription.status === 'active',
      status: subscription.status,
      planId: subscription.planId,
      nextBillingDate: subscription.nextBillingDate,
      amount: subscription.amount,
      currency: subscription.currency
    };
  } catch (error) {
    console.error('❌ Error al obtener estado:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ========== ASIGNAR PREMIUM MANUAL (SOLO CEO/SUSCRIPCIONES) ==========
// Función para que CEO o rol SUSCRIPCIONES asigne Premium manualmente
exports.assignPremiumManual = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const adminUserId = context.auth.uid;
  const { targetUserId, durationMonths } = data;

  if (!targetUserId || !durationMonths) {
    throw new functions.https.HttpsError('invalid-argument', 'Faltan parámetros requeridos');
  }

  try {
    // Verificar permisos (CEO o rol SUSCRIPCIONES)
    const adminSnapshot = await admin.database().ref(`usuarios/${adminUserId}`).once('value');
    const adminUser = adminSnapshot.val();
    
    const isCEO = adminUser.correo === 'laburitoya@gmail.com' || adminUser.rol === 'CEO' || adminUser.esAdmin === true;
    const hasSubscriptionRole = adminUser.rol === 'SUSCRIPCIONES';

    if (!isCEO && !hasSubscriptionRole) {
      throw new functions.https.HttpsError('permission-denied', 'No tienes permisos para asignar Premium');
    }

    // Calcular fecha de expiración
    const now = new Date();
    const expiresAt = new Date(now.setMonth(now.getMonth() + durationMonths));

    // Crear suscripción manual
    await admin.database().ref(`subscriptions/${targetUserId}`).set({
      planId: 'premium',
      status: 'active',
      type: 'manual',
      assignedBy: adminUserId,
      assignedByName: adminUser.nombre,
      startDate: admin.database.ServerValue.TIMESTAMP,
      expiresAt: expiresAt.toISOString(),
      amount: 0,
      currency: 'ARS'
    });

    // Activar Premium
    await admin.database().ref(`premiumUsers/${targetUserId}`).set({
      isPremium: true,
      activatedAt: admin.database.ServerValue.TIMESTAMP,
      expiresAt: expiresAt.toISOString(),
      type: 'manual',
      assignedBy: adminUserId
    });

    // Registrar en logs
    await admin.database().ref('subscriptionLogs').push({
      type: 'manual_assignment',
      userId: targetUserId,
      assignedBy: adminUserId,
      durationMonths,
      expiresAt: expiresAt.toISOString(),
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    console.log(`✅ Premium asignado manualmente a ${targetUserId} por ${durationMonths} meses`);

    return {
      success: true,
      message: 'Premium asignado correctamente',
      expiresAt: expiresAt.toISOString()
    };
  } catch (error) {
    console.error('❌ Error al asignar Premium:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ========== VERIFICAR SUSCRIPCIONES EXPIRADAS ==========
// Función programada que se ejecuta diariamente para verificar suscripciones expiradas
exports.checkExpiredSubscriptions = functions.pubsub
  .schedule('0 0 * * *') // Ejecutar todos los días a medianoche
  .timeZone('America/Argentina/Buenos_Aires')
  .onRun(async (context) => {
    console.log('🔍 Verificando suscripciones expiradas...');
    
    try {
      const result = await checkExpiredSubscriptions();
      console.log(`✅ Verificación completada: ${result.expired} suscripciones expiradas`);
      return null;
    } catch (error) {
      console.error('❌ Error al verificar suscripciones:', error);
      return null;
    }
  });

// ========== OBTENER MÉTRICAS (SOLO CEO/SUSCRIPCIONES) ==========
// Función para obtener métricas de suscripciones
exports.getSubscriptionMetrics = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const userId = context.auth.uid;

  try {
    // Verificar permisos
    const userSnapshot = await admin.database().ref(`usuarios/${userId}`).once('value');
    const user = userSnapshot.val();
    
    const isCEO = user.correo === 'laburitoya@gmail.com' || user.rol === 'CEO' || user.esAdmin === true;
    const hasSubscriptionRole = user.rol === 'SUSCRIPCIONES';

    if (!isCEO && !hasSubscriptionRole) {
      throw new functions.https.HttpsError('permission-denied', 'No tienes permisos para ver métricas');
    }

    // Obtener todas las suscripciones
    const subscriptionsSnapshot = await admin.database().ref('subscriptions').once('value');
    const subscriptions = subscriptionsSnapshot.val() || {};

    // Calcular métricas
    const activeSubscriptions = Object.values(subscriptions).filter(s => s.status === 'active').length;
    const cancelledSubscriptions = Object.values(subscriptions).filter(s => s.status === 'cancelled').length;
    const failedSubscriptions = Object.values(subscriptions).filter(s => s.status === 'failed').length;

    // Calcular ingresos mensuales
    const monthlyRevenue = Object.values(subscriptions)
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.amount || 0), 0);

    // Obtener logs del último mes
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const logsSnapshot = await admin.database()
      .ref('subscriptionLogs')
      .orderByChild('timestamp')
      .startAt(oneMonthAgo)
      .once('value');
    
    const logs = logsSnapshot.val() || {};
    const recentPayments = Object.values(logs).filter(l => l.type === 'payment_success').length;
    const recentFailures = Object.values(logs).filter(l => l.type === 'payment_failed').length;

    return {
      success: true,
      metrics: {
        activeSubscriptions,
        cancelledSubscriptions,
        failedSubscriptions,
        totalSubscriptions: Object.keys(subscriptions).length,
        monthlyRevenue,
        currency: 'ARS',
        recentPayments,
        recentFailures,
        conversionRate: activeSubscriptions > 0 ? (activeSubscriptions / Object.keys(subscriptions).length * 100).toFixed(2) : 0
      }
    };
  } catch (error) {
    console.error('❌ Error al obtener métricas:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

console.log('✅ Firebase Functions cargadas correctamente');
