<template>
  <div style="height: 91vh;" class="q-pt-md">
    <Transition name="inFade">
      <div v-if="ready" class="h-100 w-100 q-pt-lg">
        <div class="q-px-lg q-pb-md row items-center justify-between">
          <div>
            <div class="text-h5 text-weight-bold">Ordenes de retiro</div>
            <div class="text-caption text-grey-6">Pendientes, aprobadas y rechazadas</div>
          </div>
          <q-btn outline color="primary" label="Filtrar" no-caps @click="filtersDialog = true" />
        </div>

        <div class="q-px-lg q-pb-sm text-caption text-grey-7">
          Filtro activo: <span class="text-weight-medium">{{ statusOptionsMap[selectedStatus] }}</span>
        </div>

        <div v-if="paginatedWithdrawals.length > 0" class="q-px-lg withdrawal__list">
          <div class="withdrawal__item" v-for="withdrawal in paginatedWithdrawals" :key="withdrawal.id">
            <div class="withdrawal__content">
              <div class="main-row">
                <div class="amount-section">
                  <div class="amount-value">
                    Gs. {{ numberFormat(withdrawal.amount) }}
                  </div>
                </div>
                <div class="flex items-center q-gutter-sm">
                  <div class="status-badge" :class="getStatusClass(withdrawal.status)">
                    {{ withdrawal.status_label || "Pendiente" }}
                  </div>
                  <q-btn flat round dense icon="eva-more-vertical-outline">
                    <q-menu auto-close>
                      <q-list style="min-width: 140px">
                        <q-item clickable :disable="Number(withdrawal.status) !== 1"
                          @click="updateStatus(withdrawal.id, 2)">
                          <q-item-section>Aprobar</q-item-section>
                        </q-item>
                        <q-item clickable :disable="Number(withdrawal.status) !== 1"
                          @click="updateStatus(withdrawal.id, 0)">
                          <q-item-section>Rechazar</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </div>

              <div class="bank-section">
                {{ withdrawal.user?.name || "Usuario" }} - {{ numberFormat(withdrawal.user?.dni) }}
              </div>
              <div v-if="withdrawal.account_bank" class="bank-section">
                {{ withdrawal.account_bank.bank ? withdrawal.account_bank.bank.name : "N/A" }}
                <span class="account-number">•••• {{ (withdrawal.account_bank.account_number || "").slice(-4) }}</span>
              </div>

              <div class="info-row">
                <span class="info-label">Comision</span>
                <span class="info-value">Gs. {{ numberFormat((withdrawal.comision_by_type || 0) +
                  (withdrawal.comision_fixed || 0)) }}</span>
                <span class="info-separator">-</span>
                <span class="info-label">Recibira</span>
                <span class="info-value highlight">Gs. {{ numberFormat((withdrawal.amount || 0) -
                  (withdrawal.comision_by_type || 0) - (withdrawal.comision_fixed || 0)) }}</span>
              </div>
              <div class="amount-date q-mt-xs">
                {{ formatDate(withdrawal.created_at) }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="h-100 flex flex-center column">
          <div class="empty-state">
            <div class="empty-icon">
              <q-icon name="eva-checkmark-circle-2-outline" size="6rem" color="grey-4" />
            </div>
            <div class="text-h6 text-weight-medium text-grey-7 q-mt-lg q-mb-sm">
              Sin ordenes para este filtro
            </div>
          </div>
        </div>

        <div v-if="totalPages > 1" class="q-py-md flex flex-center">
          <q-pagination v-model="currentPage" :max="totalPages" direction-links outline color="primary"
            active-design="push" active-color="primary" active-text-color="white" />
        </div>
      </div>

      <div v-else class="q-px-lg">
        <div class="withdrawal__item loading" v-for="n in 6" :key="n">
          <div class="withdrawal__content">
            <div class="main-row">
              <div>
                <q-skeleton type="text" width="160px" height="24px" class="q-mb-xs" />
                <q-skeleton type="text" width="120px" height="16px" />
              </div>
              <q-skeleton type="rect" width="80px" height="24px" style="border-radius: 12px;" />
            </div>
            <q-skeleton type="text" width="200px" height="16px" class="q-mb-sm" />
            <q-skeleton type="text" width="220px" height="14px" />
          </div>
        </div>
      </div>
    </Transition>

    <q-dialog v-model="filtersDialog">
      <q-card style="min-width: 320px">
        <q-card-section class="text-subtitle1 text-weight-medium">
          Filtrar por estado
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-option-group v-model="draftStatus" type="radio" :options="statusOptions" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn flat label="Aplicar" color="primary" @click="applyFilters" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useWithdrawalStore } from "@/services/store/withdrawal.store";
import utils from "@/util/numberUtil";
import moment from "moment";
import "moment/locale/es";

