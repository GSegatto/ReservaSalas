
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AlertMessage from '@/shared/components/AlertMessage.vue'
import ReservaForm from '@/shared/components/ReservaForm.vue'
import { mensagemDeErro } from '@/shared/helpers/erro'
import { useReservaStore } from '@/shared/stores/reservaStore'
import { useSalaStore } from '@/shared/stores/salaStore'
import type { ReservaPayload } from '@/shared/types/reserva'

// Inicializa os recursos de rota e navegação.
const route = useRoute()
const router = useRouter()

// Inicializa as stores de salas e reservas.
const reservaStore = useReservaStore()
const salaStore = useSalaStore()


const erro = ref('')
const sucesso = ref('')
const enviando = ref(false)

// Valores iniciais do formulário, obtidos a partir dos parâmetros da URL.
const valoresIniciais = {
  salaId: Number(route.query.salaId) || null,
  inicio: typeof route.query.inicio === 'string' ? route.query.inicio.slice(0, 16) : '', //slice(0, 16) para ficar apenas YYYY-MM-DDTHH:mm
  fim: typeof route.query.fim === 'string' ? route.query.fim.slice(0, 16) : '',
}

//ReservaPayload é o tipo que representa os dados necessários no formato certo para criar uma nova reserva. 
async function salvar(payload: ReservaPayload, limpar: () => void) {
  erro.value = ''
  sucesso.value = ''
  enviando.value = true

  try {
    await reservaStore.criar(payload)
    sucesso.value = 'Reserva criada com sucesso.'
    limpar()
  } catch (e) {
    erro.value = mensagemDeErro(e)
  } finally {
    enviando.value = false
  }
}

// Carrega as salas ativas quando a página é aberta.
onMounted(async () => {
  try {
    await salaStore.carregar()
  } catch (e) {
    erro.value = mensagemDeErro(e)
  }
})
</script>

<template>

  <div class="flex flex-wrap items-center justify-between gap-3 space-y-6 ">
      <button
        type="button"
        class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#003151]"
        @click="router.back()"
      >
        <i class="bi bi-arrow-left"></i>
        Voltar
      </button>
    </div>

  <section class="mx-auto max-w-4xl space-y-4">
    <!-- Cabeçalho da página -->
    
    <div>
      <p class="text-sm font-medium text-blue-600">AGENDA DE SALAS</p>
      <h1 class="mt-1 text-2xl font-bold text-[#243B53]">Nova reserva</h1>
      <p class="mt-1 text-sm text-slate-500">
        Preencha os dados da reunião para confirmar a reserva.
      </p>
    </div>

    <AlertMessage tipo="erro" :mensagem="erro" />
    <AlertMessage tipo="sucesso" :mensagem="sucesso" />

    <ReservaForm
      :salas="salaStore.salasAtivas"
      :enviando="enviando"
      :valores-iniciais="valoresIniciais"
      @salvar="salvar"
    />
  </section>
</template>
