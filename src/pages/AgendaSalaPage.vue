<script setup lang="ts">

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AlertMessage from '@/shared/components/AlertMessage.vue'
import AgendaGrid from '@/shared/components/agenda/AgendaGrid.vue'
import AgendaSemanaGrid from '@/shared/components/agenda/AgendaSemanaGrid.vue'
import AgendaMesGrid from '@/shared/components/agenda/AgendaMesGrid.vue'

import { mensagemDeErro } from '@/shared/helpers/erro'
import { formatarData } from '@/shared/helpers/agenda'

import { reservaService } from '@/shared/services/reservaService'

import { useReservaStore } from '@/shared/stores/reservaStore'
import { useSalaStore } from '@/shared/stores/salaStore'

import type { Reserva } from '@/shared/types/reserva'

type ModoVisualizacao = 'dia' | 'trabalho' | 'semana' | 'mes'

// Inicializa os recursos de rota e navegação.
const route = useRoute()
const router = useRouter()

// Inicializa as stores de salas e reservas.
const salaStore = useSalaStore()
const reservaStore = useReservaStore()

// Estados responsáveis pelas mensagens exibidas na tela.
const erro = ref('')
const sucesso = ref('')

// Controla os indicadores de carregamento da página e das reservas.
const carregandoSala = ref(true)
const carregandoReservas = ref(false)

// Armazena as reservas carregadas para exibição no calendário.
const reservas = ref<Reserva[]>([])

// Armazena a reserva selecionada para exibir seus detalhes no modal.
const reservaSelecionada = ref<Reserva | null>(null)

// Controla a confirmação e o carregamento do cancelamento.
const confirmarCancelamento = ref(false)
const cancelando = ref(false)

// Define a visualização inicial do calendário como trbalho.
const modoVisualizacao = ref<ModoVisualizacao>('trabalho')

// Retorna a data atual no formato YYYY-MM-DD.
function dataLocalAtual(): string {
  return formatarData(new Date())
}

// Armazena a data selecionada pelo usuário.
const dataSelecionada = ref(dataLocalAtual())

// Obtém o identificador da sala a partir dos parâmetros da URL.
const salaId = computed(() => Number(route.params.id))


const salaSelecionada = computed(() =>
  salaStore.salasAtivas.find((sala) => sala.id === salaId.value) ?? null,
)

// Converte a data selecionada, que é uma string, para um objeto Date.
// O horário 12:00 ajuda a evitar problemas de mudança de dia por fuso horário.
const dataComoDate = computed(() => {
  const [ano, mes, dia] = dataSelecionada.value.split('-').map(Number)

  return new Date(ano, mes - 1, dia, 12, 0, 0)
})

// Cria uma nova data adicionando ou subtraindo uma quantidade de dias.
function adicionarDias(data: Date, quantidade: number): Date {
  const resultado = new Date(data)

  resultado.setDate(resultado.getDate() + quantidade)

  return resultado
}

// Calcula quais datas precisam aparecer no calendário,
// dependendo do modo de visualização selecionado.
const datasDoPeriodo = computed(() => {
  const data = dataComoDate.value

  // Na visualização diária, retorna somente a data selecionada.
  if (modoVisualizacao.value === 'dia') {
    return [data]
  }

  // Na visualização semanal, calcula os dias da semana.
  if (
    modoVisualizacao.value === 'trabalho' ||
    modoVisualizacao.value === 'semana'
  ) {
    const inicioSemana = new Date(data)
    const diaSemana = data.getDay()

    // Semana de trabalho: segunda-feira até sexta-feira.
    if (modoVisualizacao.value === 'trabalho') {
      const diferenca = diaSemana === 0 ? -6 : 1 - diaSemana

      inicioSemana.setDate(inicioSemana.getDate() + diferenca)

      return Array.from(
        { length: 5 },
        (_, indice) => adicionarDias(inicioSemana, indice),
      )
    }

    // Semana completa: domingo até sábado.
    inicioSemana.setDate(inicioSemana.getDate() - diaSemana)

    return Array.from(
      { length: 7 },
      (_, indice) => adicionarDias(inicioSemana, indice),
    )
  }

  // Na visualização mensal, identifica o ano e o mês selecionados.
  const ano = data.getFullYear()
  const mes = data.getMonth()

  // Descobre quantos dias existem no mês selecionado.
  const ultimoDia = new Date(ano, mes + 1, 0).getDate()

  // Cria um array contendo todos os dias do mês.
  return Array.from(
    { length: ultimoDia },
    (_, indice) => new Date(ano, mes, indice + 1, 12, 0, 0),
  )
})

