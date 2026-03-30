<template>
    <div class="checkout-container">
        <div class="checkout-card" v-if="!loading">
            <!-- Header Minimalista -->
            <div class="checkout-header">
                <h2 class="checkout-title">Pago Seguro</h2>
            </div>

            <!-- Form -->
            <div class="checkout-form">
                <!-- Stripe Payment Element -->
                <div class="q-mb-md">
                    <div class="text-subtitle2 q-mb-xs" style="color: #4b5563; font-weight: 600;">
                        Nombre del titular de la tarjeta *
                    </div>
                    <q-input v-model="payerName" outlined dense color="primary" placeholder="Ej: Juan Pérez"
                        :rules="[val => !!val || 'El nombre es obligatorio']" hide-bottom-space />
                </div>
                <div class="form-group">
                    <div id="payment-element" ref="paymentElementRef" class="payment-element-wrapper"></div>
                </div>

                <!-- Error Message -->
                <transition name="fade">
                    <div v-if="stripeError || stripeStore.getError" class="error-message">
                        <q-icon name="eva-alert-circle-outline" size="18px" />
                        <span>{{ stripeError || stripeStore.getError }}</span>
                    </div>
                </transition>

                <!-- Security Badge Minimalista -->
                <div class="security-badge">
                    <q-icon name="eva-lock-outline" size="14px" />
                    <span>Procesado de forma segura por Stripe</span>
                </div>

                <!-- Submit Button -->
                <q-btn unelevated no-caps color="primary" size="lg" class="submit-button" :loading="isProcessing"
                    :disable="isProcessing || !elementsLoaded" @click="handleProcessPayment">
                    Confirmar Pago Seguro
                </q-btn>
            </div>
        </div>
        <div v-else class="checkout-card skeleton-card">
            <!-- Skeleton Header -->
            <div class="checkout-header">
                <q-skeleton type="text" width="150px" height="32px" class="skeleton-title" />
            </div>

            <!-- Skeleton Form -->
            <div class="checkout-form">
                <!-- Skeleton Payment Element -->
                <div class="form-group">
                    <q-skeleton type="rect" height="200px" class="skeleton-payment-element" />
                </div>

                <!-- Skeleton Security Badge -->
                <div class="security-badge skeleton-badge">
                    <q-skeleton type="circle" size="20px" />
                    <q-skeleton type="text" width="200px" height="24px" />
                </div>

                <!-- Skeleton Submit Button -->
                <q-skeleton type="rect" height="48px" class="skeleton-button" />
            </div>
        </div>
    </div>
</template>

<script setup>
// Importaciones Esenciales
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useStripeStore } from '../../services/store/stripe.store';
import { loadStripe } from '@stripe/stripe-js';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const props = defineProps({
    link: {
        type: Object,
        required: true
    }
});

const $q = useQuasar();
const stripeStore = useStripeStore();
const router = useRouter();
const payerName = ref('');
// Variables de Stripe puras
let stripeInstance = null;
let elementsInstance = null;
let paymentElementInstance = null;

// Estado Local
const stripeError = ref(null);
const elementsLoaded = ref(false);
const isProcessing = ref(false);

const loading = computed(() => stripeStore.loading);
const loadingStripeStore = computed(() => stripeStore.getLoading);

// 1. Función para montar (o remontar) el formulario en el DOM
const mountStripeElement = () => {
    elementsLoaded.value = false;
    const paymentElementOptions = {
        layout: {
            type: 'accordion',
            defaultCollapsed: false,
            radios: true,
            spacedAccordionItems: false
        },
        fields: {

            billingDetails: {
                name: 'auto',
                email: 'auto',
                phone: 'auto',
                address: {
                    country: 'auto',
                    line1: 'auto',
                    line2: 'auto',
                    city: 'auto',
                    state: 'auto',
                    postalCode: 'auto'
                }
            }
        },
        paymentMethodTypes: [
            'card',
        ],
        // wallets: {
        //     applePay: 'auto',
        //     googlePay: 'auto'
        // }
    };
    if (paymentElementInstance) {
        paymentElementInstance.destroy();
    }

    paymentElementInstance = elementsInstance.create("payment", paymentElementOptions);
    paymentElementInstance.mount("#payment-element");

    paymentElementInstance.on('ready', () => {
        elementsLoaded.value = true;
    });
};

// 2. NUEVA FUNCIÓN: Extraemos toda la lógica pesada de inicialización aquí
const initializeStripeData = async () => {
    try {
        stripeInstance = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

        if (!stripeInstance) {
            stripeError.value = "Error crítico al inicializar la pasarela de pago.";
            return;
        }

        let intentResult;

        // EVALUAMOS DIRECTAMENTE EL TIPO DESDE EL OBJETO LINK
        if (props.link.type === 2) {
            // Es una Suscripción
            intentResult = await stripeStore.getSetupIntentLink();
        } else {
            // Es un cobro único (type 4, etc)
            intentResult = await stripeStore.getPaymentIntent(props.link.id);
        }

        if (!intentResult.success) {
            stripeError.value = intentResult.error || 'No se pudieron obtener los detalles del pago.';
            return;
        }

        const appearance = {
            theme: 'stripe',
            variables: {
                colorPrimary: '#1976D2',
                colorBackground: '#ffffff',
                colorText: '#1a1a1a',
                colorDanger: '#ef4444',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
            },
            rules: {
                '.Input': {
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '16px',
                },
                '.Input:focus': {
                    border: '2px solid #1976D2',
                    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                },
                '.Input--invalid': {
                    border: '1px solid #ef4444',
                },
            }
        };

        elementsInstance = stripeInstance.elements({
            clientSecret: intentResult.clientSecret,
            appearance: appearance,
            locale: 'es'
        });

        // Llamamos a la función para pintar el formulario
        mountStripeElement();

    } catch (error) {
        console.error("Error durante la inicialización de Stripe:", error);
        stripeError.value = "Ocurrió un error inesperado al cargar el formulario de pago.";
    }
};

