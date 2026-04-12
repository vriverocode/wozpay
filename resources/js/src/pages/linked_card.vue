<template>
  <div class="section_page-link q-mt-md q-pt-sm">
    <div class="">
      <div class="warning-info-content q-mx-md q-px-lg q-py-sm q-mx-md-xl q-px-md-md q-py-md-sm">
        <div class="info-title q-mb-sm">Información sobre los débitos</div>
        <div class="info-texto q-mb-sm">La tarjeta de crédito o débito adjunta será
          utilizada para el débito de las cuotas por el
          préstamo otorgado.
        </div>
        <div class="info-foot">Puedes cambiar tus métodos de pago luego del
          desembolso
        </div>
      </div>
      <input class="creditcard-input" style="display: none;" type="text" />
      <input class="creditcard-type" style="display: none;" type="text" />
      <q-form id="linked_form" class="" @submit.prevent="handleSubmit">
        <div class="q-px-sm q-mt-lg q-px-md-xl q-mx-md-lg">
          <div class="q-px-md-xl q-px-md">
            <div class="q-pb-xs q-pt-sm q-px-md q-px-md-lg card_form q-mt-md">
              <div class="text-center q-pt-sm">
                <img :src="dots" alt="" style="width: 3.2rem; margin: auto;">
                <div class="q-my-md text__debit">
                  Debitaremos las cuotas de ésta tarjeta
                </div>
              </div>
              <div class="q-px-md text-center q-py-sm q-mt-sm infoCard ">
                Te debitaremos una tarifa 5,5 USD <br> para validar la tarjeta
              </div>

              <div class="q-mb-sm q-mt-lg">
                <label class="text-caption text-weight-medium q-mb-xs block">Nombre del Titular</label>
                <q-input v-model="formCardData.owner_name" outlined dense color="primary" placeholder="Ej: Juan Pérez"
                  class="q-mb-md" :rules="[val => !!val || 'El nombre es obligatorio']" hide-bottom-space />

                <label class="text-caption text-weight-medium q-mb-xs block">Datos de la Tarjeta</label>
                <div id="card-element" ref="cardElementRef" class="stripe-input-container"></div>
                <div v-if="stripeError" class="text-negative text-caption q-mt-sm">
                  {{ stripeError }}
                </div>
              </div>
              <div class="q-px-xl q-my-md flex flex-center">
                <img :src="payMethod" alt="" style=" height: 2.1rem;">
              </div>
            </div>
          </div>
          <div class="q-px-md q-mt-md q-px-md-xl q-mx-md-lg">
            <div class="flex items-center q-px-md-md q-px-sm">
              <div class="text__securepay q-pt-xs">
                Pago seguro Woz Payments
              </div>
              <q-icon name="eva-lock-outline" size="sm" class="q-ml-xs" color="primary" />
            </div>
            <div class="flex items-center q-px-md-sm q-pt-xs">
              <q-checkbox class="terms-checkboxCard " v-model="formCardData.accept_terms" color="primary" size="md" />
              <a href="https://wozpayments.com/public/documents/TERMINOS_Y_CONDICIONES.pdf" target="_blank"
                style="width: 85%;">
                <div class="text__temrs " style="width: 100%;">
                  Acepto los terminos y condiciones
                </div>
              </a>
            </div>
          </div>
          <div class="q-px-sm q-mt-md q-px-md-xl q-mx-md-lg">
            <div class="flex items-center q-px-md-md autodebit_section justify-between ">
              <div class="text__autodebit ">
                Débitar automaticamente las cuota
              </div>
              <van-switch v-model="formCardData.is_autodebit" size="1.3rem" />
            </div>
            <div class="">
              <q-btn color="primary" class="w-100 q-pa-npne q-mb-none q-mt-md  link_button" no-caps type="submit"
                :loading="loading">
                <div class="text-white q-py-sm  flex justify-center items-center">
                  <div class="q-mt-xs">
                    Adjuntar tarjeta
                  </div>
                  <q-icon name="eva-lock-outline" size="sm" class="q-ml-xs " />
                </div>
                <template v-slot:loading>
                  <q-spinner-facebook />
                </template>
              </q-btn>
            </div>
          </div>
          <div class="q-px-sm q-mt-sm text-center text__bottom_comision">
            Asegúrate de contar con al menos 5,5 USD en tu tarjeta
            para la validación. Monto reembolsado en el prestamo
          </div>
        </div>

      </q-form>
      <div class="q-mt-lg q-px-md q-px-md-xl q-pb-xl">
        <div class="q-px-md-xl q-pb-sm">
          <div class="text-body2 text-weight-bold">Anuncio</div>
          <div class="text-center publicity_content bg-primary q-pa-md q-mb-md">
            <div class="text-caption text-white">
              Vende en todo el mundo haciendo Dropshipping
            </div>
            <div class="text-h3 text-white">
              26,7 <sub class="text-subtitle1">USD</sub>
            </div>
            <div>
              <div class="package-back">
                <div class="package-back__container" v-html="wozIcons.package" />
              </div>
              <div class="package-back">
                <div class="package-back__container" v-html="wozIcons.package" />
              </div>
              <div class="package-back">
                <div class="package-back__container" v-html="wozIcons.package" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showDialog">
      <doneModal :dialog="showDialog" text="Tarjeta vinculada con exito" />
    </div>
  </div>
