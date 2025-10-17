// ========================================
// SUBSCRIPTION ADMIN PANEL
// LaburitoYa - Panel de Administración de Suscripciones
// ========================================

let currentUser = null;
let subscribersData = [];
let logsData = [];
let metricsData = {};
let subscriptionsChart = null;
let revenueChart = null;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Inicializando panel de administración de suscripciones...');
    console.log('🔍 Verificando Firebase Auth...');

    // Esperar a que Firebase esté completamente inicializado
    const inicializarCuandoFirebaseEsteListo = async () => {
        // Verificar que Firebase esté cargado y inicializado
        if (typeof firebase === 'undefined') {
            console.log('⏳ Esperando a que Firebase se cargue...');
            setTimeout(inicializarCuandoFirebaseEsteListo, 100);
            return;
        }

        // Verificar que la app esté inicializada
        if (!window.firebaseInitialized || !firebase.apps || firebase.apps.length === 0) {
            console.log('⏳ Esperando a que Firebase se inicialice...');
            setTimeout(inicializarCuandoFirebaseEsteListo, 100);
            return;
        }

        // Verificar que los servicios necesarios estén disponibles
        if (!firebase.auth || !firebase.database) {
            console.log('⏳ Esperando a que los servicios de Firebase estén disponibles...');
            setTimeout(inicializarCuandoFirebaseEsteListo, 100);
            return;
        }

        console.log('✅ Firebase detectado y completamente inicializado');
        console.log('📦 Firebase App:', firebase.app().name);
        console.log('🔗 Database URL:', firebase.app().options.databaseURL);

        // Primero verificar si hay sesión en localStorage
        const usuarioLocal = localStorage.getItem('usuarioActual');
        
        if (usuarioLocal) {
            console.log('✅ Sesión encontrada en localStorage');
            try {
                const userData = JSON.parse(usuarioLocal);
                console.log('👤 Usuario desde localStorage:', userData.nombre || userData.correo);
                console.log('🔑 ID de usuario:', userData.id);
                
                // Verificar permisos directamente
                console.log('🔍 Verificando permisos de administrador...');
                const hasPermission = await checkAdminPermissions(userData.id);
                
                if (!hasPermission) {
                    console.error('❌ Usuario sin permisos de administrador');
                    alert('❌ No tienes permisos para acceder a este panel');
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 1000);
                    return;
                }

                console.log('✅ Permisos verificados correctamente');
                
                // Crear objeto currentUser compatible
                currentUser = {
                    uid: userData.id,
                    email: userData.correo,
                    displayName: userData.nombre
                };
                
                // Inicializar panel
                await initializeAdminPanel();
                
            } catch (error) {
                console.error('❌ Error al parsear usuario de localStorage:', error);
                alert('Error al cargar sesión. Por favor, inicia sesión nuevamente.');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        } else {
            console.log('⚠️ No hay sesión en localStorage, intentando con Firebase Auth...');
            
            // Si no hay sesión local, intentar con Firebase Auth
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                console.log('✅ Persistencia de sesión configurada');
                
                // Verificar autenticación
                firebase.auth().onAuthStateChanged(async (user) => {
                    console.log('🔄 Estado de autenticación cambió');
                    
                    if (user) {
                        currentUser = user;
                        console.log('✅ Usuario autenticado con Firebase:', user.uid);
                        console.log('📧 Email:', user.email);

                        // Verificar permisos
                        console.log('🔍 Verificando permisos de administrador...');
                        const hasPermission = await checkAdminPermissions(user.uid);
                        
                        if (!hasPermission) {
                            console.error('❌ Usuario sin permisos de administrador');
                            alert('❌ No tienes permisos para acceder a este panel');
                            setTimeout(() => {
                                window.location.href = 'home.html';
                            }, 1000);
                            return;
                        }

                        console.log('✅ Permisos verificados correctamente');
                        // Inicializar panel
                        await initializeAdminPanel();
                    } else {
                        console.error('❌ Usuario no autenticado');
                        alert('Debes iniciar sesión para acceder a este panel');
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 1000);
                    }
                });
            })
            .catch((error) => {
                console.error('❌ Error al configurar persistencia:', error);
            });
        }
    };

    // Iniciar el proceso
    inicializarCuandoFirebaseEsteListo();
});

