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
      <q-form id="linked_form" class="" @submit="linkCard()">
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
            <div class="q-my-lg">
              <q-input class="linkedCard q-pb-none" outlined clearable :clear-icon="'eva-close-outline'"
                color="positive" v-model="formCardData.card" label="N° de tarjeta de crédito" :rules="rulesForm('card')"
                autocomplete="off" maxlength="19" @keyup="cleaveCard($event)" @change="validateCard($event)"
                mask="#### #### #### ####" bottom-slots :error="cardError">
                <template v-slot:append>
                  <transition name="horizontal">
                    <div v-html="wozIcons[cardType ?? 'general']" style="transform: scale(0.8)" />
                  </transition>
                </template>
              </q-input>
            </div>
            <div class="q-my-lg">
              <q-select outlined class="linkedCard q-pb-none" v-model="formCardData.type" :options="options"
                label="Seleccione su tipo de tarjeta" clearable :rules="rulesForm('card_type')"
                :clear-icon="'eva-close-outline'" dropdown-icon="eva-chevron-down-outline" behavior="menu"
                option-label="text" option-value="value" />
            </div>
            <div class="q-my-lg">
              <q-input class="linkedCard q-pb-none" outlined clearable :clear-icon="'eva-close-outline'"
                color="positive" v-model="formCardData.due_date" label="Fecha de vencimiento"
                :rules="rulesForm('card_date')" autocomplete="off" hint="Formato EJ.: 01/29" mask="##/##"
                @keyup="cleaveDate($event)" @change="validateDate($event)" :error="dateError"
                error-message="Formato de fecha no valido o vencido">
              </q-input>
            </div>
            <div class="q-my-lg">
              <q-input class="linkedCard q-pb-none" outlined clearable :clear-icon="'eva-close-outline'"
                color="positive" v-model="formCardData.cvc" name="id_user" label="Código de seguridad"
                :rules="rulesForm('cvc')" autocomplete="off" maxlength="3" />
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
            <q-checkbox class="terms-checkboxCard " v-model="formCardData.accept_terms" color="primary" size="md"
              :rules="rulesForm('terms')" />
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
        </div>
        <div class="q-px-sm q-mt-lg q-px-md-xl q-mx-md-lg">
          <q-btn color="primary" class="w-100 q-pa-npne q-mb-none  link_button" no-caps type="submit"
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
import { inject, ref } from 'vue'
import util from '@/util/numberUtil'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import payMethod from '@/assets/images/pay_types3.png'
import doneModal from '@/components/layouts/modals/doneModal.vue';
import wozIcons from '@/assets/icons/wozIcons'
import dots from '@/assets/images/dots.png'
import { getCreditCardType } from 'cleave-zen'
import {
  isValid,
  isExpirationDateValid,
  getCreditCardNameByNumber,
} from 'creditcard.js';

