
<script setup lang="ts">
import { computed } from 'vue'
import type { Reserva } from '@/shared/types/reserva'
import {
  ALTURA_HORA,
  HORA_FINAL,
  HORA_INICIAL,
  criarDataHora,
  formatarData,
  formatarHora,
} from '@/shared/helpers/agenda'

const props = defineProps<{
  salaId: number
  datas: Date[]
  reservas: Reserva[]
  carregando?: boolean
}>()

const emit = defineEmits<{
  selecionarReserva: [reserva: Reserva]
  selecionarHorario: [dados: { salaId: number; inicio: string; fim: string }]
}>()

const linhas = computed(() =>
  Array.from(
    { length: (HORA_FINAL - HORA_INICIAL) * 2 },
    (_, indice) => indice,
  ),
)

const alturaGrade = (HORA_FINAL - HORA_INICIAL) * ALTURA_HORA

function chaveData(data: Date): string {
  return formatarData(data)
}

function nomeDia(data: Date): string {
  return data.toLocaleDateString('pt-BR', { weekday: 'short' })
}

function reservasDoDia(data: Date): Reserva[] {
  const chave = chaveData(data)

  return props.reservas.filter(
    (reserva) =>
      !reserva.cancelada &&
      formatarData(new Date(reserva.inicio)) === chave,
  )
}

function posicaoReserva(reserva: Reserva) {
  const inicio = new Date(reserva.inicio)
  const fim = new Date(reserva.fim)

  const minutosInicio =
    inicio.getHours() * 60 + inicio.getMinutes() - HORA_INICIAL * 60

  const minutosFim =
    fim.getHours() * 60 + fim.getMinutes() - HORA_INICIAL * 60

  const inicioVisivel = Math.max(minutosInicio, 0)
  const fimVisivel = Math.min(
    minutosFim,
    (HORA_FINAL - HORA_INICIAL) * 60,
  )

  return {
    top: `${(inicioVisivel / 60) * ALTURA_HORA}px`,
    height: `${Math.max(((fimVisivel - inicioVisivel) / 60) * ALTURA_HORA, 24)}px`,
  }
}

function horarioOcupado(
  data: Date,
  inicio: string,
  fim: string,
): boolean {
  const inicioMs = new Date(inicio).getTime()
  const fimMs = new Date(fim).getTime()

  return reservasDoDia(data).some((reserva) => {
    const reservaInicio = new Date(reserva.inicio).getTime()
    const reservaFim = new Date(reserva.fim).getTime()

    return inicioMs < reservaFim && reservaInicio < fimMs
  })
}


function selecionarHorario(data: Date, indiceLinha: number) {
  const minutos = indiceLinha * 30
  const hora = HORA_INICIAL + Math.floor(minutos / 60)
  const minuto = minutos % 60

  const inicio = criarDataHora(data, hora, minuto)
  const fimDate = new Date(inicio)
  fimDate.setMinutes(fimDate.getMinutes() + 30)

  const fim = criarDataHora(
    data,
    fimDate.getHours(),
    fimDate.getMinutes(),
  )

  if (new Date(inicio).getTime() < Date.now()) return
  if (horarioOcupado(data, inicio, fim)) return

  emit('selecionarHorario', {
    salaId: props.salaId,
    inicio,
    fim,
  })
}

</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
    <div
      class="grid min-w-[850px]"
      :style="{
        gridTemplateColumns: `68px repeat(${datas.length}, minmax(150px, 1fr))`,
      }"
    >
      <div class="sticky left-0 z-30 border-b border-r border-slate-200 bg-slate-50 p-3">
        <span class="text-xs font-semibold text-slate-500">Horário</span>
      </div>

      <div
        v-for="data in datas"
        :key="chaveData(data)"
        class="border-b border-r border-slate-200 bg-slate-50 p-3 text-center"
      >
        <p class="text-xs font-semibold uppercase text-slate-500">
          {{ nomeDia(data) }}
        </p>
        <p class="mt-1 text-lg font-bold text-[#243B53]">
          {{ data.getDate() }}
        </p>
      </div>

      <div class="sticky left-0 z-20 bg-white">
        <div
          v-for="linha in linhas"
          :key="linha"
          class="flex h-8 items-start justify-center border-b border-slate-100 pt-1 text-[11px] text-slate-500"
        >
          <span v-if="linha % 2 === 0">
            {{ String(HORA_INICIAL + linha / 2).padStart(2, '0') }}:00
          </span>
          <span v-else>
            {{ String(HORA_INICIAL + Math.floor(linha / 2)).padStart(2, '0') }}:30
          </span>
        </div>
      </div>

      <div
        v-for="data in datas"
        :key="`grade-${chaveData(data)}`"
        class="relative border-r border-slate-200"
        :style="{ height: `${alturaGrade}px` }"
      >
        <div
          v-for="linha in linhas"
          :key="linha"
          class="absolute left-0 right-0 border-t"
          :class="linha % 2 === 0 ? 'border-slate-200' : 'border-dashed border-slate-100'"
          :style="{ top: `${linha * ALTURA_HORA / 2}px`, height: `${ALTURA_HORA / 2}px` }"
        >
          <button
            type="button"
            class="absolute inset-0 w-full bg-transparent transition hover:bg-blue-50/70"
            :disabled="new Date(criarDataHora(data, HORA_INICIAL + Math.floor(linha / 2), (linha % 2) * 30)).getTime() < Date.now()"
            aria-label="Selecionar horário"
            @click="selecionarHorario(data, linha)"
          ></button>
        </div>

        <button
          v-for="reserva in reservasDoDia(data)"
          :key="reserva.id"
          type="button"
          class="absolute z-10 mx-1 overflow-hidden rounded-md border border-blue-200 bg-[#E8F1FE] p-2 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md"
          :style="{
            ...posicaoReserva(reserva),
            left: '2px',
            width: 'calc(100% - 8px)',
          }"
          @click="emit('selecionarReserva', reserva)"
        >
          <span class="block truncate text-xs font-semibold text-[#243B53]">
            {{ reserva.titulo }}
          </span>
          <span class="mt-1 block truncate text-[10px] text-slate-600">
            {{ formatarHora(reserva.inicio) }} – {{ formatarHora(reserva.fim) }}
          </span>
          <span class="mt-1 block truncate text-[10px] text-slate-500">
            {{ reserva.responsavel }}
          </span>
        </button>

        <div
          v-if="carregando"
          class="absolute inset-0 z-20 animate-pulse bg-slate-100/60"
        ></div>
      </div>
    </div>
  </div>
</template>
