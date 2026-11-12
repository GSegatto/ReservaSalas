import { http } from './http'
import type { FiltroReserva, Reserva, ReservaPayload } from '@/shared/types/reserva'

export const reservaService = {
  async listar(filtro: FiltroReserva): Promise<Reserva[]> {
    const params = {
      salaId: filtro.salaId ?? undefined,
      data: filtro.data || undefined,
    }
    return (await http.get<Reserva[]>('/reservas', { params })).data
  },
  async criar(payload: ReservaPayload): Promise<Reserva> {
    return (await http.post<Reserva>('/reservas', payload)).data
  },
  async cancelar(id: number): Promise<Reserva> {
    return (await http.patch<Reserva>(`/reservas/${id}/cancelar`)).data
  },
}