<template>
  <main>
    <div>
      <template v-if="Object.values(stadistics).length > 0">
  
        <stadisticProfile :stadistics="stadistics" />
        <aboutWoz :stadistics="stadistics"/>
        <aboutAccount :stadistics="stadistics"/>
      </template>
      <div v-else class="flex justify-center items-center q-pa-xl"> 
        <q-spinner-tail
          color="primary"
          size="5rem"
        />
      </div>
    </div>
    <!-- <div class="flex column justify-center q-px-md" v-else>
      <div class="text-center q-mb-md">
        <q-img
          :src="sadface"
          height="80px"
          width="80px"
        />
      </div>
      
      <div style="font-size:1.3rem; font-weight:500; text-align:center">Todavia no eres miembro de Woz dropshipping </div>
      <div style="font-size:1rem; font-weight:500; text-align:center" class="q-mt-sm">
        Subscribete ya mismo y comienza a vender
      </div>
      <q-btn color="positive" @click="goTo()" text-color="white" label="" no-caps id="" class="q-mt-lg" >
        <div class="q-py-sm">
          Comenzar a vender
        </div>  
      </q-btn>

    </div> -->
  </main>
</template>
<script >
import { inject, onMounted, ref } from 'vue';
import { useAuthStore } from '@/services/store/auth.store'
import { useDropshippingStore } from '@/services/store/dropshipping.store';
import { storeToRefs } from 'pinia';
import wozIcons from '@/assets/icons/wozIcons';
import stadisticProfile from '@/components/dropshipping/profile/stadisticProfile.vue';
import aboutWoz from '@/components/dropshipping/profile/aboutWoz.vue';
import aboutAccount from '@/components/dropshipping/profile/aboutAccount.vue';
import { useRouter } from 'vue-router';
import sadFace from '@/assets/images/sadFace.svg'

export default {
  components:{
    stadisticProfile,
    aboutWoz,
    aboutAccount
  },
  setup () {
    //vue provider
    const dropStore = useDropshippingStore()
    const router = useRouter()
    const icons = inject('ionIcons')
    const { user  } = storeToRefs(useAuthStore())
    const stadistics = ref({}) 
    const sadface = sadFace
    const getStatdistics = () => {
      dropStore.getStadistics(user.value.id)
      .then((response) => {
        stadistics.value = response.data;
      })
    }
    const goTo = () =>{
      router.push('/dropshipping/activateForm?amount=250000')
    }
    onMounted(() => {
      getStatdistics()
    })
    return {
      icons,
      user,
      wozIcons,
      stadistics,
      sadface,
      goTo,
    }
  }
};
</script>