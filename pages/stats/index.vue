<script lang="ts" setup>
const { width, height } = useWindowSize()
import { notify } from '@kyvg/vue3-notification'
import { relative } from 'path'
import { Bar } from 'vue-chartjs'
const currency = useCurrency()

const secondLevelReferrals = ref(0)
const route = useRoute()
const router = useRouter()
const status = computed(() => route.query?.status || 'all')
const periodFromRoute = route.query.period
const lastElements = ref<any>([])

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Аналитика',
})

let chartDataValue = ref<any>([])
const services = ref<any>([])
let chartLabels = ref<any>([])
const buyoutsCount = ref<any>({
  all: 0,
  inAdvertisement: 0,
})
const deliveriesCount = ref<any>({
  all: 0,
  active: 0,
  complited: 0,
  penalty: 0,
})
async function getData() {
  const { data, error }: any = await useFetch('/api/stats/stats', {
    method: 'GET',
    params: {
      type: route.query.type,
      period: route.query.period,
    },
  })
  if (data.value) {
    chartDataValue.value = data.value.data
    chartLabels.value = data.value.labels
    services.value = data.value.services
  }
}

async function getLast() {
  const { data, error }: any = await useFetch('/api/stats/last10', {
    method: 'GET',
  })

  if (data.value) {
    lastElements.value = data.value
  }
}

async function countBuyouts() {
  const { data, error }: any = await useFetch('/api/stats/buyoutsCount', {
    method: 'GET',
  })
  if (data.value) {
    buyoutsCount.value = data.value
  }
}

async function coutDeliveries() {
  const { data, error }: any = await useFetch('/api/stats/deliveriesCount', {
    method: 'GET',
  })
  if (data.value) {
    deliveriesCount.value = data.value
  }
}

async function getSecondLevelReferrals() {
  const { data }: any = await useFetch('/api/partner/getSecondLevelReferrals', {
    method: 'GET',
  })
  if (data.value && data.value.status === 'ok') {
    secondLevelReferrals.value = data.value.secondLevelReferralsCount
  }
}

await getSecondLevelReferrals()

await coutDeliveries()
await getData()
await getLast()
await countBuyouts()

const store = useMainStore()

const colorMode = useColorMode()
const chardColor = computed(() =>
  colorMode.value === 'light' ? '#570df8' : '#a469f7'
)

const selectedService: any = ref({
  value: 'all',
  title: 'Все',
  expenses: 55452,
  quantity: 495,
})

const barThickness = computed(() => {
  if (width.value > 768) {
    return 30
  } else {
    return 10
  }
})

const type = route.query.type ? route.query.type : ''
const chartBar: any = ref(null)
const chartData = ref({
  labels: chartLabels.value,
  datasets: [
    {
      barPercentage: 1.3,
      maxBarThickness: 33,
      borderRadius: 7,
      minBarLength: 0,
      label: '',
      data: chartDataValue,
      backgroundColor: chardColor.value,
    },
  ],
})
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: true,
  borderWidth: 1,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          let label = context.dataset.label || ''

          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'RUB',
            }).format(context.parsed.y)
          }
          return label
        },
      },
    },
  },
})

function selectPeriod(event: any) {
  navigateTo(`/stats?type=${route.query.type}&period=${event.target.value}`, {
    external: true,
  })
}

function selectService(event: any) {
  navigateTo(`/stats?type=${event.target.value}&period=${route.query.period}`, {
    external: true,
  })
}

