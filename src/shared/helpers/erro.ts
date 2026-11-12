export function mensagemDeErro(e: unknown): string {
  return e instanceof Error ? e.message : 'Ocorreu um erro inesperado.'
}