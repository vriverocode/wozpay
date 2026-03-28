<template>
  <div class="heroSection">
    <section class="q-pt-xl q-px-md hero_content" >
      <div class="overflow" />
      <div class="q-pt-sm q-pl-sm q-pr-md" style="z-index: 2; position: relative;">
        <div class="text-header1">
          WOZ DROPSHIPPING PARAGUAY
        </div>
        <div class="text-header2 q-mt-xs q-pr-sm">
          Genera 6.500.000 Guaraníes mensuales
          vendiendo productos premium
        </div>
        <q-btn color="white" @click="goTo()" text-color="black" label="Comenzar a vender" no-caps id="initDropshipping_button" class="q-mt-lg q-mb-xl" />
      </div>
    </section>
    <div class="videoSection flex justify-center w-100 q-px-md" style="z-index: 2; position: relative;">
      <!-- <video  class="" poster preload="">
        <source src="https://www.youtube.com/watch?v=WQCRK5E4n-g" type="video/mp4" />
      </video> -->
      <iframe class="heroVideo"  src="https://www.youtube-nocookie.com/embed/WQCRK5E4n-g?si=bbf058N7ScsHSaft&amp;controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>
  </div>
</template>
<script >
  import { inject, onMounted, ref } from 'vue';
  import { useQuasar } from 'quasar'
  import { useRouter } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/services/store/auth.store';


  export default {

    setup () {
      //vue provider
      const icons = inject('ionIcons')
      const $q = useQuasar()
      const { user } = storeToRefs(useAuthStore())
      const router = useRouter()
      const goTo = () =>{
        router.push(
          !user.dropshipping_account || user.dropshipping_account.status != 2 
        ? '/dropshipping/activateForm?amount=250000' 
        : '/dropshipping/categories'
        )
      }
      return {
        goTo,
      }

    }
  };
</script>
<style lang="scss">
.heroSection{
  height: 65vh;
  overflow: hidden;
}
.videoSection{
  transform: translateY(-8rem);
  .heroVideo{
    border-radius: 40px;
    width:100%;
    height:215px
  }
  & video {
    border-radius: 40px; height: 250px; width: 70%;
  }
}
#initDropshipping_button{
  padding: 1.2rem 1.5rem;
  border-radius: 1.5rem;
  & .block{
    
    font-weight: 500;
    letter-spacing: 0.8px;
    font-size: 1rem;
  }
  &:before{
    box-shadow: none;
  }
}
.hero_content{
  height: 50vh;
  background: url('https://wozpayments.com/public/images/web/dropshipping/dropshippingHero1.jpg');
  background-size: cover;
  position: relative;
  & .overflow{
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 1;
    background: rgba(0, 0, 0, 0.247);
  }
}
[class*=text-header]{
 
  color: white;
  z-index: 3;

}
.text-header1{
  font-family: 'Amazon Ember Bolder'!important;
  font-weight: bolder;
  font-size: 1.85rem;
  line-height: 1.2;
  letter-spacing: 1px;

}
.text-header2{
  font-family: 'Amazon Ember Regular'!important;
  // font-weight: bolder;
  font-size: .9rem;
  line-height: 1.5;
  letter-spacing: 1px;
}
@media screen and (max-width: 780px){
  
  .heroSection{
    height: 67vh;
    overflow: hidden;
  }
  .hero_content{
    height: 53vh;
  }
  .videoSection{
  transform: translateY(-8rem);

    .heroVideo{
      border-radius: 30px;
      width:100%;
      height:200px
    }
    & video {
      height: 210px; width: 100%;
    }
  }
}

</style>