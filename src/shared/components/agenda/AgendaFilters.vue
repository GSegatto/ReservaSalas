
<script setup lang="ts">
import { ref } from 'vue'
import type { Sala } from '@/shared/types/sala'

defineProps<{
  data: string
  horaInicio: string
  horaFim: string
  somenteDisponiveis: boolean
  salaId: number | null
  salas: Sala[]
  pesquisa: string
}>()

const emit = defineEmits<{
  atualizarData: [data: string]
  atualizarHoraInicio: [hora: string]
  atualizarHoraFim: [hora: string]
  atualizarDisponibilidade: [valor: boolean]
  atualizarSala: [salaId: number | null]
  atualizarPesquisa: [valor: string]
  voltarDia: []
  avancarDia: []
  hoje: []
}>()

const filtrosExpandidos = ref(false)
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">

    <!-- Filtros principais -->
    <div class="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_auto] xl:items-end">

      <!-- Pesquisa -->
      <div class="min-w-0">
        <label
          for="pesquisa-sala"
          class="mb-1.5 block text-xs font-semibold text-slate-600"
        >
          Pesquisar sala
        </label>

        <div class="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 transition focus-within:border-[#243B53] focus-within:ring-2 focus-within:ring-[#243B53]/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 shrink-0 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <input
            id="pesquisa-sala"
            :value="pesquisa"
            type="search"
            placeholder="Digite o nome da sala..."
            class="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            @input="emit('atualizarPesquisa', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <!-- Data -->
      <div class="min-w-0">
        <label
          for="agenda-data"
          class="mb-1.5 block text-xs font-semibold text-slate-600"
        >
          Data da agenda
        </label>

        <div class="flex h-11 items-center gap-1 rounded-lg border border-slate-200 px-2">
          <button
            type="button"
            aria-label="Dia anterior"
            class="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-[#243B53]"
            @click="emit('voltarDia')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <input
            id="agenda-data"
            :value="data"
            type="date"
            aria-label="Data da agenda"
            class="w-full min-w-0 bg-transparent px-1 text-sm text-slate-700 outline-none"
            @change="emit('atualizarData', ($event.target as HTMLInputElement).value)"
          />

          <button
            type="button"
            aria-label="Próximo dia"
            class="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-[#243B53]"
            @click="emit('avancarDia')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Seleção de sala -->
      <div class="min-w-0">
        <label
          for="agenda-sala"
          class="mb-1.5 block text-xs font-semibold text-slate-600"
        >
          Sala
        </label>

        <select
          id="agenda-sala"
          :value="salaId ?? ''"
          class="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#243B53] focus:ring-2 focus:ring-[#21645B]/10"
          @change="emit('atualizarSala', ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)"
        >
          <option value="">Todas as salas</option>
          <option v-for="sala in salas" :key="sala.id" :value="sala.id">
            {{ sala.nome }}
          </option>
        </select>
      </div>

      <!-- Expandir filtros -->
      <button
        type="button"
        :aria-expanded="filtrosExpandidos"
        class="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#243B53]/20 px-4 text-sm font-semibold text-[#003151] transition hover:bg-[#243B53]/5"
        @click="filtrosExpandidos = !filtrosExpandidos"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M4 7h16M7 12h10m-7 5h4" />
        </svg>

        Filtros

        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 transition-transform"
          :class="{ 'rotate-180': filtrosExpandidos }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </div>

    <!-- Filtros adicionais -->
    <div
      v-if="filtrosExpandidos"
      class="grid grid-cols-1 gap-4 border-t border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div>
        <label
          for="agenda-hora-inicio"
          class="mb-1.5 block text-xs font-semibold text-slate-600"
        >
          Horário inicial
        </label>

        <input
          id="agenda-hora-inicio"
          :value="horaInicio"
          type="time"
          class="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#243B53]"
          @change="emit('atualizarHoraInicio', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div>
        <label
          for="agenda-hora-fim"
          class="mb-1.5 block text-xs font-semibold text-slate-600"
        >
          Horário final
        </label>

        <input
          id="agenda-hora-fim"
          :value="horaFim"
          type="time"
          class="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#243B53]"
          @change="emit('atualizarHoraFim', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="flex items-center sm:col-span-2 lg:col-span-1">
        <label class="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
          <input
            :checked="somenteDisponiveis"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 accent-[#243B53]"
            @change="emit('atualizarDisponibilidade', ($event.target as HTMLInputElement).checked)"
          />
          Somente salas disponíveis
        </label>
      </div>

      <div class="flex justify-end sm:col-span-2 lg:col-span-3">
        <button
          type="button"
          class="text-xs font-semibold text-[#243B53] transition hover:underline"
          @click="emit('hoje')"
        >
          Voltar para hoje
        </button>
      </div>
    </div>
  </div>
</template>