// ========== VERIFICAR PERMISOS ==========
async function checkAdminPermissions(userId) {
    try {
        console.log('🔍 Consultando datos del usuario en Firebase...');
        console.log('📍 Ruta:', `usuarios/${userId}`);
        
        // Verificar que Firebase esté disponible antes de usarlo
        if (!firebase || !firebase.database) {
            console.error('❌ Firebase database no está disponible');
            throw new Error('Firebase database no está disponible');
        }

        // Verificar que la app esté inicializada
        if (!firebase.apps || firebase.apps.length === 0) {
            console.error('❌ Firebase no está inicializado');
            throw new Error('Firebase no está inicializado');
        }

        const userRef = firebase.database().ref(`usuarios/${userId}`);
        const userSnapshot = await userRef.once('value');
        
        console.log('📦 Snapshot recibido:', userSnapshot.exists());
        
        if (!userSnapshot.exists()) {
            console.error('❌ Usuario no encontrado en la base de datos');
            console.log('💡 Intentando con datos de localStorage...');
            
            // Fallback: usar datos de localStorage
            const usuarioLocal = localStorage.getItem('usuarioActual');
            if (usuarioLocal) {
                const userData = JSON.parse(usuarioLocal);
                console.log('📋 Datos desde localStorage:', userData);
                
                // Verificar permisos desde localStorage
                const isCEO = userData.correo === 'laburitoya@gmail.com';
                const hasSubscriptionRole = userData.rol === 'SUSCRIPCIONES' || userData.rol === 'CEO';
                const isAdmin = userData.esAdmin === true;
                
                const hasPermission = isCEO || hasSubscriptionRole || isAdmin;
                
                console.log('🔐 Verificación de permisos (localStorage):', {
                    correo: userData.correo,
                    rol: userData.rol,
                    esAdmin: userData.esAdmin,
                    isCEO,
                    hasSubscriptionRole,
                    isAdmin,
                    hasPermission
                });
                
                return hasPermission;
            }
            
            return false;
        }

        const user = userSnapshot.val();
        console.log('📋 Datos del usuario desde Firebase:', {
            correo: user.correo,
            rol: user.rol,
            esAdmin: user.esAdmin
        });

        // CEO o rol SUSCRIPCIONES o Admin
        const isCEO = user.correo === 'laburitoya@gmail.com';
        const hasSubscriptionRole = user.rol === 'SUSCRIPCIONES' || user.rol === 'CEO';
        const isAdmin = user.esAdmin === true;

        const hasPermission = isCEO || hasSubscriptionRole || isAdmin;

        console.log('🔐 Verificación de permisos:', {
            isCEO,
            hasSubscriptionRole,
            isAdmin,
            hasPermission
        });

        return hasPermission;
    } catch (error) {
        console.error('❌ Error al verificar permisos:', error);
        console.error('📄 Detalles del error:', error.message, error.code);
        
        // Fallback: intentar con localStorage
        console.log('💡 Intentando verificación con localStorage como fallback...');
        try {
            const usuarioLocal = localStorage.getItem('usuarioActual');
            if (usuarioLocal) {
                const userData = JSON.parse(usuarioLocal);
                const isCEO = userData.correo === 'laburitoya@gmail.com';
                const hasSubscriptionRole = userData.rol === 'SUSCRIPCIONES' || userData.rol === 'CEO';
                const isAdmin = userData.esAdmin === true;
                const hasPermission = isCEO || hasSubscriptionRole || isAdmin;
                
                console.log('✅ Permisos verificados desde localStorage:', hasPermission);
                return hasPermission;
            }
        } catch (fallbackError) {
            console.error('❌ Error en fallback:', fallbackError);
        }
        
        return false;
    }
}

// ========== INICIALIZAR PANEL ==========
async function initializeAdminPanel() {
    try {
        console.log('🚀 Inicializando panel de administración...');

        // Mostrar nombre del admin
        await loadAdminInfo();

        // Cargar métricas
        await loadMetrics();

        // Cargar suscriptores
        await loadSubscribers();

        // Configurar event listeners
        setupEventListeners();

        console.log('✅ Panel inicializado correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar panel:', error);
        showError('Error al cargar el panel de administración');
    }
}

