<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AlertMessage from '@/shared/components/AlertMessage.vue'
import { mensagemDeErro } from '@/shared/helpers/erro'
import { useSalaStore } from '@/shared/stores/salaStore'

// Inicializa os recursos de navegação.
const router = useRouter()
// Inicializa as stores de salas.
const salaStore = useSalaStore()

const erro = ref('')
const pesquisa = ref('')

const salasAtivas = computed(() => salaStore.salasAtivas)

// Filtra as salas pelo nome ou pela capacidade.
const salasFiltradas = computed(() => {
  const termo = pesquisa.value.trim().toLowerCase()

  if (!termo) {
    return salasAtivas.value
  }

  return salasAtivas.value.filter((sala) => {
    const nomeCorresponde = sala.nome.toLowerCase().includes(termo)
    const capacidadeCorresponde = String(sala.capacidade).includes(termo)

    return nomeCorresponde || capacidadeCorresponde
  })
})

const apiBaseUrl = (import.meta.env.VITE_API_URL as string)
  .replace(/\/api\/?$/, '')

function imagemDaSala(imagemUrl: string | null): string | null {
  if (!imagemUrl) return null

  // Se já for um endereço completo, utiliza diretamente.
  if (imagemUrl.startsWith('http')) {
    return imagemUrl
  }

  // Monta o endereço da imagem utilizando a mesma lógica da agenda.
  return `${apiBaseUrl}${imagemUrl.startsWith('/') ? imagemUrl : `/${imagemUrl}`}`
}

// Abre a agenda individual da sala selecionada.
function abrirAgenda(salaId: number) {
  router.push({
    name: 'agenda-sala',
    params: {
      id: salaId,
    },
  })
}

// Carrega as salas quando a página é aberta.
onMounted(async () => {
  erro.value = ''

  try {
    await salaStore.carregar()
  } catch (e) {
    erro.value = mensagemDeErro(e)
  }
})
</script>

<template>
  <section class="space-y-8">

    <!-- Cabeçalho da página -->
    <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-2">
        <p class="text-sm font-bold uppercase tracking-[0.16em] text-[#003151]">
          Espaços de trabalho
        </p>

        <h1 class="text-4xl font-bold tracking-tight text-[#243B53]">
          Salas de reunião
        </h1>

        <p class="max-w-xl text-sm leading-relaxed text-slate-500">
          Encontre o espaço ideal para sua reunião, evento ou trabalho
          em equipe.<br />
          Selecione uma sala para visualizar sua agenda.
        </p>
      </div>

      <div class="mt-12 flex items-center justify-between gap-4">
        <!-- Campo de pesquisa -->
        <div class="relative w-full sm:w-96">
          <i
            class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          ></i>

          <input
            v-model="pesquisa"
            type="text"
            placeholder="Buscar por nome ou capacidade..."
            class="w-full rounded-lg border border-slate-200 bg-white py-4 pl-11 pr-4 text-base text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#003151] focus:ring-2 focus:ring-[#003151]/10"
          />
        </div>

        <!-- Botão nova reserva -->
        <button
          type="button"
          class="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#003151] px-7 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#0F528A]"
          @click="router.push('/reservas/nova')"
        >
          <i class="bi bi-plus-lg"></i>
          Nova reserva
        </button>
      </div>
    </div>

    <!-- Mensagem de erro -->
    <AlertMessage
      tipo="erro"
      :mensagem="erro"
    />

    <!-- Carregamento das salas -->
    <div
      v-if="salaStore.carregando"
      class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div
        v-for="n in 4"
        :key="n"
        class="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <div class="aspect-[16/10] bg-slate-100"></div>

        <div class="space-y-3 p-4">
          <div class="h-5 w-3/4 rounded bg-slate-100"></div>
          <div class="h-4 w-1/2 rounded bg-slate-100"></div>
        </div>
      </div>
    </div>

    <template v-else>

      <!-- Título e quantidade de salas -->
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-base font-semibold text-slate-800">
          Espaços disponíveis
        </h2>
      </div>

      <!-- Grade de salas -->
      <div
        v-if="salasFiltradas.length > 0"
        class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <button
          v-for="sala in salasFiltradas"
          :key="sala.id"
          type="button"
          class="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#003151]/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#003151] focus:ring-offset-2"
          @click="abrirAgenda(sala.id)"
        >

          <!-- Imagem da sala -->
          <div class="relative aspect-[16/10] overflow-hidden bg-slate-100">
            <img
              v-if="sala.imagemUrl"
              :src="imagemDaSala(sala.imagemUrl) ?? undefined"
              :alt="`Imagem da ${sala.nome}`"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />

            <!-- Caso a sala não tenha imagem -->
            <div
              v-else
              class="flex h-full items-center justify-center text-slate-400"
            >
              <i class="bi bi-building text-5xl"></i>
            </div>

            <!-- Identificação da sala na imagem -->
            <div
              class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3"
            >
            </div>
          </div>

          <!-- Informações da sala -->
          <div class="space-y-3 p-4">
            <div>
              <h3
                class="text-base font-bold text-[#243B53] transition group-hover:text-[#0F528A]"
              >
                {{ sala.nome }}
              </h3>

              <div class="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <i class="bi bi-people"></i>

                <span>
                  Capacidade para {{ sala.capacidade }}
                  {{ sala.capacidade === 1 ? 'pessoa' : 'pessoas' }}
                </span>
              </div>
            </div>

            <!-- Rodapé do card -->
            <div
              class="flex items-center justify-between border-t border-slate-100 pt-3"
            >
              <span
                class="ml-auto flex items-center gap-1 text-xs font-semibold text-[#003151] transition-all group-hover:gap-2"
              >
                Ver agenda
                <i class="bi bi-arrow-right"></i>
              </span>
            </div>
          </div>
        </button>
      </div>

      <!-- Nenhuma sala encontrada na pesquisa -->
      <div
        v-else-if="salasAtivas.length > 0"
        class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
      >
        <i class="bi bi-search text-4xl text-slate-300"></i>

        <h3 class="mt-4 font-semibold text-slate-700">
          Nenhuma sala encontrada
        </h3>

        <p class="mt-2 text-sm text-slate-500">
          Não encontramos salas com esse nome ou capacidade.
        </p>
      </div>

      <!-- Nenhuma sala cadastrada ou ativa -->
      <div
        v-else
        class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
      >
        <i class="bi bi-building text-4xl text-slate-300"></i>

        <h3 class="mt-4 font-semibold text-slate-700">
          Nenhuma sala disponível
        </h3>

        <p class="mt-2 text-sm text-slate-500">
          Não existem salas ativas cadastradas no momento.
        </p>
      </div>

    </template>
  </section>
</template>