<template>
  <section class="landing-container">
    <!-- Banner Naranja Superior -->
    <div class="banner-orange">
      <div class="banner-content">
        <h1 class="banner-title">Woz Payments Links</h1>
        <p class="banner-description">
          Genera un link o QR de ventas para tus clientes. Úsalos para cobrar por tus ventas, trabajos
          freelance, o suscripciones mensuales
        </p>
      </div>
    </div>

    <!-- Tarjeta Blanca con Ilustración -->
    <div class="card-section">
      <div class="white-card">
        <div class="illustration-container">
          <!-- Ilustración SVG del smartphone y tarjeta -->
          <img :src="phone" alt="">
        </div>
        <h2 class="card-title">Woz Payments Links</h2>
        <p class="card-description">
          Envía un link de ventas a tus clientes para cobrar por tus ventas, trabajos freelance, o
          suscripciones mensuales
        </p>
      </div>

      <!-- Indicadores de paginación -->
      <div class="pagination-dots">
        <span class="dot active"></span>
        <span class="dot"></span>
      </div>
    </div>

    <!-- Sección Tarifario de retiro -->
    <div class="pricing-section">
      <h3 class="section-title">Tarifario de retiro</h3>
      <h4 class="section-subtitle">Retira tus ganancias</h4>

      <div class="table-container">
        <table class="pricing-table">
          <thead>
            <tr>
              <th>Tipo de cuenta</th>
              <th>Tipo de retiro</th>
              <th>Comisión</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cuenta gratuita</td>
              <td>Instantáneo</td>
              <td>Desde 15%</td>
            </tr>
            <tr>
              <td>Cuenta premium</td>
              <td>Instantáneo</td>
              <td>Desde 15%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Sección Otros retiros -->
    <div class="pricing-section">
      <h3 class="section-title q-mt-md">Otros retiros</h3>
      <h4 class="section-subtitle">Retira tus ganancias</h4>

      <div class="table-container">
        <table class="pricing-table">
          <thead>
            <tr>
              <th>Tipo de cuenta</th>
              <th>Tipo de retiro</th>
              <th>Comisión</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ambas cuentas</td>
              <td>7 días</td>
              <td>10%</td>
            </tr>
            <tr>
              <td>Ambas cuentas</td>
              <td>14 días</td>
              <td>8%</td>
            </tr>
            <tr>
              <td>Ambas cuentas</td>
              <td>30 días</td>
              <td>3,9%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Comisión adicional y botón -->
    <div class="footer-section">
      <p class="additional-commission">
        <span class="commission-label">Comisión</span> + 1.5 USD
      </p>
      <q-btn unelevated no-caps class="start-button" @click="handleStart">
        Comenzar a cobrar
      </q-btn>
    </div>
  </section>
</template>

<script>
import { defineComponent, onMounted } from 'vue'
import phone from '@/assets/images/phone_link.png'
import linkPhone from '@/assets/images/links_de_pagos.jpg'
import { useRouter } from 'vue-router';
export default defineComponent({
  name: 'NewLandingLink',
  setup() {
    const router = useRouter()
    const handleStart = () => {
      // Aquí puedes agregar la lógica para navegar o abrir un modal
      goTo()
    }
    const goTo = () => {
      router.push('/generatePayLink/0')
    }
    onMounted(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    })
    return {
      phone,
      linkPhone,
      handleStart,
    }
  }
})
</script>

<style lang="scss" scoped>
.landing-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 3rem;
}

// Banner Naranja
.banner-orange {
  background: linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%);
  padding: 3rem 1.5rem;
  text-align: center;
  color: white;
}

.banner-content {
  max-width: 800px;
  margin: 0 auto;
}

.banner-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin: 0 0 1rem 0;
  color: white;
  line-height: 1.2;
}

.banner-description {
  font-size: 1.1rem;
  font-weight: 400;
  margin: 0;
  line-height: 1.6;
  opacity: 0.95;
}

// Tarjeta Blanca
.card-section {
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.white-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.illustration-container {
  margin-bottom: 0rem;
  display: flex;
  justify-content: center;
  align-items: center;
}



.card-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #1a1a1a;
  margin: 0 0 0.1rem 0;
}

.card-description {
  font-size: 0.9rem;
  color: #9c9c9c;
  margin: 0;
  line-height: 1.5;
}

// Indicadores de paginación
.pagination-dots {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;

  justify-content: center;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #d0d0d0;
  cursor: pointer;
  transition: background-color 0.3s;

  &.active {
    background-color: $primary
  }
}

// Secciones de tarifario
.pricing-section {
  padding: 0rem 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #1a1a1a;
  text-align: center;
}

.section-subtitle {
  font-size: 1.1rem;
  font-weight: 400;
  color: #1a1a1a;
  margin: 0 0 1.5rem 0;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.pricing-table {
  width: 100%;
  border-collapse: collapse;

  thead {
    background-color: #f8f8f8;
  }

  th {
    padding: 1rem;
    text-align: center;
    font-weight: 700;
    color: #1a1a1a;
    font-size: 0.95rem;
    border-bottom: 2px solid #e0e0e0;
  }

  tbody {
    tr {
      border-bottom: 1px solid #e8e8e8;

      &:last-child {
        border-bottom: none;
      }
    }

    td {
      padding: 1rem;
      text-align: center;
      color: #1a1a1a;
      font-size: 0.9rem;
    }
  }
}

// Footer con comisión y botón
.footer-section {
  padding: 1.8rem 1.5rem;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 0.8rem;
}

.additional-commission {
  margin: 0;
  font-size: 0.9rem;
  color: #0066cc;

  .commission-label {
    font-weight: 700;
  }
}

.start-button {
  background: #0ed90a !important;
  color: white !important;
  font-weight: 700 !important;
  font-size: 1.1rem !important;
  padding: 1rem 2rem !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(14, 217, 10, 0.3) !important;
  width: 100%;
  max-width: 400px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(14, 217, 10, 0.4) !important;
  }

  &:active {
    transform: translateY(0);
  }
}

// Responsive
@media screen and (max-width: 768px) {
  .banner-title {
    font-size: 2rem;
  }

  .banner-description {
    font-size: 0.9rem;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 1.3rem;
  }

  .pricing-table {

    th,
    td {
      padding: 0.75rem 0.5rem;
      font-size: 0.85rem;
    }
  }

  .white-card {
    padding: 2rem 1.5rem;
  }

  .section-subtitle {
    font-size: 1rem;
    margin: 0px 1rem;

  }
}

@media screen and (max-width: 480px) {
  .banner-orange {
    padding: 2rem 1rem;
  }

  .banner-title {
    font-size: 1.75rem;
  }

  .pricing-table {

    th,
    td {
      padding: 0.6rem 0.4rem;
      font-size: 0.8rem;
    }
  }
}
</style>