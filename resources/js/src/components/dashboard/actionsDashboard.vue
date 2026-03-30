<template>
  <div class="q-py-xs q-px-md-md q-px-sm  q-pb-none" style="height: 100%; overflow: hidden;">
    <div>
      <div class="text-subtitle1 text-weight-medium q-mt-none text-black q-px-sm">¿Qué puedes hacer?</div>
    </div>
    <div class="q-mt-md-md q-mt-xs-sm">
      <div class="row q-px-sm q-py-md" style="background: #efefef; border-radius: 1.5rem; ">
        <div class="col-3 q-px-xs">
          <q-btn color="white" flat no-caps class="q-px-xs q-py-none actions-button w-100" to="/dashboard">
            <img :src="binance" alt="" class="q-pt-sm" style="height:32px;">
            <div class="q-mt-none text-dark text-body2 text-ellipsis ellipsis" style="width: 100%;">Comprar</div>
          </q-btn>
        </div>
        <div class="col-3 q-px-xs">
          <q-btn color="white" flat no-caps class="q-px-xs q-py-none actions-button w-100"
            :to="user.viewTransfer == 1 ? '/transfer' : '/transfer_send'">
            <div class="q-mt-xs" v-html="icons.transferir" />
            <span class="q-mt-none text-dark text-body2">Transfer.</span>
          </q-btn>
        </div>

        <div class="col-3 q-px-xs">
          <q-btn color="white" flat no-caps class="q-px-xs q-py-none actions-button w-100" to="/deposit">
            <div class="q-mt-xs" v-html="icons.cargar" />
            <span class="q-mt-none text-dark text-body2">Cargar</span>
          </q-btn>
        </div>
        <div class="col-3 q-px-xs">
          <q-btn color="white" flat no-caps class="q-px-xs q-py-none actions-button w-100" to="/dashboard">
            <img :src="acciones" alt="" style="width:32px; height: 32px;">
            <span class="q-mt-none text-dark text-body2">Acciones</span>
          </q-btn>
        </div>
        <div class="col-3 q-px-xs q-mt-md">
          <q-btn color="white" flat no-caps class="q-px-xs q-py-none actions-button w-100"
            to="https://wozdropshipping.figma.site/ ">
            <img :src="droppi" alt="" style="height:32px;" class="q-mt-xs">
            <div class="q-mt-none text-dark text-body2 text-ellipsis ellipsis" style="width: 100%;">Woz Dropshipping
            </div>
          </q-btn>
        </div>
        <div class="col-3 q-px-xs q-mt-md">
          <q-btn color="white" flat no-caps class="q-px-xs q-py-none actions-button w-100"
            href="https://wozmarketplacepy.netlify.app/" target="_blank">
            <img :src="market" alt="" style="height:32px;" class="q-mt-xs">
            <div class="q-mt-none text-dark text-body2 text-ellipsis ellipsis" style="width: 100%;">Woz Marketplace
            </div>
          </q-btn>
        </div>

        <div class="col-3 q-px-xs q-mt-md">
          <q-btn color="white" flat no-caps class="q-px-xs q-py-none actions-button w-100"
            to="https://wozpaymentsapi.figma.site/">
            <img :src="api" alt="" style="height:32px;" class="q-mt-xs">
            <div class="q-mt-none text-dark text-body2 text-ellipsis ellipsis" style="width: 100%;">Woz api {{ '</>' }}
            </div>
          </q-btn>
        </div>
        <div class="col-3 q-px-xs q-mt-md">
          <q-btn color="white" flat no-caps class="q-px-xs q-py-none actions-button w-100"
            :class="{ 'rekutu-efect': user.viewRekutu }" to="https://crediapp.figma.site/"> <!-- /apply -->
            <div v-if="loan.status == 3 && loan.red_tapes.use_count < 3">
              <q-icon :name="iconis.ionRepeat" size="2.5rem" class="q-mt-xs" />
            </div>
            <div class="q-mt-sm" v-html="icons.solicitar" v-else />
            <span class="q-mt-none text-dark text-body2">{{ loan.status == 3 && loan.red_tapes.use_count < 3 ? 'Rekutu'
              : 'Prestamo' }}</span>
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import wozIcons from '@/assets/icons/wozIcons'
import { useAuthStore } from '@/services/store/auth.store'
import { useLoanStore } from '@/services/store/loan.store';
import { storeToRefs } from 'pinia';
import { ref, onMounted, inject } from 'vue'
import binance from '@/assets/images/BINANCE.png'
import acciones from '@/assets/images/acciones_woz.svg'
import api from '@/assets/images/Woz_Api.svg'
import droppi from '@/assets/images/Woz_Dropshipping.svg'
import market from '@/assets/images/Woz_Marketplace.svg'

export default {
  setup() {
    //vue provider
    const { user } = storeToRefs(useAuthStore())
    const icons = wozIcons
    const iconis = inject('ionIcons')
    const loanStore = useLoanStore()
    const loan = ref({})

    const activeLoan = () => {
      loanStore.getLoan(user.value.id).then((data) => {
        if (!data.code) throw data
        loan.value = data.data ? Object.assign(data.data) : {}

        loadingShow(false)
      }).catch((e) => {
        // isReady.value = true

        // showNotify('negative', 'error al obtener prestamo activo')
      })
    }

    onMounted(() => {
      activeLoan()
    })
    return {
      icons,
      iconis,
      user,
      loan,
      binance,
      acciones,
      api,
      droppi,
      market
    }
  },
}
</script>

<style lang="scss">
.actions-button {
  box-shadow: 0px 0px 0px 0px #aaaaaab4;
  border: 0px solid #c7c7c7 !important;
  border-radius: 15px !important;
  height: 75px !important;
  padding: 0.3rem;
  width: 100% !important;
  overflow: hidden;
  background: white !important;

  & .q-btn__content {
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-evenly !important;
    align-items: center !important;
  }
}

.rekutu-efect {

  --border-angle: 0turn; // For animation.
  --main-bg: conic-gradient(from var(--border-angle),
      rgb(255, 255, 255),
      rgb(255, 255, 255) 5%,
      rgb(255, 255, 255) 60%,
      rgb(255, 255, 255) 95%);

  border: solid 3px transparent !important;
  border-radius: 2em;
  --gradient-border: conic-gradient(from var(--border-angle), #ffc701 0%, #ffc701, #ffffff 90%, #fff);


  background:
    // padding-box clip this background in to the overall element except the border.
    var(--main-bg) padding-box,
    // border-box extends this background to the border space
    var(--gradient-border) border-box,
    // Duplicate main background to fill in behind the gradient border. You can remove this if you want the border to extend "outside" the box background.
    var(--main-bg) border-box;

  background-position: center center;

  animation: bg-spin 4s linear infinite;

  @keyframes bg-spin {
    to {
      --border-angle: 2turn;
    }
  }
}

@property --border-angle {
  syntax: "<angle>";
  inherits: true;
  initial-value: 0turn;
}
</style>