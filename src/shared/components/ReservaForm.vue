<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Sala } from '@/shared/types/sala'
import type { ReservaPayload } from '@/shared/types/reserva'

const props = defineProps<{
  salas: Sala[]
  enviando: boolean
  valoresIniciais?: {
    salaId: number | null
    inicio: string
    fim: string
  }
}>()

const emit = defineEmits<{
  salvar: [payload: ReservaPayload, limpar: () => void]
}>()

const form = reactive({
  salaId: null as number | null,
  responsavel: '',
  titulo: '',
  inicio: '',
  fim: '',
  participantes: 1,
})

function aplicarValoresIniciais() {
  if (!props.valoresIniciais) return

  form.salaId = props.valoresIniciais.salaId
  form.inicio = props.valoresIniciais.inicio
  form.fim = props.valoresIniciais.fim
}

watch(
  () => props.valoresIniciais,
  aplicarValoresIniciais,
  { immediate: true, deep: true },
)

function limpar() {
  form.salaId = null
  form.responsavel = ''
  form.titulo = ''
  form.inicio = ''
  form.fim = ''
  form.participantes = 1
}

function enviar() {
  emit(
    'salvar',
    {
      salaId: form.salaId ?? 0,
      responsavel: form.responsavel.trim(),
      titulo: form.titulo.trim(),
      inicio: form.inicio ? `${form.inicio}:00` : '',
      fim: form.fim ? `${form.fim}:00` : '',
      participantes: Number(form.participantes),
    },
    limpar,
  )
}
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div class="grid gap-5 sm:grid-cols-2">
      <div>
        <label class="label" for="sala">Sala</label>
        <select id="sala" v-model="form.salaId" class="input" required>
          <option :value="null" disabled>Selecione uma sala...</option>
          <option v-for="sala in salas" :key="sala.id" :value="sala.id">
            {{ sala.nome }} (até {{ sala.capacidade }} pessoas)
          </option>
        </select>
      </div>

      <div>
        <label class="label" for="responsavel">Responsável</label>
        <input
          id="responsavel"
          v-model="form.responsavel"
          class="input"
          type="text"
          maxlength="150"
          placeholder="Nome do responsável"
          required
        />
      </div>

      <div class="sm:col-span-2">
        <label class="label" for="titulo">Título da reunião</label>
        <input
          id="titulo"
          v-model="form.titulo"
          class="input"
          type="text"
          maxlength="200"
          placeholder="Ex.: Reunião de planejamento"
          required
        />
      </div>

      <div>
        <label class="label" for="inicio">Início</label>
        <input
          id="inicio"
          v-model="form.inicio"
          class="input"
          type="datetime-local"
          required
        />
      </div>

      <div>
        <label class="label" for="fim">Fim</label>
        <input
          id="fim"
          v-model="form.fim"
          class="input"
          type="datetime-local"
          required
        />
      </div>

      <div>
        <label class="label" for="participantes">Número de participantes</label>
        <input
          id="participantes"
          v-model.number="form.participantes"
          class="input"
          type="number"
          min="1"
          required
        />
      </div>
    </div>

    <div class="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
      <button class="btn-secondary" type="button" :disabled="enviando" @click="limpar">
        Limpar campos
      </button>

      <button class="btn-primary" type="button" :disabled="enviando" @click="enviar">
        {{ enviando ? 'Salvando...' : 'Confirmar reserva' }}
      </button>
    </div>
  </div>
</template>
