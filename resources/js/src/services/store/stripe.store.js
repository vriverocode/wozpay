import { defineStore } from "pinia";
import ApiService from "@/services/axios/";
import JwtService from "@/services/jwt/";

export const useStripeStore = defineStore("stripe", {
    state: () => {
        return {
            loading: false,
            error: null,
            plans: [
                {
                    id: 1,
                    name: "Plan Gratuito / Free",
                    type: "Gratis",
                    code: "0000",
                    annual: {
                        price: "Gratis",
                        annualSavings: "",
                        description: "Ideal para iniciar",
                        features: [
                            "Cuenta básica en Gs",
                            "Hasta 5 links o QR por mes",
                            "Hasta 300.000 Gs por link o QR",
                            "Hasta 1.500.000 Gs/mes en trans.",
                            "Comisión por trans. del 10% + IVA",
                            "Solo retiros manuales",
                            "1 Retiro por mes",
                        ],
                    },
                    monthly: {
                        price: "Gratis",
                        annualSavings: "",
                        description: "Ideal para iniciar",
                        features: [
                            "Cuenta básica en Gs",
                            "Hasta 5 links o QR por mes",
                            "Hasta 300.000 Gs por link o QR",
                            "Hasta 1.500.000 Gs/mes en trans.",
                            "Comisión por trans. del 10% + IVA",
                            "Solo retiros manuales",
                            "1 Retiro por mes",
                        ],
                    },
                },
                // {
                //   id: 2,
                //   name: "Principiante",
                //   type: "Basico",
                //   code: '4f4d956b-fa33-11f0-a322-64006a4efafd',
                //   annual: {
                //       price: 250000,
                //       annualSavings: 938000,
                //       description: "Ideal para principiantes",
                //       features: [
                //           "Cuenta básica en Gs",
                //           "Hasta 10 links o QR por mes",
                //           "Hasta 700.000 Gs por link o QR",
                //           "Hasta 7.000.000 Gs/mes en trans.",
                //           "Comisión por trans. del 15% + IVA",
                //           "Desembolso día lunes",
                //       ],
                //   },
                //   monthly: {
                //       price: 99000,
                //       description: "Ideal para principiantes",
                //       features: [
                //           "Cuenta básica en Gs",
                //           "Hasta 10 links o QR por mes",
                //           "Hasta 700.000 Gs por link o QR",
                //           "Hasta 7.000.000 Gs/mes en trans.",
                //           "Comisión por trans. del 15% + IVA",
                //           "Desembolso día lunes",
                //       ],
                //   },
                // },
                // {
                //   id: 3,
                //   name: "Emprendedor regular",
                //   type: "Regular",
                //   code: '4f4d96e3-fa33-11f0-a322-64006a4efafd',
                //   annual: {
                //       price: 600000,
                //       annualSavings: 200000,
                //       description: "Ideal para emprendedores regulares",
                //       features: [
                //           "Cuenta corriente en USD",
                //           "Hasta 30 links por mes",
                //           "Hasta 30 QR por mes",
                //           "Gs - USD - EUR",
                //           "Hasta 1.000 USD por link o QR",
                //           "Hasta 30.000 USD/mes en trans.",
                //           "Comisión por trans. del 6,5% + IVA",
                //           "Préstamo hasta Gs. 200.000.000",
                //           "Proceso de acreditación 48hs",
                //           "Desembolso al instante",
                //       ],
                //   },
                //   monthly: {
                //       price: 200000,
                //       description: "Para negocios en crecimiento",
                //       features: [
                //           "Cuenta corriente en USD",
                //           "Hasta 30 links por mes",
                //           "Hasta 30 QR por mes",
                //           "Gs - USD - EUR",
                //           "Hasta 1.000 USD por link o QR",
                //           "Hasta 30.000 USD/mes en trans.",
                //           "Comisión por trans. del 6,5% + IVA",
                //           "Préstamo hasta Gs. 200.000.000",
                //           "Proceso de acreditación 48hs",
                //           "Desembolso al instante",
                //       ],
                //   },
                // },
                // {
                //   id: 4,
                //   name: "Emprendedor Business",
                //   type: "Profesional",
                //   code: '4f4d9798-fa33-11f0-a322-64006a4efafd',
                //   annual: {
                //       price: 1500000,
                //       annualSavings: 2700000,
                //       description: "Para empresas establecidas",
                //       features: [
                //           "Cuenta corriente en USD",
                //           "Tarjeta de crédito - 2.000 USD",
                //           "Links & QR ilimitados",
                //           "+200 monedas",
                //           "Hasta 10.000 USD por link o QR",
                //           "Hasta 500.000 USD/mes en trans.",
                //           "Comisión por trans. del 3,9% + IVA",
                //           "Préstamo a sola firma Gs. 600.000.000",
                //           "Proceso de acreditación 24hs",
                //           "Desembolso al instante",
                //           "Multi-dispositivos",
                //           "Ejecutivo de cuentas asignado",
                //           "Boton de pago API Woz Pay",
                //       ],
                //   },
                //   monthly: {
                //       price: 350000,
                //       description: "Ideal para emprendedores establecidos",
                //       features: [
                //           "Cuenta corriente en USD",
                //           "Tarjeta de crédito - 2.000 USD",
                //           "Links & QR ilimitados",
                //           "+200 monedas",
                //           "Hasta 10.000 USD por link o QR",
                //           "Hasta 500.000 USD/mes en trans.",
                //           "Comisión por trans. del 3,9% + IVA",
                //           "Préstamo a sola firma Gs. 600.000.000",
                //           "Proceso de acreditación 24hs",
                //           "Desembolso al instante",
                //           "Multi-dispositivos",
                //           "Ejecutivo de cuentas asignado",
                //           "Boton de pago API Woz Pay",
                //       ],
                //   },
                // },
            ],
        };
    },
    actions: {
        setLoading(loading) {
            this.loading = loading;
        },
        setError(error) {
            this.error = error;
        },
        async getSetupIntent() {
            try {
                if (JwtService.getToken()) {
                    ApiService.setHeader();
                }

                const { data } = await ApiService.get(
                    "/api/v1/stripe/payments/setup-intent",
                    "",
                );

                if (data.code !== 200) {
                    throw new Error(
                        data.error || "Error al obtener el setup intent",
                    );
                }

                return { success: true, clientSecret: data.data.client_secret };
            } catch (e) {
                const errorMessage =
                    e.response?.data?.error ||
                    e.response?.data?.message ||
                    e.message ||
                    "Error de conexión con el servidor";
                return { success: false, error: errorMessage };
            }
        },
        async confirmPayment(stripe, elements) {
            this.setLoading(true);
            this.setError(null);

            try {
                const { error: submitError } = await elements.submit();

                if (submitError) {
                    this.setError(submitError.message);
                    this.setLoading(false);
                    return { success: false, error: submitError.message };
                }

                // Confirmar el pago con Stripe
                const { error: confirmError, setupIntent } =
                    await stripe.confirmSetup({
                        elements,
                        confirmParams: {
                            return_url: `${window.location.origin}/checkout/success`,
                        },
                        redirect: "if_required",
                    });

                if (confirmError) {
                    this.setError(confirmError.message);
                    this.setLoading(false);
                    return { success: false, error: confirmError.message };
                }

                // Si el setup intent requiere redirección, manejarlo
                if (setupIntent.status === "requires_action") {
                    this.setLoading(false);
                    return {
                        success: false,
                        error: "Se requiere autenticación adicional",
                        requiresAction: true,
                    };
                }

                // Obtener el payment method del setup intent
                const paymentMethod = setupIntent.payment_method;

                this.setLoading(false);
                return {
                    success: true,
                    paymentMethod: paymentMethod,
                };
            } catch (e) {
                const errorMessage =
                    e.response?.data?.error ||
                    e.response?.data?.message ||
                    e.message ||
                    "Error al procesar el pago";
                this.setError(errorMessage);
                this.setLoading(false);
                return { success: false, error: errorMessage };
            }
        },
        async finalizeSubscription(paymentMethodId, plan = null) {
            this.setLoading(true);
            try {
                if (JwtService.getToken()) {
                    ApiService.setHeader();
                }

                const body = {
                    payment_method: paymentMethodId,
                    plan_code: plan.code,
                    payment_type: plan.typePay,
                };

                const { data } = await ApiService.post(
                    "/api/v1/stripe/payments/subscribe",
                    body,
                );
                if (data.code !== 200) {
                    throw new Error(
                        data.error || "Error al crear la suscripción",
                    );
                }

                return { success: true, data };
            } catch (e) {
                const errorMessage = "Error al finalizar el registro.";
                this.setError(errorMessage);

                return {
                    success: false,
                    error: {
                        message: errorMessage,
                        code: 401,
                        consoleError: "Keys no valid",
                    },
                };
            } finally {
                this.setLoading(false);
            }
        },
        async getPaymentIntent(linkId) {
            this.setLoading(true);
            try {
                const { data } = await ApiService.post(
                    "/api/v1/stripe/create-payment-intent",
                    { link_id: linkId },
                );
                if (data.code !== 200) throw new Error(data.message);

                return { success: true, clientSecret: data.data.client_secret };
            } catch (e) {
                this.setError("Error al preparar el pago seguro");
                return { success: false };
            } finally {
                this.setLoading(false);
            }
        },

        async verifyPaymentSuccess(paymentIntentId, linkId) {
            this.setLoading(true);
            try {
                const { data } = await ApiService.post(
                    "/api/v1/stripe/verify-payment",
                    {
                        payment_intent_id: paymentIntentId,
                        link_id: linkId,
                    },
                );
                if (data.code !== 200) throw new Error(data.message);

                return { success: true, ...data.data };
            } catch (e) {
                this.setError("Hubo un error al validar la transacción.");
                return { success: false };
            } finally {
                this.setLoading(false);
            }
        },
        // 1. Obtener el Client Secret para guardar la tarjeta sin cobrar aún
        async getSetupIntentLink() {
            this.setLoading(true);
            try {
                // Llamamos a una ruta pública porque el que paga no está logueado
                const { data } = await ApiService.post(
                    "/api/v1/stripe/create-setup-intent-link",
                );
                if (data.code !== 200)
                    throw new Error(
                        data.message || "Error al preparar la suscripción",
                    );

                return { success: true, clientSecret: data.data.client_secret };
            } catch (e) {
                this.setError("Error al preparar el pago seguro recurrente");
                return { success: false };
            } finally {
                this.setLoading(false);
            }
        },

        // 2. Enviar el ID de la tarjeta guardada para programar los cobros
        async createSubscriptionLink(payload) {
            this.setLoading(true);
            try {
                const { data } = await ApiService.post(
                    "/api/v1/stripe/create-subscription",
                    payload,
                );
                if (data.code !== 200)
                    throw new Error(
                        data.message || "Error al crear la suscripción",
                    );

                return { success: true, ...data.data };
            } catch (e) {
                this.setError(
                    "Ocurrió un error al intentar procesar su suscripción.",
                );
                return { success: false, error: e };
            } finally {
                this.setLoading(false);
            }
        },
    },
    getters: {
        isLoading: (state) => state.loading,
        getError: (state) => state.error,
    },
});
