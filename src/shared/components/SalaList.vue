<script setup lang="ts">
import type { Sala } from '@/shared/types/sala'

defineProps<{ salas: Sala[] }>()

const emit = defineEmits<{
  editar: [sala: Sala]
  desativar: [sala: Sala]
  ativar: [sala: Sala]
  excluir: [sala: Sala]
}>()
</script>

<template>
  <div class="overflow-x-auto rounded border border-gray-200 bg-white shadow-sm">
    <table class="w-full text-left text-sm">
      <thead class="bg-gray-100 text-gray-600">
        <tr>
          <th class="px-4 py-2">Nome</th>
          <th class="px-4 py-2">Capacidade</th>
          <th class="px-4 py-2">Situação</th>
          <th class="px-4 py-2 text-right">Ações</th>
        </tr>
      </thead>

      <tbody>
        <tr v-if="salas.length === 0">
          <td colspan="4" class="px-4 py-6 text-center text-gray-500">
            Nenhuma sala cadastrada. 
          </td>
        </tr>

        <tr
          v-for="sala in salas"
          :key="sala.id"
          class="border-t border-gray-100"
        >
          <td class="px-4 py-2">{{ sala.nome }}</td>
          <td class="px-4 py-2">{{ sala.capacidade }}</td>

          <td class="px-4 py-2">
            <span
              class="rounded px-2 py-0.5 text-xs font-medium"
              :class="
                sala.ativa
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-800'
              "
            >
              {{ sala.ativa ? 'Ativa' : 'Desativada' }}
            </span>
          </td>

          <td class="px-4 py-2 text-right">
            <div class="flex justify-end gap-2">
              <button
                v-if="sala.ativa"
                class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
                type="button"
                @click="emit('desativar', sala)"
              >
                Desativar
              </button>

              <button
                v-else
                class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                type="button"
                @click="emit('ativar', sala)"
              >
                Ativar
              </button>

              <button
                class="btn-secondary"
                type="button"
                @click="emit('editar', sala)"
              >
                Editar
              </button>

              <button
                class="btn-danger"
                type="button"
                @click="emit('excluir', sala)"
              >
                Excluir
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>