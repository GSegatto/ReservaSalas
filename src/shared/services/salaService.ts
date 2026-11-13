import { http } from './http'
import type { Sala, SalaPayload } from '@/shared/types/sala'

//Usa o Axios por meio do arquivo http.ts para fazer requisições HTTP à API

//Preparação dos dados para o envio
function criarFormData(payload: SalaPayload): FormData {
  const dados = new FormData()

  dados.append('Nome', payload.nome)
  dados.append('Capacidade', String(payload.capacidade))

  if (payload.imagem) {
    dados.append('Imagem', payload.imagem)
  }

  return dados
}

//OPERAÇÕES DO SISTEMA
export const salaService = {
  async listar(): Promise<Sala[]> {
    return (await http.get<Sala[]>('/salas')).data
  },

  async cadastrar(payload: SalaPayload): Promise<Sala> {
    return (
      await http.post<Sala>('/salas', criarFormData(payload))
    ).data
  },

  async editar(id: number, payload: SalaPayload): Promise<Sala> {
    return (
      await http.put<Sala>(`/salas/${id}`, criarFormData(payload))
    ).data
  },

  async desativar(id: number): Promise<Sala> {
    return (await http.patch<Sala>(`/salas/${id}/desativar`)).data
  },
  
  async ativar(id: number): Promise<Sala> {
  return (await http.patch<Sala>(`/salas/${id}/ativar`)).data
  },

  async excluir(id: number): Promise<void> {
  await http.delete(`/salas/${id}`)
  },
}