// Calcula a largura do seletor conforme o texto selecionado.
const larguraSeletor = computed(() => {
  const larguras: Record<ModoVisualizacao, string> = {
    dia: '88px',
    trabalho: '195px',
    semana: '120px',
    mes: '100px',
  }

  return larguras[modoVisualizacao.value]
})

// Monta o título que aparece acima do calendário,
// de acordo com o período selecionado.
const tituloPeriodo = computed(() => {
  // Formata a data completa na visualização diária.
  if (modoVisualizacao.value === 'dia') {
    return dataComoDate.value.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  // Exibe somente o mês e o ano na visualização mensal.
  if (modoVisualizacao.value === 'mes') {
    return dataComoDate.value.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    })
  }

  // Nas visualizações semanais, exibe a primeira e a última data.
  const primeiraData = datasDoPeriodo.value[0]
  const ultimaData = datasDoPeriodo.value[datasDoPeriodo.value.length - 1]

  return `${primeiraData.toLocaleDateString('pt-BR')} – ${ultimaData.toLocaleDateString('pt-BR')}`
})

// Busca as reservas da sala para todas as datas do período selecionado.
async function carregarReservas() {
  // Interrompe a execução se nenhuma sala estiver selecionada.
  if (!salaSelecionada.value) return

  carregandoReservas.value = true
  erro.value = ''

  // Atualiza os filtros da store com a sala e a data selecionadas.
  reservaStore.filtro = {
    salaId: salaId.value,
    data: dataSelecionada.value,
  }

  try {
    // Faz uma requisição para cada data do período.
    // Promise.all aguarda todas as requisições terminarem.
    const resultados = await Promise.all(
      datasDoPeriodo.value.map((data) =>
        reservaService.listar({
          salaId: salaId.value,
          data: formatarData(data),
        }),
      ),
    )

    // Junta todas as listas de reservas em um único array.
    const todasReservas = resultados.flat()

    // Remove possíveis registros duplicados utilizando o ID da reserva.
    const reservasUnicas = Array.from(
      new Map(todasReservas.map((reserva) => [reserva.id, reserva])).values(),
    )

    // Atualiza as reservas locais e os dados compartilhados pela store.
    reservas.value = reservasUnicas
    reservaStore.reservas = reservasUnicas
  } catch (e) {
    // Exibe a mensagem de erro e limpa a lista caso a requisição falhe.
    erro.value = mensagemDeErro(e)
    reservas.value = []
  } finally {
    // Encerra o indicador de carregamento, independentemente do resultado.
    carregandoReservas.value = false
  }
}

// Carrega os dados necessários para abrir a página de uma sala.
async function carregarPagina() {
  carregandoSala.value = true
  erro.value = ''

  try {
    // Verifica se o identificador recebido pela URL é válido.
    if (!Number.isInteger(salaId.value) || salaId.value <= 0) {
      erro.value = 'Identificador da sala inválido.'
      return
    }

    // Solicita à store o carregamento das salas.
    await salaStore.carregar()

    // Verifica se a sala existe e está ativa.
    if (!salaSelecionada.value) {
      erro.value = 'Sala não encontrada ou está desativada.'
      return
    }

    // Após encontrar a sala, carrega suas reservas.
    await carregarReservas()
  } catch (e) {
    erro.value = mensagemDeErro(e)
  } finally {
    // Finaliza o carregamento inicial da página.
    carregandoSala.value = false
  }
}