export default {
  components: {
    doneModal
  },
  setup() {
    //vue provider
    const user = useAuthStore().user;
    const cardStore = useCardStore()
    const numberFormat = util.numberFormat
    const icons = inject('ionIcons')
    const q = useQuasar()
    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)
    const showDialog = ref(false)
    const cardType = ref('general')
    const selectCard = ref(0)
    const cardError = ref(false)
    const dateError = ref(false)


    const options = [
      { value: '1', text: 'Crédito' },
      { value: '2', text: 'Débito' }
    ]

    const formCardData = ref({
      card: '',
      type: options[parseInt(route.params.id_card) - 1],
      due_date: '',
      cvc: '',
      accept_terms: false,
      is_autodebit: true,
    })

    // Data

    const linkCard = () => {
      if (!validate()) {
        showNotify('negative', 'Debes completar el formulario')
        return
      }
      loadingState(true)
      cardStore.linkCard(formCardData.value).then((data) => {
        if (data.code !== 200) throw data
        setTimeout(() => {
          showDialog.value = true
        }, 1000);
        setTimeout(() => {
          route.query.redirect
            ? router.push('/apply')
            : router.go(-3)

        }, 4000)
      }).catch((response) => {
        showNotify('negative', response)
        loadingState(false)
      })
    }
    const validate = () => {
      let isOk = true

      Object.entries(formCardData.value).forEach(([key, value]) => { if (value == '') isOk = false });

      if (validateCard(formCardData.value.card)) {
        isOk = false
        return isOk
      }

      if (validateDate(formCardData.value.due_date)) {
        isOk = false
        return isOk
      }
      if (formCardData.value.accept_terms == false) {
        showNotify('negative', 'Debes aceptar los terminos y condiciones para continuar')
      }
      if (formCardData.value.is_autodebit == false) {
        isOk = true
      }
      return isOk
    }
    const showNotify = (type, message) => {
      q.notify({
        message: message,
        color: type,
        actions: [
          { icon: 'eva-close-outline', color: 'white', round: true, handler: () => { /* ... */ } }
        ]
      })
    }
    const rulesForm = (id) => {
      const iRules = {
        card: [
          val => (val !== null && val !== '') || 'El número de tarjeta es requerido.',
          // val => (val.length > 20 ) || 'Debe contener 20 digitos',
          val => (/[a-zA-z,%"'();&|<>]/.test(val) == false) || "Se permiten solo valores numericos",
        ],
        card_type: [
          val => (val !== null && val !== '') || 'El tipo de tarjeta es requerido.',
        ],
        card_date: [
          val => (val !== null && val !== '') || 'La fecha de vencimiento es requerida.',
          // val => (/[,%"' ();&|<>]/.test(val) == false ) || 'No debe contener espacios, ni "[](),%|&;\'" ',
        ],
        cvc: [
          val => (val !== null && val !== '') || 'El CVC es obligatorio.',
          val => val.length >= 3 || "Minimo 3 digitos.",

          val => (/[a-zA-z,%"' ();&|<>]/.test(val) == false) || "Se permiten solo valores numericos",
        ],
        terms: [
          val => (val !== false) || 'Debes aceptar los terminos y condiciones.',

        ],
      }

      return iRules[id]
    }
    const loadingState = (state) => {
      loading.value = state;
    }
    const cleaveCard = (e) => {
      const value = e.target.value
      cardType.value = getCreditCardType(value)
    }
    const cleaveDate = (e) => {
      const value = e.target.value.split('/')
      if (parseInt(value[0]) > 12) {
        formCardData.value.due_date = '12'
      }
      if (value[0] == '00') {
        formCardData.value.due_date = '01'
      }
      if (value[1] && value[1].length < 2) {
        dateError.value = true
      }
      if (value[1] && value[1].length == 2) {
        dateError.value = false
        const verifyDate = new Date();
        if (parseInt(value[1]) > (verifyDate.getFullYear() + 10) - 2000) {
          formCardData.value.due_date = value[0] + '' + ((verifyDate.getFullYear() + 10) - 2000)
        }
      }
    }
    const validateCard = (e) => {
      if (!e) {
        cardType.value = 'general'
        return false
      }
      cardError.value = false
      if (getCreditCardNameByNumber(e) == 'Credit card is invalid!' && !isValid(e)) {
        alert('Tarjeta no valida.')
        cardError.value = true
      }

      return cardError.value
    }

    const validateDate = (e) => {
      if (!e) {
        return true
      }
      const value = e.split('/');
      dateError.value = false
      if (value[1] && value[1].length < 2) {
        alert('Fecha no valida.')

        dateError.value = true
      }
      if (!isExpirationDateValid(value[0], value[1])) {
        alert('Fecha vencida.')
        dateError.value = true
      }

      return dateError.value
    }

    return {
      payMethod,
      icons,
      user,
      numberFormat,
      cardError,
      dateError,
      selectCard,
      formCardData,
      options,
      loading,
      showDialog,
      dots,
      cardType,
      wozIcons,
      cleaveCard,
      cleaveDate,
      linkCard,
      rulesForm,
      validateCard,
      validateDate,
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