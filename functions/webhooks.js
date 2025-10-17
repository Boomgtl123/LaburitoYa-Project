const admin = require('firebase-admin');
const axios = require('axios');

const MERCADOPAGO_ACCESS_TOKEN = 'APP_USR-7755486415585411-101715-7ccc3b149d1a325b8ba922c16f531983-2927945637';

// ========== MANEJAR WEBHOOK DE MERCADO PAGO ==========
async function handleMercadoPagoWebhook(body, query) {
  console.log('🔔 Procesando webhook de Mercado Pago');
  console.log('Body:', JSON.stringify(body, null, 2));
  console.log('Query:', JSON.stringify(query, null, 2));

  // Mercado Pago envía notificaciones en diferentes formatos:
  // Formato nuevo: { action: "payment.updated", type: "payment", data: { id: "123" } }
  // Formato antiguo: { type: "payment", id: "123" } o query params
  
  let topic = null;
  let resourceId = null;
  let action = null;

  // Detectar formato nuevo (con action)
  if (body.action) {
    action = body.action;
    // Extraer el tipo de la acción (ej: "payment.updated" -> "payment")
    topic = body.type || action.split('.')[0];
    resourceId = body.data?.id;
    console.log('📱 Formato nuevo detectado - Action:', action);
  } else {
    // Formato antiguo
    topic = body.type || body.topic || query.topic;
    resourceId = body.data?.id || body.id || query.id;
    console.log('📱 Formato antiguo detectado');
  }

  console.log('Topic:', topic);
  console.log('Resource ID:', resourceId);
  console.log('Action:', action);

  if (!topic || !resourceId) {
    console.log('⚠️ Webhook sin topic o resource ID');
    return { success: true, message: 'Webhook sin datos suficientes' };
  }

  // Registrar webhook recibido
  await admin.database().ref('subscriptionLogs').push({
    type: 'webhook_received',
    topic,
    action,
    resourceId,
    body,
    query,
    timestamp: admin.database.ServerValue.TIMESTAMP
  });

  try {
    switch (topic) {
      case 'payment':
        await handlePaymentNotification(resourceId, action);
        break;
      
      case 'subscription':
      case 'preapproval':
        await handleSubscriptionNotification(resourceId, action);
        break;
      
      case 'subscription_preapproval':
        await handleSubscriptionNotification(resourceId, action);
        break;
      
      case 'subscription_authorized_payment':
        await handlePaymentNotification(resourceId, action);
        break;
      
      default:
        console.log('⚠️ Tipo de notificación no manejado:', topic);
        await admin.database().ref('subscriptionLogs').push({
          type: 'webhook_unhandled',
          topic,
          action,
          resourceId,
          timestamp: admin.database.ServerValue.TIMESTAMP
        });
    }

    return { success: true, message: 'Webhook procesado' };
  } catch (error) {
    console.error('❌ Error al procesar webhook:', error);
    throw error;
  }
}

