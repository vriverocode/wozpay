<template>
  <div class="bg-primary" style="height: 100vh;">
    <div v-if="loading" style="height: 100%; overflow: auto;">
      <div class="q-px-md-xl">
        <div class="q-px-md q-mt-md q-px-md-xl q-pt-lg">
          <div class="recipe__card bg-white q-py-xs ">
            <div class="recipe__card--header flex items-center w-100 q-pa-md q-px-md-lg ">
              <div class="w-50">
                <div>
                  <div class="text-weight-bold text-subtitle1">Comprobante</div>
                  <q-linear-progress rounded size="4px" :value="0.6" style="width: 70%;" color="primary" reverse
                    class="q-mt-none transfer__line" />
                </div>
              </div>
              <div class="w-50 flex justify-end">
                <div class="viewTransaction__icon" v-html="imgByType()" :class="{
                  'viewTransaction__icon--transfer': transactionType == 4,
                  'viewTransaction__icon--transfer fill-red': transactionType == 5
                }" />
              </div>
            </div>
            <div class="q-px-md q-px-md-lg">
              <div class="q-pt-sm q-mt-xs q-pb-sm  recipe__list" v-for="(items, key) in transactionFormat" :key="key">
                <div class="q-pl-xs q-mt- " :class="{
                  'flex': transactionType == 6,
                  'text-subtitle1 text-weight-bold q-pl-xs': index == 'title',
                  'text-grey-8 text-caption text-weight-medium q-pl-xs': index == 'text',
                  'text-primary text-weight-bold text-body1 q-pl-xs': index == 'value',
                  'text-grey-7 text-weight-medium text-caption': index == 'date' || index == 'hour',
                }" v-for="(lines, index) in items" :key="index">
                  <div style="word-wrap: break-word;">
                    <div v-if="!validateChip(lines)">
                      {{ lines }}
                    </div>
                    <q-chip class="q-mx-none" v-else
                      :color="lines == 'Pendiente' || 'Pendiente de aprobación' ? 'warning' : lines == 'Aprobado' ? 'positive' : 'negative'"
                      text-color="white">
                      {{ lines }}
                    </q-chip>
                  </div>
                  <q-icon :name="icons.sharpVerified" size="xs" :color="'terciary'" class="q-mx-xs "
                    v-if="transactionType == 6 && lines == 'Woz Payments'" />
                </div>

              </div>
            </div>
            <div class="q-px-md-xl q-mb-md" v-if="transactionType != 10">
              <div class="q-px-xl q-mt-lg q-px-md-xl q-mx-md-xl">
                <q-btn color="primary" class="w-100 q-pa-md back__to" no-caps label="Volver al incio"
                  @click="router.options.history.state.back == '/transactions' ? router.go(-1) : router.push('/dashboard')">
                </q-btn>
              </div>
            </div>
            <div v-else class="q-px-md-xl q-mb-md text-center text-grey-6 text-weight-medium q-pt-md">
              Gracias por usar Woz Payment
            </div>
          </div>
        </div>
      </div>
      <div class="q-px-md-none q-pb-md">
        <div class="q-px-lg q-mt-lg q-px-md-xl ">
          <a :href="url + 'api/transaction/print/' + transactionType + '/' + transaction.id + '?token=' + token"
            target="_blank" rel="noopener noreferrer">
            <q-btn color="negative" class="w-100 q-pa-md donwload" no-caps>
              <div class="flex flex-center">
                <div class="q-mr-xs q-mt-xs">
                  Descargar
                </div>
                <div v-html="wozIcons.pdf" />
              </div>
            </q-btn>
          </a>
        </div>
      </div>
      <div class="q-px-md-xl q-mb-md text-center q-mt-md text-white"
        style="text-decoration: underline; cursor: pointer;" v-if="transactionType == 10" @click="router.push('/')">
        Salir
      </div>
    </div>
  </div>
