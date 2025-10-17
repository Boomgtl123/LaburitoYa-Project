// ========================================
// SUBSCRIPTION CLIENT
// LaburitoYa - Sistema de Suscripciones
// ========================================

let currentUser = null;
let currentSubscription = null;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 Inicializando cliente de suscripciones...');
    
    // Verificar autenticación desde localStorage
    const usuarioActual = localStorage.getItem('usuarioActual');
    
    if (usuarioActual) {
        try {
            currentUser = JSON.parse(usuarioActual);
            // El usuario se guarda con 'id' en lugar de 'uid'
            if (!currentUser.uid && currentUser.id) {
                currentUser.uid = currentUser.id;
            }
            console.log('✅ Usuario autenticado:', currentUser.uid || currentUser.id);
            await loadSubscriptionStatus();
            setupEventListeners();
        } catch (error) {
            console.error('❌ Error al parsear usuario:', error);
            window.location.href = 'login.html';
        }
    } else {
        console.log('❌ Usuario no autenticado, redirigiendo...');
        window.location.href = 'login.html';
    }
});

// ========== CARGAR ESTADO DE SUSCRIPCIÓN ==========
async function loadSubscriptionStatus() {
    try {
        console.log('📊 Cargando estado de suscripción...');
        
        // Verificar que Firebase esté inicializado
        if (!firebase || !firebase.database) {
            console.error('❌ Firebase no está inicializado');
            showSubscriptionPlans();
            return;
        }
        
        // Obtener suscripción desde Firebase
        const subscriptionRef = firebase.database().ref(`subscriptions/${currentUser.uid}`);
        const snapshot = await subscriptionRef.once('value');
        currentSubscription = snapshot.val();

        // Obtener estado Premium
        const premiumRef = firebase.database().ref(`premiumUsers/${currentUser.uid}`);
        const premiumSnapshot = await premiumRef.once('value');
        const premiumData = premiumSnapshot.val();

        console.log('Suscripción:', currentSubscription);
        console.log('Premium:', premiumData);

        // Actualizar UI según el estado
        if (currentSubscription && currentSubscription.status === 'active') {
            showCurrentSubscription(currentSubscription);
        } else {
            showSubscriptionPlans();
        }

    } catch (error) {
        console.error('❌ Error al cargar estado de suscripción:', error);
        showSubscriptionPlans();
    }
}

// ========== MOSTRAR SUSCRIPCIÓN ACTUAL ==========
function showCurrentSubscription(subscription) {
    const statusSection = document.getElementById('currentStatusSection');
    if (!statusSection) return;

    statusSection.style.display = 'block';

    // Actualizar estado
    const statusElement = document.getElementById('subscriptionStatus');
    if (statusElement) {
        statusElement.textContent = getStatusText(subscription.status);
        statusElement.className = `info-value status-${subscription.status}`;
    }

    // Actualizar próxima fecha de pago
    const nextBillingElement = document.getElementById('nextBillingDate');
    if (nextBillingElement && subscription.nextBillingDate) {
        const date = new Date(subscription.nextBillingDate);
        nextBillingElement.textContent = date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Actualizar monto
    const amountElement = document.getElementById('subscriptionAmount');
    if (amountElement && subscription.amount) {
        amountElement.textContent = `$${subscription.amount.toLocaleString('es-AR')} ${subscription.currency}/mes`;
    }

    // Deshabilitar botón de suscripción
    const subscribeBtn = document.getElementById('subscribePremiumBtn');
    if (subscribeBtn) {
        subscribeBtn.disabled = true;
        subscribeBtn.textContent = 'Ya eres Premium';
        subscribeBtn.style.opacity = '0.6';
    }
}

// ========== MOSTRAR PLANES ==========
function showSubscriptionPlans() {
    const statusSection = document.getElementById('currentStatusSection');
    if (statusSection) {
        statusSection.style.display = 'none';
    }

    const subscribeBtn = document.getElementById('subscribePremiumBtn');
    if (subscribeBtn) {
        subscribeBtn.disabled = false;
        subscribeBtn.style.opacity = '1';
    }
}

// ========== CONFIGURAR EVENT LISTENERS ==========
function setupEventListeners() {
    // Botón de suscribirse
    const subscribeBtn = document.getElementById('subscribePremiumBtn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', handleSubscribe);
    }

    // Botón de cancelar
    const cancelBtn = document.getElementById('cancelSubscriptionBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', showCancelModal);
    }
}

