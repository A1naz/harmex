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
const router = useRouter()
const { width } = useWindowSize()
const secondLevelReferrals = ref(0)
const lastElements = ref<any>([])
const deliveries = ref<any>([])
const periodFromRoute = route.query.period
const routePath = route.path.endsWith('/') ? route.path.slice(0, -1) : route.path;

if (!route.query.type || !route.query.period || !route.query.headerPeriod || !route.query.deliveryPeriod) {
  navigateTo(`${routePath}?type=all&period=today&headerPeriod=today&deliveryPeriod=today`, {
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




const purchaseDelivery = ref(0)
const inTransit = ref(0)
const readyToPickup = ref(0)
const received = ref(0)
const cancelled = ref(0)
const reviews = ref(0)

const deliveryPeriod = ref(route.query.deliveryPeriod)
const deliveryDataLoading = ref(false)
const searchQuery = ref('')
const searchLoading = ref(false)
const filteredElements = ref<any>([])
const deliveryQuery = ref('all')
const deliveryStatsLoading = ref(false)


async function countBuyouts() {
  //@ts-ignore
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
// await getData()
// await getLast()
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
  navigateTo(`${routePath}?type=${route.query.type}&period=${event.target.value}`, {
    external: true,
  })
}

function selectService(event: any) {
  navigateTo(`${routePath}?type=${event.target.value}&period=${route.query.period}`, {
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

// const MPTabs =  store.client.username == 'test' ? [
//   { title: 'Все', value: '' },
//   { title: 'Ozon', value: 'ozon' },
//   { title: 'Wildberries', value: 'wildberries' },
// ] : [
//   { title: 'Все', value: '' },
//   { title: 'Wildberries', value: 'wildberries' },
// ]

const periods = [
      { title: 'Сегодня', value: 'today' },
      { title: 'Вчера', value: 'yesterday' },
      { title: 'Неделя', value: 'week' },
      { title: 'Этот месяц', value: 'month' },
      { title: 'Прошлый месяц', value: 'lastMonth' },
    ];
const deliveryType = [
  { title: 'Все', value: 'all' },
  { title: 'В пути', value: 'inTransit' },
  { title: 'Готовы к выдаче', value: 'ready' },
  { title: 'Получено', value: 'picked' },
  { title: 'Отменено', value: 'canceled' },
];
// async function changeMP(e: any) {
//   return navigateTo(
//     `${routePath}/` + e.value + `?type=${route.query.type}&period=${route.query.period}&headerPeriod=${route.query.headerPeriod}&deliveryPeriod=${route.query.deliveryPeriod}`
//   )
// }
// function changeHeaderPeriod(e: any) {
//   headerDataLoading.value = true
//   headerPeriod.value = e.value
//   router.push(`${routePath}?type=${route.query.type}&period=${route.query.period}&headerPeriod=${e.value}&deliveryPeriod=${route.query.deliveryPeriod}`)
//   getDataHeader()
// }

// function changeDeliveryPeriod(e: any) {
//   deliveryDataLoading.value = true
//   deliveryStatsLoading.value = true
//   deliveryPeriod.value = e.value
//   router.push(`${routePath}?type=${route.query.type}&period=${route.query.period}&headerPeriod=${route.query.headerPeriod}&deliveryPeriod=${e.value}`)
//   getLast()
// }

// function changePeriod(e: any) {
//   navigateTo(`${routePath}?type=${route.query.type}&period=${e.value}&headerPeriod=${route.query.headerPeriod}&deliveryPeriod=${route.query.deliveryPeriod}`, {
//     external: true,
//   });
// }
// function changeService(e: any) {
//   selectedService.value = e

//   navigateTo(`${routePath}?type=${e.value}&period=${route.query.period}&headerPeriod=${route.query.headerPeriod}&deliveryPeriod=${route.query.deliveryPeriod}`, {
//     external: true,
//   })
// }
// function changeDelivery(e: any) {
//   deliveryQuery.value = e.value
//   deliveryDataLoading.value = true  
//   deliveryStatsLoading.value = true
//   getLast();
// }

// function selectText() {
//   const index = periods.findIndex(period => route.query.period ? period.value === route.query.period : period.value === 'today');
//   return periods[index].title 
// }
// function selectHeaderText() {
//   const index = periods.findIndex(period => route.query.headerPeriod ? period.value === route.query.headerPeriod : period.value === 'today');
//   return periods[index].title 
// }
// function selectDeliveryText() {
//   const index = periods.findIndex(period => route.query.deliveryPeriod ? period.value === route.query.deliveryPeriod : period.value === 'today');
//   return periods[index].title 
// }

// function selectServiceText() {
//   const index = services.value.findIndex((service:any) => route.query.type ? service.value === route.query.type : service.value === 'all');
//   return services.value[index].title
// }

onMounted(() => {
      
})


const deliveryStats = computed(() => [
  {
    title: 'Выкуплено',
    value: purchaseDelivery.value,
  },
  {
    title: 'Доступных отзывов',
    value: reviews.value,
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
])

const filterElementsDebounced = useDebounceFn(filterElements, 1000)
function filterElements() {
  
  filteredElements.value = lastElements.value.map((element: any) => {
  return {
      ...element, 
      purchaseDate: element.purchaseDate ? defaultDateShort(element.purchaseDate) : '-',
      receiptDate: element.receiptDate ? defaultDateShort(element.receiptDate) : '-',
      receiveDate: element.receiveDate ? defaultDateShort(element.receiveDate) : '-',
    };
  });
  if(searchQuery.value === '') {
    searchLoading.value = false
    deliveryDataLoading.value = false
    return
  }
  filteredElements.value = filteredElements.value.filter((element: any) =>
    Object.values(element).some(value =>
      String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  );
  deliveryDataLoading.value = false
  searchLoading.value = false
}
function search(){
  searchLoading.value = true
  deliveryDataLoading.value = true
  filterElementsDebounced()
}
</script>
<template>
  <StatsHeaderStats />

  <StatsMainStats />

  <StatsDeliveryStats />
  
  <div class="h-10"></div>
</template>

<style scoped></style>