// ========== CARGAR INFO DEL ADMIN ==========
async function loadAdminInfo() {
    try {
        // Verificar Firebase
        if (!firebase || !firebase.database || !firebase.apps || firebase.apps.length === 0) {
            console.error('❌ Firebase no está disponible para cargar info del admin');
            // Usar datos de localStorage como fallback
            const usuarioLocal = localStorage.getItem('usuarioActual');
            if (usuarioLocal) {
                const userData = JSON.parse(usuarioLocal);
                document.getElementById('adminName').textContent = userData.nombre || userData.correo;
                console.log('✅ Info del admin cargada desde localStorage');
            }
            return;
        }

        const userSnapshot = await firebase.database().ref(`usuarios/${currentUser.uid}`).once('value');
        const user = userSnapshot.val();

        if (user) {
            document.getElementById('adminName').textContent = user.nombre || user.correo;
            console.log('✅ Info del admin cargada desde Firebase');
        }
    } catch (error) {
        console.error('❌ Error al cargar info del admin:', error);
        // Fallback a localStorage
        try {
            const usuarioLocal = localStorage.getItem('usuarioActual');
            if (usuarioLocal) {
                const userData = JSON.parse(usuarioLocal);
                document.getElementById('adminName').textContent = userData.nombre || userData.correo;
                console.log('✅ Info del admin cargada desde localStorage (fallback)');
            }
        } catch (fallbackError) {
            console.error('❌ Error en fallback:', fallbackError);
        }
    }
}

// ========== CARGAR MÉTRICAS ==========
async function loadMetrics() {
    try {
        console.log('📊 Cargando métricas...');
        showLoading('Cargando métricas...');

        // Verificar Firebase
        if (!firebase || !firebase.database || !firebase.apps || firebase.apps.length === 0) {
            throw new Error('Firebase no está disponible');
        }

        // Obtener todas las suscripciones
        const subscriptionsSnapshot = await firebase.database().ref('subscriptions').once('value');
        const subscriptions = subscriptionsSnapshot.val() || {};

        // Obtener usuarios premium
        const premiumSnapshot = await firebase.database().ref('premiumUsers').once('value');
        const premiumUsers = premiumSnapshot.val() || {};

        // Calcular métricas
        const allSubs = Object.values(subscriptions);
        const activeSubs = allSubs.filter(s => s.status === 'active');
        const cancelledSubs = allSubs.filter(s => s.status === 'cancelled');
        const failedSubs = allSubs.filter(s => s.status === 'failed');
        const pendingSubs = allSubs.filter(s => s.status === 'pending');

        // Calcular ingresos mensuales (estimado)
        const monthlyRevenue = activeSubs.length * 2000; // $2000 ARS por suscripción

        // Calcular tasa de conversión
        const totalUsers = Object.keys(premiumUsers).length;
        const conversionRate = totalUsers > 0 ? ((activeSubs.length / totalUsers) * 100).toFixed(1) : 0;

        // Obtener pagos fallidos recientes (últimos 30 días)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const recentFailures = failedSubs.filter(s => s.updatedAt > thirtyDaysAgo).length;

        metricsData = {
            activeSubscriptions: activeSubs.length,
            cancelledSubscriptions: cancelledSubs.length,
            failedSubscriptions: failedSubs.length,
            pendingSubscriptions: pendingSubs.length,
            totalSubscriptions: allSubs.length,
            monthlyRevenue: monthlyRevenue,
            conversionRate: conversionRate,
            recentFailures: recentFailures
        };

        // Renderizar métricas
        renderMetrics();

        // Renderizar gráficos
        renderCharts();

        hideLoading();
        console.log('✅ Métricas cargadas:', metricsData);
    } catch (error) {
        console.error('❌ Error al cargar métricas:', error);
        hideLoading();
        showError('Error al cargar métricas');
    }
}