// ========== MANEJAR SUSCRIPCIÓN ==========
async function handleSubscribe() {
    try {
        console.log('💳 Iniciando proceso de suscripción...');
        
        if (!currentUser || !currentUser.uid) {
            throw new Error('Usuario no identificado');
        }
        
        // Mostrar loading
        showLoading('Creando tu suscripción...');

        // Crear suscripción usando endpoint HTTP (no requiere Firebase Auth)
        const response = await fetch('https://us-central1-laburitoya-6e55d.cloudfunctions.net/createSubscriptionHTTP', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.uid,
                planId: 'premium',
                userEmail: currentUser.correo || currentUser.email
            })
        });

        const result = await response.json();
        console.log('✅ Respuesta del servidor:', result);

        if (result.success) {
            // Redirigir a Mercado Pago
            if (result.initPoint) {
                console.log('🔗 Redirigiendo a Mercado Pago:', result.initPoint);
                window.location.href = result.initPoint;
            } else {
                throw new Error('No se recibió URL de pago');
            }
        } else {
            throw new Error(result.error || 'Error al crear suscripción');
        }

    } catch (error) {
        console.error('❌ Error al suscribirse:', error);
        hideLoading();
        showError(error.message || 'Error al procesar tu suscripción. Por favor intenta nuevamente.');
    }
}

// ========== MOSTRAR MODAL DE CANCELACIÓN ==========
function showCancelModal() {
    const modal = document.getElementById('cancelModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// ========== CANCELAR SUSCRIPCIÓN ==========
window.cancelSubscription = async function() {
    try {
        console.log('🚫 Cancelando suscripción...');
        
        if (!currentUser || !currentUser.uid) {
            throw new Error('Usuario no identificado');
        }
        
        showLoading('Cancelando tu suscripción...');

        // Cancelar usando endpoint HTTP
        const response = await fetch('https://us-central1-laburitoya-6e55d.cloudfunctions.net/cancelSubscriptionHTTP', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.uid
            })
        });

        const result = await response.json();
        console.log('✅ Resultado:', result);

        if (result.success) {
            hideLoading();
            showSuccess('Tu suscripción ha sido cancelada. Seguirás teniendo acceso Premium hasta el final del período pagado.');
            
            // Recargar después de 2 segundos
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            throw new Error(result.error || 'Error al cancelar');
        }

    } catch (error) {
        console.error('❌ Error al cancelar:', error);
        hideLoading();
        showError(error.message || 'Error al cancelar tu suscripción. Por favor intenta nuevamente.');
    }
};

// ========== VERIFICAR ESTADO DE PAGO ==========
async function checkPaymentStatus(paymentId) {
    try {
        console.log('🔍 Verificando estado de pago:', paymentId);
        
        // Esperar un momento para que el webhook procese
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Recargar estado de suscripción
        await loadSubscriptionStatus();

        return currentSubscription;
    } catch (error) {
        console.error('❌ Error al verificar pago:', error);
        return null;
    }
}

// ========== UTILIDADES ==========
function getStatusText(status) {
    const statusTexts = {
        'active': 'Activa',
        'pending': 'Pendiente',
        'cancelled': 'Cancelada',
        'failed': 'Fallida',
        'expired': 'Expirada',
        'paused': 'Pausada'
    };
    return statusTexts[status] || status;
}

function showLoading(message = 'Procesando...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        const messageElement = overlay.querySelector('p');
        if (messageElement) {
            messageElement.textContent = message;
        }
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showError(message) {
    alert('❌ ' + message);
}

function showSuccess(message) {
    alert('✅ ' + message);
}

// ========== EXPORTAR FUNCIONES ==========
window.subscriptionClient = {
    loadSubscriptionStatus,
    handleSubscribe,
    cancelSubscription: window.cancelSubscription,
    checkPaymentStatus
};

console.log('✅ Cliente de suscripciones cargado');
