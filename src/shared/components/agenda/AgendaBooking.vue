<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Reserva } from '@/shared/types/reserva'
import { formatarHora } from '@/shared/helpers/agenda'

const props = defineProps<{
  reserva: Reserva
}>()

const emit = defineEmits<{
  selecionar: [reserva: Reserva]
}>()

// Atualiza a referência do horário atual
const agora = ref(Date.now())

let intervalo: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  intervalo = setInterval(() => {
    agora.value = Date.now()
  }, 60_000)
})

onUnmounted(() => {
  if (intervalo) clearInterval(intervalo)
})

// Identifica o estado da reserva
const status = computed(() => {
  if (props.reserva.cancelada) {
    return 'cancelada'
  }

  const inicio = new Date(props.reserva.inicio).getTime()
  const fim = new Date(props.reserva.fim).getTime()

  if (agora.value < inicio) {
    return 'agendada'
  }

  if (agora.value < fim) {
    return 'andamento'
  }

  return 'concluida'
})

// Classes visuais conforme o estado
const estilos = computed(() => {
  const opcoes = {
    agendada: {
      card: 'border-blue-200 bg-[#E8F1FE] hover:border-blue-400',
      faixa: 'bg-[#367BF5]',
      titulo: 'text-[#243B53]',
      texto: 'text-slate-600',
      etiqueta: 'bg-blue-100 text-blue-700',
      icone: 'bi-calendar-event',
      nome: 'Agendada',
    },
    andamento: {
      card: 'border-emerald-200 bg-emerald-50 hover:border-emerald-400',
      faixa: 'bg-emerald-500',
      titulo: 'text-emerald-900',
      texto: 'text-emerald-700',
      etiqueta: 'bg-emerald-100 text-emerald-700',
      icone: 'bi-play-circle',
      nome: 'Em andamento',
    },
    concluida: {
      card: 'border-slate-200 bg-slate-100 hover:border-slate-300',
      faixa: 'bg-slate-400',
      titulo: 'text-slate-600',
      texto: 'text-slate-500',
      etiqueta: 'bg-slate-200 text-slate-600',
      icone: 'bi-check-circle',
      nome: 'Concluída',
    },
    cancelada: {
      card: 'border-red-200 bg-red-50 hover:border-red-300',
      faixa: 'bg-red-400',
      titulo: 'text-red-800 line-through',
      texto: 'text-red-600',
      etiqueta: 'bg-red-100 text-red-700',
      icone: 'bi-x-circle',
      nome: 'Cancelada',
    },
  }

  return opcoes[status.value]
})
</script>

<template>
  <button
    type="button"
    class="group absolute z-10 w-[calc(100%-8px)] overflow-hidden rounded-md border text-left shadow-sm transition hover:z-20 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    :class="estilos.card"
    :style="{
      top: 'var(--agenda-top)',
      height: 'var(--agenda-height)',
      minHeight: '28px',
    }"
    :title="`${reserva.titulo} — ${reserva.responsavel} | ${estilos.nome}`"
    @click="emit('selecionar', reserva)"
  >
    <!-- Indicador lateral -->
    <span
      class="absolute inset-y-0 left-0 w-1"
      :class="estilos.faixa"
    ></span>

    <span class="flex h-full flex-col overflow-hidden py-1 pl-3 pr-2">
      <!-- Título -->
      <span
        class="truncate text-xs font-semibold"
        :class="estilos.titulo"
      >
        {{ reserva.titulo }}
      </span>

      <!-- Horário -->
      <span
        class="mt-0.5 truncate text-[11px]"
        :class="estilos.texto"
      >
        {{ formatarHora(reserva.inicio) }}–{{ formatarHora(reserva.fim) }}
      </span>

      <!-- Responsável -->
      <span
        v-if="reserva.responsavel"
        class="mt-0.5 truncate text-[11px]"
        :class="estilos.texto"
      >
        {{ reserva.responsavel }}
      </span>

      <!-- Status -->
      <span
        class="mt-1 inline-flex w-fit shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold"
        :class="estilos.etiqueta"
      >
        <i class="bi" :class="estilos.icone"></i>
        {{ estilos.nome }}
      </span>
    </span>
  </button>
</template>