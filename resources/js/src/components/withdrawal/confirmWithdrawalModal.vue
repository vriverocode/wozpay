<template>
  <div>
    <q-dialog v-model="dialog" persistent class="withdrawal__modal">
      <q-card style=" overflow: visible; border-radius: 10px;" class="position-relative card__withdrawal">
        <q-card-section class="flex q-py-sm w-100 items-center justify-between">
          <div class="flex items-center">
            <div class="text-black text-bold">
              Formulario de retiro
            </div>
          </div>
          <q-btn @click="hideModal" size="0.2rem" flat style="padding:0.3rem 0px;">
            <q-icon name="eva-close-outline" size="sm" color="grey-6" />
          </q-btn>
        </q-card-section>
        <q-linear-progress :value="1" color="grey-5" size="0.125rem" />
        <q-card-section>
          <div>
            <div class="flex justify-between items-center q-mt-xs containerSaldo">
              <div class="text-balanceSaldo">Saldo total</div>
              <div class="text-balanceSaldo">Gs. {{ numberFormat(withdrawal.balanceTotal) }}</div>
            </div>
            <div class="q-mt-lg">
              <div style="font-size: .95rem;" class="text-bold q-mb-md q-mt-md">
                Retira tus ganancias
              </div>
              <div class="q-pt-sm">
                <q-input class="withdrawalAmount" outlined clearable :clear-icon="'eva-close-outline'" color="positive"
                  v-model="withdrawal.amount" label="¿Cuanto quieres retirar?" mask="###.###.###" reverse-fill-mask
                  :rules="amountRules" autocomplete="off" @keyup="deducAmount(); validateAmount()" />
              </div>
              <div class="" style="border: 1px solid lightgray; border-radius:0.87rem; padding: 0.5rem 1rem;">
                <div class="flex items-center justify-between q-pb-sm">
                  <div>
                    <div class="title-withdarwal">Comisión a pagar</div>
                    <div class="subtitle-withdarwal text-grey-7">{{ numberFormat(withdrawal.typeOfWithdrawalFee) }}%
                      sobre
                      monto a retirar</div>
                  </div>
                  <div class="title-withdarwal">Gs. {{ numberFormat(withdrawal.deductAmount) }}</div>
                </div>
                <div class="flex items-center justify-between q-pt-sm" style="border-top: 1px solid lightgray;">
                  <div>
                    <div class="title-withdarwal">Comisión fija</div>
                    <div class="subtitle-withdarwal text-grey-7">1,5 USD fijo</div>
                  </div>
                  <div class="title-withdarwal">Gs. {{ numberFormat(7500) }}</div>
                </div>
              </div>
              <div class="q-mt-md">
                <div class="flex justify-between items-center q-mt-xs containerSaldoGreen">
                  <div class="text-balanceSaldo text-positive">Total a retirar</div>
                  <div class="text-balanceSaldo text-positive">Gs. {{ numberFormat(withdrawal.totalWithdrawalAmount) }}
                  </div>
                </div>
              </div>
              <div class="q-pt-sm q-px-xs  q-mt-lg">
                <q-btn unelevated no-caps color="positive" class="redirect_button" style="width: 100%;"
                  @click="createWithdrawalOrder()" :loading="loading" :disable="disable">
                  <div class="q-py-sm">
                    Solicitar
                  </div>
                </q-btn>
                <div style="font-size: 0.8rem;" class="text-primary q-px-md-xs q-mt-xs">
                  Tu dinero estará disponible en 24hs a 72h habiles
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { inject, onMounted, ref, watch } from 'vue';
import utils from '@/util/numberUtil';
import { useQuasar } from 'quasar';
import { useWithdrawalStore } from '@/services/store/withdrawal.store'

