export interface BloqueioHorario {
  id: string | number
  salaId: number
  titulo: string
  inicio: string
  fim: string
  motivo?: string
}
