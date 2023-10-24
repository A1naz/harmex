<script lang="ts" setup>
const { width, height } = useWindowSize()
import { notify } from '@kyvg/vue3-notification'
import { relative } from 'path'
import { Bar } from 'vue-chartjs'
const currency = useCurrency()

const route = useRoute()
const router = useRouter()
const status = computed(() => route.query?.status || 'all')
const periodFromRoute = route.query.period

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Аналитика',
})

let chartDataValue = ref<any>([])
const services = ref<any>([])
let chartLabels = ref<any>([])
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

const store = useMainStore()

function openInfoModal() {
  store.infoModal = true
  store.infoType = 'reviews'
}

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

const type = route.query.type ? route.query.type : ''
const chartBar: any = ref(null)
const chartData = ref({
  labels: chartLabels.value,
  datasets: [
    {
      barPercentage: 0.5,
      barThickness:
        width.value > 768 ? 55 - chartDataValue.value.length : 42 - chartDataValue.value.length,
      maxBarThickness: 30,
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
  navigateTo('/stats?type=all&period=today')
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
        Прошедший месяц
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
        <div class="w-full lg:w-1/2">
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
  </div>
</template>

<style scoped></style>
