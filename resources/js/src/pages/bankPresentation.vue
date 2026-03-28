<template>
  <div style="height: 100vh; background: #1c304f;" class="">
    <div style="position: absolute; left: 0.1rem; top: 0; z-index: 3;" class="q-mt-sm">
      <q-btn round unelevated dense color="grey-5" size="1rem" icon="eva-chevron-left-outline" @click="goBack()" />
    </div>
    <div>
      <p class="text-center text-white text__title-transf q-mb-none q-pt-lg text-weight-bold">Transferencias</p>
      <p class="text-center text-white text__subtitle-transf text-weight-bold q-mt-none q-ml-md">Bancarias</p>

    </div>
    <div class="bg-white hero-section_transfer">
      <div class="flex flex-center ">
        <img :src="heroImg" class="q-mt-xl q-mt-md-md hero__img_transfer">
      </div>
    </div>
    <div class="terms-section_transfer q-px-lg q-px-md-xl">
      <div class="q-pt-lg">
        <div class=" q-pt-md">
          <div class="text-white text__title-transf text-weight-bold ">Retira tu dinero en tu
            cuenta bancaria </div>
        </div>
        <div class="q-mt-md q-px-md-none q-mx-md-none text-subtitle3 text-white text-weight-light">
          Con Woz Payments podes retirar tus
          ganancias directamente a tu cuenta
          bancaria.
        </div>
        <div class=" flex q-mt-md q-pt-md items-center" style="transform: translateX(-0.8rem);">
          <q-checkbox class="terms-checkbox_transf" v-model="notShowBank" color="terciary" style="width: 10%;"
            size="lg" />
          <a target="_blank" style="width: 85%;">
            <div
              class="text-subtitle1  text-weight-medium text-white q-pl-md q-pl-md-xs cursor-pointer text-decoration-underline"
              style="width: 100%;">
              No volver a mostrar
            </div>
          </a>
        </div>
      </div>
      <div class="q-px-md q-mt-md q-px-md-xl q-mx-md-xl">
        <q-btn color="primary" class="w-100 q-pa-sm q-mb-lg text-primary access_button" no-caps @click="goTo()">
          <div class=" q-py-sm text-subtitle1 text-weight-medium">
            Agregar cuenta bancaria
          </div>
        </q-btn>
      </div>
    </div>
  </div>
</template>
<script>
import heroImg from '@/assets/images/tr.svg'
import { inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/services/store/user.store';
import { useAuthStore } from '@/services/store/auth.store';

export default {
  setup() {
    //vue provider

    const icons = inject('ionIcons')
    const router = useRouter()
    const notShowBank = ref(false)
    const userStore = useUserStore()
    const authStore = useAuthStore()
    // Methods

    const goTo = () => {
      if (notShowBank.value) changeStatusNotShow()

      router.push('/account_bank')
    }

    const changeStatusNotShow = () => {
      const data = {
        type: 1,
        status: 0,
      }
      userStore.setStatusNotShow(data)
        .then((response) => {
          if (response.code !== 200) throw response

          authStore.setUser(response.data)
        }).catch((response) => {

        })
    }
    const goBack = () => {
      router.go(-1)
    }

    // Data
    return {
      icons,
      notShowBank,
      heroImg,
      goTo,
      goBack,
    }
  },
}

</script>
<style lang="scss">
.terms-checkbox_transf .q-checkbox__bg {
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
.text__title-transf {
  font-size: 2rem;
  line-height: 0.8;
}

.text__subtitle-transf {
  font-size: 1.5rem;

}

.w-100 {
  width: 100%;
}

.text-subtitle3 {
  font-size: 1.2rem;
}

.hero-section_transfer {
  height: 35%;
  border-top-left-radius: 35px;
  border-top-right-radius: 35px;
  position: relative;
  z-index: 2;
  box-shadow: 0px 4px 14px 0px #00000040;

  &>div {
    height: 100%;
  }
}

.hero__img_transfer {
  height: 10rem;
}

.terms-section_transfer {
  height: 55%;
  // background: linear-gradient(130deg, $primary 60%, #0449fb 70%, rgba(0,32,163,1) 80%, rgba(0,16,83,1) 90%, rgba(0,0,0,1) 100%);
}
</style>