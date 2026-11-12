<script setup lang="ts">
import { reactive, ref, watch, onBeforeUnmount } from 'vue'
import type { Sala, SalaPayload } from '@/shared/types/sala'

const props = defineProps<{ sala: Sala | null }>()
const emit = defineEmits<{ salvar: [payload: SalaPayload]; cancelar: [] }>()

const form = reactive<SalaPayload>({
  nome: '',
  capacidade: 1,
  imagem: null,
})

const arquivoInput = ref<HTMLInputElement | null>(null)
const previaImagem = ref<string | null>(null)
const erroImagem = ref('')
const imagemAtual = ref<string | null>(null)

watch(
  () => props.sala,
  (sala) => {
    form.nome = sala?.nome ?? ''
    form.capacidade = sala?.capacidade ?? 1
    form.imagem = null
    previaImagem.value = null
    erroImagem.value = ''
    imagemAtual.value = sala?.imagemUrl ?? null

    if (arquivoInput.value) {
      arquivoInput.value.value = ''
    }
  },
  { immediate: true },
)

function selecionarImagem(evento: Event) {
  const input = evento.target as HTMLInputElement
  const arquivo = input.files?.[0]

  erroImagem.value = ''
  previaImagem.value = null
  form.imagem = null

  if (!arquivo) return

  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp']

  if (!tiposPermitidos.includes(arquivo.type)) {
    erroImagem.value = 'Selecione uma imagem JPG, PNG ou WebP.'
    input.value = ''
    return
  }

  if (arquivo.size > 5 * 1024 * 1024) {
    erroImagem.value = 'A imagem deve ter no máximo 5 MB.'
    input.value = ''
    return
  }

  form.imagem = arquivo
  previaImagem.value = URL.createObjectURL(arquivo)
}

function removerSelecao() {
  form.imagem = null
  previaImagem.value = null

  if (arquivoInput.value) {
    arquivoInput.value.value = ''
  }
}

function enviar() {
  if (erroImagem.value) return

  emit('salvar', {
    nome: form.nome,
    capacidade: Number(form.capacidade),
    imagem: form.imagem,
  })
}

onBeforeUnmount(() => {
  if (previaImagem.value) {
    URL.revokeObjectURL(previaImagem.value)
  }
})
</script>

<template>
  <div class="mb-6 rounded border border-gray-200 bg-white p-4 shadow-sm">
    <h2 class="mb-3 text-base font-semibold">
      {{ sala ? 'Editar sala' : 'Nova sala' }}
    </h2>

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label class="label" for="nome">Nome</label>
        <input
          id="nome"
          v-model="form.nome"
          class="input"
          type="text"
          maxlength="100"
          required
        />
      </div>

      <div>
        <label class="label" for="capacidade">Capacidade</label>
        <input
          id="capacidade"
          v-model.number="form.capacidade"
          class="input"
          type="number"
          min="1"
          required
        />
      </div>
    </div>

    <div class="mt-4">
      <label class="label" for="imagem">Foto da sala</label>

      <div
        v-if="previaImagem || imagemAtual"
        class="mb-3 max-w-sm overflow-hidden rounded-lg border border-gray-200"
      >
        <img
          :src="previaImagem ?? `http://localhost:5160${imagemAtual}`"
          alt="Pré-visualização da foto da sala"
          class="h-44 w-full object-cover"
        />
      </div>

      <input
        id="imagem"
        ref="arquivoInput"
        class="block w-full max-w-md text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-medium file:text-blue-700 hover:file:bg-blue-100"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        @change="selecionarImagem"
      />

      <p class="mt-1 text-xs text-gray-500">
        JPG, PNG ou WebP. Tamanho máximo: 5 MB.
      </p>

      <p v-if="erroImagem" class="mt-2 text-sm text-red-600">
        {{ erroImagem }}
      </p>

      <button
        v-if="previaImagem"
        class="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
        type="button"
        @click="removerSelecao"
      >
        Remover nova foto
      </button>
    </div>

    <div class="mt-4 flex gap-2">
      <button class="btn-primary" type="button" @click="enviar">
        Salvar
      </button>

      <button class="btn-secondary" type="button" @click="emit('cancelar')">
        Cancelar
      </button>
    </div>
  </div>
</template>
