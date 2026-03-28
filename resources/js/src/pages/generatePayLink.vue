<template>
  <div v-if="load">
    <noReady v-if="showNotReady" :requirements="requirements" />
    <generate v-else/>
  </div>
  <div  v-else style="height: 100vh;">
    <transition name="inFade">
      <q-inner-loading
        :showing="true"
        label="Cargando"
        class="bg-primary"
        color="white"
        label-class="text-white"
        label-style="font-size: 1.1em"
      />
    </transition>
  </div>
</template>
<script>

  import { useRoute, useRouter } from 'vue-router';
  import noReady from "@/components/payLink/noReady.vue";
  import generate from "@/components/payLink/generatePayLinkByType.vue";
  import { storeToRefs } from 'pinia'
  import { useAuthStore } from '@/services/store/auth.store'
  import { inject, onMounted } from 'vue';
  import { useQuasar } from 'quasar';
  import wozIcons from '@/assets/icons/wozIcons';

export default {
  components:{
    noReady,
    generate
  },
  setup() {

    const { user  } = storeToRefs(useAuthStore())
    const requirements = ref({
      card: user.value.card  ?? false,
      current: user.value.current_loan ?? false,
      loan:user.value.loans_complete_count ?? false,
      bankAccount:user.value.loans_complete_count ?? false,

    })
    const showNotReady = ref(true)
    const load = ref(false)
    const colorBanner = ref('#0449fb')
    const router = useRouter();

    const validateToShow = () => {
      // let isOk = Object.values(requirements.value).filter((el) => !el)

      setTimeout(() => {
        load.value = true;
        showNotReady.value = false
      }, 1000);
    }
    onMounted(() => {
      useQuasar().addressbarColor.set(colorBanner.value)
      validateToShow()

      console.log(requirements.value)
      
    })
    return {
      router,
      wozIcons,
      showNotReady,
      load,
      requirements,
    }
  },
}
</script>