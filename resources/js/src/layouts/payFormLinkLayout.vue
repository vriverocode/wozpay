<template>
  <div class="layout-dasboard__content"   style="">
    <topbarPay />
    <div class="container_paget" :style="'background:#'+ (route.query.color ? route.query.color : '0449fa')">
      <div class="section_page q-mt-md">  
        <router-view v-slot="{ Component }">
          <transition name="vertical">
            <component :is="Component"  />
          </transition>
        </router-view>
      </div>
    </div>
    <!-- <div class="payNavbar-buttom">
      <navbarVue  v-if="user.rol_id != 1" />
      <navbarAdminVue v-else />
    </div> -->
  </div>
</template>
<script >
  import { inject, onMounted, ref } from 'vue';
  import { useAuthStore } from '@/services/store/auth.store'
  import { useQuasar } from 'quasar'
  import { useRoute } from 'vue-router';
  import topbarPay from '@/components/layouts/topbarPayLink.vue';
  import navbarVue from "@/components/layouts/navbar.vue";
  import navbarAdminVue from '@/components/layouts/navbarAdmin.vue';

  export default {
    components:{
      topbarPay,
      navbarVue,
      navbarAdminVue,
    },
    setup () {
      //vue provider
      const icons = inject('ionIcons')
      const $q = useQuasar()
      const store = useAuthStore();
      const route = useRoute();
      const user = ref(useAuthStore().user)

      const readyState = ref(false)
      // methods
      // const getCurrentUser = () =>{
      //   store.currentUser().then((data)=>{
      //     if(data.code !== 200 ) throw data
      //     readyState.value = true
      //   }).catch((e) => { 
      //     showNotify('negative', 'Error de servicio')
      //     utils.errorLogout( () => router.push('/login'))
      //   })
      // }
      // const showNotify = (type, message) => {
      //   $q.notify({
      //     message: message,
      //     color: type,
      //     actions: [
      //       { icon: 'eva-close-outline', color: 'white', round: true, handler: () => { /* ... */ } }
      //     ]
      //   })
      // }

      // Mounted
      onMounted(() =>{
        // getCurrentUser()
        $q.addressbarColor.set('#'+route.query.color)
      })
      
      return {
        icons,
        readyState,
        user,
        route,
      }
    }
  };
</script>

<style lang="scss" scoped>
.container_paget{
  height: 91%;
  overflow-y: hidden;

}

.layout-dasboard__content{
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.payNavbar-buttom{
  height: 9%;
}
</style>
<style lang="scss" scoped>
.section_page {
  background: white;
  height: 100%;
  width: 100%;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  overflow: hidden;
}
</style>