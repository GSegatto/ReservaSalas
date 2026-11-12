<script setup lang="ts">
import type { Sala } from '@/shared/types/sala'
import type { FiltroReserva } from '@/shared/types/reserva'

defineProps<{ salas: Sala[] }>()
const filtro = defineModel<FiltroReserva>({ required: true })
const emit = defineEmits<{ buscar: []; limpar: [] }>()
</script>

<template>
  <div class="mb-4 grid gap-4 rounded border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-3">
    <div>
      <label class="label" for="filtro-sala">Sala</label>
      <select id="filtro-sala" v-model="filtro.salaId" class="input">
        <option :value="null">Todas</option>
        <option v-for="sala in salas" :key="sala.id" :value="sala.id">{{ sala.nome }}</option>
      </select>
    </div>
    <div>
      <label class="label" for="filtro-data">Data</label>
      <input id="filtro-data" v-model="filtro.data" class="input" type="date" />
    </div>
    <div class="flex items-end gap-2">
      <button class="btn-primary" type="button" @click="emit('buscar')">Filtrar</button>
      <button class="btn-secondary" type="button" @click="emit('limpar')">Limpar</button>
    </div>
  </div>
</template>