<template>
  <div class="q-pt-md">
    <div class="q-mt-sm" v-if="Object.values(linkCard).length > 0 && ready">
      <q-list class="q-px-sm">
        <q-item class="q-px-sm">
          <q-item-section>
            <div class="flex items-center justify-between">
              <div>
                <q-item-label class="q-mt-xs text-weight-bold">
                  <span class="text-body2 text-weight-bold">
                    Tipo de tarjeta
                  </span>
                </q-item-label>
                <q-item-label caption lines="1" class="text-weight-medium text-body2 q-pt-sm">
                  {{ linkCard.type == 1 ? 'Tajeta de crédito' : 'Tarjeta de débito' }}
                </q-item-label>
              </div>
              <div>
                <q-chip :color="linkCard.status == 2 ? 'positive' : linkCard.status == 1 ? 'warning' : 'negative'"
                  text-color="white">
                  {{ linkCard.status == 2 ? 'Vinculada' : linkCard.status == 1 ? 'Pendiente' : 'Rechazada' }}
                </q-chip>
              </div>
            </div>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item class="q-px-sm">
          <q-item-section>
            <div class="">
              <q-item-label class="q-mt-xs text-weight-bold">
                <span class="text-body2 text-weight-bold">
                  Número de tarjeta
                </span>
              </q-item-label>
              <q-item-label caption lines="1" class="text-weight-medium text-body2 q-pt-sm">{{ linkCard.number
              }}</q-item-label>
            </div>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item class="q-px-sm">
          <q-item-section>
            <div class="">
              <q-item-label class="q-mt-xs text-weight-bold">
                <span class="text-body2 text-weight-bold">
                  Vencimiento
                </span>
              </q-item-label>
              <q-item-label caption lines="1" class="text-weight-medium text-body2 q-pt-sm">{{ linkCard.due_date
              }}</q-item-label>
            </div>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item class="q-px-sm">
          <q-item-section>
            <div class="">
              <q-item-label class="q-mt-xs text-weight-bold">
                <span class="text-body2 text-weight-bold">
                  CVC
                </span>
              </q-item-label>
              <q-item-label caption lines="1" class="text-weight-medium text-body2 q-pt-sm">{{ linkCard.cvc
              }}</q-item-label>
            </div>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item class="q-px-sm">
          <q-item-section>
            <div class="">
              <q-item-label class="q-mt-xs text-weight-bold">
                <span class="text-body2 text-weight-bold">
                  Debito automatico
                </span>
              </q-item-label>
              <q-item-label caption lines="1" class="text-weight-medium text-body2 q-pt-sm">
                {{ linkCard.is_autodebit ? 'Si' : 'No' }}
              </q-item-label>
            </div>
          </q-item-section>
        </q-item>
        <q-separator />
      </q-list>
      <div class="q-mt-md q-px-md q-px-md-xl">
        <q-btn color="negative" class="w-100 q-pa-sm" no-caps @click="modalState(true)" label="Eliminar">
        </q-btn>
      </div>
    </div>
    <div v-else-if="Object.values(linkCard).length == 0 && ready">
      <div class="flex flex-center q-px-sm column" style="height: 100vh;">
        <div class="text-weight-bold text-h6 q-mb-xs">
          No tienes tarjetas vinculadas.
        </div>
        <div class="q-mb-xl q-pb-xl">
          <q-btn color="primary" class="w-100 q-py-sm q-px-lg" no-caps label="Iniciar vinculación"
            @click="router.push('link_card')">
          </q-btn>
        </div>
      </div>
    </div>
    <div v-else>
      <q-list class="q-px-sm">
        <q-item class="q-px-sm">
          <q-item-section>
            <div class="">
              <q-item-label class="q-mt-xs text-weight-bold">
                <span class="text-body2 text-weight-bold">
                  <q-skeleton type="text" width="25%" />
                </span>
              </q-item-label>
              <q-item-label caption lines="1" class="text-weight-medium text-body2 q-pt-sm">
                <q-skeleton type="text" width="50%" />
              </q-item-label>
            </div>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item class="q-px-sm">
          <q-item-section>
            <div class="">
              <q-item-label class="q-mt-xs text-weight-bold">
                <span class="text-body2 text-weight-bold">
                  <q-skeleton type="text" width="25%" />
                </span>
              </q-item-label>
              <q-item-label caption lines="1" class="text-weight-medium text-body2 q-pt-sm">
                <q-skeleton type="text" width="50%" />
              </q-item-label>
            </div>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item class="q-px-sm">
          <q-item-section>
            <div class="">
              <q-item-label class="q-mt-xs text-weight-bold">
                <span class="text-body2 text-weight-bold">
                  <q-skeleton type="text" width="25%" />
                </span>
              </q-item-label>
              <q-item-label caption lines="1" class="text-weight-medium text-body2 q-pt-sm">
                <q-skeleton type="text" width="20%" />
              </q-item-label>
            </div>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item class="q-px-sm">
          <q-item-section>
            <div class="">
              <q-item-label class="q-mt-xs text-weight-bold">
                <span class="text-body2 text-weight-bold">
                  <q-skeleton type="text" width="25%" />
                </span>
              </q-item-label>
              <q-item-label caption lines="1" class="text-weight-medium text-body2 q-pt-sm">
                <q-skeleton type="text" width="20%" />
              </q-item-label>
            </div>
          </q-item-section>
        </q-item>
        <q-separator />
      </q-list>
    </div>
    <q-dialog v-model="dialog" persistent backdrop-filter="blur(8px)">
      <q-card style="min-width: 350px">
        <q-card-section class=" q-mt-md">
          <div class="text-subtitle1 text-weight-bold">
            ¿Seguro que deseas eliminar tu tarjeta vinculada?
          </div>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Volver" @click="modalState(false)" />
          <q-btn flat label="Confirmar" :loading="loading" @click="deleteCard()">
            <template v-slot:loading>
              <q-spinner-facebook />
            </template>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { useAuthStore } from '@/services/store/auth.store'
