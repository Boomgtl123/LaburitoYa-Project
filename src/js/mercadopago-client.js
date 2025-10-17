// ========================================
// MERCADO PAGO CLIENT
// LaburitoYa - Integración con Mercado Pago
// ========================================

const MERCADOPAGO_PUBLIC_KEY = 'APP_USR-aaeb1507-4edf-4214-a702-5d6dd077c9e2';

let mp = null;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Inicializando Mercado Pago...');
    initializeMercadoPago();
});

// ========== INICIALIZAR MERCADO PAGO SDK ==========
function initializeMercadoPago() {
    try {
        // Verificar que el SDK esté cargado
        if (typeof MercadoPago === 'undefined') {
            console.error('❌ SDK de Mercado Pago no cargado');
            return;
        }

        // Inicializar con la public key
        mp = new MercadoPago(MERCADOPAGO_PUBLIC_KEY, {
            locale: 'es-AR'
        });

        console.log('✅ Mercado Pago inicializado correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar Mercado Pago:', error);
    }
}

// ========== CREAR PREFERENCIA DE PAGO ==========
async function createPaymentPreference(userId, planId, amount, currency = 'ARS') {
    try {
        console.log('💳 Creando preferencia de pago...');

        const preference = {
            items: [
                {
                    title: 'Suscripción Premium LaburitoYa',
                    description: 'Acceso Premium mensual con todos los beneficios',
                    quantity: 1,
                    unit_price: amount,
                    currency_id: currency
                }
            ],
            payer: {
                email: firebase.auth().currentUser?.email || ''
            },
            back_urls: {
                success: 'https://laburitoya.online/src/pages/subscription-success.html',
                failure: 'https://laburitoya.online/src/pages/subscription-failure.html',
                pending: 'https://laburitoya.online/src/pages/subscription-pending.html'
            },
            auto_return: 'approved',
            external_reference: userId,
            notification_url: 'https://us-central1-laburitoya-6e55d.cloudfunctions.net/mercadopagoWebhook',
            metadata: {
                user_id: userId,
                plan_id: planId
            }
        };

        console.log('Preferencia creada:', preference);
        return preference;

    } catch (error) {
        console.error('❌ Error al crear preferencia:', error);
        throw error;
    }
}

// ========== ABRIR CHECKOUT ==========
async function openCheckout(preferenceId) {
    try {
        if (!mp) {
            throw new Error('Mercado Pago no inicializado');
        }

        console.log('🚀 Abriendo checkout con preferencia:', preferenceId);

        // Abrir checkout
        mp.checkout({
            preference: {
                id: preferenceId
            },
            autoOpen: true
        });

    } catch (error) {
        console.error('❌ Error al abrir checkout:', error);
        throw error;
    }
}

