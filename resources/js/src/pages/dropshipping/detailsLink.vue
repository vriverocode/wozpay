<template>
  <div class="bg-positive " style="height: 100vh;">
    <div v-if="Object.values(link).length > 0" style="height: 100%; overflow: auto;"
      class="q-pb-xl q-pb-md-sm linkContentList">

      <div id="topbarLayoutLink" class="bg-positive q-pt-md q-pt-md-xs">
        <div class="w-100 flex justify-between items-center h-100 q-pb-sm">
          <q-btn flat round color="white" size="md" @click="router.go(-1)">
            <q-icon name="eva-chevron-left-outline" size="xl" />
          </q-btn>

          <div class="text-weight-bold text-white title__text">
            Link generado con éxito
          </div>
          <div class="boxNoVisibleLink">
          </div>
        </div>
      </div>
      <div>
        <div class="q-px-sm q-mt-xs q-px-md-xl">
          <div class="recipe__card bg-white q-py-xs q-mt-lg q-mt-md-none">
            <div class="recipe__card--header flex items-center w-100 q-pa-md q-px-md-lg ">
              <div class="w-50">
                <div>
                  <div class="text-weight-bold text-subtitle1">Detalles</div>
                  <q-linear-progress rounded size="4px" :value="0.6" style="width: 70%;" color="primary" reverse
                    class="q-mt-none transfer__line" />
                </div>
              </div>
            </div>
            <div class="q-px-sm">
              <div class="q-px-sm q-px-md-lg">

                <div class="recipe__list q-pt-sm q-mt-xs q-pt-md-xs q-pb-xs">
                  <div class="text-subtitle1 text-weight-bold q-pl-xs">Link generado</div>
                  <div class="text-primary text-weight-light text-body1 q-px-xs q-py-xs">
                    {{ link.url }}
                  </div>
                </div>
                <!-- <div class="recipe__list q-pt-sm q-mt-xs q-pt-md-xs q-pb-xs flex items-center justify-between">
                  <div>
                    <div class="text-subtitle1 text-weight-bold q-pl-xs">Categoría</div>
                    <div class="text-primary text-weight-medium text-body1 q-px-xs q-py-xs">
                      {{ link.type == 1 ? 'Freelance' : link.type == 4 ? 'Venta' : 'Membresias'  }}
                    </div>
                  </div>
                  <div class="text-grey-5 text-weight-medium text-body1 q-pt-lg">
                    N° {{ link.code }}
                  </div>
                </div> -->
                <div class="recipe__list q-pt-sm q-mt-xs q-pt-md-xs q-pb-xs">
                  <div class="text-subtitle1 text-weight-bold q-pl-xs">Monto total a cobrar</div>
                  <div class="text-primary text-weight-medium text-body1 q-px-xs q-py-xs">
                    {{ link.coin.code }} {{ numberFormat(link.amount / link.coin.rate) }}
                  </div>
                </div>
                <div class="recipe__list q-pt-sm q-mt-xs q-pt-md-xs q-pb-xs">
                  <div class="text-subtitle1 text-weight-bold q-pl-xs">Ganancias de la venta </div>
                  <div class="text-primary text-weight-medium text-body1 q-px-xs q-py-xs">
                    {{ link.coin.code }} {{ numberFormat(link.amount_to_client / link.coin.rate) }}
                  </div>
                </div>
                <div class="recipe__list q-pt-sm q-mt-xs q-pt-md-xs q-pb-xs">
                  <div class="text-subtitle1 text-weight-bold q-pl-xs">Moneda</div>
                  <div class="text-primary text-weight-medium text-body1 q-px-xs q-py-xs">
                    {{ link.coin.name }}
                  </div>
                </div>
                <div class="recipe__list q-pt-sm q-mt-xs q-pt-md-xs q-pb-xs">
                  <div class="text-subtitle1 text-weight-bold q-pl-xs">Duración del link</div>
                  <div class="text-primary text-weight-bold text-body1 q-px-xs q-py-xs">
                    2 horas desde su creación
                  </div>
                </div>
                <div class="recipe__list q-pt-sm q-mt-xs q-pt-md-xs q-pb-xs">
                  <div class="text-subtitle1 text-weight-bold q-pl-xs">Estado</div>
                  <div class="text-primary text-weight-medium text-body1">
                    <q-chip :color="link.status == 2 ? 'positive' : link.status == 1 ? 'terciary' : 'negative'"
                      text-color="white">
                      {{ link.status_label }}
                    </q-chip>
                  </div>
                </div>
              </div>
              <div class=" q-mt-sm q-px-md-md q-mt-md-md">

                <div class="text-subtitle1 text-weight-bold q-pl-xs q-mb-xs">Productos</div>
                <div class="  q-pt-md-xs q-py-md q-px-sm" style="border: 1px solid lightgrey; border-radius:1rem">
                  <div class=" q-px-none q-pb-none q-pt-md-sm flex items-center" style="flex-wrap:nowrap"
                    v-for="product in productsInLink" :key="product.id">
                    <div class="q-mr-xs ">
                      <img :src="product.image" alt="" style="width: 4rem; padding: 0rem 12%">
                    </div>
                    <div class=" q-px-none q-py-xs flex items-center justify-between"
                      style="flex-wrap:nowrap; width: -webkit-fill-available; border-bottom:1px solid lightgrey">

                      <div class=" flex column">
                        <div style="font-weight:500; font-size:1rem; line-break: auto;">
                          {{ product.title }}
                        </div>
                        <div class="text-grey-7 q-mt-xs" style="font-weight:400; font-size:0.95rem;">
                          {{ link.coin.code }} {{ numberFormat(product.pivot.dropper_price / link.coin.rate) }}

                        </div>
                      </div>
                      <div class="text-grey-7 q-mt-xs"
                        style="font-weight:600; font-size:1.1rem;width:9%; text-align:end">
                        x{{ numberFormat(product.pivot.quantity) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="q-px-md-xl q-mb-md">
              <template v-if="link.status == 1">

                <div class="text-h6 text-primary text-center text-weight-medium q-mt-lg q-mt-md-sm">Tiempo restante
                </div>
                <div class="text-h4 text-primary text-center text-weight-medium q-mt-sm q-mt-md-none"
                  :id="'timer-link' + link.id" style="letter-spacing: 5px;" />
                <div class="q-px-xl q-mt-sm q-px-md-xl q-mx-md-xl">
                  <q-btn color="primary" class="w-100 q-pa-md back__to" no-caps label="Copiar link" @click="copyLink()">
                  </q-btn>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import wozIcons from '@/assets/icons/wozIcons'
import { useQuasar } from 'quasar';
import { useLinkStore } from '@/services/store/link.store'
import moment from 'moment';
import util from '@/util/numberUtil'
import productLinkForm from '@/components/dropshipping/link/linkForm.vue';

export default {
  setup() {
    //vue provider
    const icons = inject('ionIcons')
    const route = useRoute();
    const router = useRouter();
    const $q = useQuasar()
    const linkId = route.params.id
    const storeLink = useLinkStore()
    const link = ref({})
    const numberFormat = util.numberFormat
    const productsInLink = ref({});
    const getLink = () => {
      storeLink.getDropshippingLinkById(linkId)
        .then((data) => {
          link.value = data.data
          productsInLink.value = link.value.products_in_link

          clocks()
        })
    }
    const clocks = () => {
      link.value.timer = setInterval(() => {
        let today = new Date().getTime();
        let link_due_date = new Date(moment(link.value.due_date)).getTime();
        let diffTime = link_due_date - today;
        let duration = moment.duration(diffTime, 'milliseconds');

        if (diffTime < 0) {
          clearInterval(link.value.timer);
          setTimeout(() => {
            document.getElementById('timer-link' + link.value.id).innerHTML = '00:00:00'
          }, 1000)
          return
        }

        duration = moment.duration(duration - 1000, 'milliseconds');
        let hour = (duration.hours() + '').length == 1 ? '0' + duration.hours() : duration.hours()
        let minutes = (duration.minutes() + '').length == 1 ? '0' + duration.minutes() : duration.minutes()
        let seconds = (duration.seconds() + '').length == 1 ? '0' + duration.seconds() : duration.seconds()
        document.getElementById('timer-link' + link.value.id).innerHTML = hour + ":" + minutes + ":" + seconds
      }, 1000)

    }

    const copyLink = () => {

      const texto = link.value.url;
      const textArea = document.createElement('textarea');
      textArea.value = texto;
      textArea.style.opacity = 0;
      document.body.appendChild(textArea);
      textArea.select();

      try {
        const success = document.execCommand('copy');
      } catch (err) {
        console.error(err.name, err.message);
      }

      document.body.removeChild(textArea);

      $q.notify({
        message: 'Link copiado exitosamente',
        color: 'positive',
        actions: [
          { icon: 'eva-close-outline', color: 'white', round: true, handler: () => { /* ... */ } }
        ]
      })
    }
    onMounted(() => {
      $q.addressbarColor.set('#0449fb')
      getLink()
    })
    return {
      icons,
      router,
      route,
      wozIcons,
      link,
      numberFormat,
      copyLink,
      moment,
      productsInLink,

    }
  }
};
</script>
<style lang="scss" scoped>
.linkContentList {
  &::-webkit-scrollbar {
    width: 4px;
  }

  /* Track */
  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px grey;
    border-radius: 10px;
  }

  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: rgb(0, 107, 18);
    border-radius: 10px;
  }
}

.title__text {
  font-size: 1.3rem;
}

.donwload {
  border-radius: 15px !important;
}

.back__to {
  border-radius: 50px !important;
}

.w-100 {
  width: 100%;
}

.w-50 {
  width: 50%;
}

.recipe__card {
  border-radius: 20px;

  &--header {
    border-bottom: 1.5px solid $primary;
  }
}

.recipe__list {
  border-bottom: 1px solid $grey-6;
  width: 100%;
  line-break: anywhere
}

.boxNoVisibleLink {
  width: 45px;
  height: 45px;
  visibility: hidden;
}

.h-100 {
  height: 100%;
}

#topbarLayoutLink {
  height: 10%;
  width: 100%;
  // border-bottom: 1px solid lightgray;
}
</style>
