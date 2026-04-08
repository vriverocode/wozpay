<template>
  <div class="dashboard_container">
    <div style="" class="dashboard_container--details">
      <div class="info__conta">
        <currentUserPersonalInfo />
      </div>
      <div class="dashi">
        <div>
          <capital />
        </div>
        <div>
          <balance />
        </div>
        <div>
          <pays />
        </div>
        <div>
          <withdrawalOrder />
        </div>
        <div>
          <deposit />
        </div>
        <div>
          <profit />
        </div>
        <div class="q-pb-xl">
          <another_profit />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import currentUserPersonalInfo from '@/components/dashboard/currentUserPersonalInfo.vue';
import another_profit from '@/components/admin/dashboard/another_profit.vue';
import balance from '@/components/admin/dashboard/balance.vue';
import capital from '@/components/admin/dashboard/capital.vue';
import profit from '@/components/admin/dashboard/profit.vue';
import pays from '@/components/admin/dashboard/pays.vue'
import deposit from '@/components/admin/dashboard/deposit.vue';
import withdrawalOrder from '@/components/admin/dashboard/withdrawalOrder.vue';
import { useAuthStore } from '@/services/store/auth.store'
import { useWalletStore } from '@/services/store/wallet.store'
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia';

export default {
  components: {
    currentUserPersonalInfo,
    another_profit,
    balance,
    capital,
    profit,
    pays,
    deposit,
    withdrawalOrder,
  },
  setup() {
    const { user } = storeToRefs(useAuthStore())
    const walletStore = useWalletStore()
    const ready = ref(false)
    const capitalBalances = () => {

      walletStore.getBalancesByUser(user.value.id)
        .then((data) => {
          if (!data.code) throw data
          ready.value = true
        }).catch((response) => {
          console.log(response)
        })
    }
    onMounted(() => {
      // capitalBalances()
    })
    return {
      ready
    }
  },
}
</script>
<style lang="scss" scoped>
.dashboard_container {
  height: 100%;
  background: #f2f2f5;
  overflow: hidden;
}

.dashboard_container--details {
  height: 100%;
  overflow: hidden;

}

.dashi {
  max-height: 77%;
  height: max-content;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }

}

.info__conta {
  height: 13rem;
}

@media screen and (max-width: 820px) {
  .dashboard_container {
    height: 100%;
    max-height: fit-content;
    background: #f1f0f0;
    overflow-y: auto;
  }
}
</style>