<script setup lang="ts">
import { formatarDataHora } from '@/shared/helpers/datas'
import type { Reserva } from '@/shared/types/reserva'

defineProps<{ reservas: Reserva[] }>()
const emit = defineEmits<{ cancelar: [reserva: Reserva] }>()
</script>

<template>
  <div class="overflow-x-auto rounded border border-gray-200 bg-white shadow-sm">
    <table class="w-full text-left text-sm">
      <thead class="bg-gray-100 text-gray-600">
        <tr>
          <th class="px-4 py-2">Sala</th>
          <th class="px-4 py-2">Título</th>
          <th class="px-4 py-2">Responsável</th>
          <th class="px-4 py-2">Início</th>
          <th class="px-4 py-2">Fim</th>
          <th class="px-4 py-2">Pessoas</th>
          <th class="px-4 py-2">Situação</th>
          <th class="px-4 py-2 text-right">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="reservas.length === 0">
          <td colspan="8" class="px-4 py-6 text-center text-gray-500">Nenhuma reserva encontrada.</td>
        </tr>
        <tr v-for="r in reservas" :key="r.id" class="border-t border-gray-100">
          <td class="px-4 py-2">{{ r.salaNome }}</td>
          <td class="px-4 py-2">{{ r.titulo }}</td>
          <td class="px-4 py-2">{{ r.responsavel }}</td>
          <td class="px-4 py-2">{{ formatarDataHora(r.inicio) }}</td>
          <td class="px-4 py-2">{{ formatarDataHora(r.fim) }}</td>
          <td class="px-4 py-2">{{ r.participantes }}</td>
          <td class="px-4 py-2">
            <span
              class="rounded px-2 py-0.5 text-xs font-medium"
              :class="r.cancelada ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
            >
              {{ r.cancelada ? 'Cancelada' : 'Ativa' }}
            </span>
          </td>
          <td class="px-4 py-2 text-right">
            <button v-if="!r.cancelada" class="btn-danger" type="button" @click="emit('cancelar', r)">
              Cancelar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>