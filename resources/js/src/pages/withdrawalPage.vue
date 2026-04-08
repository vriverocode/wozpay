<script setup>
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/services/store/auth.store'
import { useBankAccountStore } from '@/services/store/bankAccount.store'
import { storeToRefs } from 'pinia';
import wozIcons from '@/assets/icons/wozIcons'
import utils from '@/util/numberUtil';
import { useRouter } from 'vue-router';
import confirmWithdrawalModal from '@/components/withdrawal/confirmWithdrawalModal.vue';
import { useWithdrawalStore } from '@/services/store/withdrawal.store'
import { useQuasar } from 'quasar';
import moment from 'moment';
import 'moment/locale/es';
moment.updateLocale('es',
  {
    months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
    monthsShort: 'Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dic.'.split('_'),
    weekdays: 'Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado'.split('_'),
    weekdaysShort: 'Dom._Lun._Mar._Mier._Jue._Vier._Sab.'.split('_'),
    weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_')
  }
);


const { user } = storeToRefs(useAuthStore())
const withdrawalStore = useWithdrawalStore()
const availableBalances = ref({
  15: 0,
  10: 0,
  8: 0,
  3.9: 0
})
const hasPending = ref(false);
const pendingWithdrawal = ref({})
const q = useQuasar()
const
  step = ref(1)
const dialog = ref(false)
const router = useRouter()
const stepTitle = ref('Cuenta bancaria')
const ready = ref(false)
const store = useBankAccountStore()
const numberFormat = utils.numberFormat
const withdrawalForm = ref({
  account: '',
  typeOfWithdrawal: 1,
  typeOfWithdrawalFee: 1,
  amount: user.value.wallet_link?.balance ||
    user.value.wallet?.balance,
  balanceTotal: user.value.wallet_link?.balance ||
    user.value.wallet?.balance,
  deductAmount: 0,
  totalWithdrawalAmount: 0
})
const tableInfo = [
  {
    title: 'Ingresos de hoy',
    subtitle: 'Estos son los ingresos del día'
  },
  {
    title: 'Retiro',
    subtitle: 'Retira tus ganancias'
  },
  {
    title: 'Comision a pagar',
    subtitle: 'Espera más dias para bajar la comision'
  }
]

const accountsOptions = ref([])
const selectedAccount = ref({})
const getAccountsBankbyUser = () => {
  ready.value = false
  store.getAllAccountBankByUser(user.value.id).then((data) => {
    if (data.code !== 200) return
    accountsOptions.value = data.data
    getPendingWithDrawal()

    selectedAccount.value = accountsOptions.value[0]
  })
}
const getBalances = () => {
  withdrawalStore.getWithdrawalBalances()
    .then((response) => {
      availableBalances.value = response
      updateAmountWithdrawal(1)
    })
    .catch((error) => {
      console.error("Error cargando balances", error)
    })
}
const stepBack = () => {
  if (step.value == 2) {
    step.value--
    return
  }
  router.go(-1)
}
const nextStep = () => {
  if (step.value == 1) {
    step.value++
    return
  }
  createWithdrawal()
}
const createWithdrawal = () => {
  if (withdrawalForm.value.amount == 0) {
    showNotify('negative', 'El monto a retirar debe ser mayor a 0')
    return
  }
  showDialog()
}
const changeTextBySelection = (selection) => {
  const options = [
    {
      title: 'Ingresos de hoy',
      subtitle: 'Estos son los ingresos del día'
    },
    {
      title: 'Ingresos de hoy',
      subtitle: 'Estos son los ingresos del día'
    },
    {
      title: 'Ingresos de hace 7 dias',
      subtitle: 'Estos son los ingresos de hace 7 dias '
    },
    {
      title: 'Ingresos de hace 14 dias',
      subtitle: 'Estos son los ingresos de hace 14 dias '
    },
    {
      title: 'Ingresos de más de 30 dias',
      subtitle: 'Estos son los ingresos de hace más de 30 dias '
    }
  ]
  tableInfo[0] = options[selection];
}
const disableButton = ref(true)
const setSelectedAccount = (id) => {
  disableButton.value = false
  selectedAccount.value = accountsOptions.value.find(item => item.id == id)
}
const setValueByIndex = ref([
  `Gs. ${utils.numberFormat(0)}`, // Usamos el monto filtrado aquí
  'Instantaneo',
  '15%'
])

