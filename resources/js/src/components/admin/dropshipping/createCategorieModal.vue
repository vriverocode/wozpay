<template>
  <div>
    <q-dialog v-model="dialog" persistent class="productCreate__modal">
      <q-card class="position-relative dialog__product">
        <q-card-section class="flex q-pb-sm w-100 items-center justify-between">
          <div class="text-subtitle1 text-weight-bold">
            Crear nueva categoria
          </div>
          <q-btn color="black" size="xs" round @click="hideModal()">
            <q-icon name="eva-close-outline" size="xs" color="white" class="q-mx-xs " />
          </q-btn>
        </q-card-section>
        <q-linear-progress :value="1" color="black" size="0.125rem" />
        <q-card-section class=" text-center q-pt-md q-pb-none q-px-none card__product " style="    ">
          <div v-if="ready" style="    height: 100%; overflow: hidden;">
            <div class="flex justify-between items-center" style="height: 100%; overflow: hidden;">
              <q-card-section class="q-pt-none q-pb-none q-px-none w-100" style="height: 100%; overflow: none;">
                <q-form @submit="createCategorie()" style="height: 100%; overflow: hidden;">
                  <div class="product_container q-px-md" style="">
                    <div class="w-100">
                      <div class="q-pb-md text-subtitle1 text-bold">
                        Ingresa datos del producto
                      </div>

                      <div class="text-subtitle1 q-py-xs  q-my-xs text-weight-medium">
                        <q-input class="createCategorie-input" outlined clearable :clear-icon="'eva-close-outline'"
                          color="positive" v-model="categorieForm.title" label="Nombre de la categoria"
                          placholder="Ej. Accesorios de viaje compactos" autocomplete="off"
                          :rules="[val => val && val.length > 0 || 'Campo obligatorio']" />
                      </div>
                      <div class="text-subtitle1 q-py-xs  q-my-xs text-weight-medium">
                        <q-input class="createCategorie-input" outlined clearable :clear-icon="'eva-close-outline'"
                          color="positive" v-model="categorieForm.rating" label="Numero de estrellas" autocomplete="off"
                          placholder="Ej. valor de 1 a 5"
                          :rules="[val => val && val.length > 0 || 'Campo obligatorio']" />
                      </div>
                      <div class="text-subtitle1 q-py-xs  q-my-xs text-weight-medium">
                        <q-input class="createCategorie-input" outlined clearable :clear-icon="'eva-close-outline'"
                          color="positive" v-model="categorieForm.reviews" label="Cantidad de reviews"
                          autocomplete="off" placholder="Ej. 100 a 50.000"
                          :rules="[val => val && val.length > 0 || 'Campo obligatorio']" />
                      </div>
                    </div>
                  </div>
                  <div class="flex justify-end q-pb-xl  q-px-md">
                    <q-btn label="Cerrar" color="negative" class="q-mx-sm" @click="hideModal()" />
                    <q-btn label="Crear" color="black" type="submit" :loading="loading" />
                  </div>
                </q-form>
              </q-card-section>
            </div>
          </div>
          <div v-else class="q-py-lg flex flex-center">
            <q-spinner color="primary" size="3em" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { useQuasar } from 'quasar';
import { inject, ref, } from 'vue';
import util from '@/util/numberUtil'
import { useCategorieStore } from '@/services/store/categorie.store';


