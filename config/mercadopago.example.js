// ========== CONFIGURACIÓN DE MERCADO PAGO (EJEMPLO) ==========
// IMPORTANTE: Copia este archivo como mercadopago.js y completa con tus credenciales reales

const MERCADOPAGO_CONFIG = {
  // Credenciales de producción
  publicKey: 'TU_PUBLIC_KEY_AQUI',
  accessToken: 'TU_ACCESS_TOKEN_AQUI',
  
  // URLs
  webhookUrl: 'https://us-central1-TU-PROYECTO.cloudfunctions.net/mercadopagoWebhook',
  successUrl: 'https://tu-dominio.com/src/pages/subscription-success.html',
  failureUrl: 'https://tu-dominio.com/src/pages/subscription-failure.html',
  pendingUrl: 'https://tu-dominio.com/src/pages/subscription-pending.html',
  
  // Configuración de suscripciones
  currency: 'ARS',
  country: 'AR',
  
  // Plan Premium
  premiumPlan: {
    id: 'premium',
    name: 'Plan Premium LaburitoYa',
    description: 'Acceso completo a beneficios Premium',
    price: 2000,
    currency: 'ARS',
    frequency: 1,
    frequency_type: 'months',
    billing_day: 1, // Día del mes para cobrar
    billing_day_proportional: true,
    repetitions: null, // null = indefinido
    free_trial: {
      frequency: 0,
      frequency_type: 'months'
    }
  }
};

// Exportar configuración
if (typeof window !== 'undefined') {
  window.MERCADOPAGO_CONFIG = MERCADOPAGO_CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MERCADOPAGO_CONFIG;
}

console.log('✅ Configuración de Mercado Pago cargada');