const showDialog = () => {
  dialog.value = true
  deducAmount()
}
const hideModal = () => {
  dialog.value = false
}
const deducAmount = () => {
  const selectedCheckpoint = checkpointsWithdrawal.find(c => c.type == withdrawalForm.value.typeOfWithdrawal);
  const percentage = selectedCheckpoint ? selectedCheckpoint.value : 15;

  withdrawalForm.value.deductAmount = (withdrawalForm.value.amount * percentage) / 100;
  withdrawalForm.value.totalWithdrawalAmount = withdrawalForm.value.amount - withdrawalForm.value.deductAmount;
}
const redirectToComplete = () => {
  setTimeout(() => {
    router.push('/withdrawal-complete')
  }, 500)
}

const checkpointsWithdrawal = [
  { type: 1, days: 0, label: '15%', value: 15 },    // Index 0
  { type: 2, days: 7, label: '10%', value: 10 },    // Index 1 (Este es tu Step 1 visual)
  { type: 3, days: 15, label: '8%', value: 8 },      // Index 2
  { type: 4, days: 30, label: '3,9%', value: 3.9 },  // Index 3
];

const checkpoints = ref({
  1: true,
  2: false,
  3: false,
  4: false,
})

const updateAmountWithdrawal = (type) => {
  if (!type || ![1, 2, 3, 4].includes(type)) {
    type = 1;
  }

  // Obtenemos los datos del checkpoint seleccionado (15, 10, 8 o 3.9)
  let data = checkpointsWithdrawal.find((checkpoint) => checkpoint.type == type);

  // Extraemos el monto correspondiente del backend, o 0 si no hay
  let currentBalance = availableBalances.value[data.value] || 0;

  // ¡Importante! Actualizamos el monto a retirar en el formulario
  withdrawalForm.value.amount = currentBalance;
  withdrawalForm.value.balanceTotal = currentBalance;

  setValueByIndex.value = [
    `Gs. ${utils.numberFormat(currentBalance)}`, // Usamos el monto filtrado aquí
    'Instantaneo',
    data.label
  ]
  withdrawalForm.value.typeOfWithdrawalFee = data.value
  changeTextBySelection(type)
  restrigedSelectors(type)
}

