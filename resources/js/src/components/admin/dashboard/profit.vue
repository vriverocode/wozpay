<template>
  <div>
    <div class="q-py-sm q-px-md q-px-md-lg" v-if="balances">
      <div class=" q-pb-sm">
        <div class="row">
          <div class="col-12 flex items-center justify-between">
            <div class="text-subtitle1 q-mt-sm text-dark text-weight-bold">Ganancias en tiempo real</div>
          </div>
        </div>
      </div>
      <div>
        <div class="quote-section">
          <div class="row q-px-none">
            <div class="col-12 bg-white q-pa-md  flex items-center justify-between justify-md-start loan_card" style="">
              <div class="w-100 flex items-center justify-between q-pb-sm" style="border-bottom: 1px solid lightgrey">
                <div class="flex items-center w-80 ">
                  <div class="q-mr-sm q-mt-xs">
                    <q-icon :name="icons.outlinedAddCard" class="" size="sm" />
                  </div>
                  <div class=" q-ml-xs q-mr-md q-mr-md-none q-pl-md-md">
                    <div class="text-weight-medium"> Ganancias </div>
                    <div class="text-weight-medium text-grey-8 ">Ganancias al cierre</div>
                  </div>
                </div>
                <div class="q-mr-sm text-end">
                  <div class="text-weight-medium text-right">Total</div>
                  <div class="text-weight-medium text-right">Gs. {{ numberFormat(((balances.wallet + balances.paysRecieve
                    + balances.toPay) - balances.loans))}}</div>
                </div>
              </div>
              <div class="w-100 flex items-center justify-between q-mt-sm q-pt-xs q-pb-sm"
                style="border-bottom: 1px solid lightgrey" @click="router.push('/pays/pending')">
                <div class="flex items-center   w-80 ">
                  <div class="q-mr-sm q-mt-xs">
                    <q-icon name="eva-clock-outline" class="" size="sm" />
                  </div>
                  <div class=" q-ml-xs q-mr-md q-mr-md-none q-pl-md-md">
                    <div class="text-weight-medium">Pagos pendientes </div>
                    <div class="text-weight-medium text-grey-8 ">Cuotas pendientes de aprobación</div>
                  </div>
                </div>
                <div class="q-mr-sm text-end">
                  <div class="text-weight-medium text-right">Total</div>
                  <div class="text-weight-medium text-right">{{ balances.paysPeding }}</div>
                </div>
              </div>
              <div class="w-100 flex items-center justify-between q-mt-sm q-pt-xs q-pb-sm"
                style="border-bottom: 1px solid lightgrey">
                <div class="flex items-center   w-80 ">
                  <div class="q-mr-sm q-mt-xs">
                    <q-icon :name="icons.outlinedAccountBalance" class="" size="sm" />
                  </div>
                  <div class=" q-ml-xs q-mr-md q-mr-md-none q-pl-md-md">
                    <div class="text-weight-medium">Capital retornado</div>
                    <div class="text-weight-medium text-grey-8 ">Préstamo devuelto</div>
                  </div>
                </div>
                <div class="q-mr-sm text-end">
                  <div class="text-weight-medium text-right">Recibiste</div>
                  <div class="text-weight-medium text-right text-light-green-14">Gs.
                    {{ numberFormat(balances.paysRecieve) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="q-py-sm q-px-md q-px-md-lg" v-else>
      <div class="row q-px-none">
        <div class="col-12 bg-white q-pa-md flex items-center justify-between justify-md-start loan_card" style="">
          <div class="w-100 flex items-center">
            <div style="" class="w-10">
              <!-- <div v-html="wozIcons.withdrawal" /> -->
              <q-skeleton type="rect" />
            </div>
            <div class="flex items-center justify-between  w-80-load">
              <div class=" q-mx-sm  w-50-load">
                <div class="text-weight-medium"><q-skeleton type="rect" /></div>
                <div class="text-weight-bold q-mt-xs"><q-skeleton type="rect" /></div>
              </div>
            </div>
            <div class="w-10">
              <q-skeleton type="rect" />
              <q-skeleton type="rect" class="q-mt-xs" />
            </div>
          </div>
          <div class="w-100 flex items-center q-mt-md">
            <div style="" class="w-10">
              <!-- <div v-html="wozIcons.withdrawal" /> -->
              <q-skeleton type="rect" />
            </div>
            <div class="flex items-center justify-between  w-80-load ">
              <div class=" q-mx-sm  w-50-load">
                <div class="text-weight-medium"><q-skeleton type="rect" /></div>
                <div class="text-weight-bold q-mt-xs"><q-skeleton type="rect" /></div>
              </div>
            </div>
            <div class="w-10">
              <q-skeleton type="rect" />
              <q-skeleton type="rect" class="q-mt-xs" />
            </div>
          </div>
          <div class="w-100 flex items-center q-mt-md">
            <div style="" class="w-10">
              <!-- <div v-html="wozIcons.withdrawal" /> -->
              <q-skeleton type="rect" />
            </div>
            <div class="flex items-center justify-between  w-80-load">
              <div class=" q-mx-sm  w-50-load">
                <div class="text-weight-medium"><q-skeleton type="rect" /></div>
                <div class="text-weight-bold q-mt-xs"><q-skeleton type="rect" /></div>
              </div>
            </div>
            <div class="w-10">
              <q-skeleton type="rect" />
              <q-skeleton type="rect" class="q-mt-xs" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
<script>
import { useAuthStore } from '@/services/store/auth.store'
import { useWalletStore } from '@/services/store/wallet.store'
import { inject, ref } from 'vue'
import util from '@/util/numberUtil'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

export default {
  setup() {
    //vue provider
    const user = useAuthStore().user;
    const { balances } = storeToRefs(useWalletStore())
    const icons = inject('ionIcons')
    const ready = ref(false)
    const numberFormat = util.numberFormat
    const router = useRouter()
    // Data
    return {
      icons,
      user,
      router,
      ready,
      numberFormat,
      balances
    }
  },
}

</script>

<style lang="scss">
.w-100 {
  width: 100% !important;
}
</style>
<style lang="scss" scoped>
.loan_card {
  border-radius: 23px;
  //box-shadow: 0px 5px 5px 0px #aaaaaa
}

.loan_container {
  border-bottom: 1px solid #d3d3d3;
}

.quote_description {
  font-size: 12px;
  color: lightgray;
}

.quote_container {
  border-bottom: 1px solid #d3d3d3;
}

.quote-section::-webkit-scrollbar {
  display: none;
}

.w-80 {
  width: 80%;
}

.w-50 {
  width: 50%;
}

.w-10 {
  width: 10%;
}

.w-80-load {
  width: 80%;
}

.w-50-load {
  width: 50%;
}

@media screen and (max-width: 780px) {
  .w-50-load {
    width: 50%;
  }

  .w-80-load {
    width: 80%;
  }

  .w-80 {
    width: auto;
  }

  .w-50 {
    width: auto;
  }
}
</style>