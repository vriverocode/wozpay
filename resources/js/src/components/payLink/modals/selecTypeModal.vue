<template>
    <q-dialog v-model="dialog" persistent transition-show="scale" transition-hide="scale" class="doneLoan"> 
        <q-card class="bg-white  flex flex-center q-py-md" style="width: 100%; height: 100%">
          <q-card-section class="q-py-none flex column flex-center">
            <div>

            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
  </template>
  <script>
    import { inject, ref, watch } from 'vue';
  
    export default {
      props: {
        dialog: Boolean,
        text: String,
      },
      setup(props) {
        //vue provider
        const dialog = ref(props.dialog);
        const icons = inject('ionIcons')
        const options = [
            
        ]
  
        watch(() => props.dialog, (newValue) => {
          dialog.value = newValue
        });
        
        return{
          dialog,
          icons,
          text:props.text
        }
      },
    }
  
  </script>
  
  <style lang="scss">
  .doneLoan .q-dialog__inner {
    padding:0px
  }
  .doneLoan .q-card {
    max-height: 100%!important;
  }
  .doneLoan .q-dialog__inner--minimized > div{
    max-width: 50%!important;
  }
  .doneIcon {
    animation: doneAppear 1.7s forwards;
  }
  @media screen and (max-width: 780px){
    .doneLoan .q-dialog__inner--minimized > div{
      max-width: 100%!important;
    }
  }
  
  @keyframes doneAppear {
    0% {
      transform: rotate(360deg) scale(0.2);
    }
    70% {
      transform: rotate(0deg) scale(1);
    }
    80% {
      transform: translateY(-20%);
    }
    100%{
      transform: translateY(0%);
    }
  }
  </style>
  