</template>
<script>
import { inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import wozIcons from '@/assets/icons/wozIcons'
import { useQuasar } from 'quasar';
import { useTransactionStore } from '@/services/store/transaction.store'
import util from '@/util/numberUtil'
import moment from 'moment';
export default {
  setup() {
    //vue provider
    const icons = inject('ionIcons')
    const route = useRoute();
    const router = useRouter();
    const transactionType = route.params.type
    const id = route.params.id
    const loading = ref(false)
    const storeTransaction = useTransactionStore()
    const transaction = ref({})
    const transactionFormat = ref([])
    const numberFormat = util.numberFormat

    const lines = () => {

      const lines = []
      lines[0] = {
        title: 'Monto',
        text: (transactionType == 10 && transaction.value.coin.id == 2) || (transactionType == 7 && transaction.value.coin.id == 2)
          ? 'Cantidad de dinero (1 USD ≈ ' + 'Gs.' + numberFormat(transaction.value.coin.rate) + ')'
          : 'Cantidad de dinero en Guaranies',
        value: (transactionType == 10 && transaction.value.coin.id == 2) || (transactionType == 7 && transaction.value.coin.id == 2)
          ? `${numberFormat(transaction.value.amount / transaction.value.rate_amount)} ${transaction.value.coin.code} ≈ Gs. ${numberFormat((transaction.value.amount / transaction.value.rate_amount) * transaction.value.coin.rate)}`
          : numberFormat(
            transactionType == 6
              ? 212000
              : transaction.value.amount)
      }

      if (transactionType == 1) {
        lines[1] = {
          title: 'Carga de saldo',
          text: 'Titular Woz Pay',
          value: transaction.value.user.name,
        }
        lines[2] = {
          title: 'Caja de ahorro N°',
          text: 'Documento de identificación',
          value: '916-' + transaction.value.user.dni,
        }
        lines[3] = {
          title: 'Referencia',
          text: 'Referencia de transacción',
          value: transaction.value.operation_id,
        }
      }

      if (transactionType == 2 || transactionType == 3) {
        lines[1] = {
          title: 'Pago de prestamo',
          text: transaction.value.concept,
        }
        lines[2] = {
          title: 'Tipo de pago',
          text: transactionType == 3 ? 'Transeferencia' : 'Tarjeta mediante Tpago',
        }
        lines[3] = {
          title: 'Referencia',
          text: 'Referencia de prestamo',
          value: '619-' + transaction.value.loan.loan_number,
        }
      }

      if (transactionType == 4 || transactionType == 5) {
        lines[1] = {
          title: transactionType == 4 ? 'Recibido de' : 'Enviado a',
          text: 'Titular Woz Pay',
          value: transactionType == 4 ? transaction.value.user_from.user.name : transaction.value.user_to.user.name,

        }
        lines[2] = {
          title: 'Documentación',
          text: 'Documento de identificación',
          value: transactionType == 4 ? numberFormat(transaction.value.user_from.user.dni) : numberFormat(transaction.value.user_to.user.dni),

        }
        lines[3] = {
          title: 'Concepto',
          text: 'Motivo del envío',
          value: transaction.value.concept,
        }
      }

      if (transactionType == 6) {
        lines[1] = {
          title: 'Debito automatico',
          text: 'Woz Payments',
        }
        lines[2] = {
          title: 'Tipo de debito',
          text: 'Debito tarjeta de crédito',
        }
        lines[3] = {
          title: 'Referencia',
          text: 'Cuota anual Prepaga Woz Payments',
          value: '619-' + transaction.value.loan_number,
        }
      }

      if (transactionType == 7) {
        lines[1] = {
          title: 'Monto a recibir',
          value: transaction.value.coin.id == 2
            ? `${numberFormat(transaction.value.amount_to_client / transaction.value.rate_amount)} ${transaction.value.coin.code} ≈ Gs. ${numberFormat((transaction.value.amount_to_client / transaction.value.rate_amount) * transaction.value.coin.rate)}`
            : 'Gs.' + numberFormat(transaction.value.amount_to_client),
        }
        lines[2] = {
          title: 'Titulo del producto',
          text: transaction.value.title,
        }

        lines[3] = {
          title: 'URL',
          value: transaction.value.url,
        }
        lines[4] = {
          title: 'Referencia',
          value: transaction.value.code,
        }
        lines[5] = {
          title: 'Tipo de moneda',
          value: transaction.value.coin.name,
        }
        if (transaction.value.type == 2) {
          lines[6] = {
            title: 'Cobrar por',
            text: transaction.value.for_month + ' meses',
          }
          lines[7] = {
            title: 'Fecha de inicio',
            value: moment(transaction.value.init_day).format('DD/MM/YYYY'),
          }
        }
        lines[transaction.value.type == 2 ? 8 : 6] = {
          title: 'Estado',
          value: transaction.value.status_label,
        }
      }
      if (transactionType == 8) {
        lines[1] = {
          title: 'Titulo del producto',
          text: 'Activación de cuenta internacional',
        }
        lines[2] = {
          title: 'Referencia',
          value: 'N° ' + transaction.value.operation_id,
        }
        lines[3] = {
          title: 'Metodo de pago',
          value: transaction.value.method == 1 ? 'Transferencia' : 'Tarjeta',
        }
        lines[4] = {
          title: 'Estado',
          value: transaction.value.status_label,
        }
      }
      if (transactionType == 9) {
        lines[1] = {
          title: 'Titulo del producto',
          text: transaction.value.package.title,
        }
        lines[2] = {
          title: 'Referencia',
          value: 'N° ' + transaction.value.operation_id,
        }
        lines[3] = {
          title: 'Metodo de pago',
          value: transaction.value.method == 1 ? 'Transferencia' : 'Tarjeta',
        }
        lines[4] = {
          title: 'Estado',
          value: transaction.value.status_label,
        }
      }
      if (transactionType == 10) {
        lines[1] = {
          title: 'Titulo del producto',
          text: transaction.value.links.title,
        }
        lines[2] = {
          title: 'Tipo de moneda',
          value: transaction.value.coin.name,
        }
        lines[3] = {
          title: 'Referencia',
          value: 'N° ' + transaction.value.operation_id,
        }
        lines[4] = {
          title: 'Metodo de pago',
          value: 'Tarjeta',
        }
        lines[5] = {
          title: 'Estado',
          value: transaction.value.status_label,
        }
      }
      if (transactionType == 11) {
        lines[1] = {
          title: 'Titulo del producto',
          text: 'Activación de cuenta dropshipping',
        }
        lines[2] = {
          title: 'Referencia',
          value: 'N° ' + transaction.value.operation_id,
        }
        lines[3] = {
          title: 'Metodo de pago',
          value: transaction.value.method == 1 ? 'Transferencia' : 'Tarjeta',
        }
        lines[4] = {
          title: 'Estado',
          value: transaction.value.status_label,
        }
        lines[5] = {
          title: 'Concepto',
          text: transaction.value.concept,
        }
      }
      if (transactionType == 12) {
        lines[1] = {
          title: 'Cuenta de banco',
          value: transaction.value.account_bank.account_number,
        };
        // lines[2] = {
        //   title: 'Referencia',
        //   value: transaction.value.operation_id,
        // };
        lines[2] = {
          title: 'Banco',
          value: transaction.value.account_bank.bank.name,
        };
        lines[3] = {
          title: 'Metodo de pago',
          value: transaction.value.method_label,
        };

        lines[4] = {
          title: 'Comisión',
          value: 'Gs. ' + numberFormat(transaction.value.comision_by_type) + ' (' + transaction.value.comision_type_label + '%)',
        };
        lines[5] = {
          title: 'Comisión fija',
          value: 'Gs. ' + numberFormat(transaction.value.comision_fixed),
        };
      }
      if (transactionType == 15) {
        let products = JSON.parse(transaction.value.link.products)
        let productText = ""
        products.forEach(product => {
          productText += `- ${product.title} x ${product.quantityOrder} unidad(es) `
        });


        lines[1] = {
          title: 'Producto / Cantidad',
          value: productText,
        }
        lines[2] = {
          title: 'Transacción',
          text: 'Pago de producto',
        },
          lines[3] = {
            title: 'Tipo de moneda',
            value: transaction.value.coin.name,
          }
        lines[4] = {
          title: 'Referencia',
          value: 'N° ' + transaction.value.operation_id,
        }
        lines[5] = {
          title: 'Metodo de pago',
          value: transaction.value.method_label,
        }
        lines[6] = {
          title: 'Estado',
          value: transaction.value.status_label,
        }

      }
      lines.push({
        date: moment(transaction.value.created_at).format('DD/MM/YYYY'),
        hour: moment(transaction.value.created_at).format('hh:mm') + ' hs',
      })
      return lines
    }
    const imgByType = () => {
      if (transactionType == 1) return wozIcons.cargar
      if (transactionType == 2 || transactionType == 3) return wozIcons.cashOutline
      if (transactionType == 4 || transactionType == 5) return wozIcons.transferir
      if (transactionType == 6) return wozIcons.cardOutline
    }
    const getTransaction = () => {
      storeTransaction.getTrasactionByData(transactionType, id, (route.fullPath.includes('10') || route.fullPath.includes('15')))
        .then((data) => {
          transaction.value = data.data
          transactionFormat.value = lines()
          loading.value = true
        })
    }
    const validateChip = (lines) => {
      const refere = ['Aprobado', 'Pendiente', 'Rechazada', 'Pendiente de aprobación']
      return refere.includes(lines)
    }
    onMounted(() => {
      getTransaction()
    })
    return {
      icons,
      loading,
      router,
      route,
      wozIcons,
      transactionFormat,
      imgByType,
      transactionType,
      transaction,
      validateChip,
      url: import.meta.env.VITE_VUE_APP_BACKEND_URL,
      token: localStorage.getItem('id_token')
    }
  }
};
</script>
<style lang="scss" scoped>
.viewTransaction__icon {
  transform: scale(1);
  width: max-content;

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
  border-bottom: 1px solid $grey-5;
}

.boxNoVisible {
  width: 72px;
  height: 72px;
  visibility: hidden;
}

.h-100 {
  height: 100%;
}

#topbarLayout {
  height: 10%;
  width: 100%;
  // border-bottom: 1px solid lightgray;
}
</style>

<style lang="scss">
.viewTransaction__icon.viewTransaction__icon--transfer {
  transform: scale(1) rotate(310deg) !important;

  &.fill-red path {
    fill: red;
    stroke: red;
  }
}
</style>