export default {
  props: {
    show: Boolean,
  },
  emits: ['hiddeModal'],
  setup(props, { emit }) {
    const categorieStore = useCategorieStore();

    const categorieForm = ref({
      title: '',
      reviews: 0,
      rating: 0,
    })
    const dialog = ref(props.show);
    const icons = inject('ionIcons')
    const q = useQuasar()
    const ready = ref(false)
    const numberFormat = util.numberFormat
    const loading = ref(false)

    const createCategorie = () => {
      loading.value = true
      categorieStore.storeCategorie(categorieForm.value)
        .then((response) => {
          if (response.code !== 200) throw response

          setTimeout(() => {
            showNotify('positive', 'Categoria creada con exito')
            hideModal()
            loading.value = false
          }, 1000);
        })
        .catch((response) => {
          console.log(response)
          loading.value = false
        })
    }

    const hideModal = () => {
      emit('hiddeModal')
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


    watch(() => props.show, (newValue) => {
      dialog.value = newValue
      setTimeout(() => {
        ready.value = true
      }, 1000);
    });


    return {
      dialog,
      icons,
      ready,
      categorieForm,
      numberFormat,
      loading,
      hideModal,
      createCategorie,
    }
  }
};
</script>
<style lang="scss">
.card__product {
  height: 93%;
  overflow: hidden;
}

.product_container {
  height: 92%;
  overflow: auto;
}

.imgLabel {
  transition: all 0.5s ease;

  &:hover {
    opacity: 0.6;
  }
}

.createCategorieSelect.q-field--auto-height.q-field--labeled {
  & .q-field__control-container {
    padding-top: 0px !important;
  }
}

.textArea {
  & .q-field__control-container {
    padding-top: 19px !important;
  }

  & .q-field__control {
    border-radius: 10px !important;
  }

  &.q-field--focused .q-field__label,
  &.q-field--float .q-field__label {
    z-index: 100;
    background: white;
    font-weight: 600;
    max-width: 133%;
    transform: translateY(-125%) translateX(4%) scale(0.75) !important;
  }
}

.createCategorieSelect {
  & .q-field__control {
    border-radius: 10px !important;
    height: 50px !important;
    min-height: 50px !important;
  }

  & .q-field__label {
    transform: translateY(0%)
  }

  &.q-field--focused .q-field__label,
  &.q-field--float .q-field__label {
    z-index: 100;
    background: white;
    font-weight: 600;
    max-width: 133%;
    transform: translateY(-125%) translateX(4%) scale(0.75) !important;
  }

  & .q-field__native {
    padding-top: 5px !important;
    font-weight: 500;
  }

  & .q-field__append {
    transform: translateY(-2%)
  }

  & .q-field__messages {
    transform: translateY(-25%) translateX(-1%)
  }

}

.createCategorie-input {
  & .q-field__control {
    border-radius: 10px !important;
    height: 59px
  }

  & .q-field__label {
    transform: translateY(11%)
  }

  &.q-field--focused .q-field__label,
  &.q-field--float .q-field__label {
    z-index: 100;
    background: white !important;
    font-weight: 600;
    max-width: 133%;
    padding: 0px 10px;
    transform: translateY(-125%) translateX(4%) scale(0.75) !important;
  }

  & .q-field__native {
    padding-top: 15px !important;
    font-weight: 600;
  }

  & .q-field__append {
    transform: translateY(5%)
  }

}

@media screen and (max-width: 780px) {
  .card__product {
    height: 92%;
  }

  .product_container {
    height: 91%;
  }

  .createCategorie-input {
    & .q-field__bottom {
      transform: translateY(15px);
    }
  }
}

.noBorderInput {

  border-radius: 10px;
  padding: 0px 0.5rem;


  & input {
    cursor: pointer;
    font-family: "Roboto", sans-serif !important;
    font-style: normal;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.75rem;
    letter-spacing: 0.00937em;
    text-align: end;
  }
}

.productCreate__modal {
  width: 100%;

  & .q-dialog__inner--minimized {
    padding: 13px !important;
  }
}
</style>
<style lang="scss" scoped>
.dialog__product {
  width: 560px;
  transition: all 0.8s ease;
  max-height: 100% !important;
  border-radius: 20px;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.w-100 {
  width: 100%;
}

.negative-back {
  background-color: #ff00001a;
  border-radius: 20px;
}

.button-file {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  box-shadow: 0px 2px 8px 0px rgba(168, 167, 167, 0.829);
}

.cls-button {
  position: absolute;
  right: -10px;
  top: -10px;
  z-index: 15;
}

@media screen and (max-width: 780px) {
  .dialog__product {
    width: 400px;
  }
}
</style>