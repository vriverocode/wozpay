<template>
  <div class="slider-wrapper q-pa-md">

    <div class="markers-container">
      <div v-for="(point, index) in checkpoints" :key="index" class="marker-bubble"
        :class="{ 'marker-active': modelIndex.valueInTrack === index, 'marker-active3': (modelIndex.valueInTrack == 0.5 && point.value == 15) }"
        :style="{ left: getMarkerPosition(index) }" @click="modelIndex = point; emitSelectedValue(index)">
        <div class="marker-text">{{ point.label }}</div>
      </div>
    </div>

    <q-slider v-model="modelIndex.valueInTrack" :min="0" :max="checkpoints.length - 1" :step="1" snap
      thumb-path="M 4,10 h 22 a 6,6 0 0 1 6,6 v 8 a 6,6 0 0 1 -6,6 h -22 a 6,6 0 0 1 -6,-6 v -8 a 6,6 0 0 1 6,-6 Z"
      track-size="20px" class="custom-orange-slider" @update:model-value="emitSelectedValue" />

    <div class="slider-helper-text text-start">
      Desliza el cursor para ver tus demas fondos
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const valueInTrack = (index) => {
  const totalSteps = 3;
  const percent = (totalSteps - index);
  return percent
}
const checkpoints = [
  { type: 1, days: 7, label: '15%', value: 15, valueInTrack: valueInTrack(2.5) },    // Index 0
  { type: 2, days: 15, label: '10%', value: 10, valueInTrack: valueInTrack(2) },    // Index 1 (Este es tu Step 1 visual)
  { type: 3, days: 30, label: '8%', value: 8, valueInTrack: valueInTrack(1) },      // Index 2
  { type: 4, days: 45, label: '3,9%', value: 3.9, valueInTrack: valueInTrack(0) },  // Index 3
];

// Ajuste 2: Inicializamos en 1 para que arranque en la segunda posición (10%)
const modelIndex = ref(checkpoints[0]);

const emit = defineEmits(['update:modelValue', 'change']);

const emitSelectedValue = (newIndex) => {

  const selectedData = checkpoints[newIndex];
  emit('update:modelValue', selectedData);
  emit('change', selectedData);
};

const getMarkerPosition = (index) => {
  const totalSteps = checkpoints.length - 1;
  const percent = (index / totalSteps) * 100;
  // Ajuste matemático para centrar la burbuja (50px ancho / 2 = 25px)
  return `calc(${percent}% - 25px)`;
};

onMounted(() => {
  emitSelectedValue(0);
})
</script>

<style lang="scss" scoped>
$dark-blue: #2B3A67;
$active-orange: #F5A623;
$thumb-grey: #D3D3D3;
$text-blue: #3355AA;

.slider-wrapper {
  position: relative;
  padding-top: 70px;
  /* CAMBIO CLAVE: Reduje el max-width a 320px.
     Esto obliga a que las marcas estén mucho más juntas (agrupadas).
     Aumenta o disminuye este valor según qué tan pegadas las quieras.
  */
  max-width: 400px;
  margin: 0 auto;
  /* Centrado en el padre */
}

.markers-container {
  position: absolute;
  top: 20px;
  left: calc(45px);
  right: calc(45px);
  height: 60px;
}

.marker-bubble {
  position: absolute;
  width: 40px;
  height: 40px;
  background-color: $dark-blue;
  color: white;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50% 50% 0 50%;
  transform: rotate(45deg);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  /* Agregué cursor pointer para que se pueda hacer click en la burbuja */

  .marker-text {
    transform: rotate(-45deg);
  }

  &.marker-active {
    background-color: $active-orange;
    z-index: 10;
    transform: rotate(45deg) scale(1.15);
    /* Un poco más grande al seleccionarse */
  }

  &.marker-active3 {
    background-color: $active-orange;
    z-index: 10;
    transform: rotate(45deg) scale(1.15);
    /* Un poco más grande al seleccionarse */
  }
}

:deep(.custom-orange-slider) {
  color: $active-orange;

  .q-slider__track-container--h {
    opacity: 1;
    /* Opcional: Bordes redondeados al final del track */
    border-radius: 25px;
  }

  .q-slider__track {
    color: $active-orange !important;
    opacity: 1 !important;
    border-radius: 25px;
  }

  .q-slider__thumb {
    fill: $thumb-grey !important;
    color: transparent !important;

    /* Quitamos el efecto ripple */
    &:before {
      display: none;
    }
  }

  .q-slider__tick {
    display: none;
  }
}

.slider-helper-text {
  color: $text-blue;
  font-size: 12px;
  font-weight: 500;
}
</style>