<script setup lang="ts">
import { Bar } from 'vue-chartjs'

const route = useRoute()
const router = useRouter()
const routePath = route.path.endsWith('/') ? route.path.slice(0, -1) : route.path;
const apiRoute = '/'+( route.path === '/stats' ? route.path + '/' : route.path.startsWith('/stats/') ? route.path.split('/').slice(2).join('/') + '/' + route.path.split('/').slice(1, 2).join('/') : '');
const store = useMainStore()
const periodFromRoute = route.query.period
const periods = [
      { title: 'Сегодня', value: 'today' },
      { title: 'Вчера', value: 'yesterday' },
      { title: 'Неделя', value: 'week' },
      { title: 'Этот месяц', value: 'month' },
      { title: 'Прошлый месяц', value: 'lastMonth' },
    ];

let chartDataValue = ref<any>([])
const services = ref<any>([])
let chartLabels = ref<any>([])

async function getData() {
  const { data, error }: any = await useFetch(`/api${routePath === '/stats' ? routePath : apiRoute}/stats`, {
    method: 'GET',
    params: {
      type: route.query.type ? route.query.type : 'all',
      period: route.query.period ? route.query.period : 'today',
    },
    watch: false,
  })
  if (data.value) {
    services.value = data.value.services
    chartDataValue.value = data.value.data
    chartLabels.value = data.value.labels
  }
  
}
await getData()

const colorMode = useColorMode()
const chardColor = computed(() =>
  colorMode.value === 'light' ? '#3273FF' : '#3273FF'
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

function selectServiceText() {
  const index = services.value.findIndex((service:any) => route.query.type ? service.value === route.query.type : service.value === 'all');
  return services.value[index].title ? services.value[index].title : 'Все'
}
function selectText() {
  const index = periods.findIndex(period => route.query.period ? period.value === route.query.period : period.value === 'today');
  return periods[index].title 
}
function changeService(e: any) {
  selectedService.value = e

  navigateTo(`${routePath}?type=${e.value}&period=${route.query.period}&headerPeriod=${route.query.headerPeriod}&deliveryPeriod=${route.query.deliveryPeriod}`, {
    external: true,
  })
}
function changePeriod(e: any) {
  navigateTo(`${routePath}?type=${route.query.type}&period=${e.value}&headerPeriod=${route.query.headerPeriod}&deliveryPeriod=${route.query.deliveryPeriod}`, {
    external: true,
  });
}
</script>

<template>

<div  class="bg-base-100 rounded-lg drop-shadow-sm w-full flex flex-col gap-5 mt-4 ">
    <div class="flex gap-2 sm:self-end p-3 sm:p-6">
      {{ services.value }}
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
      class="flex flex-col lg:flex-row gap-2 sm:gap-10 w-full bg-base-100 rounded-lg px-1 py-3"
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
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full">
          <div
            v-for="(service, index) in services"
            class="flex flex-col bg-primary bg-opacity-5 rounded-lg gap-2"
          >
            <div class="card-body flex flex-col justify-center p-5 navbar:p-2">
              <h2 class="font-bold text-xs text-center 3xl:text-xl">
                {{ service.title }}
              </h2>
              <div class="flex flex-col">
                  <h2 class="text-2xl  text-primary font-bold text-center mb-2">
                    {{ service.quantity }}
                  </h2>
                  <h2
                    class="text-center text-sm 3xl:text-lg"
                    :class="{'opacity-0': service.value == 'deliveries'}"
                  >
                    {{ service.expenses+' ₽' }}
                  </h2>
              </div>
              <h2 class="text-center 3xl:text-lg">
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
</template>