// Avança ou retrocede o período exibido no calendário.
function alterarPeriodo(direcao: number) {
  const data = new Date(dataComoDate.value)

  // Na visualização mensal, altera o mês.
  if (modoVisualizacao.value === 'mes') {
    data.setMonth(data.getMonth() + direcao)
  } else if (
    modoVisualizacao.value === 'trabalho' ||
    modoVisualizacao.value === 'semana'
  ) {
    // Nas visualizações semanais, altera sete dias.
    data.setDate(data.getDate() + 7 * direcao)
  } else {
    // Na visualização diária, altera apenas um dia.
    data.setDate(data.getDate() + direcao)
  }

  // Atualiza a data selecionada.
  dataSelecionada.value = formatarData(data)
}

// Retorna o calendário para a data atual.
function irParaHoje() {
  dataSelecionada.value = dataLocalAtual()
}

// Ao selecionar um dia no calendário mensal,
// muda a data selecionada e abre a visualização diária.
function selecionarDiaNoMes(data: string) {
  dataSelecionada.value = data
  modoVisualizacao.value = 'dia'
}

// Recebe os dados de um horário selecionado no calendário
// e encaminha o usuário para a página de criação da reserva.
function selecionarHorario(dados: {
  salaId: number
  inicio: string
  fim: string
}) {
  router.push({
    name: 'nova-reserva',
    query: {
      salaId: dados.salaId,
      inicio: dados.inicio,
      fim: dados.fim,
    },
  })
}

// Define qual reserva foi selecionada para abrir o modal de detalhes.
function selecionarReserva(reserva: Reserva) {
  reservaSelecionada.value = reserva
  confirmarCancelamento.value = false
}

// Fecha o modal e limpa a reserva selecionada.
function fecharDetalhes() {
  reservaSelecionada.value = null
  confirmarCancelamento.value = false
}

// Cancela a reserva selecionada e atualiza o calendário.
async function cancelarReserva() {
  // Não executa se nenhuma reserva estiver selecionada.
  if (!reservaSelecionada.value) return

  cancelando.value = true
  erro.value = ''
  sucesso.value = ''

  try {
    // Solicita o cancelamento através da store.
    await reservaStore.cancelar(reservaSelecionada.value.id)

    // Atualiza as reservas do período exibido.
    await carregarReservas()

    sucesso.value = 'Reserva cancelada com sucesso.'

    // Fecha o modal após o cancelamento.
    fecharDetalhes()
  } catch (e) {
    erro.value = mensagemDeErro(e)
  } finally {
    cancelando.value = false
  }
}

// Abre a página de criação de uma nova reserva para a sala atual.
function abrirNovaReserva() {
  router.push({
    name: 'nova-reserva',
    query: {
      salaId: salaId.value,
    },
  })
}

// Observa alterações na data ou no modo de visualização.
// Quando algum deles muda, carrega novamente as reservas do período.
watch([dataSelecionada, modoVisualizacao], () => {
  if (salaSelecionada.value) {
    carregarReservas()
  }
})

// Observa mudanças no ID da sala na URL.
// Se o usuário acessar outra sala, carrega os novos dados.
watch(
  () => route.params.id,
  () => {
    carregarPagina()
  },
)

// Executa o carregamento inicial assim que o componente é montado.
onMounted(() => {
  carregarPagina()
})
</script>

