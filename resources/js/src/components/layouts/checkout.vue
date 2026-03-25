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
                <q-btn unelevated no-caps color="primary" size="lg" class="submit-button"
                    :loading="stripeStore.isLoading" :disable="stripeStore.isLoading || !isPaymentElementReady"
                    @click="handleProcessPayment">
                    <q-icon name="eva-credit-card-outline" class="q-mr-sm" />
                    {{ stripeStore.isLoading ? 'Procesando...' : 'Confirmar Pago' }}
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
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { useQuasar } from 'quasar';
import { useStripeStore } from '@/services/store/stripe.store';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';


const $q = useQuasar();
const stripeStore = useStripeStore();

const stripe = ref(null);
const elements = ref(null);
const paymentElement = ref(null);
const paymentElementRef = ref(null);
const router = useRouter()
const stripeError = ref(null);
const isPaymentElementReady = ref(false);
const loading = ref(false)
const route = useRoute()

onMounted(async () => {
    initStripe()
});

// Limpiar al desmontar
onBeforeUnmount(() => {
    if (paymentElement.value) {
        paymentElement.value.unmount();
    }
});

const initStripe = async () => {
    try {
        // Obtener la clave pública de Stripe
        const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || null;
        if (stripeKey == null) {
            throw new Error(`Error: ${errors.value.consoleError}`);
        }
        stripe.value = await loadStripe(stripeKey);
        if (!stripe.value) {
            throw new Error('No se pudo cargar Stripe');
        }

        const intentResult = await stripeStore.getSetupIntent();

        if (!intentResult.success) {
            throw new Error(intentResult.error || 'Error al obtener el setup intent');
        }

        const clientSecret = intentResult.clientSecret;

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

        elements.value = stripe.value.elements({
            clientSecret: clientSecret,
            appearance: appearance,
            locale: 'es'
        });
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

        paymentElement.value = elements.value.create('payment', paymentElementOptions);

        paymentElement.value.on('ready', () => {
            isPaymentElementReady.value = true;
        });

        paymentElement.value.on('change', (event) => {
            if (event.error) {
                stripeError.value = event.error.message;
            } else {
                stripeError.value = null;
            }
        });
        loading.value = false
        setTimeout(() => {
            paymentElement.value.mount('#payment-element');
        }, 400);

    } catch (error) {
        console.error('Error al inicializar Stripe:', error);
        stripeError.value = error.message || 'Error al cargar el sistema de pagos. Por favor, recarga la página.';
    }
}
const handleProcessPayment = async () => {
    if (!isPaymentElementReady.value) {
        $q.notify({ type: 'negative', message: 'El formulario de pago aún no está listo' });
        return;
    }

    stripeError.value = null;
    stripeStore.setError(null);

    try {
        const result = await stripeStore.confirmPayment(stripe.value, elements.value);

        if (result.success && result.paymentMethod) {
            const finalizeResult = await stripeStore.finalizeSubscription(
                result.paymentMethod,
                payPlan.value
            );

            if (finalizeResult.success) {
                $q.notify({
                    type: 'positive',
                    message: '¡Suscripción activa con éxito!',
                    position: 'top'
                });
                console.log(finalizeResult)

                // AQUÍ: Redirigir al usuario porque ya terminó el proceso
                router.push('/checkout/success?trx=' + finalizeResult.data.data.trx);
                return;
            } else {
                console.log(finalizeResult)
                throw finalizeResult.error;
            }
        } else {
            console.log(result)
            throw new Error('Error al procesar el pago.');
        }

    } catch (error) {
        console.error('Error en el proceso de pago:', error);
        console.log(error)
        $q.notify({
            type: 'negative',
            message: 'Ocurrió un error inesperado.',
            position: 'top'
        });
        resetStripeFlow();
    }
};

const resetStripeFlow = async () => {
    isPaymentElementReady.value = false;

    if (paymentElement.value) {
        paymentElement.value.destroy();
    }

    await initStripe();
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
    max-width: 520px;
    background: #ffffff;
    border-radius: 16px;
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
