<template>
  <header class="bg-[#003151] text-white shadow-sm">
    <div class="flex w-full items-center justify-between px-6 py-4 sm:px-8 lg:px-10">

      <!-- Identidade do sistema -->
      <RouterLink to="/reservas" class="-ml-4 flex shrink-0 items-center">
        <img
          :src="logo"
          alt="Logo Reserva de Salas"
          class="h-12 w-auto object-contain"
        />
      </RouterLink>

      <!-- Navegação -->
      <nav class="mr-60 flex items-center gap-7 text-base font-medium">

        <RouterLink
          to="/reservas"
          class="relative py-3 transition-colors hover:text-white/80"
          active-class="font-semibold"
          exact-active-class="after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-white"
        >
          Reservas
        </RouterLink>

        <RouterLink
          to="/salas"
          class="relative py-3 transition-colors hover:text-white/80"
          active-class="font-semibold"
          exact-active-class="after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-white"
        >
          Salas
        </RouterLink>

      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import logo from '@/assets/img/logo.png'
</script>