// ========== MANEJAR NOTIFICACIÓN DE PAGO ==========
async function handlePaymentNotification(paymentId, action) {
  console.log('💳 Procesando notificación de pago:', paymentId);
  console.log('💳 Action:', action);

  try {
    // Obtener información del pago desde Mercado Pago
    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`
        }
      }
    );

    const payment = response.data;
    console.log('Pago obtenido:', JSON.stringify(payment, null, 2));

    // Extraer información relevante
    const status = payment.status;
    const userId = payment.metadata?.user_id || payment.external_reference;
    const subscriptionId = payment.metadata?.subscription_id;
    const amount = payment.transaction_amount;
    const currency = payment.currency_id;

    if (!userId) {
      console.log('⚠️ Pago sin user_id en metadata');
      return;
    }

    console.log(`Usuario: ${userId}, Estado: ${status}, Monto: ${amount} ${currency}`);

    // Registrar pago en logs
    await admin.database().ref('subscriptionLogs').push({
      type: `payment_${status}`,
      userId,
      paymentId,
      subscriptionId,
      amount,
      currency,
      status,
      paymentData: payment,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    // Procesar según el estado del pago
    switch (status) {
      case 'approved':
        await handlePaymentApproved(userId, payment);
        break;
      
      case 'rejected':
      case 'cancelled':
        await handlePaymentFailed(userId, payment);
        break;
      
      case 'pending':
      case 'in_process':
        await handlePaymentPending(userId, payment);
        break;
      
      default:
        console.log('⚠️ Estado de pago no manejado:', status);
    }
  } catch (error) {
    console.error('❌ Error al procesar pago:', error);
    throw error;
  }
}

// ========== MANEJAR NOTIFICACIÓN DE SUSCRIPCIÓN ==========
async function handleSubscriptionNotification(subscriptionId, action) {
  console.log('📋 Procesando notificación de suscripción:', subscriptionId);
  console.log('📋 Action:', action);

  try {
    // Obtener información de la suscripción desde Mercado Pago
    const response = await axios.get(
      `https://api.mercadopago.com/preapproval/${subscriptionId}`,
      {
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`
        }
      }
    );

    const subscription = response.data;
    console.log('Suscripción obtenida:', JSON.stringify(subscription, null, 2));

    const status = subscription.status;
    const userId = subscription.external_reference || subscription.metadata?.user_id;
    const amount = subscription.auto_recurring?.transaction_amount;
    const currency = subscription.auto_recurring?.currency_id;

    if (!userId) {
      console.log('⚠️ Suscripción sin user_id');
      return;
    }

    console.log(`Usuario: ${userId}, Estado: ${status}`);

    // Registrar en logs
    await admin.database().ref('subscriptionLogs').push({
      type: `subscription_${status}`,
      userId,
      subscriptionId,
      status,
      amount,
      currency,
      subscriptionData: subscription,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    // Procesar según el estado de la suscripción
    switch (status) {
      case 'authorized':
        await handleSubscriptionAuthorized(userId, subscription);
        break;
      
      case 'paused':
        await handleSubscriptionPaused(userId, subscription);
        break;
      
      case 'cancelled':
        await handleSubscriptionCancelled(userId, subscription);
        break;
      
      default:
        console.log('⚠️ Estado de suscripción no manejado:', status);
    }
  } catch (error) {
    console.error('❌ Error al procesar suscripción:', error);
    throw error;
  }
}

// ========== PAGO APROBADO ==========
async function handlePaymentApproved(userId, payment) {
  console.log('✅ Pago aprobado para usuario:', userId);

  try {
    // Calcular próxima fecha de cobro (1 mes después)
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    // Actualizar suscripción
    await admin.database().ref(`subscriptions/${userId}`).update({
      status: 'active',
      lastPaymentDate: admin.database.ServerValue.TIMESTAMP,
      lastPaymentId: payment.id,
      nextBillingDate: nextBillingDate.toISOString(),
      amount: payment.transaction_amount,
      currency: payment.currency_id,
      updatedAt: admin.database.ServerValue.TIMESTAMP
    });

    // Activar Premium
    const expiresAt = new Date(nextBillingDate);
    expiresAt.setDate(expiresAt.getDate() + 3); // 3 días de gracia

    await admin.database().ref(`premiumUsers/${userId}`).set({
      isPremium: true,
      activatedAt: admin.database.ServerValue.TIMESTAMP,
      expiresAt: expiresAt.toISOString(),
      lastPaymentDate: admin.database.ServerValue.TIMESTAMP,
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

    // Enviar notificación al usuario
    await admin.database().ref('notificaciones').push({
      tipo: 'subscription',
      para: userId,
      mensaje: '¡Tu suscripción Premium está activa! Disfruta de todos los beneficios.',
      fecha: new Date().toISOString(),
      leida: false,
      icono: '💎'
    });

    console.log(`✅ Premium activado para ${userId} hasta ${expiresAt.toISOString()}`);
  } catch (error) {
    console.error('❌ Error al activar Premium:', error);
    throw error;
  }
}

// ========== PAGO FALLIDO ==========
async function handlePaymentFailed(userId, payment) {
  console.log('❌ Pago fallido para usuario:', userId);

  try {
    // Actualizar estado de suscripción
    await admin.database().ref(`subscriptions/${userId}`).update({
      status: 'failed',
      lastFailedPaymentDate: admin.database.ServerValue.TIMESTAMP,
      lastFailedPaymentId: payment.id,
      failureReason: payment.status_detail,
      updatedAt: admin.database.ServerValue.TIMESTAMP
    });

    // Enviar notificación al usuario
    await admin.database().ref('notificaciones').push({
      tipo: 'subscription',
      para: userId,
      mensaje: 'Hubo un problema con tu pago. Por favor actualiza tu método de pago.',
      fecha: new Date().toISOString(),
      leida: false,
      icono: '⚠️'
    });

    // Si tiene Premium activo, darle 3 días de gracia
    const premiumSnapshot = await admin.database().ref(`premiumUsers/${userId}`).once('value');
    const premium = premiumSnapshot.val();

    if (premium && premium.isPremium) {
      const gracePeriod = new Date();
      gracePeriod.setDate(gracePeriod.getDate() + 3);

      await admin.database().ref(`premiumUsers/${userId}`).update({
        gracePeriodUntil: gracePeriod.toISOString(),
        paymentFailed: true
      });

      console.log(`⏰ Período de gracia hasta ${gracePeriod.toISOString()}`);
    }
  } catch (error) {
    console.error('❌ Error al manejar pago fallido:', error);
    throw error;
  }
}

// ========== PAGO PENDIENTE ==========
async function handlePaymentPending(userId, payment) {
  console.log('⏳ Pago pendiente para usuario:', userId);

  try {
    await admin.database().ref(`subscriptions/${userId}`).update({
      status: 'pending',
      lastPendingPaymentDate: admin.database.ServerValue.TIMESTAMP,
      lastPendingPaymentId: payment.id,
      updatedAt: admin.database.ServerValue.TIMESTAMP
    });

    // Enviar notificación
    await admin.database().ref('notificaciones').push({
      tipo: 'subscription',
      para: userId,
      mensaje: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
      fecha: new Date().toISOString(),
      leida: false,
      icono: '⏳'
    });
  } catch (error) {
    console.error('❌ Error al manejar pago pendiente:', error);
    throw error;
  }
}

// ========== SUSCRIPCIÓN AUTORIZADA ==========
async function handleSubscriptionAuthorized(userId, subscription) {
  console.log('✅ Suscripción autorizada para usuario:', userId);

  try {
    const nextBillingDate = new Date(subscription.next_payment_date || new Date());
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    await admin.database().ref(`subscriptions/${userId}`).set({
      planId: 'premium',
      status: 'active',
      mercadopagoSubscriptionId: subscription.id,
      startDate: admin.database.ServerValue.TIMESTAMP,
      nextBillingDate: nextBillingDate.toISOString(),
      amount: subscription.auto_recurring?.transaction_amount || 2000,
      currency: subscription.auto_recurring?.currency_id || 'ARS',
      createdAt: admin.database.ServerValue.TIMESTAMP,
      updatedAt: admin.database.ServerValue.TIMESTAMP
    });

    console.log('✅ Suscripción creada en Firebase');
  } catch (error) {
    console.error('❌ Error al autorizar suscripción:', error);
    throw error;
  }
}

// ========== SUSCRIPCIÓN PAUSADA ==========
async function handleSubscriptionPaused(userId, subscription) {
  console.log('⏸️ Suscripción pausada para usuario:', userId);

  try {
    await admin.database().ref(`subscriptions/${userId}`).update({
      status: 'paused',
      pausedAt: admin.database.ServerValue.TIMESTAMP,
      updatedAt: admin.database.ServerValue.TIMESTAMP
    });

    // Desactivar Premium
    await admin.database().ref(`premiumUsers/${userId}`).update({
      isPremium: false,
      deactivatedAt: admin.database.ServerValue.TIMESTAMP,
      reason: 'subscription_paused'
    });

    // Notificar
    await admin.database().ref('notificaciones').push({
      tipo: 'subscription',
      para: userId,
      mensaje: 'Tu suscripción Premium ha sido pausada.',
      fecha: new Date().toISOString(),
      leida: false,
      icono: '⏸️'
    });
  } catch (error) {
    console.error('❌ Error al pausar suscripción:', error);
    throw error;
  }
}

// ========== SUSCRIPCIÓN CANCELADA ==========
async function handleSubscriptionCancelled(userId, subscription) {
  console.log('🚫 Suscripción cancelada para usuario:', userId);

  try {
    await admin.database().ref(`subscriptions/${userId}`).update({
      status: 'cancelled',
      cancelledAt: admin.database.ServerValue.TIMESTAMP,
      updatedAt: admin.database.ServerValue.TIMESTAMP
    });

    // Desactivar Premium
    await admin.database().ref(`premiumUsers/${userId}`).update({
      isPremium: false,
      deactivatedAt: admin.database.ServerValue.TIMESTAMP,
      reason: 'subscription_cancelled'
    });

    // Notificar
    await admin.database().ref('notificaciones').push({
      tipo: 'subscription',
      para: userId,
      mensaje: 'Tu suscripción Premium ha sido cancelada. Esperamos verte pronto.',
      fecha: new Date().toISOString(),
      leida: false,
      icono: '👋'
    });
  } catch (error) {
    console.error('❌ Error al cancelar suscripción:', error);
    throw error;
  }
}

module.exports = {
  handleMercadoPagoWebhook,
  handlePaymentNotification,
  handleSubscriptionNotification
};
