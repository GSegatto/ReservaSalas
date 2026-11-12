import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { salaService } from '@/shared/services/salaService'
import type { Sala, SalaPayload } from '@/shared/types/sala'

export const useSalaStore = defineStore('sala', () => {
  const salas = ref<Sala[]>([])
  const carregando = ref(false)
  const salasAtivas = computed(() => salas.value.filter((s) => s.ativa))

  async function carregar() {
    carregando.value = true
    try {
      salas.value = await salaService.listar()
    } finally {
      carregando.value = false
    }
  }

  async function cadastrar(payload: SalaPayload) {
    await salaService.cadastrar(payload)
    await carregar()
  }

  async function editar(id: number, payload: SalaPayload) {
    await salaService.editar(id, payload)
    await carregar()
  }

  async function ativar(id: number) {
  await salaService.ativar(id)
  await carregar()
  }

  async function desativar(id: number) {
    await salaService.desativar(id)
    await carregar()
  }

  async function excluir(id: number) {
  await salaService.excluir(id)
  await carregar()
  }

  

  return { salas, salasAtivas, carregando, carregar, cadastrar, editar, ativar, desativar, excluir }
})