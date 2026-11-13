export const HORA_INICIAL = 8
export const HORA_FINAL = 18
export const ALTURA_HORA = 64
export const INTERVALO_MINUTOS = 30

export interface IntervaloHorario {
  inicio: string
  fim: string
}

export function minutosDoDia(data: string | Date): number {
  const valor = data instanceof Date ? data : new Date(data)
  return valor.getHours() * 60 + valor.getMinutes()
}

export function minutosDesdeInicio(data: string | Date): number {
  return minutosDoDia(data) - HORA_INICIAL * 60
}

export function calcularPosicao(inicio: string | Date): number {
  return (minutosDesdeInicio(inicio) / 60) * ALTURA_HORA
}

export function calcularAltura(
  inicio: string | Date,
  fim: string | Date,
): number {
  const duracao = minutosDoDia(fim) - minutosDoDia(inicio)
  return Math.max((duracao / 60) * ALTURA_HORA, 24)
}

export function horariosSeSobrepoem(
  primeiro: IntervaloHorario,
  segundo: IntervaloHorario,
): boolean {
  const inicioA = new Date(primeiro.inicio).getTime()
  const fimA = new Date(primeiro.fim).getTime()
  const inicioB = new Date(segundo.inicio).getTime()
  const fimB = new Date(segundo.fim).getTime()

  return inicioA < fimB && inicioB < fimA
}

export function formatarHora(data: string | Date): string {
  const valor = data instanceof Date ? data : new Date(data)

  return valor.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function formatarData(data: Date): string {
  return data.toLocaleDateString('en-CA')
}

export function criarDataHora(
  data: Date,
  hora: number,
  minuto = 0,
): string {
  const resultado = new Date(data)
  resultado.setHours(hora, minuto, 0, 0)

  // Formata a data e hora no padrão ISO 8601 (YYYY-MM-DDTHH:mm)
  const ano = resultado.getFullYear()
  const mes = String(resultado.getMonth() + 1).padStart(2, '0')
  const dia = String(resultado.getDate()).padStart(2, '0')
  const horas = String(resultado.getHours()).padStart(2, '0')
  const minutos = String(resultado.getMinutes()).padStart(2, '0')

  return `${ano}-${mes}-${dia}T${horas}:${minutos}`
}

export function estaNoPassado(inicio: string | Date): boolean {
  return new Date(inicio).getTime() < Date.now()
}