<template>
  <section class="space-y-6">

    <!-- Cabeçalho da página: voltar para a lista e criar nova reserva -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#003151]"
        @click="router.push('/reservas')"
      >
        <i class="bi bi-arrow-left"></i>
        Voltar para as salas
      </button>

      <button
        v-if="salaSelecionada"
          type="button"
          class="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#003151] px-7 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#0F528A]"
          @click="router.push('/reservas/nova')"
        >
          <i class="bi bi-plus-lg"></i>
          Nova reserva
        </button>
    </div>

    <!-- Componentes responsáveis por exibir mensagens de erro e sucesso -->
    <AlertMessage tipo="erro" :mensagem="erro" />
    <AlertMessage tipo="sucesso" :mensagem="sucesso" />

    <!-- Indicador visual enquanto os dados da sala estão sendo carregados -->
    <div
      v-if="carregandoSala"
      class="animate-pulse rounded-xl border border-slate-200 bg-white p-6"
    >
      <div class="h-6 w-48 rounded bg-slate-200"></div>
      <div class="mt-4 h-10 w-full rounded bg-slate-100"></div>
    </div>

    <!-- Exibe o calendário somente quando a sala foi encontrada -->
    <template v-else-if="salaSelecionada">

      <!-- Barra superior com data, visualização e navegação do calendário -->
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

          <!-- Data do período selecionado -->
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="text-lg font-bold capitalize text-[#243B53]">
              {{ tituloPeriodo }}
            </h1>
          </div>

          <!-- Botões, seletor e data do calendário -->
          <div class="flex flex-wrap items-center gap-2">

          <!-- Permite alternar entre dia, semana de trabalho, semana e mês -->
            <select
                v-model="modoVisualizacao"
                 :style="{ width: larguraSeletor }"
                  class="h-10 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm font-medium text-slate-700 outline-none transition-all focus:border-[#003151] focus:ring-1 focus:ring-[#003151]"
                  aria-label="Selecionar visualização do calendário"
                >
                <option value="dia">Dia</option>
                <option value="trabalho">Semana de trabalho</option>
                <option value="semana">Semana</option>
                <option value="mes">Mês</option>
            </select>

            <!-- Volta para o período anterior -->
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              aria-label="Período anterior"
              @click="alterarPeriodo(-1)"
            >
              <i class="bi bi-chevron-left"></i>
            </button>

            <!-- Retorna diretamente para o dia atual -->
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              @click="irParaHoje"
            >
              Hoje
            </button>

            <!-- Avança para o próximo período -->
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              aria-label="Próximo período"
              @click="alterarPeriodo(1)"
            >
              <i class="bi bi-chevron-right"></i>
            </button>

            <!-- Permite selecionar uma data específica pelo calendário do navegador -->
            <input
              v-model="dataSelecionada"
              type="date"
              class="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-[#003151] focus:ring-1 focus:ring-[#003151]"
              aria-label="Selecionar data"
            />
          </div>
        </div>
      </div>

      <!-- Calendário diário: exibe os horários de uma única data -->
      <div v-if="modoVisualizacao === 'dia'">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-semibold text-slate-800">
            Calendário diário
          </h2>

          <span class="text-xs text-slate-500">
            Funcionamento: 08h às 18h
          </span>
        </div>

        <!-- Componente responsável pela grade de horários diária -->
        <AgendaGrid
          :salas="[salaSelecionada]"
          :reservas="reservas"
          :data-selecionada="dataComoDate"
          :carregando="carregandoReservas"
          @selecionar-horario="selecionarHorario"
          @selecionar-reserva="selecionarReserva"
        />
      </div>

      <!-- Calendário semanal: semana de trabalho ou semana completa -->
      <div
        v-else-if="
          modoVisualizacao === 'trabalho' ||
          modoVisualizacao === 'semana'
        "
      >
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-semibold text-slate-800">
            Calendário semanal
          </h2>

          <span class="text-xs text-slate-500">
            Funcionamento: 08h às 18h
          </span>
        </div>

        <!-- Componente responsável pela grade de horários dos dias da semana -->
        <AgendaSemanaGrid
          :sala-id="salaId"
          :datas="datasDoPeriodo"
          :reservas="reservas"
          :carregando="carregandoReservas"
          @selecionar-horario="selecionarHorario"
          @selecionar-reserva="selecionarReserva"
        />
      </div>

      <!-- Calendário mensal: exibe os dias do mês e suas reservas -->
      <div v-else>
        <h2 class="mb-3 font-semibold text-slate-800">
          Calendário mensal
        </h2>

        <!-- Componente responsável pela grade mensal -->
        <AgendaMesGrid
          :data="dataComoDate"
          :reservas="reservas"
          :carregando="carregandoReservas"
          @selecionar-dia="selecionarDiaNoMes"
          @selecionar-reserva="selecionarReserva"
        />
      </div>
    </template>

    <!-- Mensagem exibida quando a sala não existe ou está desativada -->
    <div
      v-else-if="!carregandoSala"
      class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
    >
      <i class="bi bi-exclamation-circle text-4xl text-slate-300"></i>

      <h2 class="mt-4 font-semibold text-slate-700">
        Não foi possível encontrar esta sala
      </h2>

      <p class="mt-2 text-sm text-slate-500">
        A sala pode ter sido desativada ou não existir.
      </p>
    </div>

    <!-- Modal que apresenta os detalhes da reserva selecionada -->
    <div
      v-if="reservaSelecionada"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="fecharDetalhes"
    >
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

        <!-- Título do modal e botão para fechá-lo -->
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-[#003151]">
              Detalhes da reserva
            </p>

            <h2 class="mt-1 text-xl font-bold text-[#243B53]">
              {{ reservaSelecionada.titulo }}
            </h2>
          </div>

          <button
            type="button"
            class="text-slate-400 transition hover:text-slate-700"
            aria-label="Fechar"
            @click="fecharDetalhes"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Informações da reserva selecionada -->
        <div class="mt-5 space-y-4 text-sm">

          <!-- Nome do responsável pela reserva -->
          <div>
            <p class="text-slate-400">Responsável</p>

            <p class="mt-1 font-medium text-slate-700">
              {{ reservaSelecionada.responsavel }}
            </p>
          </div>

          <!-- Data e horário de início e término -->
          <div>
            <p class="text-slate-400">Horário</p>

            <p class="mt-1 font-medium text-slate-700">
              {{ new Date(reservaSelecionada.inicio).toLocaleString('pt-BR') }}
              até
              {{ new Date(reservaSelecionada.fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}
            </p>
          </div>

          <!-- Quantidade de participantes da reserva -->
          <div>
            <p class="text-slate-400">Participantes</p>

            <p class="mt-1 font-medium text-slate-700">
              {{ reservaSelecionada.participantes }}
            </p>
          </div>
        </div>

        <!-- Botões exibidos antes de solicitar a confirmação do cancelamento -->
        <div
          v-if="!confirmarCancelamento"
          class="mt-6 flex justify-end gap-3"
        >
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            @click="fecharDetalhes"
          >
            Fechar
          </button>

          <button
            type="button"
            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            @click="confirmarCancelamento = true"
          >
            Cancelar reserva
          </button>
        </div>

        <!-- Confirmação exibida antes de efetivamente cancelar a reserva -->
        <div
          v-else
          class="mt-6 rounded-lg border border-red-100 bg-red-50 p-4"
        >
          <p class="text-sm font-semibold text-red-800">
            Deseja realmente cancelar esta reserva?
          </p>

          <p class="mt-1 text-xs text-red-700">
            Essa ação irá liberar o horário na agenda.
          </p>

          <!-- Botões para desistir ou confirmar o cancelamento -->
          <div class="mt-4 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
              :disabled="cancelando"
              @click="confirmarCancelamento = false"
            >
              Voltar
            </button>

            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              :disabled="cancelando"
              @click="cancelarReserva"
            >
              {{ cancelando ? 'Cancelando...' : 'Confirmar cancelamento' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>