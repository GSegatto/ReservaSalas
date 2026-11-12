export interface Reserva {
  id: number
  salaId: number
  salaNome: string
  responsavel: string
  titulo: string
  inicio: string
  fim: string
  participantes: number
  cancelada: boolean
}

export interface ReservaPayload {
  salaId: number
  responsavel: string
  titulo: string
  inicio: string
  fim: string
  participantes: number
}

export interface FiltroReserva {
  salaId: number | null
  data: string
}