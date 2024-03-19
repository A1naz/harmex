<script lang="ts" setup>
import { Bar } from 'vue-chartjs'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Аналитика',
})

const store = useMainStore()

const currency = useCurrency()
const route = useRoute()
const { width } = useWindowSize()
const secondLevelReferrals = ref(0)
const lastElements = ref<any>([])
const deliveries = ref<any>([])
const periodFromRoute = route.query.period

if (!route.query.type || !route.query.period) {
  navigateTo('/stats?type=all&period=today', {
    external: true,
  })
}

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

const deliveryPenaltyCount = ref<any>(0)
async function getData() {
  const { data, error }: any = await useFetch('/api/stats/stats', {
    method: 'GET',
    params: {
      type: route.query.type,
      period: route.query.period,
    },
    watch: false,
  })
  if (data.value) {
    chartDataValue.value = data.value.data
    chartLabels.value = data.value.labels
    services.value = data.value.services
    deliveryPenaltyCount.value = data.value.penalty
  }
}

const totalSumm = ref(0)
const totalExpense = ref(0)
const totalDeals = ref(0)
const comissions = ref(0)
async function getDataHeader() {
  const { data, error }: any = await useFetch('/api/stats/statsHeader', {
    method: 'GET',
    params: {
      // type: route.query.type,
      period: route.query.period,
    },
    watch: false,
  })
  if (data.value) {
    totalSumm.value = data.value.totalSumm
    totalExpense.value = data.value.totalExpense
    totalDeals.value = data.value.totalDeals
    comissions.value = data.value.comissions
  }
}
await getDataHeader()

const purchaseDelivery = ref(0)
const inTransit = ref(0)
const readyToPickup = ref(0)
const received = ref(0)
const cancelled = ref(0)
async function getLast() {
  const { data, error }: any = await useFetch('/api/stats/statsDelivery', {
    method: 'GET',
    params: {
      // type: route.query.type,
      period: route.query.period,
    },
    watch: false,
  })

  if (data.value) {
    lastElements.value = data.value.lastElements
    purchaseDelivery.value = data.value.purchase
    inTransit.value = data.value.inTransit
    readyToPickup.value = data.value.ready
    received.value = data.value.received
    cancelled.value = data.value.cancelled
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

const withdrawsCount = ref(0)
async function getSecondLevelReferrals() {
  const { data }: any = await useFetch('/api/partner/getSecondLevelReferrals', {
    method: 'GET',
  })
  if (data.value && data.value.status === 'ok') {
    secondLevelReferrals.value = data.value.secondLevelReferralsCount
  }
}
async function getPatnerWithdraws() {
  const { data }: any = await useFetch('/api/stats/getPartnerWithdraws', {
    method: 'GET',
  })
  if (data.value) {
    withdrawsCount.value = data.value.withdrawsCount
  }
}

await getPatnerWithdraws()
await getSecondLevelReferrals()

await coutDeliveries()
await getData()
await getLast()
await countBuyouts()


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
            if (route.query.type == 'deliveries') {
              label += context.parsed.y + ' шт'
            } else {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'RUB',
              }).format(context.parsed.y)
            }
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
  
// DELIVERIES by CITY
interface DelisDataChart {
  data: number[]
  labels: string[]
  arcticles: any[]
}
const chartDelivs = ref<DelisDataChart>({
  data: [],
  labels: [],
  arcticles: [],
})
const paramsDelivs = ref({
  period: route.query.period,
  article: null,
})

const delivsReady = ref(false)

async function getDeliveries() {
  delivsReady.value = false
  const { data, error }: any = await useFetch<DelisDataChart>(
    '/api/stats/deliveries',
    {
      method: 'GET',
      params: paramsDelivs,
    }
  )
  if (data.value) {
    ;(chartDelivs.value.data = data.value.data),
      (chartDelivs.value.labels = data.value.labels)
    chartDelivs.value.arcticles = data.value.articles
  }
  delivsReady.value = true
}
await getDeliveries()

