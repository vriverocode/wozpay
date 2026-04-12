<template>
  <div>
    <div class="q-pl-md-lg q-pl-md q-py-md q-mt-md" style="border-bottom: 1px solid lightgray;">
      <div class="text-h5  text-center text-bold">Links</div>
    </div>
    <div class="q-py-xs">
      <div v-if="load">
        <div v-if="userLinks.length > 0" class="q-px-xs">
          <div v-for="(link, index) in userLinks" :key="index" class="q-mt-md flex items-center justify-between"
            style="cursor: pointer;" @click="getLinkById(link.id)">
            <q-icon name="eva-link-2-outline" size="md" />
            <div class="q-pl-md flex items-center justify-between container__link">
              <div>
                <div class="text-subtitle1 text-weight-medium">Link de pago</div>
                <div class="text-subtitle2 text-weight-regular">N° {{ link.code }}</div>
              </div>
              <div>
                <div class="text-subtitle2  text-right flex items-center w-100 justify-end "
                  :class="{ 'text-grey-6 text-weight-medium': link.pay_status == 3, 'text-terciary text-weight-bold': link.pay_status == 1 || link.pay_status == 2, 'text-negative text-weight-bold': link.pay_status == 0 || link.pay_status == 4 }">
                  <div style="" v-if="link.pay_status == 2" class="q-mr-xs bounce_pay" />
                  <div>
                    {{ link.status == 2 ? moment(link.created_at).format('DD/MM/YYYY') : link.status == 0 ?
                      link.status_label : link.pay_status_label }}
                  </div>
                </div>
                <div style="font-size: 15px;" class="text-weight-medium text-right"
                  :class="{ 'text-positive': link.status == 2, 'text-grey-6': link.status != 2, 'text-negative': link.status == 0 }">
                  {{ link.coin.code }} {{ numberFormat(link.amount / link.rate_amount) }}
                </div>
                <div v-if="link.pay_status != 3" class="text-subtitle2 text-grey-6 text-right text-weight-medium"
                  :id="'timer-item_link-user' + link.id" style="transition: all 1s ease ;" />
              </div>
            </div>
            <q-btn color="black" flat size="xs" class="q-pl-none q-pr-none">
              <q-icon name="eva-more-vertical-outline" size="1.5rem" />
            </q-btn>
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

    <modalActions :show="show" :link="selectedLink" @hiddeModal="hideModal()" @updateLink="updateLink" />
  </div>
</template>
<script>
import { useAuthStore } from '@/services/store/auth.store'
import util from '@/util/numberUtil'
import { inject, ref, onMounted } from 'vue'
import wozIcons from '@/assets/icons/wozIcons';
import { useLinkStore } from '@/services/store/link.store';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import moment from 'moment';
import modalActions from '@/components/admin/links/modalActions.vue';

export default {
  components: {
    modalActions
  },
  setup() {
    //vue provider
    const q = useQuasar()
    const { user } = storeToRefs(useAuthStore())
    const icons = inject('ionIcons')
    const numberFormat = util.numberFormat
    const isReady = ref(false)
    const router = useRouter()
    const route = useRoute()
    const linkStore = useLinkStore()
    const userLinks = ref([])
    const load = ref(false)
    const selectedLink = ref({})
    const show = ref(false)

    const getLinkByUser = () => {
      linkStore.getLinksByUser(route.params.user)
        .then((response) => {
          if (response.code !== 200) throw response
          userLinks.value = response.data
          // clocks(response.data)
          setTimeout(() => {
            load.value = true
          }, 500);


        })
        .catch((response) => {
          console.log(response)
          showNotify('negative', response)
        })
    }
    const getLinkById = (id) => {
      show.value = true
      linkStore.getLinkById(id)
        .then((data) => {
          selectedLink.value = data.data
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
              document.getElementById('timer-item_link-user' + element.id).innerHTML = '00:00:00'
            }, 1000)
            return
          }

          duration = moment.duration(duration - 1000, 'milliseconds');
          let hour = (duration.hours() + '').length == 1 ? '0' + duration.hours() : duration.hours()
          let minutes = (duration.minutes() + '').length == 1 ? '0' + duration.minutes() : duration.minutes()
          let seconds = (duration.seconds() + '').length == 1 ? '0' + duration.seconds() : duration.seconds()
          document.getElementById('timer-item_link-user' + element.id).innerHTML = hour + ":" + minutes + ":" + seconds
        }, 1000)

      });

    }
    const goTo = (id) => {
      router.push('/link/pay/' + id)
    }
    const hideModal = () => {
      show.value = false
      selectedLink.value = {}
    }
    const updateLink = (link) => {
      let index = userLinks.value.findIndex(linkLot => linkLot.id == link.id);

      if (index > -1) {
        userLinks.value[index] = link
      }

      selectedLink.value = link
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
      show,
      selectedLink,
      goTo,
      getLinkById,
      hideModal,
      updateLink
    }
  },
}

</script>
<style lang="scss" scoped>
.container__link {
  border-bottom: 1px solid lightgray;
  width: 89%;
}

.bounce_pay {
  height: 0.9rem;
  width: 0.9rem;
  border-radius: 50%;
  background: red;
  animation: bounce-in 1s alternate-reverse infinite;
}

@media screen and (max-width: 780px) {
  .container__link {
    width: 80%;
  }
}

@keyframes bounce-in {
  0% {
    opacity: 1;
    transform: scale(0.8) translateY(-0.1rem);
  }

  50% {
    opacity: 1;
    transform: scale(1.05) translateY(-0.1rem);
  }

  70% {
    transform: scale(.9) translateY(-0.1rem);
  }

  100% {
    transform: scale(1) translateY(-0.1rem);
  }
}
</style>