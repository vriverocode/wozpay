<template>
  <div style="height: 100vh;" class=" bg-primary">
    <div style="position: absolute; left: 0.1rem; top: 0; z-index: 3;" class="q-mt-sm">
      <q-btn round unelevated dense color="grey-5" size="1rem" icon="eva-chevron-left-outline" @click="goBack()" />
    </div>
    <div class="bg-white hero-section">
      <div class="flex flex-center">
        <img :src="heroImg" class="q-mt-xl q-mt-md-md hero__img">
      </div>
    </div>
    <div class="terms-section">
      <div class="q-pt-lg">
        <div class="text-center q-pt-md">
          <div class="text-white text-h4 text-weight-bold ">Woz Payments</div>
          <div class="text-white text-subtitle1 text-weight-medium">CRÉDITOS POR DÉBITO</div>
        </div>
        <div class="text-center q-mt-md q-mx-md q-px-md-lg text-subtitle3 text-white text-weight-medium">
          Accede a una <span class="text-weight-bold">línea</span> de crédito con débito
          automatico con cualquier tarjeta de
          crédito o débito.
        </div>
        <div class="q-px-lg q-mx-md-xl flex q-mt-lg q-pt-md items-center">
          <q-checkbox class="terms-checkbox" v-model="accept_terms" color="terciary" style="width: 10%;" size="lg" />
          <a href="https://wozpayments.com/public/documents/TERMINOS_Y_CONDICIONES.pdf" target="_blank"
            style="width: 85%;">
            <div
              class="text-subtitle1  text-weight-medium text-white q-pl-md q-pl-md-xs cursor-pointer text-decoration-underline"
              style="width: 100%;">
              Acepto que he leído los términos y
              condiciones de Woz Pay
            </div>
          </a>
        </div>
      </div>
      <div class="q-px-md q-mt-lg q-px-md-xl q-mx-md-xl">
        <q-btn color="white" class="w-100 q-pa-sm q-mb-lg text-primary access_button" no-caps :loading="loading"
          @click="goTo()">
          <div class="text-primary q-mt-sm text-subtitle1 text-weight-medium">
            Acceder
          </div>
        </q-btn>
      </div>
    </div>
  </div>
</template>
<script>
import { useAuthStore } from '@/services/store/auth.store'
import heroImg from '@/assets/images/woz.png'
import { inject, ref } from 'vue'
import util from '@/util/numberUtil'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'


export default {
  setup() {
    //vue provider
    const q = useQuasar()
    const user = useAuthStore().user;
    const icons = inject('ionIcons')
    const showing = ref(false)
    const ready = true
    const numberFormat = util.numberFormat
    const router = useRouter()
    const route = useRoute()
    const accept_terms = ref(false)
    const loading = ref(false)
    // Methods
    const showToltip = () => {
      showing.value = true
      setTimeout(() => {
        showing.value = false
      }, 3500);
    }
    const goTo = () => {
      if (!validateTermsCheck()) return

      route.query.redirect
        ? router.push('/link_card_form?redirect=' + route.query.redirect)
        : router.push('/link_card_form')
    }
    const validateTermsCheck = () => {
      if (!accept_terms.value) showNotify('negative', 'Debes aceptar los términos y condiciones')
      return accept_terms.value
    }
    const goBack = () => {
      router.go(-1)
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
    // Data
    return {
      icons,
      user,
      showing,
      router,
      ready,
      numberFormat,
      accept_terms,
      loading,
      heroImg,
      showToltip,
      goTo,
      goBack,
    }
  },
}

</script>
<style lang="scss">
.terms-checkbox .q-checkbox__bg {
  border-color: white !important;
}

.access_button {
  & .block {
    color: $primary;
    font-weight: bold;
    // font-size: 20px;
  }
}
</style>
<style scoped lang="scss">
.w-100 {
  width: 100%;
}

.text-subtitle3 {
  font-size: 1.2rem;
}

.hero-section {
  height: 45%;
  border-bottom-left-radius: 35px;
  border-bottom-right-radius: 35px;
  position: relative;
  z-index: 2;
  box-shadow: 0px 4px 14px 0px #00000040;
}

.hero__img {
  height: 20rem;
}

.terms-section {
  height: 55%;
  background: linear-gradient(130deg, $primary 60%, #0449fb 70%, rgba(0, 32, 163, 1) 80%, rgba(0, 16, 83, 1) 90%, rgba(0, 0, 0, 1) 100%);
}

@media screen and (max-width: 780px) {
  .hero__img {
    height: 15rem;
  }
}
</style>