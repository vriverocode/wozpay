<template>
    <div class="q-py-sm q-px-md q-px-md-lg q-pb-md">
        <div class=" q-pb-sm">
            <div class="row">
                <div class="col-12 flex items-center justify-between">
                    <div class="text-subtitle1 q-mt-sm text-dark text-weight-bold" v-if="pendingData">
                        Ordenes de retiro pendientes
                    </div>
                </div>
            </div>
        </div>
        <div style="" class="q-mb-sm">
            <div class="quote-section" v-if="pendingData">
                <div class="row q-px-none ">
                    <div class="col-12 bg-white q-px-md q-py-sm flex items-center justify-between justify-md-start loan_card"
                        style="cursor: pointer;"
                        @click="router.push({ path: '/admin/withdrawal/pending', query: { status: 'pending' } })">
                        <div class="">
                            <q-icon name="eva-clock-outline" class="" size="sm" />
                        </div>
                        <div class="flex items-center justify-between  w-80 q-py-xs ">
                            <div class=" q-mr-md-none q-pl-md-md q-pl-xs w-50">
                                <div class="text-weight-medium">Ordenes de retiro</div>
                            </div>
                            <div class="q-ml-md-none q-pl-md-md w-50 text-end">
                                <div class="text-weight-medium text-right" :class="{
                                    'text-terciary': pendingData?.pending_count > 0
                                }">
                                    Total
                                </div>
                                <div class="text-weight-medium text-right" :class="{
                                    'text-terciary': pendingData?.pending_count > 0
                                }">
                                    {{ numberFormat(pendingData?.pending_count || 0) }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="quote-section" v-else>
                <div class="row q-px-none">
                    <div class="col-12 bg-white q-pa-md flex items-center justify-between justify-md-start loan_card"
                        style="">
                        <div style="" class="w-10">
                            <!-- <div v-html="wozIcons.withdrawal" /> -->
                            <q-skeleton type="rect" />
                        </div>
                        <div class="flex items-center justify-between  w-80 ">
                            <div class=" q-mx-sm  w-50">
                                <div class="text-weight-medium"><q-skeleton type="rect" /></div>
                                <div class="text-weight-bold q-mt-xs"><q-skeleton type="rect" /></div>
                            </div>
                            <div class="q-mx-sm w-50 text-end">
                                <div class="text-weight-medium text-right"><q-skeleton type="rect" /></div>
                                <div class="text-weight-medium q-mt-xs text-right"><q-skeleton type="rect" /></div>
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
import { useQuasar } from 'quasar';
import { useWithdrawalStore } from '@/services/store/withdrawal.store'
import { useRouter } from 'vue-router';

export default {
    setup() {
        //vue provider
        const q = useQuasar()
        const user = useAuthStore().user;
        const icons = inject('ionIcons')
        const numberFormat = util.numberFormat
        const pendingData = ref(null)
        const withdrawalStore = useWithdrawalStore()
        const router = useRouter()
        const showNotify = (type, message) => {
            q.notify({
                message: message,
                color: type,
                actions: [
                    { icon: 'eva-close-outline', color: 'white', round: true, handler: () => { /* ... */ } }
                ]
            })
        }

        const loadPendingCount = async () => {
            const data = await withdrawalStore.hasPendingWithdrawal()
            pendingData.value = data || { pending_count: 0, has_pending: false }
        }

        onMounted(() => {
            loadPendingCount()
        })
        // Data
        return {
            icons,
            user,
            numberFormat,
            wozIcons,
            pendingData,
            router,

        }
    },
}

</script>
<style lang="scss" scoped>
.loan_card {
    border-radius: 23px;
    // box-shadow: 0px 5px 5px 0px #aaaaaa
}

.loan_container {
    border-bottom: 1px solid #d3d3d3;
}

.w-80 {
    width: 94%;
}

.w-50 {
    width: 42%;
}

.w-10 {
    width: 6%;
}

@media screen and (max-width: 780px) {
    .w-80 {
        width: 40%;
    }

    .w-50 {
        width: 50%;
    }

    .loan_card>div:nth-child(1) {
        width: 10% !important;
    }

    .loan_card>div:nth-child(2) {
        width: 90% !important;
    }

}
</style>