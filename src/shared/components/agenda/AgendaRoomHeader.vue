<script setup lang="ts">
import type { Sala } from '@/shared/types/sala'

defineProps<{
  sala: Sala
}>()
</script>

<template>
  <header
    class="flex h-[100px] min-w-0 flex-col justify-center gap-2 border-b border-r border-slate-200 bg-white p-3"
  >
    <div class="min-w-0 w-full">
      <h3 class="truncate text-sm font-semibold text-slate-800">
        {{ sala.nome }}
      </h3>

      <p class="mt-1 text-xs text-slate-500">
        {{ sala.capacidade }}
        {{ sala.capacidade === 1 ? 'pessoa' : 'pessoas' }}
      </p>
    </div>
  </header>
</template>