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
<template></template>

<style scoped></style>