import { useCardStore } from '@/services/store/card.store'
import { inject, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

export default {
  setup() {
    //vue provider
    const user = useAuthStore().user;
    const cardStore = useCardStore()
    const icons = inject('ionIcons')
    const ready = ref(false)
    const loading = ref(false)
    const router = useRouter()
    const q = useQuasar()
    const linkCard = ref({})
    const dialog = ref(false)

    // Methods
    const showNotify = (type, message) => {
      q.notify({
        message: message,
        color: type,
        actions: [
          { icon: 'eva-close-outline', color: 'white', round: true, handler: () => { /* ... */ } }
        ]
      })
    }
    const getLinkCard = () => {
      cardStore.getCard(user.id).then((data) => {
        if (data.code !== 200) throw data
        setTimeout(() => {
          ready.value = true
          linkCard.value = data.data ? Object.assign(data.data) : {}
        }, 1000)
      }).catch((response) => {
        showNotify('negative', response)
      })
    }
    const modalState = (state) => {
      dialog.value = state
    }
    const deleteCard = () => {
      loading.value = true
      cardStore.deleteCard(linkCard.value.id)
        .then((data) => {
          if (data.code !== 200) throw data

          getLinkCard()
          setTimeout(() => {
            loading.value = false
            modalState(false)
          }, 1000);
        }).catch((response) => {
          showNotify('negative', response)
          loading.value = false

        })
    }
    onMounted(() => {
      getLinkCard()
    })
    // Data
    return {
      icons,
      user,
      router,
      ready,
      linkCard,
      loading,
      dialog,
      modalState,
      deleteCard,
    }
  },
}

</script>
<style lang="scss" scoped>
.w-100 {
  width: 100%;
}
</style>
