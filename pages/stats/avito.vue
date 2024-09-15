<script lang="ts" setup>
import { Bar } from 'vue-chartjs'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Аналитика',
})

const currency = useCurrency()
const route = useRoute()
const routePath = route.path.endsWith('/')
  ? route.path.slice(0, -1)
  : route.path
const { width } = useWindowSize()
const secondLevelReferrals = ref(0)
const lastElements = ref<any>([])
const periodFromRoute = route.query.period

if (
  !route.query.type ||
  !route.query.period ||
  !route.query.headerPeriod ||
  !route.query.deliveryPeriod
) {
  navigateTo(
    `${routePath}?type=all&period=today&headerPeriod=today&deliveryPeriod=today`,
    {
      external: true,
    }
  )
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
async function getData() {
  const { data, error }: any = await useFetch('/api/wildberries/stats/stats', {
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
  }
}

async function getLast() {
  const { data, error }: any = await useFetch('/api/wildberries/stats/last10', {
    method: 'GET',
  })

  if (data.value) {
    lastElements.value = data.value
  }
}

async function countBuyouts() {
  const { data, error }: any = await useFetch(
    '/api/wildberries/stats/buyoutsCount',
    {
      method: 'GET',
    }
  )
  if (data.value) {
    buyoutsCount.value = data.value
  }
}

async function coutDeliveries() {
  const { data, error }: any = await useFetch(
    '/api/wildberries/stats/deliveriesCount',
    {
      method: 'GET',
    }
  )
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
  const { data }: any = await useFetch(
    '/api/wildberries/stats/getPartnerWithdraws',
    {
      method: 'GET',
    }
  )
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

const store = useMainStore()

const colorMode = useColorMode()
const chardColor = computed(() =>
  colorMode.value === 'light' ? '#570df8' : '#a469f7'
)


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
    '/api/wildberries/stats/deliveries',
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


</script>
<template>
  <StatsHeaderStats />

  <StatsMainStats />

  <StatsDeliveryStats />

  <div class="h-24"></div>
</template>

<style scoped></style>
