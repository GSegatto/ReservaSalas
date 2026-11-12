import { ref } from 'vue'
import { defineStore } from 'pinia'
import { reservaService } from '@/shared/services/reservaService'
import type { FiltroReserva, Reserva, ReservaPayload } from '@/shared/types/reserva'

export const useReservaStore = defineStore('reserva', () => {
  const reservas = ref<Reserva[]>([])
  const carregando = ref(false)
  const filtro = ref<FiltroReserva>({ salaId: null, data: '' })

  async function carregar() {
    carregando.value = true
    try {
      reservas.value = await reservaService.listar(filtro.value)
    } finally {
      carregando.value = false
    }
  }

  async function criar(payload: ReservaPayload) {
    await reservaService.criar(payload)
  }

  async function cancelar(id: number) {
    await reservaService.cancelar(id)
    await carregar()
  }

  return { reservas, filtro, carregando, carregar, criar, cancelar }
})