export default {
  props: {
    dialog: Boolean,
    withdrawalData: Object
  },
  emits: ['hideModal', 'operationComplete'],

  setup(props, { emit }) {
    const q = useQuasar()
    const withdrawalStore = useWithdrawalStore()
    const dialog = ref(props.dialog);
    const withdrawal = ref(props.withdrawalData)
    const numberFormat = utils.numberFormat
    const loading = ref(false)
    const disable = ref(false)
    const amountRules = [
      val => (val !== null && val !== '') || 'Monto es requerido.',
      val => (/[,%"'();&|<>]/.test(val) == false) || 'No debe contener "[](),%|&;\'" ',
    ]
    const hideModal = () => {
      emit('hideModal')
    }
    const operationSuccesfully = () => {
      emit('operationComplete')
      emit('hideModal')

    }
    const createWithdrawalOrder = () => {
      if (!validateAmount()) {
        console.log('asadasdasdasd')
        return
      }
      loading.value = true
      let amount = typeof withdrawal.value.amount == 'number' ? withdrawal.value.amount : parseInt(withdrawal.value.amount.replace(/\./g, ''))
      let dataToWithdrawal = new FormData()
      dataToWithdrawal.append('account', withdrawal.value.account)
      dataToWithdrawal.append('amount', amount)
      dataToWithdrawal.append('comision_by_type', withdrawal.value.deductAmount.toFixed(2))
      dataToWithdrawal.append('comision_fixed', 7500)
      dataToWithdrawal.append('type', withdrawal.value.typeOfWithdrawal)
      dataToWithdrawal.append('amount_to_transfer', withdrawal.value.totalWithdrawalAmount.toFixed(2))

      withdrawalStore.createWithdrawal(dataToWithdrawal)
        .then((response) => {
          showNotify('positive', 'Tu orden de retiro fue creada con exito')
          setTimeout(() => {
            operationSuccesfully()
          }, 500)
        })
        .catch((response) => {
        })
        .finally(() => {
          loading.value = false
        })

    }
    const deducAmount = () => {

      let amount = typeof withdrawal.value.amount == 'number'
        ? withdrawal.value.amount
        : parseInt(withdrawal.value.amount.replace(/\./g, ''))


      withdrawal.value.deductAmount = ((isNaN(amount) ? 0 : amount) * withdrawal.value.typeOfWithdrawalFee) / 100;
      withdrawal.value.totalWithdrawalAmount = (isNaN(amount) ? 0 : amount) - withdrawal.value.deductAmount - 7500;
    }
    const validateAmount = () => {
      let amount = typeof withdrawal.value.amount == 'number' ? withdrawal.value.amount : parseInt(withdrawal.value.amount.replace(/\./g, ''))
      if (amount > withdrawal.value.balanceTotal) {
        showNotify('negative', 'Monto ingresado supera tu saldo actual')
        withdrawal.value.amount = withdrawal.value.balanceTotal
        deducAmount()
        return false
      }
      if (withdrawal.value.totalWithdrawalAmount <= 0) {
        showNotify('negative', 'Monto final a transferir deber ser mayor a cero')
        disable.value = true
        return false
      }
      disable.value = false
      return true
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
    watch(() => props.dialog, (newValue) => {
      dialog.value = newValue
      deducAmount()
    });


    return {
      dialog,
      withdrawal,
      hideModal,
      disable,
      loading,
      numberFormat,
      amountRules,
      deducAmount,
      validateAmount,
      createWithdrawalOrder,
    }
  }
};
</script>
<style lang="scss">
.containerSaldoGreen {
  border: 1px solid #20ce1c;
  border-radius: 0.5rem;
  padding: 0.7rem 0.8rem;
}

.subtitle-withdarwal {
  font-size: 0.69rem;
}

.title-withdarwal {
  font-size: 0.95rem;
  font-weight: 400;
}

.card__withdrawal {
  width: 850px;
}

@media screen and (max-width: 780px) {
  .card__withdrawal {
    width: 350px;
  }
}

.withdrawalAmount {

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
    transform: translateY(-125%) translateX(4%) scale(0.75) !important;
  }

  & .q-field__native {
    padding-top: 5px !important;
    font-weight: 500;
  }

  & .q-field__append {
    transform: translateY(-2%)
  }

  & .q-field__messages {
    transform: translateY(-25%) translateX(-1%)
  }

}

.withdrawalAmount .q-field__native {
  padding-top: 15px !important;
}

.withdrawal__modal {
  width: 100%;

  & .q-dialog__inner {
    padding: 0;
  }
}
</style>
<style lang="scss" scoped>
.containerSaldo {
  border: 1px solid rgb(148, 148, 148);
  border-radius: 0.4rem;
  padding: 0.7rem 0.8rem;
}

.w-100 {
  width: 100%;
}

.negative-back {
  background-color: #ff00001a;
  border-radius: 20px;
}

.button-file {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  box-shadow: 0px 2px 8px 0px rgba(168, 167, 167, 0.829);
}

.cls-button {
  position: absolute;
  right: -10px;
  top: -10px;
  z-index: 15;
}
</style>