export interface Sala {
  id: number
  nome: string
  capacidade: number
  ativa: boolean
  imagemUrl: string | null
}

export interface SalaPayload {
  nome: string
  capacidade: number
  imagem?: File | null
}
