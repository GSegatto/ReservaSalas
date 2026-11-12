<script setup lang="ts">
import AppHeader from '@/shared/components/AppHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <AppHeader />
    <main class="mx-auto w-full max-w-none px-4 py-6 sm:px-6 lg:px-8">
      <RouterView />
    </main>
  </div>
</template>
