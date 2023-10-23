<script lang="ts" setup>
import { notify } from '@kyvg/vue3-notification'
import { relative } from 'path'
import { Bar } from 'vue-chartjs'
const currency = useCurrency()

const route = useRoute()
const router = useRouter()
const status = computed(() => route.query?.status || 'all')

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Аналитика',
})

let chartDataValue = ref<any>([])

const { data, error } = await useFetch('/api/stats/stats', {
  method: 'GET',
})
if (data.value) {
  chartDataValue.value = data.value
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

const services = ref([
  {
    value: 'all',
    title: 'Все',
    expenses: 55452,
    quantity: 495,
  },
  {
    value: 'buyouts service',
    title: 'Выкупы',
    expenses: 10880,
    quantity: 110,
  },
  {
    value: 'reviews',
    title: 'Отзывы',
    expenses: 7980,
    quantity: 90,
  },
  {
    value: 'likes',
    title: 'Лайки на отзывы',
    expenses: 19880,
    quantity: 56,
  },
  {
    value: 'productlikes',
    title: 'Лайки на товар/бренд',
    expenses: 9180,
    quantity: 95,
  },
  {
    value: 'questions',
    title: 'Вопросы',
    expenses: 4320,
    quantity: 59,
  },
  {
    value: 'cart',
    title: 'Корзина',
    expenses: 3212,
    quantity: 95,
  },
  {
    value: 'autoanswer',
    title: 'Автоответчик',
    expenses: 55452,
    quantity: 495,
  },
])

const selectedService: any = ref({
  value: 'all',
  title: 'Все',
  expenses: 55452,
  quantity: 495,
})

const type = route.query.type ? route.query.type : ''
const chartBar: any = ref(null)
const chartData = ref({
  labels: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ],
  datasets: [
    {
      barPercentage: 0.5,
      barThickness: 35,
      maxBarThickness: 35,
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

function select(event: any) {
  selectedService.value = services.value.find(
    (service: any) => service.value === event.target.value
  )
  chartData.value.datasets[0].label = 'aaaaa'
  chartData.value.datasets[0].data = [65, 12, 32, 45, 65]
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
        :to="'/stats?type=' + service.value"
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
      class="select select-bordered select-sm lg:hidden"
      @change="select($event)"
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
      <div
        class="flex flex-col md:flex md:flex-row md:flex-wrap"
      >
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
              class="card w-full md:w-44 bg-base-100 shadow-2xl"
            >
              <div class="card-body">
                <h2 class="text-md font-bold h-3 mb-10 -mt-5 text-center">
                  {{ service.title }}
                </h2>
                <h2 class="text-2xl text-primary font-bold  text-center">
                  {{ service.quantity }}
                </h2>
                <h2 class="mt-1  text-center">{{ currency.format(service.expenses) }}</h2>
                <h2 class=" text-center">за неделю</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