// ========== RENDERIZAR MÉTRICAS ==========
function renderMetrics() {
    // Suscriptores activos
    document.getElementById('activeSubscribers').textContent = metricsData.activeSubscriptions || 0;

    // Ingresos mensuales
    document.getElementById('monthlyRevenue').textContent = `$${(metricsData.monthlyRevenue || 0).toLocaleString('es-AR')}`;

    // Tasa de conversión
    document.getElementById('conversionRate').textContent = `${metricsData.conversionRate || 0}%`;

    // Pagos fallidos
    document.getElementById('failedPayments').textContent = metricsData.recentFailures || 0;
}

// ========== RENDERIZAR GRÁFICOS ==========
function renderCharts() {
    // Gráfico de suscripciones por estado
    const subscriptionsCtx = document.getElementById('subscriptionsChart');
    if (subscriptionsCtx) {
        if (subscriptionsChart) {
            subscriptionsChart.destroy();
        }

        subscriptionsChart = new Chart(subscriptionsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Activas', 'Canceladas', 'Fallidas', 'Pendientes'],
                datasets: [{
                    data: [
                        metricsData.activeSubscriptions || 0,
                        metricsData.cancelledSubscriptions || 0,
                        metricsData.failedSubscriptions || 0,
                        metricsData.pendingSubscriptions || 0
                    ],
                    backgroundColor: [
                        '#00C853',
                        '#f44336',
                        '#ff9800',
                        '#2196F3'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Gráfico de ingresos (simulado - últimos 6 meses)
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        if (revenueChart) {
            revenueChart.destroy();
        }

        const months = ['Mes -5', 'Mes -4', 'Mes -3', 'Mes -2', 'Mes -1', 'Mes Actual'];
        const currentRevenue = metricsData.monthlyRevenue || 0;
        const revenues = [
            currentRevenue * 0.6,
            currentRevenue * 0.7,
            currentRevenue * 0.8,
            currentRevenue * 0.85,
            currentRevenue * 0.9,
            currentRevenue
        ];

        revenueChart = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Ingresos (ARS)',
                    data: revenues,
                    borderColor: '#00C853',
                    backgroundColor: 'rgba(0, 200, 83, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString('es-AR');
                            }
                        }
                    }
                }
            }
        });
    }
}

// ========== CARGAR SUSCRIPTORES ==========
async function loadSubscribers() {
    try {
        console.log('👥 Cargando suscriptores...');
        showLoading('Cargando suscriptores...');

        // Verificar Firebase
        if (!firebase || !firebase.database || !firebase.apps || firebase.apps.length === 0) {
            throw new Error('Firebase no está disponible');
        }

        // Obtener suscripciones
        const subscriptionsSnapshot = await firebase.database().ref('subscriptions').once('value');
        const subscriptions = subscriptionsSnapshot.val() || {};

        // Obtener información de usuarios
        const usersSnapshot = await firebase.database().ref('usuarios').once('value');
        const users = usersSnapshot.val() || {};

        // Combinar datos
        subscribersData = [];
        for (const [userId, subscription] of Object.entries(subscriptions)) {
            const user = users[userId];
            if (user) {
                subscribersData.push({
                    userId,
                    userName: user.nombre || 'Sin nombre',
                    userEmail: user.correo || 'Sin email',
                    userPhoto: user.foto || 'https://via.placeholder.com/40',
                    ...subscription
                });
            }
        }

        // Ordenar por fecha de creación (más recientes primero)
        subscribersData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        // Renderizar tabla
        renderSubscribersTable();

        hideLoading();
        console.log(`✅ ${subscribersData.length} suscriptores cargados`);
    } catch (error) {
        console.error('❌ Error al cargar suscriptores:', error);
        hideLoading();
        showError('Error al cargar suscriptores');
    }
}

