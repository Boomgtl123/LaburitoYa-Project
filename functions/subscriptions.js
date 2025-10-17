const admin = require('firebase-admin');
const axios = require('axios');

const MERCADOPAGO_ACCESS_TOKEN = 'APP_USR-7755486415585411-101715-7ccc3b149d1a325b8ba922c16f531983-2927945637';
const PREMIUM_PRICE = 2000;
const PREMIUM_CURRENCY = 'ARS';

// ========== CREAR SUSCRIPCIÓN ==========
async function createSubscription(userId, planId, paymentMethodId) {
  console.log(`📝 Creando suscripción para usuario ${userId}, plan ${planId}`);

  try {
    // Verificar si ya tiene una suscripción activa
    const existingSubSnapshot = await admin.database().ref(`subscriptions/${userId}`).once('value');
    const existingSub = existingSubSnapshot.val();

    if (existingSub && existingSub.status === 'active') {
      console.log('⚠️ Usuario ya tiene suscripción activa');
      return {
        success: false,
        error: 'Ya tienes una suscripción activa'
      };
    }

    // Obtener información del usuario
    const userSnapshot = await admin.database().ref(`usuarios/${userId}`).once('value');
    const user = userSnapshot.val();

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Crear preferencia de pago en Mercado Pago (pago único por ahora)
    const preferenceData = {
      items: [
        {
          title: 'Suscripción Premium LaburitoYa - 1 Mes',
          description: 'Acceso Premium por 1 mes con todos los beneficios',
          quantity: 1,
          unit_price: PREMIUM_PRICE,
          currency_id: PREMIUM_CURRENCY
        }
      ],
      payer: {
        email: user.correo,
        name: user.nombre || 'Usuario',
        surname: user.apellido || ''
      },
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 1,
        default_installments: 1
      },
      back_urls: {
        success: 'https://laburitoya.online/src/pages/subscription-success.html',
        failure: 'https://laburitoya.online/src/pages/subscription-failure.html',
        pending: 'https://laburitoya.online/src/pages/subscription-pending.html'
      },
      auto_return: 'approved',
      external_reference: userId,
      notification_url: 'https://us-central1-laburitoya-6e55d.cloudfunctions.net/mercadopagoWebhook',
      statement_descriptor: 'LABURITOYA PREMIUM',
      binary_mode: false,
      metadata: {
        user_id: userId,
        plan_id: planId,
        type: 'subscription'
      }
    };

    console.log('Creando preferencia de pago en Mercado Pago:', preferenceData);

    const response = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      preferenceData,
      {
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const mpSubscription = response.data;
    console.log('Suscripción creada en MP:', mpSubscription.id);

    // Guardar suscripción en Firebase
    await admin.database().ref(`subscriptions/${userId}`).set({
      planId,
      status: 'pending',
      mercadopagoSubscriptionId: mpSubscription.id,
      initPoint: mpSubscription.init_point,
      startDate: admin.database.ServerValue.TIMESTAMP,
      amount: PREMIUM_PRICE,
      currency: PREMIUM_CURRENCY,
      createdAt: admin.database.ServerValue.TIMESTAMP,
      updatedAt: admin.database.ServerValue.TIMESTAMP
    });

    // Registrar en logs
    await admin.database().ref('subscriptionLogs').push({
      type: 'subscription_created',
      userId,
      subscriptionId: mpSubscription.id,
      planId,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    return {
      success: true,
      subscriptionId: mpSubscription.id,
      initPoint: mpSubscription.init_point,
      message: 'Suscripción creada exitosamente'
    };
  } catch (error) {
    console.error('❌ Error al crear suscripción:', error);
    
    // Registrar error
    await admin.database().ref('subscriptionLogs').push({
      type: 'subscription_creation_error',
      userId,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    throw error;
  }
}

// ========== CANCELAR SUSCRIPCIÓN ==========
async function cancelSubscription(userId) {
  console.log(`🚫 Cancelando suscripción para usuario ${userId}`);

  try {
    // Obtener suscripción actual
    const subSnapshot = await admin.database().ref(`subscriptions/${userId}`).once('value');
    const subscription = subSnapshot.val();

    if (!subscription) {
      return {
        success: false,
        error: 'No tienes una suscripción activa'
      };
    }

    const mpSubscriptionId = subscription.mercadopagoSubscriptionId;

    if (!mpSubscriptionId) {
      // Si es suscripción manual, solo actualizar en Firebase
      await admin.database().ref(`subscriptions/${userId}`).update({
        status: 'cancelled',
        cancelledAt: admin.database.ServerValue.TIMESTAMP,
        updatedAt: admin.database.ServerValue.TIMESTAMP
      });

      await admin.database().ref(`premiumUsers/${userId}`).update({
        isPremium: false,
        deactivatedAt: admin.database.ServerValue.TIMESTAMP,
        reason: 'manual_cancellation'
      });

      return {
        success: true,
        message: 'Suscripción cancelada'
      };
    }

    // Cancelar en Mercado Pago
    console.log('Cancelando suscripción en MP:', mpSubscriptionId);

    await axios.put(
      `https://api.mercadopago.com/preapproval/${mpSubscriptionId}`,
      { status: 'cancelled' },
      {
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Actualizar en Firebase
    await admin.database().ref(`subscriptions/${userId}`).update({
      status: 'cancelled',
      cancelledAt: admin.database.ServerValue.TIMESTAMP,
      updatedAt: admin.database.ServerValue.TIMESTAMP
    });

    // Desactivar Premium
    await admin.database().ref(`premiumUsers/${userId}`).update({
      isPremium: false,
      deactivatedAt: admin.database.ServerValue.TIMESTAMP,
      reason: 'user_cancellation'
    });

    // Registrar en logs
    await admin.database().ref('subscriptionLogs').push({
      type: 'subscription_cancelled',
      userId,
      subscriptionId: mpSubscriptionId,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    // Enviar notificación
    await admin.database().ref('notificaciones').push({
      tipo: 'subscription',
      para: userId,
      mensaje: 'Tu suscripción Premium ha sido cancelada. Esperamos verte pronto.',
      fecha: new Date().toISOString(),
      leida: false,
      icono: '👋'
    });

    console.log('✅ Suscripción cancelada exitosamente');

    return {
      success: true,
      message: 'Suscripción cancelada exitosamente'
    };
  } catch (error) {
    console.error('❌ Error al cancelar suscripción:', error);
    
    await admin.database().ref('subscriptionLogs').push({
      type: 'subscription_cancellation_error',
      userId,
      error: error.message,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    throw error;
  }
}

// ========== ACTUALIZAR ESTADO DE SUSCRIPCIÓN ==========
async function updateSubscriptionStatus(userId, status, data = {}) {
  console.log(`🔄 Actualizando estado de suscripción para ${userId}: ${status}`);

  try {
    const updates = {
      status,
      updatedAt: admin.database.ServerValue.TIMESTAMP,
      ...data
    };

    await admin.database().ref(`subscriptions/${userId}`).update(updates);

    // Si el estado es activo, activar Premium
    if (status === 'active') {
      let nextBillingDate = data.nextBillingDate || new Date();
      if (typeof nextBillingDate === 'string') {
        nextBillingDate = new Date(nextBillingDate);
      }
      
      const expiresAt = new Date(nextBillingDate);
      expiresAt.setDate(expiresAt.getDate() + 3); // 3 días de gracia

      await admin.database().ref(`premiumUsers/${userId}`).set({
        isPremium: true,
        activatedAt: admin.database.ServerValue.TIMESTAMP,
        expiresAt: expiresAt.toISOString(),
        benefits: [
          'green_name',
          'verified_badge',
          'priority_search',
          'direct_contact',
          'profile_stats',
          'job_alerts',
          'priority_support',
          'no_ads'
        ]
      });
    } else if (status === 'cancelled' || status === 'failed') {
      // Desactivar Premium
      await admin.database().ref(`premiumUsers/${userId}`).update({
        isPremium: false,
        deactivatedAt: admin.database.ServerValue.TIMESTAMP,
        reason: status
      });
    }

    console.log('✅ Estado actualizado correctamente');
    return { success: true };
  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    throw error;
  }
}

// ========== VERIFICAR SUSCRIPCIONES EXPIRADAS ==========
async function checkExpiredSubscriptions() {
  console.log('🔍 Verificando suscripciones expiradas...');

  try {
    const now = new Date().toISOString();
    let expiredCount = 0;

    // Obtener todos los usuarios Premium
    const premiumSnapshot = await admin.database().ref('premiumUsers').once('value');
    const premiumUsers = premiumSnapshot.val() || {};

    for (const [userId, premium] of Object.entries(premiumUsers)) {
      if (!premium.isPremium) continue;

      const expiresAt = premium.expiresAt;
      const gracePeriodUntil = premium.gracePeriodUntil;

      // Verificar si expiró
      if (expiresAt && expiresAt < now) {
        // Si tiene período de gracia, verificar si también expiró
        if (gracePeriodUntil && gracePeriodUntil < now) {
          console.log(`⏰ Suscripción expirada para usuario ${userId}`);
          
          // Desactivar Premium
          await admin.database().ref(`premiumUsers/${userId}`).update({
            isPremium: false,
            deactivatedAt: admin.database.ServerValue.TIMESTAMP,
            reason: 'expired'
          });

          // Actualizar suscripción
          await admin.database().ref(`subscriptions/${userId}`).update({
            status: 'expired',
            expiredAt: admin.database.ServerValue.TIMESTAMP,
            updatedAt: admin.database.ServerValue.TIMESTAMP
          });

          // Enviar notificación
          await admin.database().ref('notificaciones').push({
            tipo: 'subscription',
            para: userId,
            mensaje: 'Tu suscripción Premium ha expirado. Renueva para seguir disfrutando de los beneficios.',
            fecha: new Date().toISOString(),
            leida: false,
            icono: '⏰'
          });

          expiredCount++;
        } else if (!gracePeriodUntil) {
          // No tiene período de gracia, desactivar inmediatamente
          console.log(`⏰ Suscripción expirada para usuario ${userId} (sin gracia)`);
          
          await admin.database().ref(`premiumUsers/${userId}`).update({
            isPremium: false,
            deactivatedAt: admin.database.ServerValue.TIMESTAMP,
            reason: 'expired'
          });

          await admin.database().ref(`subscriptions/${userId}`).update({
            status: 'expired',
            expiredAt: admin.database.ServerValue.TIMESTAMP,
            updatedAt: admin.database.ServerValue.TIMESTAMP
          });

          await admin.database().ref('notificaciones').push({
            tipo: 'subscription',
            para: userId,
            mensaje: 'Tu suscripción Premium ha expirado. Renueva para seguir disfrutando de los beneficios.',
            fecha: new Date().toISOString(),
            leida: false,
            icono: '⏰'
          });

          expiredCount++;
        }
      }
    }

    // Registrar en logs
    await admin.database().ref('subscriptionLogs').push({
      type: 'expired_check',
      expiredCount,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    console.log(`✅ Verificación completada: ${expiredCount} suscripciones expiradas`);
    return { success: true, expired: expiredCount };
  } catch (error) {
    console.error('❌ Error al verificar suscripciones:', error);
    throw error;
  }
}

// ========== OBTENER INFORMACIÓN DE SUSCRIPCIÓN ==========
async function getSubscriptionInfo(userId) {
  try {
    const subSnapshot = await admin.database().ref(`subscriptions/${userId}`).once('value');
    const premiumSnapshot = await admin.database().ref(`premiumUsers/${userId}`).once('value');

    const subscription = subSnapshot.val();
    const premium = premiumSnapshot.val();

    return {
      subscription: subscription || null,
      premium: premium || null,
      hasPremium: premium?.isPremium || false
    };
  } catch (error) {
    console.error('❌ Error al obtener info de suscripción:', error);
    throw error;
  }
}

module.exports = {
  createSubscription,
  cancelSubscription,
  updateSubscriptionStatus,
  checkExpiredSubscriptions,
  getSubscriptionInfo
};
