<script setup lang="ts">
import {
  ALTURA_HORA,
  HORA_FINAL,
  HORA_INICIAL,
} from '@/shared/helpers/agenda'

const horas = Array.from(
  { length: HORA_FINAL - HORA_INICIAL + 1 },
  (_, indice) => HORA_INICIAL + indice,
)
</script>

<template>
  <div
    class="agenda-time-column relative shrink-0 border-r border-slate-200 bg-white"
    :style="{ width: '68px', height: `${(HORA_FINAL - HORA_INICIAL) * ALTURA_HORA}px` }"
  >
    <div
      v-for="hora in horas"
      :key="hora"
      class="absolute left-0 right-0 -translate-y-1/2 pr-3 text-right text-xs font-medium text-slate-500"
      :style="{ top: `${(hora - HORA_INICIAL) * ALTURA_HORA}px` }"
    >
      {{ String(hora).padStart(2, '0') }}:00
    </div>
  </div>
</template>
