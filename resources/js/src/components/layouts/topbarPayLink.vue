<template>
  <div id="topbarLayoutlink" class=" q-pt-none" :style="'background:#'+ (route.query.color ? route.query.color : '0449fa')">
    <div class="w-100 flex flex-center h-100 q-pb-sm q-pt-md-sm q-pt-md position-relative" v-if="loading">
      <div style="position: absolute; left: 0%;">
        <q-btn flat round color="white" size="xl" icon="eva-chevron-left-outline" @click="redirectToHome()" />
      </div>
      <div class="text-weight-bold text-h6 text-white w-100 text-center" >
        {{ route.name == 'deposit_pay' ? 'Carga tu billetera' : route.query.title ??  'Woz Payments'}}
      </div>
      <div class="text-weight-bold text-subtitle1 text-white w-100 text-center q-mt-xs" v-if="route.name != 'form_pay_link'" >
        {{ route.name == 'deposit_pay' ? 'Carga por transferencia' : route.query.subtitle ?? ''}}
      </div>
      <div class="boxNoVisible" style="position: absolute; right: 0%;">
        <transition name="inFade">
          <q-btn v-if="!isShowSideMenu" flat round color="white" size="lg" icon="eva-menu-outline" @click="showSideMenu" />
        </transition>
        <transition name="inFade">
          <q-btn v-if="isShowSideMenu" flat round color="white" size="lg" icon="eva-close-outline" @click="showSideMenu" />
        </transition>
      </div>
    </div>
  </div>
</template>
<script >
  import { inject, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useLinkStore } from '@/services/store/link.store';

  export default {
    setup () {
      //vue provider
      const icons = inject('ionIcons')
      const emitter = inject('emitter');
      const route = useRoute();
      const router = useRouter();
      const isShowSideMenu = ref(false)
      const link = ref({})
      const linkStore = useLinkStore()
      const loading = ref(!(!route.query.title))
      const title = [
        '',
        '',
        'Membresia',
        'Servicio freelancer',
        'Venta',
      ]
      const showSideMenu = () => {
        isShowSideMenu.value = !isShowSideMenu.value 
        emitter.emit('showSideMenu', true);
      }
      const redirectToHome = () => {
        router.go(-1)
      }
      const getLink = () => {
        if(!route.params.code) return
        linkStore.getLinkByCode(route.params.code)
        .then((response) => {

          link.value = response.data
          loading.value = true
        })
      }
      emitter.on('closeMenu', () => {
        showSideMenu()
      })
      onMounted(() => {
        getLink()
        if(route.name == 'deposit_pay') loading.value = true
      })
      return {
        icons,
        route,
        link,
        loading,
        isShowSideMenu,
        title,
        redirectToHome,
        showSideMenu,
      }
    }
  };
</script>
<style lang="scss" scoped>
.w-100 {
  width: 100%;
}
.boxNoVisible {
  width: 72px;
  height: 72px;
  visibility: hidden;
}
.h-100{
  height: 100%;
}
#topbarLayoutlink{
  height: 10%;
  width: 100%;
  // border-bottom: 1px solid lightgray;
}
</style>