moment.locale("es");

export default {
  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();
    const store = useWithdrawalStore();
    const numberFormat = utils.numberFormat;

    const ready = ref(false);
    const withdrawals = ref([]);
    const currentPage = ref(1);
    const rowsPerPage = 10;

    const filtersDialog = ref(false);
    const selectedStatus = ref("all");
    const draftStatus = ref("all");

    const statusOptions = [
      { label: "Todos", value: "all" },
      { label: "Pendientes", value: "pending" },
      { label: "Aprobadas", value: "approved" },
      { label: "Rechazadas", value: "rejected" },
    ];

    const statusOptionsMap = {
      all: "Todos",
      pending: "Pendientes",
      approved: "Aprobadas",
      rejected: "Rechazadas",
    };

    const totalPages = computed(() => Math.max(1, Math.ceil(withdrawals.value.length / rowsPerPage)));
    const paginatedWithdrawals = computed(() => {
      const start = (currentPage.value - 1) * rowsPerPage;
      return withdrawals.value.slice(start, start + rowsPerPage);
    });

    const formatDate = (date) => moment(date).format("DD MMM YYYY, HH:mm");

    const getStatusClass = (status) => {
      const normalized = Number(status);
      if (normalized === 2) return "status-approved";
      if (normalized === 0) return "status-rejected";
      return "status-pending";
    };

    const normalizeStatusFilter = (status) => {
      const allowed = ["all", "pending", "approved", "rejected"];
      return allowed.includes(status) ? status : "all";
    };

    const notify = (type, message) => {
      $q.notify({
        message,
        color: type,
        actions: [{ icon: "eva-close-outline", color: "white", round: true }],
      });
    };

    const getWithdrawals = async () => {
      ready.value = false;
      const data = await store.getPendingWithdrawals(selectedStatus.value);
      withdrawals.value = Array.isArray(data) ? data : [];
      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value;
      }
      ready.value = true;
    };

    const applyFilters = async () => {
      selectedStatus.value = draftStatus.value;
      currentPage.value = 1;
      await router.replace({
        path: route.path,
        query: selectedStatus.value === "all" ? {} : { status: selectedStatus.value },
      });
      filtersDialog.value = false;
      await getWithdrawals();
    };

    const updateStatus = async (withdrawalId, status) => {
      const result = await store.setPendingWithdrawalStatus(withdrawalId, status);
      if (!result) {
        notify("negative", "No se pudo actualizar el estado del retiro");
        return;
      }
      notify("positive", status === 2 ? "Retiro aprobado" : "Retiro rechazado");
      await getWithdrawals();
    };

    watch(
      () => route.query.status,
      async (statusQuery) => {
        const normalized = normalizeStatusFilter(String(statusQuery || "all"));
        if (normalized !== selectedStatus.value) {
          selectedStatus.value = normalized;
          draftStatus.value = normalized;
          currentPage.value = 1;
          await getWithdrawals();
        }
      }
    );

    onMounted(async () => {
      selectedStatus.value = normalizeStatusFilter(String(route.query.status || "all"));
      draftStatus.value = selectedStatus.value;
      await getWithdrawals();
    });

    return {
      filtersDialog,
      draftStatus,
      statusOptions,
      statusOptionsMap,
      selectedStatus,
      router,
      ready,
      withdrawals,
      currentPage,
      totalPages,
      paginatedWithdrawals,
      numberFormat,
      formatDate,
      getStatusClass,
      applyFilters,
      updateStatus,
    };
  },
};
</script>

<style lang="scss" scoped>
.withdrawal__list {
  overflow-y: auto;
  height: calc(91vh - 190px);
  padding-bottom: 1rem;
}

.withdrawal__item {
  padding: 1.2rem 0;
  border-bottom: 2px solid #e0e0e0;

  &.loading {
    border-bottom-color: #f5f5f5;
  }
}

.withdrawal__content {
  width: 100%;
}

.main-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.amount-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a1a1a;
}

.amount-date {
  font-size: 0.85rem;
  color: #999;
  font-weight: 500;
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.status-pending {
    background: #fff3cd;
    color: #856404;
  }

  &.status-approved {
    background: #d4edda;
    color: #155724;
  }

  &.status-rejected {
    background: #f8d7da;
    color: #721c24;
  }
}

.bank-section {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.account-number {
  color: #999;
  margin-left: 0.5rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.8rem;
}

.info-label {
  color: #999;
}

.info-value {
  color: #666;
  font-weight: 500;

  &.highlight {
    color: #4caf50;
    font-weight: 600;
  }
}

.info-separator {
  color: #ddd;
}

.empty-state {
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  opacity: 0.5;
}
</style>
