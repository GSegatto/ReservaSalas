
<script setup lang="ts">
import { computed } from 'vue'
import type { Reserva } from '@/shared/types/reserva'
import { formatarData, formatarHora } from '@/shared/helpers/agenda'

const props = defineProps<{
  data: Date
  reservas: Reserva[]
  carregando?: boolean
}>()

const emit = defineEmits<{
  selecionarDia: [data: string]
  selecionarReserva: [reserva: Reserva]
}>()

const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const dias = computed(() => {
  const ano = props.data.getFullYear()
  const mes = props.data.getMonth()

  const primeiroDia = new Date(ano, mes, 1)
  const ultimoDia = new Date(ano, mes + 1, 0)

  const quantidadeDias =
    Math.ceil((primeiroDia.getDay() + ultimoDia.getDate()) / 7) * 7

  return Array.from({ length: quantidadeDias }, (_, indice) => {
    const dia = new Date(ano, mes, 1 - primeiroDia.getDay() + indice)

    return {
      data: dia,
      chave: formatarData(dia),
      pertenceAoMes: dia.getMonth() === mes,
      hoje: formatarData(dia) === formatarData(new Date()),
    }
  })
})

function reservasDoDia(chave: string): Reserva[] {
  return props.reservas.filter(
    (reserva) =>
      !reserva.cancelada &&
      formatarData(new Date(reserva.inicio)) === chave,
  )
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div class="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
      <div
        v-for="nome in nomesDias"
        :key="nome"
        class="py-3 text-center text-xs font-semibold uppercase text-slate-500"
      >
        {{ nome }}
      </div>
    </div>

    <div class="grid grid-cols-7">
      <div
        v-for="dia in dias"
        :key="dia.chave"
        class="min-h-28 border-b border-r border-slate-100 p-2"
        :class="[
          !dia.pertenceAoMes ? 'bg-slate-50/70' : 'bg-white',
          dia.hoje ? 'bg-blue-50/50' : '',
        ]"
      >
        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition"
          :class="[
            dia.hoje
              ? 'bg-[#003151] text-white'
              : dia.pertenceAoMes
                ? 'text-slate-700 hover:bg-slate-100'
                : 'text-slate-300',
          ]"
          @click="emit('selecionarDia', dia.chave)"
        >
          {{ dia.data.getDate() }}
        </button>

        <div v-if="!carregando" class="mt-2 space-y-1">
          <button
            v-for="reserva in reservasDoDia(dia.chave).slice(0, 3)"
            :key="reserva.id"
            type="button"
            class="block w-full truncate rounded px-1.5 py-1 text-left text-[10px] font-medium text-blue-800 bg-blue-100 transition hover:bg-blue-200"
            :title="`${reserva.titulo} — ${formatarHora(reserva.inicio)}`"
            @click="emit('selecionarReserva', reserva)"
          >
            {{ formatarHora(reserva.inicio) }} {{ reserva.titulo }}
          </button>

          <p
            v-if="reservasDoDia(dia.chave).length > 3"
            class="px-1 text-[10px] font-medium text-slate-500"
          >
            +{{ reservasDoDia(dia.chave).length - 3 }} reservas
          </p>
        </div>

        <div
          v-else
          class="mt-2 h-5 animate-pulse rounded bg-slate-100"
        ></div>
      </div>
    </div>
  </div>

  <p class="mt-3 text-xs text-slate-500">
    Selecione um dia para visualizar os horários disponíveis.
  </p>
</template>
