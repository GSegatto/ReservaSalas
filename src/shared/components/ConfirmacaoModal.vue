<script setup lang="ts">
withDefaults(
  defineProps<{
    aberto: boolean
    titulo: string
    mensagem: string
    textoConfirmar: string
    tipo?: 'ativar' | 'desativar' | 'excluir'
  }>(),
  {
    tipo: 'desativar',
  },
)

const emit = defineEmits<{
  confirmar: []
  cancelar: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="aberto"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
        @click.self="emit('cancelar')"
      >
        <section
          class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          role="dialog"
          aria-modal="true"
          :aria-label="titulo"
        >
          <div
            class="mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold"
            :class="{
              'bg-emerald-100 text-emerald-700': tipo === 'ativar',
              'bg-amber-100 text-amber-700': tipo === 'desativar',
              'bg-slate-100 text-slate-700': tipo === 'excluir',
            }"
          >
            {{ tipo === 'ativar' ? '✓' : tipo === 'desativar' ? '!' : '×' }}
          </div>

          <h2 class="text-lg font-semibold text-slate-800">
            {{ titulo }}
          </h2>

          <p class="mt-2 text-sm leading-relaxed text-slate-600">
            {{ mensagem }}
          </p>

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              @click="emit('cancelar')"
            >
              Cancelar
            </button>

            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
              :class="{
                'bg-emerald-700 hover:bg-emerald-800': tipo === 'ativar',
                'bg-amber-600 hover:bg-amber-700': tipo === 'desativar',
                'bg-slate-700 hover:bg-slate-800': tipo === 'excluir',
              }"
              @click="emit('confirmar')"
            >
              {{ textoConfirmar }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>