const seletArticleOptions = computed(() => {
  const all = { value: 'Нет данных', qty: 0 }
  const arr: any[] = [all]
  if (chartDelivs.value.arcticles) {
    ;(all.value = 'Все артикулы'),
      (all.qty = chartDelivs.value.arcticles.reduce(
        (acc, cur) => acc + cur.qty,
        0
      ))
    arr.push(...chartDelivs.value.arcticles)
  }
  return arr
})

function selectDelArt(event: any) {
  const val = event.target.value
  paramsDelivs.value.article = val == 'Все артикулы' ? null : val
  getDeliveries()
}

const chartDelivsData = ref({
  labels: chartDelivs.value.labels,
  datasets: [
    {
      barPercentage: 1.3,
      maxBarThickness: 33,
      borderRadius: 7,
      minBarLength: 0,
      label: '',
      data: chartDelivs.value.data,
      backgroundColor: chardColor.value,
    },
  ],
})
watch(
  () => chartDelivs.value.data,
  () => {
    if (chartDelivs.value.data)
      chartDelivsData.value.datasets[0].data = chartDelivs.value.data
  }
)

const charttDelivOptions = ref({
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
          return context.parsed.y + ' шт'
        },
      },
    },
  },
})

const MPTabs =  store.client.username == 'test' ? [
  { title: 'Все', value: '' },
  { title: 'Ozon', value: 'ozon' },
  { title: 'Wildberries', value: 'wildberries' },
] : [
  { title: 'Все', value: '' },
  { title: 'Wildberries', value: 'wildberries' },
]

const periods = [
      { title: 'Сегодня', value: 'today' },
      { title: 'Вчера', value: 'yesterday' },
      { title: 'Неделя', value: 'week' },
      { title: 'Этот месяц', value: 'month' },
      { title: 'Прошлый месяц', value: 'lastMonth' },
    ];
async function changeMP(e: any) {
  return navigateTo(
    '/stats/' + e.value + `?type=all&period=${route.query.period}`
  )
}
function changePeriod(e: any) {
  navigateTo(`/stats?type=${route.query.type}&period=${e.value}`, {
    external: true,
  })
}
function changeService(e: any) {
  selectedService.value = e
  navigateTo(`/stats?type=${e.value}&period=${route.query.period}`, {
    external: true,
  })
}

function selectText() {
  const index = periods.findIndex(period => period.value === route.query.period);
  return periods[index].title
}

function selectServiceText() {
  const index = services.value.findIndex((service:any) => service.value === route.query.type);
  return services.value[index].title
}

onMounted(() => {
      
})

