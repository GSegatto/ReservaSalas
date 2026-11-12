import axios, { AxiosError } from 'axios'


// Classe personalizada para representar erros da API.
export class ApiError extends Error { //além de possuir uma mensagem de erro, ela também pode armazenar o código HTTP retornado
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.status = status
  }
}

// Axios configurado com a URL base da API
export const http = axios.create({ baseURL: import.meta.env.VITE_API_URL })

// Converte qualquer erro HTTP em ApiError com a mensagem retornada pela API (RF08)
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ mensagem?: string }>) => {
    if (!error.response) {
      return Promise.reject(
        new ApiError('Não foi possível conectar à API. Verifique se o servidor está em execução.'),
      )
    }
    const mensagem = error.response.data?.mensagem ?? 'Ocorreu um erro inesperado.'
    return Promise.reject(new ApiError(mensagem, error.response.status))
  },
)