// ========== RENDERIZAR TABLA DE SUSCRIPTORES ==========
function renderSubscribersTable(filteredData = null) {
    const tbody = document.getElementById('subscribersTableBody');
    const noSubscribers = document.getElementById('noSubscribers');
    const data = filteredData || subscribersData;

    if (data.length === 0) {
        tbody.innerHTML = '';
        noSubscribers.style.display = 'block';
        return;
    }

    noSubscribers.style.display = 'none';

    tbody.innerHTML = data.map(sub => {
        const statusClass = getStatusClass(sub.status);
        const statusText = getStatusText(sub.status);
        const startDate = sub.startDate ? new Date(sub.startDate).toLocaleDateString('es-AR') : '-';
        const nextBilling = sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString('es-AR') : '-';
        const amount = sub.amount ? `$${sub.amount.toLocaleString('es-AR')}` : '-';

        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${sub.userPhoto}" alt="${sub.userName}" 
                             style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                        <span>${sub.userName}</span>
                    </div>
                </td>
                <td>${sub.userEmail}</td>
                <td><span class="status-badge">Premium</span></td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${startDate}</td>
                <td>${nextBilling}</td>
                <td>${amount}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-table btn-view" onclick="viewSubscriptionDetails('${sub.userId}')">
                            👁️ Ver
                        </button>
                        ${sub.status === 'active' ? `
                            <button class="btn-table btn-cancel" onclick="cancelSubscriptionAdmin('${sub.userId}')">
                                ❌ Cancelar
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ========== OBTENER CLASE DE ESTADO ==========
function getStatusClass(status) {
    const classes = {
        'active': 'status-active',
        'cancelled': 'status-cancelled',
        'pending': 'status-pending',
        'failed': 'status-failed',
        'expired': 'status-cancelled'
    };
    return classes[status] || 'status-pending';
}

// ========== OBTENER TEXTO DE ESTADO ==========
function getStatusText(status) {
    const texts = {
        'active': 'Activa',
        'cancelled': 'Cancelada',
        'pending': 'Pendiente',
        'failed': 'Fallida',
        'expired': 'Expirada'
    };
    return texts[status] || status;
}

// ========== CONFIGURAR EVENT LISTENERS ==========
function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            window.location.href = 'login.html';
        });
    });

    // Filtro de estado
    document.getElementById('statusFilter').addEventListener('change', filterSubscribers);

    // Búsqueda
    document.getElementById('searchSubscriber').addEventListener('input', filterSubscribers);

    // Filtros de logs
    const logTypeFilter = document.getElementById('logTypeFilter');
    const logDateFilter = document.getElementById('logDateFilter');
    
    if (logTypeFilter) {
        logTypeFilter.addEventListener('change', filterLogs);
    }
    
    if (logDateFilter) {
        logDateFilter.addEventListener('change', filterLogs);
    }
}

// ========== FILTRAR SUSCRIPTORES ==========
function filterSubscribers() {
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchSubscriber').value.toLowerCase();

    let filtered = subscribersData;

    // Filtrar por estado
    if (statusFilter !== 'all') {
        filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
        filtered = filtered.filter(sub => 
            sub.userName.toLowerCase().includes(searchTerm) ||
            sub.userEmail.toLowerCase().includes(searchTerm)
        );
    }

    renderSubscribersTable(filtered);
}

// ========== VER DETALLES DE SUSCRIPCIÓN ==========
async function viewSubscriptionDetails(userId) {
    try {
        showLoading('Cargando detalles...');

        const subscription = subscribersData.find(s => s.userId === userId);
        if (!subscription) {
            throw new Error('Suscripción no encontrada');
        }

        const modal = document.getElementById('subscriptionDetailsModal');
        const body = document.getElementById('subscriptionDetailsBody');

        body.innerHTML = `
            <div style="display: grid; gap: 20px;">
                <div>
                    <h4>👤 Información del Usuario</h4>
                    <p><strong>Nombre:</strong> ${subscription.userName}</p>
                    <p><strong>Email:</strong> ${subscription.userEmail}</p>
                    <p><strong>ID:</strong> ${userId}</p>
                </div>

                <div>
                    <h4>💎 Información de Suscripción</h4>
                    <p><strong>Estado:</strong> <span class="status-badge ${getStatusClass(subscription.status)}">${getStatusText(subscription.status)}</span></p>
                    <p><strong>Plan:</strong> Premium</p>
                    <p><strong>Monto:</strong> $${(subscription.amount || 2000).toLocaleString('es-AR')} ARS</p>
                    <p><strong>Fecha de inicio:</strong> ${subscription.startDate ? new Date(subscription.startDate).toLocaleString('es-AR') : '-'}</p>
                    <p><strong>Próximo pago:</strong> ${subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleString('es-AR') : '-'}</p>
                    ${subscription.cancelledAt ? `<p><strong>Fecha de cancelación:</strong> ${new Date(subscription.cancelledAt).toLocaleString('es-AR')}</p>` : ''}
                </div>

                <div>
                    <h4>🔗 Información de MercadoPago</h4>
                    <p><strong>ID de Suscripción:</strong> ${subscription.mercadopagoSubscriptionId || '-'}</p>
                    ${subscription.initPoint ? `<p><strong>Link de pago:</strong> <a href="${subscription.initPoint}" target="_blank">Ver</a></p>` : ''}
                </div>

                <div>
                    <h4>📊 Historial</h4>
                    <p><strong>Creada:</strong> ${subscription.createdAt ? new Date(subscription.createdAt).toLocaleString('es-AR') : '-'}</p>
                    <p><strong>Última actualización:</strong> ${subscription.updatedAt ? new Date(subscription.updatedAt).toLocaleString('es-AR') : '-'}</p>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        hideLoading();
    } catch (error) {
        console.error('❌ Error al ver detalles:', error);
        hideLoading();
        showError('Error al cargar detalles de la suscripción');
    }
}

// ========== CANCELAR SUSCRIPCIÓN (ADMIN) ==========
async function cancelSubscriptionAdmin(userId) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta suscripción?')) {
        return;
    }

    try {
        showLoading('Cancelando suscripción...');

        // Actualizar estado en Firebase
        await firebase.database().ref(`subscriptions/${userId}`).update({
            status: 'cancelled',
            cancelledAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP,
            cancelledBy: 'admin',
            adminId: currentUser.uid
        });

        // Desactivar Premium
        await firebase.database().ref(`premiumUsers/${userId}`).update({
            isPremium: false,
            deactivatedAt: firebase.database.ServerValue.TIMESTAMP,
            reason: 'admin_cancellation'
        });

        // Registrar en logs
        await firebase.database().ref('subscriptionLogs').push({
            type: 'admin_cancellation',
            userId: userId,
            adminId: currentUser.uid,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        // Enviar notificación al usuario
        await firebase.database().ref('notificaciones').push({
            tipo: 'subscription',
            para: userId,
            mensaje: 'Tu suscripción Premium ha sido cancelada por el administrador.',
            fecha: new Date().toISOString(),
            leida: false,
            icono: '❌'
        });

        hideLoading();
        showSuccess('Suscripción cancelada exitosamente');

        // Recargar datos
        await loadSubscribers();
        await loadMetrics();
    } catch (error) {
        console.error('❌ Error al cancelar suscripción:', error);
        hideLoading();
        showError('Error al cancelar la suscripción');
    }
}

// ========== MOSTRAR MODAL ASIGNAR PREMIUM ==========
function showAssignPremiumModal() {
    const modal = document.getElementById('assignPremiumModal');
    modal.style.display = 'flex';
    document.getElementById('targetUserId').value = '';
    document.getElementById('durationMonths').value = '1';
    document.getElementById('confirmAssign').checked = false;
}

// ========== CERRAR MODAL ASIGNAR PREMIUM ==========
function closeAssignPremiumModal() {
    const modal = document.getElementById('assignPremiumModal');
    modal.style.display = 'none';
}

// ========== CONFIRMAR ASIGNAR PREMIUM ==========
async function confirmAssignPremium() {
    const userId = document.getElementById('targetUserId').value.trim();
    const months = parseInt(document.getElementById('durationMonths').value);
    const confirmed = document.getElementById('confirmAssign').checked;

    if (!userId) {
        alert('Por favor ingresa el ID del usuario');
        return;
    }

    if (!confirmed) {
        alert('Por favor confirma la asignación');
        return;
    }

    try {
        showLoading('Asignando Premium...');

        // Verificar que el usuario existe
        const userSnapshot = await firebase.database().ref(`usuarios/${userId}`).once('value');
        if (!userSnapshot.exists()) {
            throw new Error('Usuario no encontrado');
        }

        const user = userSnapshot.val();

        // Calcular fecha de expiración
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + months);

        // Activar Premium
        await firebase.database().ref(`premiumUsers/${userId}`).set({
            isPremium: true,
            activatedAt: firebase.database.ServerValue.TIMESTAMP,
            expiresAt: expiresAt.toISOString(),
            assignedBy: 'admin',
            adminId: currentUser.uid,
            durationMonths: months,
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

        // Crear suscripción manual
        await firebase.database().ref(`subscriptions/${userId}`).set({
            planId: 'premium_manual',
            status: 'active',
            startDate: firebase.database.ServerValue.TIMESTAMP,
            nextBillingDate: expiresAt.toISOString(),
            amount: 2000 * months,
            currency: 'ARS',
            type: 'manual',
            assignedBy: currentUser.uid,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        });

        // Registrar en logs
        await firebase.database().ref('subscriptionLogs').push({
            type: 'manual_premium_assigned',
            userId: userId,
            adminId: currentUser.uid,
            months: months,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        // Enviar notificación
        await firebase.database().ref('notificaciones').push({
            tipo: 'subscription',
            para: userId,
            mensaje: `¡Felicidades! Se te ha asignado Premium por ${months} ${months === 1 ? 'mes' : 'meses'}. Disfruta de todos los beneficios.`,
            fecha: new Date().toISOString(),
            leida: false,
            icono: '🎉'
        });

        hideLoading();
        closeAssignPremiumModal();
        showSuccess(`Premium asignado exitosamente a ${user.nombre || user.correo} por ${months} ${months === 1 ? 'mes' : 'meses'}`);

        // Recargar datos
        await loadSubscribers();
        await loadMetrics();
    } catch (error) {
        console.error('❌ Error al asignar Premium:', error);
        hideLoading();
        showError(error.message || 'Error al asignar Premium');
    }
}

// ========== EXPORTAR SUSCRIPTORES ==========
function exportSubscribers() {
    try {
        // Crear CSV
        const headers = ['Usuario', 'Email', 'Estado', 'Fecha Inicio', 'Próximo Pago', 'Monto'];
        const rows = subscribersData.map(sub => [
            sub.userName,
            sub.userEmail,
            getStatusText(sub.status),
            sub.startDate ? new Date(sub.startDate).toLocaleDateString('es-AR') : '-',
            sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString('es-AR') : '-',
            sub.amount ? `$${sub.amount}` : '-'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `suscriptores_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showSuccess('Archivo exportado exitosamente');
    } catch (error) {
        console.error('❌ Error al exportar:', error);
        showError('Error al exportar suscriptores');
    }
}

// ========== ACTUALIZAR MÉTRICAS ==========
async function refreshMetrics() {
    await loadMetrics();
    await loadSubscribers();
    showSuccess('Métricas actualizadas');
}

// ========== VER LOGS ==========
async function viewLogs() {
    try {
        showLoading('Cargando logs...');

        const logsSection = document.getElementById('logsSection');
        logsSection.style.display = 'block';

        // Cargar logs
        const logsSnapshot = await firebase.database().ref('subscriptionLogs')
            .orderByChild('timestamp')
            .limitToLast(100)
            .once('value');

        logsData = [];
        logsSnapshot.forEach(child => {
            logsData.push({
                id: child.key,
                ...child.val()
            });
        });

        // Ordenar por más recientes
        logsData.reverse();

        renderLogs();
        hideLoading();

        // Scroll a la sección
        logsSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('❌ Error al cargar logs:', error);
        hideLoading();
        showError('Error al cargar logs');
    }
}

// ========== RENDERIZAR LOGS ==========
function renderLogs(filteredData = null) {
    const container = document.getElementById('logsContainer');
    const data = filteredData || logsData;

    if (data.length === 0) {
        container.innerHTML = '<p class="no-data">No hay logs para mostrar</p>';
        return;
    }

    container.innerHTML = data.map(log => {
        const logClass = getLogClass(log.type);
        const logIcon = getLogIcon(log.type);
        const logText = getLogText(log);
        const date = log.timestamp ? new Date(log.timestamp).toLocaleString('es-AR') : '-';

        return `
            <div class="log-item ${logClass}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <strong>${logIcon} ${log.type}</strong>
                        <p style="margin: 5px 0; color: #666;">${logText}</p>
                    </div>
                    <span style="font-size: 0.85rem; color: #999;">${date}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ========== OBTENER CLASE DE LOG ==========
function getLogClass(type) {
    if (type.includes('success') || type.includes('created') || type.includes('assigned')) {
        return 'success';
    }
    if (type.includes('error') || type.includes('failed')) {
        return 'error';
    }
    return 'warning';
}

// ========== OBTENER

// ========== OBTENER ICONO DE LOG ==========
function getLogIcon(type) {
    const icons = {
        'subscription_created': '✅',
        'subscription_cancelled': '❌',
        'payment_success': '💰',
        'payment_failed': '⚠️',
        'manual_premium_assigned': '👑',
        'admin_cancellation': '🛑',
        'expired_check': '⏰',
        'webhook_received': '📨'
    };
    return icons[type] || '📋';
}

// ========== OBTENER TEXTO DE LOG ==========
function getLogText(log) {
    const texts = {
        'subscription_created': `Suscripción creada para usuario ${log.userId}`,
        'subscription_cancelled': `Suscripción cancelada para usuario ${log.userId}`,
        'payment_success': `Pago exitoso de usuario ${log.userId}`,
        'payment_failed': `Pago fallido de usuario ${log.userId}`,
        'manual_premium_assigned': `Premium asignado manualmente a ${log.userId} por ${log.months} meses`,
        'admin_cancellation': `Suscripción cancelada por admin para usuario ${log.userId}`,
        'expired_check': `Verificación de expirados: ${log.expiredCount} suscripciones expiradas`,
        'webhook_received': `Webhook recibido de MercadoPago`
    };
    return texts[log.type] || JSON.stringify(log);
}

// ========== FILTRAR LOGS ==========
function filterLogs() {
    const typeFilter = document.getElementById('logTypeFilter').value;
    const dateFilter = document.getElementById('logDateFilter').value;

    let filtered = logsData;

    // Filtrar por tipo
    if (typeFilter !== 'all') {
        filtered = filtered.filter(log => log.type === typeFilter);
    }

    // Filtrar por fecha
    if (dateFilter) {
        const selectedDate = new Date(dateFilter);
        filtered = filtered.filter(log => {
            if (!log.timestamp) return false;
            const logDate = new Date(log.timestamp);
            return logDate.toDateString() === selectedDate.toDateString();
        });
    }

    renderLogs(filtered);
}

// ========== CERRAR LOGS ==========
function closeLogs() {
    const logsSection = document.getElementById('logsSection');
    logsSection.style.display = 'none';
}

// ========== CERRAR MODAL DE DETALLES ==========
function closeDetailsModal() {
    const modal = document.getElementById('subscriptionDetailsModal');
    modal.style.display = 'none';
}

// ========== UTILIDADES ==========

function showLoading(message = 'Cargando...') {
    const overlay = document.getElementById('loadingOverlay');
    const messageEl = document.getElementById('loadingMessage');
    if (overlay) {
        overlay.style.display = 'flex';
        if (messageEl) {
            messageEl.textContent = message;
        }
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showSuccess(message) {
    alert('✅ ' + message);
}

function showError(message) {
    alert('❌ ' + message);
}

// ========== CERRAR MODALES AL HACER CLIC FUERA ==========
window.onclick = function(event) {
    const assignModal = document.getElementById('assignPremiumModal');
    const detailsModal = document.getElementById('subscriptionDetailsModal');
    
    if (event.target === assignModal) {
        closeAssignPremiumModal();
    }
    if (event.target === detailsModal) {
        closeDetailsModal();
    }
}

// ========== EXPORTAR FUNCIONES GLOBALES ==========
window.showAssignPremiumModal = showAssignPremiumModal;
window.closeAssignPremiumModal = closeAssignPremiumModal;
window.confirmAssignPremium = confirmAssignPremium;
window.exportSubscribers = exportSubscribers;
window.refreshMetrics = refreshMetrics;
window.viewLogs = viewLogs;
window.closeLogs = closeLogs;
window.viewSubscriptionDetails = viewSubscriptionDetails;
window.cancelSubscriptionAdmin = cancelSubscriptionAdmin;
window.closeDetailsModal = closeDetailsModal;

console.log('✅ Subscription Admin Panel cargado correctamente');