// 3. ONMOUNTED LIMPIO: Solo llama a la función principal
onMounted(() => {
    initializeStripeData();
});



const handleProcessPayment = async () => {
    // Validación del nombre (que agregamos en el paso anterior)
    if (!payerName.value || payerName.value.trim() === '') {
        stripeError.value = "Por favor, ingresa el nombre del titular de la tarjeta.";
        return;
    }

    if (!elementsLoaded.value || isProcessing.value) return;

    isProcessing.value = true;
    stripeError.value = null;

    try {
        // BIFURCACIÓN SEGÚN EL TIPO DE LINK
        if (props.link.type === 2) {

            // --- 1. FLUJO DE SUSCRIPCIÓN ---
            const { error, setupIntent } = await stripeInstance.confirmSetup({
                elements: elementsInstance,
                confirmParams: {
                    payment_method_data: {
                        billing_details: { name: payerName.value }
                    }
                },
                redirect: 'if_required',
            });

            if (error) {
                stripeError.value = error.message;
                mountStripeElement();
            } else if (setupIntent && setupIntent.status === 'succeeded') {

                // Enviamos los datos al backend para crear la suscripción usando props.link.id
                const result = await stripeStore.createSubscriptionLink({
                    link_id: props.link.id,
                    payment_method_id: setupIntent.payment_method,
                    payer_name: payerName.value,
                });

                if (result.success) {
                    $q.notify({ color: 'positive', message: '¡Suscripción programada con éxito!' });
                    router.push('/trasacction-public/view/10/' + result.data)
                } else {
                    stripeError.value = "Error al programar la suscripción. Contacte soporte.";
                }
            }

        } else {

            // --- 2. FLUJO DE VENTA ÚNICA ---
            const { error, paymentIntent } = await stripeInstance.confirmPayment({
                elements: elementsInstance,
                confirmParams: {
                    payment_method_data: {
                        billing_details: { name: payerName.value }
                    }
                },
                redirect: 'if_required',
            });

            if (error) {
                stripeError.value = error.message;
                mountStripeElement();
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {

                // Verificamos el pago único usando props.link.id
                const result = await stripeStore.verifyPaymentSuccess(paymentIntent.id, props.link.id);

                if (result.success) {
                    $q.notify({ color: 'positive', message: '¡Pago realizado con éxito!' });
                    router.push('/trasacction-public/view/10/' + result.data)
                } else {
                    stripeError.value = "Pago cobrado, pero ocurrió un error al acreditar su wallet.";
                }
            } else {
                stripeError.value = "El estado del pago es incompleto. Intente de nuevo.";
                mountStripeElement();
            }
        }

    } catch (e) {
        console.error("Error durante el proceso de pago:", e);
        stripeError.value = "Ocurrió un error inesperado al procesar el pago.";
        mountStripeElement();
    } finally {
        isProcessing.value = false;
    }
};
</script>
<style lang="scss" scoped>
.checkout-container {
    //display: flex;
    //justify-content: center;
    //align-items: center;
    //min-height: 100vh;
    padding: 2rem 1rem;
    background: white
}

.checkout-card {
    width: 100%;
    max-width: 700px;
    background: #ffffff;
    border-radius: 16px;
    margin: auto;
    overflow: hidden;
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(15px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.checkout-header {
    text-align: center;
    padding: 1.5rem 2rem 1rem;
    //border-bottom: 1px solid #f0f0f0;
    background: #ffffff;
}

.checkout-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: -0.02em;
}

.checkout-form {
    padding: 2rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.payment-element-wrapper {
    padding: 0;
    border-radius: 8px;
    overflow: hidden;

    :deep(.PaymentElement) {
        padding: 0;
    }
}

.error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-size: 0.875rem;
    animation: shake 0.3s ease;
}

@keyframes shake {

    0%,
    100% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-4px);
    }

    75% {
        transform: translateX(4px);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.security-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    margin-bottom: 1.5rem;
    background-color: #f9fafb;
    border-radius: 8px;
    color: #6b7280;
    font-size: 0.8rem;
    font-weight: 500;
}

.submit-button {
    width: 100%;
    padding: 0.875rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 10px;
    text-transform: none;
    letter-spacing: 0.3px;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(25, 118, 210, 0.25);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}

// Responsive
@media (max-width: 600px) {
    .checkout-container {
        padding: 0rem;
        background: #ffffff;
    }

    .checkout-card {
        border-radius: 12px;
        box-shadow: none;
        max-width: 100%;
        //border: 1px solid #e5e7eb;
    }

    .checkout-header {
        padding: 1.25rem 1.5rem 0.75rem;
    }

    .checkout-title {
        font-size: 1.25rem;
    }

    .checkout-form {
        padding: 0.7rem;
    }
}

// Skeleton Styles
.skeleton-card {
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}

.skeleton-title {
    margin: 0 auto;
}

.skeleton-payment-element {
    border-radius: 8px;
}


.skeleton-button {
    border-radius: 10px;
    width: 100%;
}

// Responsive Skeleton
@media (max-width: 600px) {
    .skeleton-card {
        border-radius: 12px;
        box-shadow: none;
        border: 1px solid #e5e7eb;
    }
}
</style>
