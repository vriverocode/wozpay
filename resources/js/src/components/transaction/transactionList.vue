<template>
  <div class="transactionList q-mb-xl q-pb-md">
    <div v-if="!loading && Object.values(transactions).length > 0" style="height: 100%;">
      <div style="" class="q-mt-md">

        <div v-for="(transaction, key) in transactions" :key="key" class="q-py-sm  cursor-pointer">
          <div class="flex items-center justify-between q-px-sm q-mx-sm bottom-border q-pb-md"
            @click="goTo(transaction.transaction, transaction.id)">
            <div class="flex items-center">
              <div v-html="imgTransaction(transaction)"
                v-if="transaction.transaction != 7 && transaction.transaction != 8 && transaction.transaction != 9"
                class="q-mr-sm q-mr-md-md icons-transfer"
                :class="{ 'transfer-icon-t': transaction.transaction == 4, 'transfer-icon-t fill-red': transaction.transaction == 5, 'uppeIconn': transaction.transaction == 1 }" />
              <q-icon :name="imgTransaction(transaction)" size="md" class="q-mr-sm"
                v-if="transaction.transaction == 7 || transaction.transaction == 8 || transaction.transaction == 9" />

              <div>
                <div v-for="(line, index) in lines(transaction)" :key="index"
                  class="text-subtitle2 text-grey-7 text-weight-regular flex items-center"
                  :class="{ 'text-weight-bold text-grey-10': index == 'title' }">
                  <div>
                    {{ line }}
                  </div>
                  <div v-if="line == 'Woz Payments'">
                    <q-icon :name="icons.sharpVerified" size="xs" :color="'terciary'" class="q-mx-xs " />
                  </div>

                </div>
              </div>
            </div>
            <div>
              <div class="text-right text-caption text-grey-7">
                {{ moment(transaction.created_at).format('DD/MM/YYYY') }}
              </div>
              <div class="text-subtitle2 text-right text-weight-medium " :class="colorTextByTrasaction(transaction)">
                {{ transaction.transaction == 1 || transaction.transaction == 4 || transaction.transaction == 7 ||
                  transaction.transaction == 10 ? '' : '-' }}{{ amountToTransaction(transaction) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="pagination flex flex-center  q-pt-md q-pb-xl" style="height: 10%;">
        <div class="q-pb-md">
          <q-pagination v-model="currentPage" :max="lastPage" direction-links outline ellipses color="primary"
            active-design="push" active-color="primary" active-text-color="white" size="0.9rem" gutter="sm"
            @update:model-value="setPage" class="q-pb-xl" />
        </div>
      </div>
    </div>
    <div v-if="!loading && Object.values(transactions).length == 0" class="flex flex-center column q-pt-xl">
      <q-icon :name="icons.ionRepeatOutline" color="terciary" size="5rem" class="q-mt-md"
        style="transform:rotate(50deg) ;" />
      <div class="text-h6 text-weight-medium">
        Sin transacciones
      </div>
    </div>
    <div v-if="loading" style="height: 100%;" class="flex flex-center column">

      <q-spinner-hourglass color="primary" size="4rem" />
      <div class="text-center text-weight-bold text-h5 q-mt-1">
        Cargando...
      </div>
    </div>

  </div>
</template>
<script>
import { inject, onMounted, ref } from 'vue'
import util from '@/util/numberUtil'
import { useAuthStore } from '@/services/store/auth.store';
import { useTransactionStore } from '@/services/store/transaction.store';
import { storeToRefs } from 'pinia'
import wozIcons from '@/assets/icons/wozIcons';
import moment from 'moment';
import { useRouter } from 'vue-router';


export default {
  setup() {
    const icons = inject('ionIcons')
    const emitter = inject('emitter');
    const { user } = storeToRefs(useAuthStore())
    const transactions = ref([])
    const transactionStore = useTransactionStore()
    const numberFormat = util.numberFormat
    const numberFormatDecimal = util.numberFormatDecimal

    const router = useRouter()
    const search = ref('')
    const month = ref(new Date().getMonth())
    const year = ref(new Date().getFullYear())
    const loading = ref(true)
    const currentPage = ref(1)
    const lastPage = ref(10)
    const getTransactions = () => {
      loading.value = true
      const data = {
        page: currentPage.value,
        user: user.value.id,
        search: search.value,
        month: month.value,
        year: year.value
      }

      transactionStore.allTransactionByUser(data)
        .then((response) => {
          if (response.code !== 200) throw response
          transactions.value = response.data.transactions,
            lastPage.value = response.data.countAllPages,
            loading.value = false
        })
        .catch((response) => {
          loading.value = false
          showNotification({ msg: response, title: 'Error' })
        })
    }
    const amountToTransaction = (transaction) => {
      let amount = transaction.transaction == 7
        ? transaction.amount_to_client
        : transaction.amount

      return transaction.transaction == 7 && transaction.coin_id == 2
        ? transaction.coin.code + ' ' + numberFormat(amount / transaction.rate_amount)
        : 'Gs. ' + numberFormat(amount)
    }
    const showNotification = (value) => {
      const data = {
        newColor: 'negative',
        newTitle: value.title,
        newText: value.msg,
        newIcon: 'eva-bell-outline',
        newCallback: () => emitter.emit('offModalNotification'),
      }
      emitter.emit('modalNotification', data);
    }
    const lines = (transaction) => {
      if (transaction.transaction == 1) return { title: 'Realizaste una carga de saldo', text: transaction.concept }
      if (transaction.transaction == 2) return { title: 'Realizaste un pago de prestamo', text: transaction.concept }
      if (transaction.transaction == 3) return { title: 'Realizaste un pago de prestamo', text: transaction.concept }
      if (transaction.transaction == 4) return { title: 'Recibiste una transferencia de', second: transaction.user_from.user.name, text: transaction.concept }
      if (transaction.transaction == 5) return { title: 'Realizaste una transferencia de', second: transaction.user_to.user.name, text: transaction.concept }
      if (transaction.transaction == 6) return { title: 'Débito automático', text: 'Woz Payments' }
      if (transaction.transaction == 7) return { title: 'Links de pago', second: 'N°' + transaction.code, text: 'Woz Payments', }
      if (transaction.transaction == 8) return { title: 'Pago de activación', second: 'Cuenta internacional', }
      if (transaction.transaction == 9) return { title: 'Pago de paquete de links', second: transaction.package.title, }
      if (transaction.transaction == 10) return { title: 'Pago de link de cobro', second: '#' + transaction.links.type_label, text: transaction.links.title }

      if (transaction.transaction == 11) return { title: 'Activación cuenta Dropshipping', text: transaction.concept }
      if (transaction.transaction == 12) return { title: 'Retiro instantaneo', text: '**** **** ' + transaction.account_bank.account_number.slice(-4) }


    }
    const imgTransaction = (transaction) => {
      if (transaction.transaction == 1) return wozIcons.cargar
      if (transaction.transaction == 2) return wozIcons.cashOutline
      if (transaction.transaction == 3) return wozIcons.cashOutline
      if (transaction.transaction == 4) return wozIcons.transferir
      if (transaction.transaction == 5) return wozIcons.transferir
      if (transaction.transaction == 6) return wozIcons.cardOutline
      if (transaction.transaction == 7) return 'eva-link-2-outline'
      if (transaction.transaction == 8 || transaction.transaction == 9) return 'eva-credit-card-outline'

      if (transaction.transaction == 10) return wozIcons.linkCheck
      if (transaction.transaction == 11 || transaction.transaction == 12) return wozIcons.cashOutline



    }
    const colorTextByTrasaction = (transaction) => {
      if (transaction.transaction == 1 || transaction.transaction == 4 || transaction.transaction == 7 || transaction.transaction == 10) return 'text-positive'
      return 'text-negative'
    }
    const goTo = (type, id) => {
      // if()
      router.push('/trasacction/view/' + type + '/' + id)
    }
    const setPage = (page) => {
      currentPage.value = page
      getTransactions()
    }
    onMounted(() => {
      getTransactions()
      emitter.on('refreshByFilter', (data) => {
        currentPage.value = 1
        search.value = data.search ?? ''
        month.value = data.month - 1
        year.value = data.year
        getTransactions()
      })

    })
    return {
      moment,
      loading,
      transactions,
      icons,
      numberFormat,
      currentPage,
      lastPage,
      lines,
      imgTransaction,
      colorTextByTrasaction,
      goTo,
      setPage,
      amountToTransaction,
    }
  },
}
</script>
<style lang="scss">
.transactionList {
  height: 70%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 5px;
    background: transparent;
    background: rgba(199, 199, 199, 0.719);

  }

  &::-webkit-scrollbar-thumb {
    background: $primary;
    border-radius: 50px;
  }

}

.icons-transfer {
  transform: scale(0.9);
}

.uppeIconn {
  transform: scale(1.2);
}

.transfer-icon-t {

  transform: scale(0.9) rotate(310deg) !important;

  &.fill-red path {
    fill: red;
    stroke: red;
  }
}

.bottom-border {
  border-bottom: 1px solid;
  border-image-slice: 1;
  border-image-source: linear-gradient(90deg, rgba(255, 255, 255, 1) 6%, $grey-5 6%);
}

@media screen and (max-width: 780px) {
  .uppeIconn {
    transform: scale(1.1) !important;
  }

  .transactionList {
    height: 73%;

  }

  .icons-transfer {
    transform: scale(0.8);
  }

  .transfer-icon-t {

    transform: scale(0.8) rotate(310deg) !important;

  }

  .bottom-border {
    border-image-source: linear-gradient(90deg, rgba(255, 255, 255, 1) 11%, $grey-5 11%);
  }
}
</style>