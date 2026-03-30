<template>
  <div class="q-py-sm " style="overflow: auto; height: 100%;">
    <div class="q-px-md q-py-md q-pb-xl q-mb-md" v-if="ready">
      <template v-if="(route.params.type == 1 || route.params.type == 2) || (link.status == 1 && link.pay_status == 1)">
        <div class="q-mb-md">
          <div class="text-weight-bold q-px-xs">
            Comercio / Cliente:
          </div>
          <div class="contet__border-primary q-px-md q-py-none q-mt-xs">
            <div class="flex items-center payToContent q-my-md justify-between">
              <div class="text-titlePay" v-if="route.params.type != 2 && route.params.type != 1">
                Comercios
              </div>
              <div class="flex items-center">
                <div class="text-titlePay">
                  {{ route.params.type != 2 && route.params.type != 1 ? link.user.name : 'Woz Payments' }}
                </div>
                <div class="bg-primary flex flex-center q-ml-xs iconcontent">
                  <q-icon name="eva-checkmark-outline" color="white" size="0.9rem" />
                </div>
              </div>
            </div>
            <div class="flex justify-between payToContent q-my-md">
              <div class="text-titlePay">RUC / CI</div>
              <div class="text-titlePay">{{ route.params.type != 2 && route.params.type != 1 ?
                numberFormat(link.user.dni) : numberFormat(4920791) }}</div>
            </div>
          </div>
        </div>
        <div class="q-mb-md">
          <div class="text-weight-bold q-px-xs">
            Producto / Servicio:
          </div>
          <div class="contet__border-primary q-px-sm q-py-none q-mt-xs">
            <div class="flex items-center  q-my-sm justify-between">
              <div class="" style="width: 80%;">
                <div class="text-titlePayP  ellipsis text-grey-9">
                  {{
                    route.params.type == 1
                      ? 'Activación de cuenta internacional Woz Payments'
                      : route.params.type == 2
                        ? route.query.description
                        : link.title + ' - ' + link.note
                  }}
                </div>
                <template v-if="(route.params.type != 2 && route.params.type != 1) && link.type == 2">
                  <div class="text-titlePayP text-weight-bold text-grey-9 q-mt-xs">
                    Fecha de inicio {{ moment(link.init_day).format('DD/MM/YYYY') }}
                  </div>
                  <div class="text-titlePayP text-weight-bold text-grey-9 q-mt-xs">
                    Cobrar por {{ link.for_month }} meses
                  </div>
                </template>
                <div class="text-titlePayP text-weight-bold text-grey-9 q-mt-xs">
                  {{ link.coin ? link.coin.code : 'GS.' }} {{
                    route.params.type == 1
                      ? numberFormat(route.query.amount)
                      : route.params.type == 2
                        ? numberFormat(route.query.amount)
                        : numberFormat(link.amount / link.coin.rate)
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="q-mb-md">
          <div class="q-mt-sm q-mb-md flex info_pay__Pay q-py-sm q-px-sm  items-center "
            v-if="route.params.type == 1 || route.params.type == 2">
            <div v-html="wozIcons.py" style="transform:scale(0.9)"
              v-if="route.params.type == 1 || route.params.type == 2" />
            <div class="text-infoBlue text-weight-medium q-mx-sm">
              {{
                route.params.type == 1 || route.params.type == 2
                  ? 'Datos para el pago mediante transferencia bancaria SIPAP, copia y usa el alías '
                  : ''
              }}
            </div>
          </div>

          <!-- <div class="text-weight-bold">
            {{route.params.type != 2 &&  route.params.type != 1 ? 'Datos de tarjeta':'Datos para el pago'}}
          </div> -->

          <div class="contet__border-primary q-pb-sm" style="overflow:hidden">
            <template v-if="route.params.type != 2 && route.params.type != 1">
              <!-- <checkout />
                -->
              <checkout :link="link" />
              <!-- <div v-for="(item ,key) in clientForm" :key="key" class="q-mt-md ">
                <div class="q-px-xs text-bold q-pb-sm" v-if="item.title">
                  {{ item.title }}
                </div>
                <q-input 
                  class="q-pb-xs paycardLink-input " 
                  outlined 
                  clearable
                  :clear-icon="'eva-close-outline'"
                  v-model="item.value" 
                  :label="item.label"  
                  autocomplete="off"
                  :rules="rulesForm(key)"

                  :mask="maskFormat(key)"
                  :maxlength="key == 'cvc' ? 3 : key == 'numberClient' ? 25 :''"
                  @keyup="callbackKeyup(key,$event)"
                  @change="callbackChange(key, $event)"
                  
                >
                  <template v-slot:append v-if=" key == 'numberClient'">
                    <transition name="horizontal">
                      <div v-html="wozIcons[cardType ?? 'general' ]" style="transform: scale(0.8)" />
                    </transition>
                  </template>
    </q-input>
    <div class="q-px-xs q-pt-xs" v-if="item.sublabel">
      {{ item.sublabel }}
    </div>
  </div> -->
            </template>
            <template v-else>
              <div class="q-px-md q-py-sm q-my-sm infoPay__content flex justify-between items-center"
                v-for="(item, key) in dataPay" :key="key">
                <div>
                  {{ item }}
                </div>
                <div v-if="item == '0983994268'">
                  <q-btn round flat class="q-ml-md-md"
                    style="width: 2rem;height: 1.4rem;overflow: hidden;min-height: auto;" @click="copyText(item)">
                    <q-icon name="eva-clipboard-outline" color="black" size="sm" />
                  </q-btn>
                </div>
              </div>
              <div class="q-my-md">
                <div class="text-bold q-px-xs">
                  Comprobante
                </div>
                <div class="q-pt-xs">
                  <q-file for="fileId" accept=".jpg, .pdf, image/*" outlined dense class="file_paylink"
                    label="Adjunta tu comprobante 📂" v-model="comprobant" v-show="!Object.values(comprobant).length" />
                  <div class="q-px-md q-py-sm  infoPay__content " v-show="Object.values(comprobant).length">
                    <label for="fileId" class="flex items-center">
                      <div class="q-pt-xs text-positive">
                        Comprobante subido
                      </div>
                      <div class="bg-positive flex flex-center q-ml-xs iconcontent">
                        <q-icon name="eva-checkmark-outline" color="white" size="0.9rem" />
                      </div>
                    </label>
                  </div>
                </div>
                <div class="text-weight-medium q-px-xs q-mt-sm" style="font-size: 0.75rem;">
                  Te confirmaremos el estado de tu pago en el día
                </div>
              </div>
            </template>
            <!-- <div class="q-px-xl q-my-md flex flex-center q-pb-sm">
              <img :src="payMethod" alt="" 
              :style="'height: 2.5rem;' " >
            </div> -->
            <div v-if="formError" class="text-subtitle1 text-negative text-bold text-center q-mt-md flex flex-center">
              <q-icon name="eva-alert-circle-outline" color="negative" size="sm" />
              {{ errorMessage }}
            </div>
          </div>
        </div>
        <div class="linkPay_content q-px-md-xl q-pb-md" v-if="!(route.params.type != 2 && route.params.type != 1)">
          <q-btn color="primary" class="w-100 q-pa-npne q-mb-none linkPay_button" no-caps :loading="loading"
            @click="procedToPay()">
            <div class="text-white q-py-sm text-subtitle1 text-weight-medium flex justify-center items-stretch">
              <div class="q-mt-xs">
                Realizar pago
              </div>
            </div>
            <template v-slot:loading>
              <q-spinner-facebook />
            </template>
          </q-btn>
        </div>
      </template>
      <template v-else>
        <div class="q-mt-xl">
          <div class="flex justify-center q-mt-xl">
            <div style="width: 5rem; height: 5rem; border-radius: 50%;" class="flex flex-center"
              :class="link.status == 0 ? 'bg-negative' : link.pay_status == 2 ? 'bg-warning' : 'bg-positive'">
              <q-icon
                :name="link.status == 0 ? 'eva-close-outline' : link.pay_status == 2 ? 'eva-clock-outline' : 'eva-checkmark-outline'"
                color="white" size="4rem" />
            </div>
          </div>
          <div class="text-h5 text-center text-weight-medium q-mt-lg">
            {{ link.status == 0 ? 'El tiempo de validez de este link de cobro ha expirado!' : link.pay_status == 2 ?
              'Este link tiene un pago pendiente por aprobación' : 'Este link fue procesado exitosamente' }}
          </div>
        </div>
      </template>
    </div>
    <div v-else class="flex-center flex" style="height:80%">
      <q-spinner-dots color="primary" size="8em" />
    </div>
    <div v-if="showDialog">
      <doneModal :dialog="showDialog" text="Tarjeta vinculada con exito" />
    </div>
  </div>
</template>
<script>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/services/store/auth.store'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import { usePayStore } from '@/services/store/pay.store'
import { useLinkStore } from '@/services/store/link.store';
import { useQuasar } from 'quasar'
import util from '@/util/numberUtil'
import payMethod from '@/assets/images/pay_types3.png'
import payMethod2 from '@/assets/images/Tpago2.png'
import bancard from '@/assets/images/bancard.png'

import doneModal from '@/components/layouts/modals/doneModal.vue';
import moment from 'moment';
import { getCreditCardType } from 'cleave-zen'
import wozIcons from '@/assets/icons/wozIcons'
import {
  isValid,
  isExpirationDateValid,
  getCreditCardNameByNumber,
} from 'creditcard.js';
import checkout from '@/components/layouts/checkout.vue'

export default {
  components: {
    doneModal,
    checkout,
  },
  setup() {
    //vue provider
    const q = useQuasar()
    const numberFormat = util.numberFormat
    const icons = inject('ionIcons')
    const loading = ref(false)
    const showDialog = ref(false)
    const { user } = storeToRefs(useAuthStore())
    const router = useRouter()
    const route = useRoute();
    const payStore = usePayStore()
    const linkStore = useLinkStore()
    const link = ref({})
    const ready = ref(!(!route.query.title))
    const errorMessage = ref('')
    const comprobant = ref([]);

    const dataPay = payStore.getDataTransfer()
    const cardType = ref('general');
    const formError = ref(false)
    const clientForm = ref({

      numberClient: {
        value: '',
        label: 'Número de tarjeta'
      },
      nameClient: {
        value: '',
        label: 'Nombre en la tarjeta'
      },
      due: {
        value: '',
        label: 'Fecha de vencimiento'
      },
      cvc: {
        value: '',
        label: 'Código de seguridad'
      },
      email: {
        value: '',
        title: 'Información extra',
        sublabel: 'Te confirmaremos el estado de tu pago en el día',
        label: 'Correo electrónico'
      },
    })

    const showNotify = (type, message) => {
      q.notify({
        message: message,
        color: type,
        actions: [
          { icon: 'eva-close-outline', color: 'white', round: true, handler: () => { /* ... */ } }
        ]
      })
    }

    const createConceptPay = () => {
      return route.params.type == 1
        ? 'Pago de activación'
        : route.params.type == 2
          ? 'Pago de paquetes de link'
          : link.title
    }
    const procedToPay = () => {
      route.params.type == 1 || route.params.type == 2
        ? createPay()
        : createPayClient()
    }
    const createPay = () => {

      if (!Object.values(comprobant.value).length) {
        showNotify('negative', ' Debes cargar el comprobante de pago')
        return
      }
      loading.value = true;
      const data = new FormData
      data.append('amount',
        parseFloat(
          route.params.type == 1
            ? 220000
            : route.params.type == 2
              ? route.query.amount
              : link.amount
        ))
      data.append('vaucher', comprobant.value)
      data.append('type',
        route.params.type == 1
          ? 5
          : route.params.type == 2
            ? 6
            : 7
      )
      data.append('method', route.params.type != 3 ? 1 : 2)
      data.append('status', 1)
      data.append('concept', createConceptPay())
      if (route.params.type == 2) {
        data.append('package', route.query.id)

      }
      payStore.createPay(data)
        .then((response) => {
          if (response.code !== 200) throw response

          showDialog.value = true
          loading.value = false
          setTimeout(() => {
            // router.push('/dashboard')
            router.push('/trasacction/view/' + (route.params.type == 1 ? 8 : 9) + '/' + response.data.id)

          }, 2000);

        }).catch((response) => {
          console.log(response)
          loading.value = false
        })
    }
    const createPayClient = () => {
      if (!validate()) {
        showNotify('negative', 'Debe completar el formulario')
        return
      }
      loading.value = true;
      const data = new FormData()

      data.append('link_id', link.value.id)
      data.append('concept', link.value.title + ' - ' + link.value.note)

      data.append('card', clientForm.value.numberClient.value.replace(/\ /g, ''),)
      data.append('card_name', clientForm.value.nameClient.value)
      data.append('cvc', clientForm.value.cvc.value)
      data.append('date', clientForm.value.due.value)
      data.append('email', clientForm.value.email.value)

      data.append('coin', link.value.coin_id)

      payStore.createPayLink(data)
        .then((response) => {
          if (response.code !== 200) throw response

          showDialog.value = true
          loading.value = false
          setTimeout(() => {
            router.push('/trasacction-public/view/10/' + response.data.id)
          }, 2000);

        }).catch((response) => {
          loading.value = false
        })
    }
    const getLink = () => {
      if (!route.params.code) return
      linkStore.getLinkByCode(route.params.code)
        .then((response) => {
          ready.value = true
          link.value = response.data
        })
    }

    const rulesForm = (key) => {
      const iRules = {
        nameClient: [
          val => (val !== null && val !== '') || 'El nombre del titular es obligatorio.',
          // val => (val.length > 20 ) || 'Debe contener 20 digitos',
          val => (/[0-9,%".'()*#|;?&|<>]/.test(val) == false) || "Nombre no valido",
        ],
        numberClient: [
          val => (val !== null && val !== '') || 'El número de tarjeta es requerido.',
          // val => (val.length > 20 ) || 'Debe contener 20 digitos',
          val => (/[a-zA-z,%"'();+*&|<>]/.test(val) == false) || "Se permiten solo valores numericos",
        ],
        due: [
          val => (val !== null && val !== '') || 'La fecha de vencimiento es requerida.',
          // val => (/[,%"' ();&|<>]/.test(val) == false ) || 'No debe contener espacios, ni "[](),%|&;\'" ',
        ],
        cvc: [
          val => (val !== null && val !== '') || 'El CVC es obligatorio.',
          val => val.length >= 3 || "Minimo 3 digitos.",

          val => (/[a-zA-z,%"' ();&|<>]/.test(val) == false) || "Se permiten solo valores numericos",
        ],
        email: [
          val => (val !== null && val !== '') || 'El email es requerido.',
          // val => (val.length > 20 ) || 'Debe contener 20 digitos',
          val => (/[*# ,%´"'();&|<>]/.test(val) == false) || "Se permiten solo valores numericos",
        ],
      }

      return iRules[key]
    }
    const maskFormat = (key) => {
      const iMask = {
        nameClient: '',
        numberClient: '#### #### #### #### #### #### #### ####',
        due: '##/##',
        cvc: '###',
        email: '',
      }

      return iMask[key]
    }
    const cleaveDate = (e) => {
      const value = e.target.value.split('/')
      if (parseInt(value[0]) > 12) {
        clientForm.value.due.value = '12'
      }
      if (value[0] == '00') {
        clientForm.value.due.value = '01'
      }
      if (value[1] && value[1].length < 2) {
        formError.value = true
      }
      if (value[1] && value[1].length == 2) {
        formError.value = false
        const verifyDate = new Date();
        if (parseInt(value[1]) > (verifyDate.getFullYear() + 10) - 2000) {
          clientForm.value.due.value = value[0] + '' + ((verifyDate.getFullYear() + 10) - 2000)
        }
      }
    }
    const cleaveCard = (e) => {
      const value = e.target.value
      cardType.value = getCreditCardType(value) ?? 'general'
    }
    const validateCard = (e) => {
      if (!e) {
        cardType.value = 'general'
        return false
      }
      formError.value = false
      if (getCreditCardNameByNumber(e) == 'Credit card is invalid!' && !isValid(e)) {
        alert('Tarjeta no valida.')
        errorMessage.value = 'Tarjeta no valida'
        formError.value = true
      }

      return formError.value
    }

    const validateDate = (e) => {
      if (!e) {
        return true
      }
      const value = e.split('/');
      formError.value = false
      if (value[1] && value[1].length < 2) {
        alert('Fecha no valida.')
        errorMessage.value = 'Fecha no valida'
        formError.value = true
      }
      if (!isExpirationDateValid(value[0], value[1])) {
        alert('Fecha vencida.')
        errorMessage.value = 'Fecha vencida.'
        formError.value = true
      }

      return formError.value
    }

    const callbackKeyup = (key, e) => {
      if (key == 'nameClient') return
      if (key == 'numberClient') {
        cleaveCard(e)
        return
      }
      if (key == 'due') {
        cleaveDate(e)
        return
      }
      if (key == 'cvc') return
      if (key == 'email') return
    }
    const callbackChange = (key, e) => {
      if (key == 'nameClient') return
      if (key == 'numberClient') {
        validateCard(e)
        return
      }
      if (key == 'due') {
        validateDate(e)
        return
      }
      if (key == 'cvc') return
      if (key == 'email') return


    }
    const validate = () => {
      let isOk = true

      Object.entries(clientForm.value).forEach(([key, value]) => { if (value.value == '') isOk = false });

      if (validateCard(clientForm.value.numberClient.value)) {
        isOk = false
        return isOk
      }

      if (validateDate(clientForm.value.due.value)) {
        isOk = false
        return isOk
      }

      return isOk
    }
    const copyText = (text) => {

      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.opacity = 0;
      document.body.appendChild(textArea);
      textArea.select();

      try {
        const success = document.execCommand('copy');
      } catch (err) {
        console.error(err.name, err.message);
      }

      document.body.removeChild(textArea);

      showNotify('positive', 'Número de cuenta copiado')
    }
    onMounted(() => {
      getLink()
    })

    return {
      moment,
      showDialog,
      formError,
      errorMessage,
      wozIcons,
      user,
      cardType,
      router,
      route,
      loading,
      ready,
      numberFormat,
      icons,
      link,
      dataPay,
      clientForm,
      comprobant,
      payMethod,
      payMethod2,
      bancard,
      procedToPay,
      rulesForm,
      maskFormat,
      callbackKeyup,
      callbackChange,
      copyText,
    }
  },
}

</script>
<style lang="scss">
.text-infoBlue {
  font-size: 0.85rem;
}

.info_pay__Pay {
  flex-wrap: inherit !important;
  border: 1px solid $primary;
  border-radius: 5px;
}

.linkPay_content {
  width: 100%;
}

.linkPay_button {
  width: 100% !important;
}

.file_paylink .q-field__control {
  border-radius: 10px;
  padding: 0.15rem 1rem;

  &::before {

    border-color: rgb(141, 141, 141);
  }
}

.infoPay__content {
  border: 1px solid rgb(141, 141, 141);
  border-radius: 8px;
  font-weight: 500;
}

.payToContent {
  border-bottom: 1px dashed black;
}

.text-titlePayP {
  font-size: 0.85rem;

}

.text-titlePay {
  font-size: 0.95rem;
  font-weight: 500;
}

.contet__border-primary {
  border: 1px solid #1c304f;
  border-radius: 0.7rem;
}

.iconcontent {
  height: 1.2rem;
  width: 1.2rem;
  border-radius: 50%;
}

.paycardLink-input {
  & .q-field__control {
    border-radius: 10px !important;
    height: 45px;

    &::before {
      border-color: rgb(141, 141, 141);
    }
  }

  & .q-field__label {
    transform: translateY(-15%)
  }

  &.q-field--focused .q-field__label,
  &.q-field--float .q-field__label {
    z-index: 100;
    background: white !important;
    font-weight: 600;
    max-width: 133%;
    padding: 0px 10px;
    transform: translateY(-110%) translateX(4%) scale(0.75) !important;
  }

  & .q-field__native {
    padding-top: 15px !important;
    font-weight: 600;
  }

  & .q-field__append {
    transform: translateY(-5%)
  }

}

@media screen and (max-width: 780px) {
  .paycardLink-input {
    & .q-field__bottom {
      transform: translateY(15px);
    }
  }
}
</style>