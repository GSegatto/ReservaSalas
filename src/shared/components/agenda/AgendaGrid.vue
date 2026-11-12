<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Sala } from '@/shared/types/sala'
import type { Reserva } from '@/shared/types/reserva'
import AgendaTimeColumn from './AgendaTimeColumn.vue'
import AgendaBooking from './AgendaBooking.vue'
import {
  ALTURA_HORA,
  HORA_FINAL,
  HORA_INICIAL,
  calcularAltura,
  calcularPosicao,
  criarDataHora,
} from '@/shared/helpers/agenda'

const props = defineProps<{
  salas: Sala[]
  reservas: Reserva[]
  dataSelecionada: Date
  carregando?: boolean
}>()

const emit = defineEmits<{
  selecionarReserva: [reserva: Reserva]
  selecionarHorario: [dados: { salaId: number; inicio: string; fim: string }]
}>()

const alturaGrade = (HORA_FINAL - HORA_INICIAL) * ALTURA_HORA

const linhas = computed(() =>
  Array.from(
    { length: (HORA_FINAL - HORA_INICIAL) * 2 },
    (_, indice) => indice,
  ),
)

function reservasDaSala(salaId: number) {
  return props.reservas.filter(
    (reserva) => reserva.salaId === salaId && !reserva.cancelada,
  )
}

function posicaoReserva(reserva: Reserva) {
  const inicio = new Date(reserva.inicio)
  const fim = new Date(reserva.fim)
  const inicioGrade = new Date(props.dataSelecionada)
  inicioGrade.setHours(HORA_INICIAL, 0, 0, 0)

  const fimGrade = new Date(props.dataSelecionada)
  fimGrade.setHours(HORA_FINAL, 0, 0, 0)

  const inicioVisivel = new Date(Math.max(inicio.getTime(), inicioGrade.getTime()))
  const fimVisivel = new Date(Math.min(fim.getTime(), fimGrade.getTime()))

  return {
    top: `${calcularPosicao(inicioVisivel)}px`,
    height: `${Math.max(calcularAltura(inicioVisivel, fimVisivel), 24)}px`,
  }
}

function horarioEstaOcupado(
  salaId: number,
  inicio: string,
  fim: string,
): boolean {
  const inicioMs = new Date(inicio).getTime()
  const fimMs = new Date(fim).getTime()

  return reservasDaSala(salaId).some((reserva) => {
    const reservaInicio = new Date(reserva.inicio).getTime()
    const reservaFim = new Date(reserva.fim).getTime()

    return inicioMs < reservaFim && reservaInicio < fimMs
  })
}

function clicarHorario(sala: Sala, indiceLinha: number) {
  const minutos = indiceLinha * 30
  const hora = HORA_INICIAL + Math.floor(minutos / 60)
  const minuto = minutos % 60

  const inicio = criarDataHora(props.dataSelecionada, hora, minuto)
  const fimDate = new Date(inicio)
  fimDate.setMinutes(fimDate.getMinutes() + 30)

  const fim = criarDataHora(
    props.dataSelecionada,
    fimDate.getHours(),
    fimDate.getMinutes(),
  )

  if (new Date(inicio).getTime() < Date.now()) return
  if (horarioEstaOcupado(sala.id, inicio, fim)) return

  emit('selecionarHorario', { salaId: sala.id, inicio, fim })
}

const agendaContainer = ref<HTMLElement | null>(null)

let arrastando = false
let posicaoInicialX = 0
let scrollInicial = 0

function iniciarArraste(event: MouseEvent) {
  if (event.button !== 0 || !agendaContainer.value) return

  arrastando = true
  posicaoInicialX = event.clientX
  scrollInicial = agendaContainer.value.scrollLeft
}

function arrastar(event: MouseEvent) {
  if (!arrastando || !agendaContainer.value) return

  const distancia = event.clientX - posicaoInicialX

  agendaContainer.value.scrollLeft = scrollInicial - distancia
}

function finalizarArraste() {
  arrastando = false
}

</script>

<template>
  <div
  ref="agendaContainer"
  class="agenda-scroll min-h-[660px] w-full cursor-grab select-none overflow-x-auto overflow-y-visible rounded-xl border border-slate-200 bg-white shadow-sm active:cursor-grabbing"  @mousedown="iniciarArraste"
  @mousemove="arrastar"
  @mouseup="finalizarArraste"
  @mouseleave="finalizarArraste"
>
    <div
  class="grid min-w-full"
  :style="{
    gridTemplateColumns: `68px repeat(${salas.length}, minmax(180px, 1fr))`,
  }"
>


      <div class="sticky left-0 z-20 bg-white pt-2">
        <AgendaTimeColumn />
      </div>

      <div
        v-for="sala in salas"
        :key="`grade-${sala.id}`"
        class="relative border-r border-slate-200 bg-white"
        :style="{ height: `${alturaGrade}px` }"
      >
        <div
          v-for="linha in linhas"
          :key="linha"
          class="absolute left-0 right-0 z-0"
          :class="linha % 2 === 0 ? 'border-t border-slate-200' : 'border-t border-dashed border-slate-100'"
          :style="{ top: `${linha * ALTURA_HORA / 2}px`, height: `${ALTURA_HORA / 2}px` }"
        >
          <button
            v-if="linha < linhas.length"
            type="button"
            class="absolute inset-0 w-full cursor-pointer bg-transparent transition hover:bg-blue-50/70 focus:outline-none focus:bg-blue-50"
            :aria-label="`Criar reserva na sala ${sala.nome}`"
            @click="clicarHorario(sala, linha)"
          ></button>
        </div>

        <AgendaBooking
          v-for="reserva in reservasDaSala(sala.id)"
          :key="reserva.id"
          :reserva="reserva"
          :style="{
            top: posicaoReserva(reserva).top,
            height: posicaoReserva(reserva).height,
            left: '4px',
            width: 'calc(100% - 8px)',
          }"
          @selecionar="emit('selecionarReserva', $event)"
        />

        <div
          v-if="carregando"
          class="absolute inset-0 z-20 animate-pulse bg-slate-100/60"
        ></div>
      </div>
    </div>

    <div
      v-if="!carregando && salas.length === 0"
      class="p-10 text-center text-sm text-slate-500"
    >
      Nenhuma sala ativa encontrada.
    </div>
  </div>

  <p class="mt-3 text-xs text-slate-500">
    <span class="mr-2 inline-block h-3 w-3 rounded-sm border border-blue-200 bg-[#E8F1FE] align-middle"></span>
    Reserva confirmada
    <span class="ml-4 mr-2 inline-block h-3 w-3 rounded-sm border border-slate-200 bg-slate-100 align-middle"></span>
    Horário livre
  </p>
</template>

<style scoped>
.agenda-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.agenda-scroll::-webkit-scrollbar {
  display: none;
}
</style>