if (!route.query.type || !route.query.period) {
  navigateTo('/stats?type=all&period=today', {
    external: true,
  })
}
</script>
<template>
  <div class="page-header">
    <div class="flex items-center gap-2 mt-4">
      <h1 class="text-2xl font-bold">Аналитика</h1>
      <!-- <InfoButton @openModal="openInfoModal" /> -->
    </div>
    <!-- <p class="description">
        На каждый полученный артикул можно оставить отзыв. Оплачивается отдельно
        от выкупа согласно вашему тарифу.
      </p>
      <p class="text-xs font-light mt-1 lg:text-sm">
        Стоимость одного отзыва - <span class="font-bold">35 руб.</span>
        Все услуги оказываются по Московскому времени.
      </p> -->
  </div>
  <div class="flex justify-between mb-4 items-center mt-6">
    <div class="hidden lg:block">
      <NuxtLink
        @click="selectedService = service"
        v-for="service in services"
        :to="`/stats?type=${service.value}&period=${route.query.period}`"
        :external="true"
        :class="{
          'btn-active': route.query.type === service.value,
        }"
        class="btn btn-ghost btn-sm normal-case font-medium"
      >
        {{ service.title }}
      </NuxtLink>
    </div>
    <select
      class="select select-bordered select-sm"
      @change="selectPeriod($event)"
    >
      <option value="today" :selected="route.query.period === 'today'">
        Сегодня
      </option>
      <option value="yesterday" :selected="route.query.period === 'yesterday'">
        Вчера
      </option>
      <option value="week" :selected="route.query.period === 'week'">
        Неделя
      </option>
      <option value="month" :selected="route.query.period === 'month'">
        Этот месяц
      </option>
      <option value="lastMonth" :selected="route.query.period === 'lastMonth'">
        Прошлый месяц
      </option>
    </select>
    <select
      class="select select-bordered select-sm lg:hidden"
      @change="selectService($event)"
    >
      <option
        v-for="service in services"
        :value="service.value"
        :selected="route.query.type === service.value"
      >
        {{ service.title }}
      </option>
    </select>
  </div>
  <div>
    <div class="flex gap-5 flex-wrap">
      <!-- <div class="card w-60 bg-base-100 shadow-2xl">
        <div class="card-body">
          <h2 class="text-md font-bold text-start">
            {{ selectedService.title }}
          </h2>
          <h2 class="text-2xl text-primary font-bold">
            {{ selectedService.quantity }}
          </h2>
          <h2 class="mt-1">{{ currency.format(selectedService.expenses) }}</h2>
          <h2>за неделю</h2>
        </div>
      </div> -->
      <div class="flex flex-col md:flex md:flex-row md:flex-wrap">
        <div id="forBar" class="w-11/12 md:w-1/2 mt-10 h-full">
          <Bar
            id="chartId"
            :data="chartData"
            :options="chartOptions"
            ref="chartBar"
          />
        </div>
        <div class="w-full lg:w-1/2 mt-2">
          <div class="ml-5 flex gap-4 flex-wrap">
            <div
              v-for="service in services"
              class="card w-full md:w-44 bg-base-100 shadow-md"
            >
              <div class="card-body">
                <h2 class="text-md font-bold h-3 mb-10 -mt-5 text-center">
                  {{ service.title }}
                </h2>
                <h2 class="text-2xl text-primary font-bold text-center">
                  {{ service.quantity }}
                </h2>
                <h2 class="mt-1 text-center">
                  {{ currency.format(service.expenses) }}
                </h2>
                <h2 class="text-center">
                  {{
                    periodFromRoute === 'today'
                      ? 'за сегодня'
                      : periodFromRoute == 'yesterday'
                      ? 'за вчера'
                      : periodFromRoute === 'week'
                      ? 'за неделю'
                      : periodFromRoute == 'month'
                      ? 'за этот месяц'
                      : periodFromRoute === 'lastMonth'
                      ? 'за прошлый месяц'
                      : 'за год'
                  }}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col-reverse md:flex-row mt-4 md:mt-10 md:ml-5">
      <div
        class="overflow-x-auto shadow-xl flex-row md:flex-col -ml-3 md:w-1/2"
      >
        <table class="table">
          <!-- head -->
          <thead>
            <tr>
              <th>Последние артикулы</th>
              <th>Последние ключи</th>
              <th>Последние ПВЗ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="element in lastElements">
              <td style="width: 3%">{{ element.article }}</td>
              <td style="width: 10%" class="overflow-x-auto">
                {{ element.searchQuery }}
              </td>
              <td style="width: 10%" class="overflow-x-auto">
                {{ element.pvz }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex flex-col md:mb-0 md:w-1/2 md:flex-row flex-wrap">
        <div class="ml-5 flex mb-2 md:mb-0 max-h-48 flex-wrap">
          <div class="card w-full md:w-80 bg-base-100 shadow-md">
            <div class="card-body">
              <h2 class="text-center text-lg font-bold">Доставки</h2>
              <div class="flex justify-between mt-4">
                <h2 class="text-md font-bold h-3 mb-10">Всего доставок:</h2>
                <p class="h-3 text-xl -mt-1 text-primary font-bold text-end">
                  {{ deliveriesCount.all }}
                </p>
              </div>
              <div class="flex justify-between">
                <h2 class="text-md -mt-4 font-bold h-3 mb-10">
                  Готовы к выдаче:
                </h2>
                <p class="h-3 -mt-5 text-xl text-primary font-bold text-end">
                  {{ deliveriesCount.active }}
                </p>
              </div>
              <div class="flex justify-between">
                <h2 class="text-md -mt-4 font-bold h-3 mb-10">Получено:</h2>
                <p class="h-3 -mt-5 text-xl text-primary font-bold text-end">
                  {{ deliveriesCount.completed }}
                </p>
              </div>
              <div class="flex justify-between">
                <h2 class="text-md -mt-4 font-bold h-3">
                  Не забраны (штрафы):
                </h2>
                <p class="h-3 -mt-5 text-xl text-primary font-bold text-end">
                  {{ deliveriesCount.penalty }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="ml-5 flex gap-4 flex-wrap">
          <div class="card w-full md:w-80 bg-base-100 max-h-48 shadow-md">
            <div class="card-body">
              <h2 class="text-center text-lg font-bold">Выкупы</h2>
              <div class="flex justify-between mt-4">
                <h2 class="text-md font-bold h-3 mb-10">Всего выкупов:</h2>
                <p class="h-3 text-xl -mt-1 text-primary font-bold text-end">
                  {{ buyoutsCount.all }}
                </p>
              </div>
              <div class="flex justify-between">
                <h2 class="text-md -mt-4 font-bold h-3 mb-10">
                  Выкуплено с рекламы:
                </h2>
                <p class="h-3 -mt-5 text-xl text-primary font-bold text-end">
                  {{ buyoutsCount.inAdvertisement }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="ml-5 flex gap-4 flex-wrap">
          <div class="card w-full md:w-80 bg-base-100 max-h-48 shadow-md">
            <div class="card-body">
              <h2 class="text-center text-lg font-bold">Рефералы</h2>
              <div class="flex justify-between mt-4">
                <h2 class="text-md font-bold h-3 mb-10">Рефералов:</h2>
                <p class="h-3 text-xl -mt-1 text-primary font-bold text-end">
                  {{ store.client.partner.refCount }}
                </p>
              </div>
              <div class="flex justify-between">
                <h2 class="text-md -mt-4 font-bold h-3 mb-10">
                  Рефералов 2 уровня::
                </h2>
                <p class="h-3 -mt-5 text-xl text-primary font-bold text-end">
                  {{ secondLevelReferrals }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="h-24"></div>
</template>

<style scoped></style>