const stats = [
  {
    icon: 'coins',
    title: 'Пополнено',
    value: currency.format(totalSumm.value) || 0,
  },
  {
    icon: 'hand',
    title: 'Расходы',
    value: currency.format(totalExpense.value) || 0,
  },
  {
    icon: 'mbox',
    title: 'Остаток',
    value: (totalSumm.value-totalExpense.value)<0 ?( 0+' ₽') : currency.format(totalSumm.value-totalExpense.value) || totalSumm.value-totalExpense.value,
  },
  {
    icon: 'box',
    title: 'Заказано услуг',
    value: totalDeals.value,
  },
  {
    icon: 'crystal',
    title: 'Партнерские вознаграждения',
    value: currency.format(comissions.value) || 0,
  },
]
const deliveryStats = [
  {
    title: 'Выкуплено',
    value: purchaseDelivery.value,
  },
  {
    title: 'Доступных отзывов',
    value: 0,
  },
  {
    title: 'В пути',
    value: inTransit.value,
  },
  {
    title: 'Готовы к выдаче',
    value: readyToPickup.value,
  },
  {
    title: 'Получено',
    value: received.value,
  },
  {
    title: 'Отменено',
    value: cancelled.value,
  }
]
</script>
<template>
  <div class="bg-base-100 rounded-lg drop-shadow-sm w-full p-6 flex flex-col gap-5 mt-4">
    <div class="flex justify-between">
      <h2 class="font-semibold text-xl">Сатистика</h2>
      <div class="flex gap-2">
        <CustomSelect
          class="lg:flex"
          :class="'sm:min-w-[120px]'"
          :tabs="MPTabs"
          @change-value="changeMP"
        />
        <CustomSelect
          class="lg:flex"
          :class="'sm:min-w-[120px]'"
          :status-text="selectText()"
          :tabs="periods"
          @change-value="(e: any) => changePeriod(e)"
        />
        <!-- <select
          class="select select-bordered select-sm ml-2"
          @change="selectPeriod($event)"
        >
          <option value="today" :selected="route.query.period === 'today'">
            Сегодня
          </option>
          <option
            value="yesterday"
            :selected="route.query.period === 'yesterday'"
          >
            Вчера
          </option>
          <option value="week" :selected="route.query.period === 'week'">
            Неделя
          </option>
          <option value="month" :selected="route.query.period === 'month'">
            Этот месяц
          </option>
          <option
            value="lastMonth"
            :selected="route.query.period === 'lastMonth'"
          >
            Прошлый месяц
          </option>
        </select> -->
      </div>
    </div>
    <div class="flex gap-3.5">
      <div v-for="item in stats" class="flex flex-col gap-2 w-[20%] rounded-lg bg-neutral-focus px-3.5 py-3">
        <nuxt-img
            class="w-6 h-6"
            :src="`/icons/figma/stats/${item.icon}.svg`"
            alt="stats1"
        />
        <!-- <IconCSS
          class="text-neutral-content text-opacity-70"
          :name="item.icon"
          size="24"
        /> -->
        <span class="text-neutral-content text-opacity-70">
          {{ item.title }}
        </span>
        <span class="text-neutral-content text-2xl">
          {{ item.value }}
        </span>
      </div>
    </div>
  </div>
  <div  class="bg-base-100 rounded-lg drop-shadow-sm w-full p-6 flex flex-col gap-5 mt-4 ">
    <div class="flex gap-2 self-end">
      <CustomSelect
        class="lg:flex"
        :class="'sm:min-w-[120px]'"
        :status-text="selectServiceText()"
        :tabs="services"
        @change-value="changeService"
      />
      <CustomSelect
        class="lg:flex"
        :class="'sm:min-w-[120px]'"
        :status-text="selectText()"
        :tabs="periods"
        @change-value="(e: any) => changePeriod(e)"
      />
    </div>
    <div
      class="flex flex-col lg:flex-row gap-10 w-full bg-base-100 rounded-lg "
    >
      <div id="forBar" class="w-11/12 md:w-1/2 h-full my-auto">
        <div class="opacity-0 -mb-5">По дням</div>
          <Bar
            id="chartId"
            :data="chartData"
            :options="chartOptions"
            ref="chartBar"
          />
      </div>
      <div class="lg:w-1/2 flex">
        <div class="grid grid-cols-4 gap-3 w-full">
          <div
            v-for="(service, index) in services"
            class="flex flex-col bg-primary bg-opacity-5 rounded-lg gap-2"
          >
            <div class="card-body flex flex-col justify-center p-5 navbar:p-2">
              <h2 class="font-bold text-xs text-center">
                {{ service.title }}
              </h2>
              <div class="flex flex-col">
                  <h2 class="text-2xl  text-primary font-bold text-center mb-2">
                    {{ service.quantity }}
                  </h2>
                  <h2
                    class="text-center text-sm"
                    :class="{'opacity-0': service.value == 'deliveries'}"
                  >
                    {{ currency.format(service.expenses) }}
                  </h2>
              </div>
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
  <div  class="bg-base-100 rounded-lg drop-shadow-sm w-full p-6 flex flex-col gap-5 mt-4 ">
    <div>
      <table class="table border-collapse border border-primary border-opacity-5">
          <!-- head -->
          <thead>
            <tr class="bg-primary bg-opacity-5">
              <th class="text-center">Последние артикулы</th>
              <th class="text-center">ПВЗ</th>
              <th class="text-center">Статус</th>
              <th class="text-center">Когда был выкуплен</th>
              <th class="text-center">ID выкупа</th>
              <th class="text-center">Дата прихода на ПВЗ</th>
              <th class="text-center">Дата забора</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="element in lastElements">
              <td class="border-r border-primary border-opacity-5 text-center">{{ element.article }}</td>
              <td class="border-r border-primary border-opacity-5 overflow-x-auto text-center">
                {{ element.pvz }}
              </td>
              <td class="border-r border-primary border-opacity-5 text-center">{{ element.status }}</td>
              <td class="border-r border-primary border-opacity-5 text-center">{{ defaultDateShort(element.purchaseDate) }}</td>
              <td class="border-r border-primary border-opacity-5 text-center">{{ element.id }}</td>
              <td class="border-r border-primary border-opacity-5 text-center">{{ defaultDateShort(element.receiptDate) }}</td>
              <td class="border-r border-primary border-opacity-5 text-center">{{ defaultDateShort(element.receiveDate) || '-' }}</td>
            </tr>
          </tbody>
        </table>
    </div>
    <div class="flex gap-2.5">
      <div v-for="item in deliveryStats" class="flex flex-col gap-2 p-3 w-1/5 rounded-lg bg-primary bg-opacity-5">
        <h2 class="font-semibold">{{ item.title }}</h2>
        <span class="text-lg font-bold text-primary">{{ item.value }}</span>
      </div>
    </div>
  </div>
  <!-- <div class="page-header"> -->
    <!-- <div class="flex items-center gap-2 mt-4">
      <h1 class="text-2xl font-bold">Аналитика</h1>
      <InfoButton @openModal="openInfoModal" />
    </div> -->
    <!-- <p class="description">
        На каждый полученный артикул можно оставить отзыв. Оплачивается отдельно
        от выкупа согласно вашему тарифу.
      </p>
      <p class="text-xs font-light mt-1 lg:text-sm">
        Стоимость одного отзыва - <span class="font-bold">35 руб.</span>
        Все услуги оказываются по Московскому времени.
      </p> -->
  <!-- </div> -->
  <div class="flex justify-between mb-4 items-center mt-1 mt-60">
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
    <!-- <div class="flex">
      <CustomSelect
        class="lg:flex"
        :class="'sm:min-w-[120px]'"
        :tabs="MPTabs"
        @change-value="changeMP"
      />
      <select
        class="select select-bordered select-sm ml-2"
        @change="selectPeriod($event)"
      >
        <option value="today" :selected="route.query.period === 'today'">
          Сегодня
        </option>
        <option
          value="yesterday"
          :selected="route.query.period === 'yesterday'"
        >
          Вчера
        </option>
        <option value="week" :selected="route.query.period === 'week'">
          Неделя
        </option>
        <option value="month" :selected="route.query.period === 'month'">
          Этот месяц
        </option>
        <option
          value="lastMonth"
          :selected="route.query.period === 'lastMonth'"
        >
          Прошлый месяц
        </option>
      </select>
    </div> -->

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
          <div>По дням</div>
          <Bar
            id="chartId"
            :data="chartData"
            :options="chartOptions"
            ref="chartBar"
          />

          <div v-if="route.query.type == 'deliveries'">
            <div class="flex flex-row content-center gap-4 mt-10">
              <div>По городам</div>
              <select
                class="select select-bordered select-sm"
                @change="selectDelArt($event)"
              >
                <option
                  v-for="art in seletArticleOptions"
                  :value="art.value"
                  :selected="route.query.type === art.value"
                >
                  {{ art.value }} ( {{ art.qty }} шт)
                </option>
              </select>
            </div>

            <Bar
              v-if="delivsReady"
              id="chartDelivsId"
              :data="chartDelivsData"
              :options="charttDelivOptions"
            />
          </div>
        </div>
        <div class="w-full lg:w-1/2 mt-2">
          <div class="ml-5 flex gap-4 flex-wrap">
            <div
              v-for="service in services"
              class="card w-full md:w-44 bg-base-100 shadow-md"
            >
              <div class="card-body flex flex-col">
                <h2 class="text-md font-bold h-3 mb-10 -mt-5 text-center">
                  {{ service.title }}
                </h2>
                <div class="flex flex-col justify-stretch h-full">
                  <h2 class="text-2xl text-primary font-bold text-center">
                    {{ service.quantity }}
                  </h2>
                  <h2
                    v-if="service.value !== 'deliveries'"
                    class="mt-1 text-center"
                  >
                    {{ currency.format(service.expenses) }}
                  </h2>
                </div>
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
              <th>ПВЗ</th>
              <th>Статус</th>
              <th>Когда был выкуплен</th>
              <th>ID выкупа</th>
              <th>Дата прихода на ПВЗ</th>
              <th>Дата забора</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="element in lastElements">
              <td >{{ element.article }}</td>
              <td class="overflow-x-auto">
                {{ element.pvz }}
              </td>
              <td >{{ element.status }}</td>
              <td >{{ defaultDateShort(element.purchaseDate) }}</td>
              <td >{{ element.id }}</td>
              <td >{{ defaultDateShort(element.receiptDate) }}</td>
              <td >{{ defaultDateShort(element.receiveDate) || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex flex-col md:mb-0 md:w-1/2 md:flex-row flex-wrap">
        <div class="ml-5 flex gap-4 flex-wrap">
          <div class="card w-full md:w-80 bg-base-100 shadow-md">
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
                  Рефералов 2 уровня:
                </h2>
                <p class="h-3 -mt-5 text-xl text-primary font-bold text-end">
                  {{ secondLevelReferrals }}
                </p>
              </div>

              <div class="flex justify-between">
                <h2 class="text-md -mt-4 font-bold h-3 mb-10">Баланс:</h2>
                <p class="h-3 -mt-5 text-xl text-primary font-bold text-end">
                  {{ currency.format(store.client.partner.balance) }}
                </p>
              </div>

              <div class="flex justify-between">
                <h2 class="text-md -mt-4 font-bold h-3">Выведено:</h2>
                <p class="h-3 -mt-5 text-xl text-primary font-bold text-end">
                  {{ currency.format(withdrawsCount) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="ml-5 flex gap-4 flex-wrap">
          <div class="card w-full md:w-80 bg-base-100 shadow-md">
            <div class="card-body">
              <h2 class="text-center text-lg font-bold">Выкупы</h2>
              <div class="flex justify-between mt-4">
                <h2 class="text-md font-bold h-3 mb-10">Всего выкупов:</h2>
                <p class="h-3 text-xl -mt-1 text-primary font-bold text-end">
                  {{ buyoutsCount.all }}
                </p>
              </div>
              <div class="flex justify-between">
                <h2 class="text-md -mt-4 font-bold h-3">
                  Выкуплено с рекламы:
                </h2>
                <p class="h-3 -mt-5 text-xl text-primary font-bold text-end">
                  {{ buyoutsCount.inAdvertisement }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="ml-5 flex mb-2 md:mb-0 mt-1 flex-wrap">
          <div class="card w-full md:w-96 bg-base-100 shadow-md">
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
                <h2 class="text-md -mt-4 font-bold h-3 mb-10">Штрафы:</h2>
                <p class="h-3 -mt-5 text-xl text-primary font-bold text-end">
                  {{ currency.format(deliveriesCount.penalty) }}
                </p>
              </div>
              <div class="flex justify-between">
                <h2 class="text-md -mt-4 font-bold h-3 mb-10">
                  Количество штрафов:
                </h2>
                <p class="h-3 -mt-5 text-xl text-primary font-bold text-end">
                  {{ deliveriesCount.penaltyCount }}
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
                <h2 class="text-md -mt-4 font-bold h-3">
                  Готовы к выдаче со штрафом:
                </h2>
                <p class="h-3 -mt-5 text-xl text-primary font-bold text-end">
                  {{ deliveriesCount.availableWithPenaltyCount }}
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
