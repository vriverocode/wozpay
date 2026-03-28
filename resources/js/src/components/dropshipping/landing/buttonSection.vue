<template>
  <section class=" q-pb-xl q-px-md flex column items-center justify-center w-100 q-pt-md"   >
     <q-btn 
      v-for="(button, key) in buttons" 
      unelevated  
      :key="key" 
      no-caps=""
      :color="button.color" 
      :class="' q-my-xs q-my-md-sm buttons__actionLanding '+button.class"
      @click="goTo(button.to)"
     >
        {{ button.title }}
     </q-btn>
  </section>
</template>
<script>
  import wozIcons from '@/assets/icons/wozIcons'
  import { useAuthStore } from '@/services/store/auth.store'
  import { storeToRefs } from 'pinia';
  import {  inject } from 'vue'
  import { useRouter } from 'vue-router';


  export default {
    setup() {
      //vue provider
      const { user } = storeToRefs(useAuthStore()) 
      const icons =  wozIcons
      const iconis =  inject('ionIcons')
      const router = useRouter()

      // 
      
      const buttons = [
        {
          title:'Productos y Categorias', 
          class:'',
          to:'/dropshipping/categories',
          color:'yellowLanding'
        },
        {
          title:'Guía básica de Dropshipping',
          class:'',
          to:'/manual-dropshipping',
          color:'yellowLanding'
        },
        {
          title:'Activar Membresia anual',
          class:'',
          to: user.value.dropshipping_account?.status != 2 ? '/dropshipping/activateForm?amount=250000' : '/dropshipping/categories',
          color:'positive'
        },
      ]
      const goTo = (id) =>{
        router.push(id)
      }
      return{
        buttons,
        goTo
      }
    },
  }
</script>

<style lang="scss">
.buttons__actionLanding{
  padding: 0.8rem 1.2rem!important;
  border-radius: 1rem!important;
  width: 92%!important;
  & .q-btn__content{
    font-size: 1rem;
    font-weight: 400;
  }
}
.text-title-section{
  font-family: 'Amazon Ember Bolder'!important;
  font-weight: bolder;
  font-size: 0.9rem;
  letter-spacing: -0px;
  padding:  0.6rem .7rem ;
  border-radius: 0.5rem;
  width: max-content;

  transform: translateY(-1rem);
}
.integrationContainer{
  border: 1px solid #f9a826;
  border-radius: 1rem;
  background: rgba(248, 168, 13, 1) ;
}
[class*=text_in_services]{
  background: white;
  width: 97%;
}
.text_in_services{
  border-top-left-radius: 0.9rem;
}
.text_in_services2{
  border-bottom-left-radius: 0.9rem;
}
[class*=service__img--container]{
  border-radius: 1rem;
}

@media screen and (max-width: 780px){
  [class*=text_in_services]{
    width: 94%;
  }
  .buttons__actionLanding{
    padding: 0.9rem 1.2rem!important;
    width: 98%!important;

  }
}
</style>