// ========== PROCESAR PAGO CON TARJETA ==========
async function processCardPayment(cardData, amount) {
    try {
        if (!mp) {
            throw new Error('Mercado Pago no inicializado');
        }

        console.log('💳 Procesando pago con tarjeta...');

        // Crear token de tarjeta
        const cardToken = await mp.createCardToken({
            cardNumber: cardData.cardNumber,
            cardholderName: cardData.cardholderName,
            cardExpirationMonth: cardData.expirationMonth,
            cardExpirationYear: cardData.expirationYear,
            securityCode: cardData.securityCode,
            identificationType: cardData.identificationType,
            identificationNumber: cardData.identificationNumber
        });

        console.log('✅ Token de tarjeta creado:', cardToken.id);

        return {
            success: true,
            token: cardToken.id
        };

    } catch (error) {
        console.error('❌ Error al procesar tarjeta:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ========== OBTENER MÉTODOS DE PAGO ==========
async function getPaymentMethods() {
    try {
        if (!mp) {
            throw new Error('Mercado Pago no inicializado');
        }

        console.log('📋 Obteniendo métodos de pago...');

        const paymentMethods = await mp.getPaymentMethods();
        console.log('✅ Métodos de pago:', paymentMethods);

        return paymentMethods;

    } catch (error) {
        console.error('❌ Error al obtener métodos de pago:', error);
        return [];
    }
}

// ========== OBTENER CUOTAS ==========
async function getInstallments(bin, amount) {
    try {
        if (!mp) {
            throw new Error('Mercado Pago no inicializado');
        }

        console.log('📊 Obteniendo cuotas para BIN:', bin);

        const installments = await mp.getInstallments({
            amount: amount,
            bin: bin,
            locale: 'es-AR'
        });

        console.log('✅ Cuotas disponibles:', installments);
        return installments;

    } catch (error) {
        console.error('❌ Error al obtener cuotas:', error);
        return [];
    }
}

// ========== VALIDAR TARJETA ==========
function validateCard(cardNumber) {
    // Eliminar espacios y guiones
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');

    // Verificar que solo contenga números
    if (!/^\d+$/.test(cleanNumber)) {
        return { valid: false, error: 'Número de tarjeta inválido' };
    }

    // Verificar longitud (13-19 dígitos)
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
        return { valid: false, error: 'Longitud de tarjeta inválida' };
    }

    // Algoritmo de Luhn
    let sum = 0;
    let isEven = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNumber[i]);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    const valid = sum % 10 === 0;

    return {
        valid,
        error: valid ? null : 'Número de tarjeta inválido'
    };
}

// ========== DETECTAR TIPO DE TARJETA ==========
function detectCardType(cardNumber) {
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');

    const cardTypes = {
        visa: /^4/,
        mastercard: /^5[1-5]/,
        amex: /^3[47]/,
        discover: /^6(?:011|5)/,
        diners: /^3(?:0[0-5]|[68])/,
        jcb: /^35/
    };

    for (const [type, pattern] of Object.entries(cardTypes)) {
        if (pattern.test(cleanNumber)) {
            return type;
        }
    }

    return 'unknown';
}

// ========== FORMATEAR NÚMERO DE TARJETA ==========
function formatCardNumber(cardNumber) {
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');
    const groups = cleanNumber.match(/.{1,4}/g) || [];
    return groups.join(' ');
}

// ========== VALIDAR FECHA DE EXPIRACIÓN ==========
function validateExpirationDate(month, year) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const expMonth = parseInt(month);
    const expYear = parseInt(year);

    // Verificar formato
    if (expMonth < 1 || expMonth > 12) {
        return { valid: false, error: 'Mes inválido' };
    }

    // Verificar que no esté expirada
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        return { valid: false, error: 'Tarjeta expirada' };
    }

    return { valid: true, error: null };
}

// ========== VALIDAR CVV ==========
function validateCVV(cvv, cardType = 'visa') {
    const cleanCVV = cvv.replace(/\D/g, '');

    // American Express usa 4 dígitos, otros usan 3
    const expectedLength = cardType === 'amex' ? 4 : 3;

    if (cleanCVV.length !== expectedLength) {
        return {
            valid: false,
            error: `CVV debe tener ${expectedLength} dígitos`
        };
    }

    return { valid: true, error: null };
}

// ========== OBTENER INFORMACIÓN DE PAGO ==========
async function getPaymentInfo(paymentId) {
    try {
        console.log('🔍 Obteniendo información de pago:', paymentId);

        // Esto normalmente se haría desde el backend
        // Aquí solo retornamos un placeholder
        return {
            id: paymentId,
            status: 'pending',
            status_detail: 'pending_waiting_payment'
        };

    } catch (error) {
        console.error('❌ Error al obtener info de pago:', error);
        return null;
    }
}

// ========== MANEJAR RESPUESTA DE PAGO ==========
function handlePaymentResponse() {
    // Obtener parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    
    const status = urlParams.get('status');
    const paymentId = urlParams.get('payment_id');
    const collectionId = urlParams.get('collection_id');
    const collectionStatus = urlParams.get('collection_status');
    const preferenceId = urlParams.get('preference_id');
    const externalReference = urlParams.get('external_reference');

    console.log('📥 Respuesta de pago recibida:', {
        status,
        paymentId,
        collectionId,
        collectionStatus,
        preferenceId,
        externalReference
    });

    return {
        status,
        paymentId: paymentId || collectionId,
        collectionStatus,
        preferenceId,
        externalReference
    };
}

// ========== EXPORTAR FUNCIONES ==========
window.mercadoPagoClient = {
    mp,
    createPaymentPreference,
    openCheckout,
    processCardPayment,
    getPaymentMethods,
    getInstallments,
    validateCard,
    detectCardType,
    formatCardNumber,
    validateExpirationDate,
    validateCVV,
    getPaymentInfo,
    handlePaymentResponse
};

console.log('✅ Cliente de Mercado Pago cargado');