const restrigedSelectors = (type) => {
  if (withdrawalForm.value.typeOfWithdrawal != type) {
    Object.values(checkpoints.value).forEach((element, index) => {

      if (type == (index + 1)) {
        checkpoints.value[index + 1] = true
      } else {
        checkpoints.value[index + 1] = false
      }
    });
  } else {
    checkpoints.value[type] = true
  }
  withdrawalForm.value.typeOfWithdrawal = type
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
const getPendingWithDrawal = () => {
  withdrawalStore.hasPendingWithdrawal()
    .then((response) => {
      ready.value = true
      hasPending.value = response.has_pending
      pendingWithdrawal.value = response.withdrawalOrder;

    })
    .catch((error) => {
      console.log(error)
    })
}

const getStatusClass = (status) => {
  const classes = {
    0: 'status-rejected',
    1: 'status-pending',
    2: 'status-approved'
  }
  return classes[status] || 'status-pending'
}

const getStatusIcon = (status) => {
  const icons = {
    0: 'eva-close-circle-outline',
    1: 'eva-clock-outline',
    2: 'eva-checkmark-circle-outline'
  }
  return icons[status] || 'eva-clock-outline'
}

const formatDate = (date) => {
  return moment(date).format('DD MMM YYYY, HH:mm')
}
const goTo = (id) => {
  router.push('/withdrawal-details/' + id)
}
onMounted(() => {
  getAccountsBankbyUser()
  getBalances()
})
</script>
<template>
  <div class="h-full" style="overflow: hidden;">
    <div class="h-100">
      <div class="q-pl-md-lg q-pl-md q-py-md q-mt-sm" style="border-bottom: 1px solid lightgray; height: 8%;">
        <div class="text-h6 text-bold">{{ stepTitle }}</div>
      </div>
      <div style="height: 94%;" v-if="ready">
        <q-form @submit="nextStep" style="height: 100%;" v-if="!hasPending">
          <div style="height: 80%; overflow: auto;">
            <template v-if="step == 1">
              <div v-for="account in accountsOptions" :key="account.id"
                class="q-px-md flex w-100 q-pt-md justify-between items-center">
                <div class="radio-section">
                  <q-radio v-model="withdrawalForm.account" :val="account.id" color="primary" size="sm"
                    @update:model-value="setSelectedAccount(account.id)" />
                </div>
                <div class="q-pb-xs bank-section" style="border-bottom: 1px solid rgba(211, 211, 211, 0.521);">
                  <div class="q-py-sm q-px-xs q-px-md-md q-py-md-sm"
                    style="width: 100%; background: rgba(241, 231, 94, 0.103); border-radius: 1rem;">
                    <div class="flex justify-start account__info--bank  account__info--item">
                      <div style="height: 100%;" :class="account.bank.logo">
                        <div v-html="wozIcons[account.bank.logo]" />
                      </div>
                    </div>
                    <div class=" items-center account__info--item q-pl-xs">
                      <div class="text-caption2 text-weight-medium text-grey-7 q-mt-xs">{{ account.account_owner }}
                      </div>
                      <div class="text-caption2 text-weight-medium text-grey-7 q-mt-xs">{{
                        utils.numberFormat(account.account_owner_dni) }}</div>
                      <div class="text-caption2 text-weight-medium text-grey-7 q-mt-xs">{{ account.account_number }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template v-if="step == 2">
              <div class="q-px-md">
                <div class="q-pt-md q-px-xs" style="font-size: 1rem; font-weight: 400;">
                  Se te depositará en esta cuenta
                </div>
                <div class="q-pt-md q-pb-none q-px-md q-px-md-md q-mb-md q-pb-md account__info q-mt-md">
                  <div class="flex justify-between items-top account__info--bank account__info--item2">
                    <div class="text-weight-medium text-caption2">Banco:</div>
                    <div style="height: 100%;" :class="selectedAccount.bank.logo">
                      <div v-html="wozIcons[selectedAccount.bank.logo]" />
                    </div>
                  </div>
                  <div class="flex justify-between items-center q-mt-sm account__info--item2">
                    <div class="text-weight-medium text-caption2">N° de cuenta</div>
                    <div class="text-caption2 text-weight-medium text-primary">{{ selectedAccount.account_number }}
                    </div>
                  </div>
                  <div class="flex justify-between items-center q-mt-sm account__info--item2">
                    <div class="text-weight-medium text-caption2">Titular</div>
                    <div class="text-caption2 text-weight-medium text-grey-7">{{ selectedAccount.account_owner }}</div>
                  </div>
                  <div class="flex justify-between items-center q-mt-sm account__info--item2">
                    <div class="text-weight-medium text-caption2">Tipo de cuenta</div>
                    <div class="text-caption2 text-weight-medium text-grey-7">{{ selectedAccount.account_type }}</div>
                  </div>
                  <div class="flex justify-between items-center q-mt-sm account__info--item2">
                    <div class="text-weight-medium text-caption2">Número de cédula</div>
                    <div class="text-caption2 text-weight-medium text-primary">{{
                      utils.numberFormat(selectedAccount.account_owner_dni) }}</div>
                  </div>
                </div>
                <div class="q-pt-xs ">
                  <div style="font-size: 1.2rem; font-weight: 500;">
                    Retiras tus ganancias
                  </div>
                  <div class="flex justify-between items-center q-mt-sm containerSaldo">
                    <div class="text-balanceSaldo">Saldo total</div>
                    <div class="text-balanceSaldo">Gs. {{ utils.numberFormat(withdrawalForm.amount) }}</div>
                  </div>
                </div>
                <div class="q-mt-md">
                  <!-- <customSlider v-model="withdrawalForm.sliderCheck" @change="handlerSlider" /> -->
                  <div class="q-pl-sm q-mb-md">
                    <div class="text-subtitle1 text-weight-medium">Comisión a pagar</div>
                    <div class="text-body2 text-weight-medium text-primary">Escoge que comisión quieres pagar</div>
                  </div>
                  <div class="q-pb-md q-pt-sm q-px-sm" style="border: 1px solid lightgray; border-radius: 0.5rem;">
                    <div class="q-py-none" v-for="checkpoint in checkpointsWithdrawal" :key="checkpoint.type">
                      <div>
                        <div class="flex items-center justify-between q-pt-sm q-pb-xs"
                          style="border-bottom: 1px solid lightgray;">
                          <div class=" text-grey-9">
                            {{ checkpoint.label }} sobre monto a retirar
                          </div>
                          <div class="q-mt-xs">
                            <van-switch v-model="checkpoints[checkpoint.type]" class="swichtCoin " size="1rem"
                              @update:model-value="updateAmountWithdrawal(checkpoint.type)" active-color="#21BA45"
                              inactive-color="#d8d8d8">
                              <template #node>
                                <div class="icon-wrapper">
                                </div>
                              </template>
                            </van-switch>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
                <div class="q-mt-md">
                  <div v-for="(info, index) in tableInfo" :key="index"
                    class="flex items-center justify-between q-mb-sm infoTableContainer">
                    <div>
                      <div class="infoTitle">{{ info.title }}</div>
                      <div class="infoSubtitle">{{ info.subtitle }}</div>
                    </div>
                    <div class="infoValue"> {{ setValueByIndex[index] }}</div>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div class="flex flex-center row q-py-md" style="height: 18%;">
            <div class="col-12 q-px-lg">
              <q-btn no-caps class="" color="grey-7" unelevated @click="stepBack()" style="width: 100%;">
                <div class="q-px-lg q-py-xs" style="font-size: 0.988rem;">
                  Volver
                </div>
              </q-btn>
            </div>
            <div class="col-12 q-px-lg">
              <q-btn no-caps :color="step == 1 ? 'primary' : 'positive'" unelevated type="submit"
                :disable="disableButton" style="width: 100%;">
                <div class="q-px-lg q-py-xs" style="font-size: 0.988rem;">
                  {{ step == 1 ? 'Siguiente' : 'Solicitar retiro' }}
                </div>
              </q-btn>
            </div>
          </div>
        </q-form>
        <div v-else>
          <div>
            <div class="text-bold text-xl text-center q-pt-sm">
              Tienes retiros pendientes
            </div>
            <div class="q-px-md q-pt-sm text-grey-8" style="font-size: 0.8rem;">
              Tienes ordenes de retiros pendientes, espera a que se confirme tu retiro para poder realizar otro
            </div>
          </div>
          <div class="q-px-sm">
            <div class="q-pt-lg" style="font-weight: bold; font-size: 1rem;">
              Orden pendiente
            </div>
            <div class="withdrawal__item q-mt-md" v-if="Object.values(pendingWithdrawal).length > 0"
              @click="goTo(pendingWithdrawal.id)">
              <div class="withdrawal__content">
                <!-- Main Row -->
                <div class="main-row">
                  <div class="amount-section">
                    <div class="amount-value">
                      Gs. {{ numberFormat(pendingWithdrawal.amount) }}
                    </div>

                  </div>
                  <div class="status-badge" :class="getStatusClass(pendingWithdrawal.status)">
                    {{ pendingWithdrawal.status_label }}
                  </div>
                </div>

                <!-- Bank Info -->
                <div v-if="pendingWithdrawal.account_bank" class="bank-section">
                  {{ pendingWithdrawal.account_bank.bank ? pendingWithdrawal.account_bank.bank.name : 'N/A' }}
                  <span class="account-number">•••• {{ pendingWithdrawal.account_bank.account_number.slice(-4) }}</span>
                </div>

                <!-- Bottom Info -->
                <div class="info-row">
                  <span class="info-label">Comisión</span>
                  <span class="info-value">Gs. {{ numberFormat(pendingWithdrawal.comision_by_type +
                    pendingWithdrawal.comision_fixed)
                  }}</span>
                  <span class="info-separator">•</span>
                  <span class="info-label">Recibirás</span>
                  <span class="info-value highlight">Gs. {{ numberFormat(pendingWithdrawal.amount -
                    pendingWithdrawal.comision_by_type
                    - pendingWithdrawal.comision_fixed) }}</span>
                </div>
                <div class="amount-date q-mt-xs">
                  {{ formatDate(pendingWithdrawal.created_at) }}
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-center row q-py-md q-mt-md" style="height: 18%;">
            <div class="col-12 q-px-lg">
              <q-btn no-caps class="" color="grey-7" unelevated @click="router.go(-1)" style="width: 100%;">
                <div class="q-px-lg q-py-xs" style="font-size: 0.988rem;">
                  Volver
                </div>
              </q-btn>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="q-py-lg flex flex-center" style="height: 94%;">
        <q-spinner color="primary" size="3em" />
      </div>
    </div>

    <confirmWithdrawalModal :dialog="dialog" :withdrawalData="withdrawalForm" @hideModal="hideModal"
      @operationComplete="redirectToComplete" />

  </div>
</template>
<style lang="scss" scoped>
.infoTableContainer {
  border-bottom: 1px solid lightgray;
  padding-bottom: 0.22rem;
}

.infoTitle {
  font-size: 1.04rem;
  font-weight: 600;
  color: #333333;
}

.infoSubtitle {
  font-size: 0.788rem;
  color: #a8a8a8;
}

.infoValue {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333333;
}

.containerSaldo {
  border: 1px solid rgb(148, 148, 148);
  border-radius: 0.4rem;
  padding: 0.7rem 0.8rem;
}

.text-balanceSaldo {
  font-size: 0.95rem;
  font-weight: 500;
}

.account__info--item {
  padding-bottom: 10px;
}

.account__info--item2 {
  border-bottom: 1.5px $grey-5 dashed;
  padding-bottom: 10px;
}

.h-full {
  height: 100vh;
}

.h-100 {
  height: 100%;
}

.w-100 {
  width: 100%;
}

.redirect_button {
  width: 50%;
}

.account__container::-webkit-scrollbar {
  width: 5px;
  height: 8px;
  border-radius: 15px;
  background-color: #aaa;
  /* or add it to the track */
}

.radio-section {
  width: 5%;
}

.bank-section {
  width: 95%;
}

@media screen and (max-width: 780px) {
  .radio-section {
    width: 11%;
  }

  .bank-section {
    width: 89%;
  }

  .redirect_button {
    width: 100%;
  }
}

.account__container {
  overflow-y: auto;
  height: max-content;
  max-height: 85%;
  cursor: pointer;
}

.account__info {
  background: #f0f4fe;
  border-radius: 10px;

  &--bank {
    padding-top: 2px;
    height: 35px;
    overflow: hidden;
  }
}

.account__info.loading {
  // background: transparent!important;
  border: 1px dashed $grey-5;

}

.text-caption2 {
  font-size: 0.85rem !important;
}

.bancoBasa {
  transform: translateX(5%) translateY(0%)
}

.bancoRio {
  transform: translateY(-0%) translateX(38%);
}

.continental {
  transform: translateY(0%) translateX(40%) scale(1.2);
}

.eko {
  transform: translateY(0%) translateX(35%);
}

.itau {
  transform: translateY(10%) translateX(-5%);
}

.sudameris {
  transform: translateY(10%) translateX(25%) scale(1.2);
}

.ueno {
  transform: translateY(0%) translateX(5%);
}

.wally {
  transform: translateY(0%) translateX(60%);
}
</style>

<style lang="scss" scoped>
.withdrawal__list {
  overflow-y: auto;
  height: calc(91vh - 80px);
  padding-bottom: 2rem;
}

.withdrawal__item {
  cursor: pointer;
  padding: 1.5rem 0.8rem;
  border: 2px solid #e0e0e0;
  transition: opacity 0.2s ease;
  border-radius: 0.8rem;


  &:hover {
    opacity: 0.8;
  }

  &.loading {
    border-bottom-color: #f5f5f5;
  }
}

.withdrawal__content {
  width: 100%;
}

.main-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.amount-section {
  flex: 1;
}

.amount-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: -0.02em;
}

.amount-date {
  font-size: 0.85rem;
  color: #999;
  font-weight: 500;
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  margin-top: 0.25rem;

  &.status-pending {
    background: #fff3cd;
    color: #856404;
  }

  &.status-approved {
    background: #d4edda;
    color: #155724;
  }

  &.status-rejected {
    background: #f8d7da;
    color: #721c24;
  }
}

.bank-section {
  font-size: 0.93rem;
  color: #666;
  margin-bottom: 0.25rem;
  font-weight: 400;
}

.account-number {
  color: #999;
  margin-left: 0.5rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.8rem;
}

.info-label {
  color: #999;
  font-weight: 400;
}

.info-value {
  color: #666;
  font-weight: 500;

  &.highlight {
    color: #4caf50;
    font-weight: 600;
  }
}

.info-separator {
  color: #ddd;
  margin: 0 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  opacity: 0.5;
}

.h-100 {
  height: 100%;
}

@media screen and (max-width: 780px) {
  .withdrawal__list {
    padding: 0 1rem;
  }

  .withdrawal__item {
    padding: 1.5rem 0.8rem;
  }

  .amount-value {
    font-size: 1rem;
  }

  .info-row {
    font-size: 0.8rem;
  }
}
</style>