</template>
<script>
import { useAuthStore } from '@/services/store/auth.store'
import { useCardStore } from '@/services/store/card.store'
import { inject, ref, onMounted } from 'vue'
import util from '@/util/numberUtil'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import payMethod from '@/assets/images/pay_types3.png'
import doneModal from '@/components/layouts/modals/doneModal.vue';
import { loadStripe } from '@stripe/stripe-js';
import wozIcons from '@/assets/icons/wozIcons'
import dots from '@/assets/images/dots.png'

export default {
  components: {
    doneModal
  },
  setup() {
    const $q = useQuasar();
    const cardStore = useCardStore();
    const stripe = ref(null);
    const elements = ref(null);
    const cardElement = ref(null);
    const loading = ref(false);
    const stripeError = ref(null);
    const user = useAuthStore().user;
    const numberFormat = util.numberFormat
    const icons = inject('ionIcons')
    const router = useRouter()
    const route = useRoute()
    const showDialog = ref(false)

    // Unificamos todo el estado del formulario aquí
    const formCardData = ref({
      accept_terms: false,
      is_autodebit: true,
      owner_name: '' // Añadimos la propiedad para el nombre
    })

    onMounted(async () => {
      stripe.value = await loadStripe(import.meta.env.VITE_STRIPE_KEY);
      elements.value = stripe.value.elements();

      const style = {
        base: {
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': { color: '#aab7c4' }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      };

      // hidePostalCode: true es lo que oculta el campo ZIP. 
      cardElement.value = elements.value.create('card', {
        style,
        hidePostalCode: true,
        disableLink: true  // <--- Agrega esta línea para ocultar Link
      });
      cardElement.value.mount('#card-element');

      cardElement.value.on('change', (event) => {
        stripeError.value = event.error ? event.error.message : null;
      });
    });

    const handleSubmit = async () => {
      if (loading.value) return;

      // Validación básica antes de enviar a Stripe
      if (!formCardData.value.owner_name) {
        $q.notify({ type: 'warning', message: 'Por favor ingresa el nombre del titular' });
        return;
      }
      if (!formCardData.value.accept_terms) {
        $q.notify({ type: 'warning', message: 'Debes aceptar los términos y condiciones' });
        return;
      }

      loading.value = true;
      stripeError.value = null;

      try {
        // Le pasamos el nombre a Stripe usando billing_details
        const { paymentMethod, error } = await stripe.value.createPaymentMethod({
          type: 'card',
          card: cardElement.value,
          billing_details: {
            name: formCardData.value.owner_name,
          },
        });

        if (error) {
          stripeError.value = error.message;
          loading.value = false;
          return;
        }

        // Enviamos al backend el ID generado por Stripe y los datos del formulario
        const response = await cardStore.linkCard({
          payment_method_id: paymentMethod.id,
          is_autodebit: formCardData.value.is_autodebit,
          owner_name: formCardData.value.owner_name // Opcional: lo enviamos al backend por si lo necesitas
        });

        if (response.code === 200) {
          showDialog.value = true;
          $q.notify({ type: 'positive', message: 'Tarjeta vinculada y validada con éxito' });

          setTimeout(() => {
            router.go(-3)
          }, 2000)
        } else {
          $q.notify({ type: 'negative', message: response.message || 'Error en la validación' });
        }
      } catch (e) {
        $q.notify({ type: 'negative', message: 'Error de conexión con el servidor' });
      } finally {
        loading.value = false;
      }
    };

    return {
      payMethod,
      icons,
      user,
      numberFormat,
      formCardData,
      loading,
      showDialog,
      dots,
      wozIcons,
      stripeError,
      handleSubmit
    }
  },
}
</script>
<style lang="scss" scoped>
.text__securepay {
  color: #0449fa;
}



.warning-info-content {
  border: 1px solid #ffc701 !important;
  border-radius: 1.5rem;
}

.text__bottom_comision {
  font-size: .85rem;
  color: #0449fa;
}

.info-title {
  text-align: center;
  color: #ffc701 !important;
  font-weight: 600;
  font-size: 0.85rem;
}

.info-texto {
  font-size: 0.85rem;
  font-weight: 400;
}

.info-foot {
  font-size: 0.85rem;
  font-weight: 800;
}

.infoCard {
  background-color: #cfdcfe;
  border-radius: 15px;
  font-size: 0.88rem;
  font-weight: 400;
}

.package-back {
  position: absolute;
}

.package-back:nth-child(1) {
  bottom: 20%;
  right: 5%;
  transform: scale(1.8);
}

.package-back:nth-child(2) {
  bottom: 15%;
  left: 18%;
  transform: scale(1.5);
}

.text__debit {
  font-size: 0.99rem;
  font-weight: bold;
}

.package-back:nth-child(3) {
  bottom: 30%;
  right: 90%;
  transform: scale(1.2);
}

.package-back__container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.link_button {
  border-radius: 15px !important;
}

.w-100 {
  width: 100%;
}

.card_form {
  border-radius: 15px;
  border: 1.8px solid #bacdfd
}

.section_page-link {
  background: white;
  max-height: 100%;
  height: max-content;
  width: 100%;
  border-top-left-radius: 50px;
  border-top-right-radius: 50px;
  overflow: auto;
}
</style>
<style lang="scss">
.autodebit_section {
  border: 1px solid lightgray;
  border-radius: 0.6rem;
  padding: 0.8rem 1rem;
}

.text__autodebit {
  font-size: 0.98rem;
}

.terms-checkboxCard {
  width: 6%;

}

.text-decoration-underline {
  text-decoration: underline;
}

.no-display-value.q-field--disabled {

  & .q-field__native {
    opacity: 0 !important;
  }
}

.linkedCard.q-field--auto-height.q-field--labeled {
  & .q-field__control-container {
    padding-top: 0px !important;
  }
}

.linkedCard {

  & .q-field__control {
    border-radius: 10px !important;
    height: 50px !important;
    min-height: 50px !important;
  }

  & .q-field__label {
    transform: translateY(0%)
  }

  &.q-field--focused .q-field__label,
  &.q-field--float .q-field__label {
    z-index: 100;
    background: white;
    font-weight: 600;
    max-width: 133%;
    transform: translateY(-110%) translateX(4%) scale(0.75) !important;
  }

  & .q-field__native {
    padding-top: 15px !important;
    font-weight: 500;
  }

  & .q-field__append {
    transform: translateY(-2%)
  }

  & .q-field__messages {
    transform: translateY(-25%) translateX(-1%)
  }
}

.input-logo-container {
  height: 50px;
  overflow: hidden;
  width: max-content;
  position: absolute
}

.publicity_content {
  border-radius: 20px;
  position: relative;
}

.text__temrs {
  font-size: 0.97rem;
}

@media screen and (max-width: 780px) {
  .terms-checkboxCard {
    width: 12%;
  }

  .text__autodebit {
    font-size: 0.91rem;
  }

  .linkedCard {
    & .q-field__bottom {
      transform: translateY(15px);
    }

    & .q-field__messages {
      transform: translateY(10%) translateX(-1%)
    }
  }
}
</style>
<style scoped>
.stripe-input-container {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white;
}

.stripe-input-container.StripeElement--focus {
  border-color: #1976d2;
  box-shadow: 0 1px 3px 0 #cfd7df;
}
</style>