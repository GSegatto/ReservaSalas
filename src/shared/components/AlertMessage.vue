<script setup lang="ts">
withDefaults(defineProps<{ tipo: 'erro' | 'sucesso'; mensagem?: string }>(), { mensagem: '' })
</script>

<template>
  <div
    v-if="mensagem"
    role="alert"
    class="mb-4 rounded border px-4 py-3 text-sm"
    :class="
      tipo === 'erro'
        ? 'border-red-300 bg-red-50 text-red-800'
        : 'border-green-300 bg-green-50 text-green-800'
    "
  >
    {{ mensagem }}
  </div>
</template>