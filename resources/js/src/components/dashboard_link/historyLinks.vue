<template>
  <div class="q-pb-xl">
    <div class="">
      <div class="flex justify-between q-px-md q-px-md-lg">
        <div class="text-subtitle1 text-bold">Links generados</div>
        <div class="text-subtitle1 text-decoration-underline text-blue-6 cursor-pointer"
          @click="router.push('/link/allByUser/' + user.id)">
          Ver todos
        </div>
      </div>
      <div class="text-subtitle1  q-pl-md q-pl-md-lg">Últimos 5 de links generados</div>
    </div>
    <div>
      <div v-if="load">
        <div v-if="userLinks.length > 0" class="q-px-md">
          <div v-for="(link, index) in userLinks" :key="index" class="q-mt-md flex items-center " @click="goTo(link.id)"
            style="cursor: pointer;">
            <q-icon name="eva-link-2-outline" size="md" />
            <div style="" class="q-px-md flex items-center justify-between links_lastContainer q-py-sm">
              <div>
                <div class="text-subtitle1 text-weight-medium">Link de pago</div>
                <div class="text-subtitle2 text-weight-regular text-grey-6">Link {{ link.type_label }}</div>
              </div>
              <div>
                <div class="text-subtitle2  text-right "
                  :class="{ 'text-grey-6 text-weight-medium': link.status == 2, 'text-terciary text-weight-bold': link.status == 1, 'text-negative text-weight-bold': link.status == 0 }">
                  {{
                    link.status == 2
                      ? moment(link.created_at).format('DD/MM/YYYY')
                      : link.pay_status == 2
                        ? 'Pendiente de aproba.'
                        : link.status == 1 ? 'Pendiente' : 'Rechazado'
                  }}
                </div>
                <div style="font-size: 15px;" class="text-weight-medium text-right"
                  :class="{ 'text-negative': link.status == 0, 'text-positive': link.status == 2, 'text-grey-6': link.status != 2 && link.status != 0, }">
                  {{ link.coin.code }} {{ numberFormat(link.amount_to_client / link.rate_amount) }}
                </div>
                <!-- <div class="text-subtitle2 text-grey-6 text-right text-weight-medium" :id="'timer-item' + link.id"
                  style="transition: all 1s ease ;" /> -->
              </div>
            </div>

          </div>
        </div>
        <div v-else class="text-center text-h6 q-mt-lg">
          No tienes links creados😞
        </div>
      </div>
      <div v-else>
        <div v-for="n in 5" :key="n" class="q-mt-md flex items-center ">
          <div class="q-pl-sm">
            <q-skeleton type="circle" />
          </div>
          <div style="border-bottom: 1px solid lightgray; width: 85%;"
            class="q-px-md flex items-center justify-between ">
            <div style="width: 50%;">
              <div class="text-subtitle1 text-weight-medium">
                <q-skeleton type="rect" />
              </div>
              <div class="text-subtitle2 text-weight-regular q-mt-sm">
                <q-skeleton type="rect" style="" />
              </div>
            </div>
            <div style="width: 30%;">
              <div class="text-subtitle2  text-right q-mt-xs">
                <q-skeleton type="text" />
              </div>
              <div style="font-size: 15px;" class="text-weight-medium text-right q-mt-xs">
                <q-skeleton type="text" />
              </div>
              <div class="q-mt-xs">
                <q-skeleton type="text" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { useAuthStore } from '@/services/store/auth.store'
import util from '@/util/numberUtil'
import { inject, ref, onMounted } from 'vue'
import wozIcons from '@/assets/icons/wozIcons';
import { useLinkStore } from '@/services/store/link.store';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import moment from 'moment';
export default {
  setup() {
    //vue provider
    const q = useQuasar()
    const { user } = storeToRefs(useAuthStore())
    const icons = inject('ionIcons')
    const numberFormat = util.numberFormat
    const isReady = ref(false)
    const router = useRouter()
    const linkStore = useLinkStore()
    const userLinks = ref([])
    const load = ref(false)

    const getLinkByUser = () => {
      linkStore.getLastFive(user.value.id)
        .then((response) => {
          if (response.code !== 200) throw response
          userLinks.value = response.data
          clocks(response.data)
          setTimeout(() => {
            load.value = true
          }, 500);


        })
        .catch((response) => {
          console.log(response)
          showNotify('negative', response)
        })
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
    const clocks = (data) => {
      const withTime = data.filter((item) => item.status != 2)

      withTime.forEach(element => {

        element.timer = setInterval(() => {
          let today = new Date().getTime();
          let link_due_date = new Date(moment(element.due_time)).getTime();
          let diffTime = link_due_date - today;
          let duration = moment.duration(diffTime, 'milliseconds');

          if (diffTime < 0) {
            clearInterval(element.timer);
            setTimeout(() => {
              document.getElementById('timer-item' + element.id).innerHTML = '00:00:00'
            }, 1000)
            return
          }

          duration = moment.duration(duration - 1000, 'milliseconds');
          let hour = (duration.hours() + '').length == 1 ? '0' + duration.hours() : duration.hours()
          let minutes = (duration.minutes() + '').length == 1 ? '0' + duration.minutes() : duration.minutes()
          let seconds = (duration.seconds() + '').length == 1 ? '0' + duration.seconds() : duration.seconds()
          document.getElementById('timer-item' + element.id).innerHTML = hour + ":" + minutes + ":" + seconds
        }, 1000)

      });

    }
    const goTo = (id) => {
      router.push('/link/pay/' + id)
    }
    onMounted(() => {
      getLinkByUser()
      // window.Echo
      // .channel('userUpdateEvent'+user.id)
      // .listen('UserUpdateEvent', async () => {
      // })
    })
    // Data
    return {
      icons,
      load,
      user,
      moment,
      numberFormat,
      isReady,
      wozIcons,
      userLinks,
      goTo,
      router,
    }
  },
}

</script>
<style lang="scss" scoped>
.links_lastContainer {
  border-bottom: 1px solid lightgray;
  width: 95%;
}

@media screen and (max-width: 780px) {
  .links_lastContainer {
    width: 90%;
  }

}
</style>