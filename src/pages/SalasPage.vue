<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import AlertMessage from '@/shared/components/AlertMessage.vue'
import SalaForm from '@/shared/components/SalaForm.vue'
import SalaList from '@/shared/components/SalaList.vue'
import ConfirmacaoModal from '@/shared/components/ConfirmacaoModal.vue'

import { mensagemDeErro } from '@/shared/helpers/erro'
import { useSalaStore } from '@/shared/stores/salaStore'

import type { Sala, SalaPayload } from '@/shared/types/sala'

const store = useSalaStore()

const erro = ref('')
const sucesso = ref('')

const formAberto = ref(false)
const salaEditando = ref<Sala | null>(null)

// Controle do modal de confirmação
type AcaoSala = 'ativar' | 'desativar' | 'excluir'

const modalAberto = ref(false)
const salaSelecionada = ref<Sala | null>(null)
const acaoPendente = ref<AcaoSala>('desativar')

// Configura o conteúdo do modal de acordo com a ação
const configuracaoModal = computed(() => {
  const configuracoes = {
    ativar: {
      titulo: 'Ativar sala',
      textoConfirmar: 'Sim, ativar',
      tipo: 'ativar' as const,
      mensagem: `Deseja realmente ativar a sala "${salaSelecionada.value?.nome}"?`,
    },

    desativar: {
      titulo: 'Desativar sala',
      textoConfirmar: 'Sim, desativar',
      tipo: 'desativar' as const,
      mensagem: `Deseja realmente desativar a sala "${salaSelecionada.value?.nome}"?`,
    },

    excluir: {
      titulo: 'Excluir sala',
      textoConfirmar: 'Sim, excluir',
      tipo: 'excluir' as const,
      mensagem: `Deseja realmente excluir a sala "${salaSelecionada.value?.nome}"? Ela deixará de aparecer na listagem.`,
    },
  }

  return configuracoes[acaoPendente.value]
})

function limparMensagens() {
  erro.value = ''
  sucesso.value = ''
}

async function carregar() {
  try {
    await store.carregar()
  } catch (e) {
    erro.value = mensagemDeErro(e)
  }
}

function novaSala() {
  limparMensagens()
  salaEditando.value = null
  formAberto.value = true
}

function editar(sala: Sala) {
  limparMensagens()
  salaEditando.value = sala
  formAberto.value = true
}

async function salvar(payload: SalaPayload) {
  limparMensagens()

  try {
    if (salaEditando.value) {
      await store.editar(salaEditando.value.id, payload)
    } else {
      await store.cadastrar(payload)
    }

    sucesso.value = 'Sala salva com sucesso.'
    formAberto.value = false
  } catch (e) {
    erro.value = mensagemDeErro(e)
  }
}

// Abre o modal personalizado
function abrirConfirmacao(sala: Sala, acao: AcaoSala) {
  limparMensagens()

  salaSelecionada.value = sala
  acaoPendente.value = acao
  modalAberto.value = true
}

// Fecha o modal sem executar a ação
function fecharConfirmacao() {
  modalAberto.value = false
  salaSelecionada.value = null
}

// Executa a ação somente após a confirmação
async function confirmarAcao() {
  if (!salaSelecionada.value) return

  const sala = salaSelecionada.value

  limparMensagens()

  try {
    if (acaoPendente.value === 'ativar') {
      await store.ativar(sala.id)
      sucesso.value = 'Sala ativada com sucesso.'
    }

    if (acaoPendente.value === 'desativar') {
      await store.desativar(sala.id)
      sucesso.value = 'Sala desativada com sucesso.'
    }

    if (acaoPendente.value === 'excluir') {
      await store.excluir(sala.id)
      sucesso.value = 'Sala excluída com sucesso.'
    }

    fecharConfirmacao()
  } catch (e) {
    erro.value = mensagemDeErro(e)
  }
}

onMounted(carregar)
</script>

<template>
  <section>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-semibold">Salas</h1>

      <button
        class="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#003151] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0F528A]"
        type="button"
        @click="novaSala"
      >
        + Nova sala
      </button>
    </div>

    <AlertMessage tipo="erro" :mensagem="erro" />
    <AlertMessage tipo="sucesso" :mensagem="sucesso" />

    <SalaForm
      v-if="formAberto"
      :sala="salaEditando"
      @salvar="salvar"
      @cancelar="formAberto = false"
    />

    <p v-if="store.carregando" class="text-sm text-gray-500">
      Carregando...
    </p>

    <SalaList
      v-else
      :salas="store.salas"
      @editar="editar"
      @desativar="abrirConfirmacao($event, 'desativar')"
      @ativar="abrirConfirmacao($event, 'ativar')"
      @excluir="abrirConfirmacao($event, 'excluir')"
    />

    <ConfirmacaoModal
      :aberto="modalAberto"
      :titulo="configuracaoModal.titulo"
      :mensagem="configuracaoModal.mensagem"
      :texto-confirmar="configuracaoModal.textoConfirmar"
      :tipo="configuracaoModal.tipo"
      @confirmar="confirmarAcao"
      @cancelar="fecharConfirmacao"
    />
  </section>
</template>