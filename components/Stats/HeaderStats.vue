<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const routePath = route.path.endsWith('/')
  ? route.path.slice(0, -1)
  : route.path
const apiRoute =
  '/' +
  (route.path === '/stats'
    ? route.path + '/'
    : route.path.startsWith('/stats/')
    ? route.path.split('/').slice(2).join('/') +
      '/' +
      route.path.split('/').slice(1, 2).join('/')
    : '')
const store = useMainStore()
const headerPeriod = ref(route.query.headerPeriod)
const headerDataLoading = ref(false)
const MPTabs = [
  { title: 'Все', value: '' },
  { title: 'Ozon', value: 'ozon' },
  { title: 'Wildberries', value: 'wildberries' },
  { title: 'Avito', value: 'avito' },
]
const periods = [
  { title: 'Сегодня', value: 'today' },
  { title: 'Вчера', value: 'yesterday' },
  { title: 'Неделя', value: 'week' },
  { title: 'Этот месяц', value: 'month' },
  { title: 'Прошлый месяц', value: 'lastMonth' },
]
const stats = computed(() => [
  {
    icon: 'coins',
    title: 'Пополнено',
    value: (totalSumm.value || 0) + ' ₽',
  },
  {
    icon: 'hand',
    title: 'Расходы',
    value: (totalExpense.value || 0) + ' ₽',
  },
  {
    icon: 'mbox',
    title: 'Остаток',
    value:
      totalSumm.value - totalExpense.value < 0
        ? 0 + ' ₽'
        : totalSumm.value - totalExpense.value + ' ₽',
  },
  {
    icon: 'box',
    title: 'Заказано услуг',
    value: totalDeals.value,
  },
  {
    icon: 'crystal',
    title: 'Партнерские вознаграждения',
    value: (comissions.value || 0) + ' ₽',
  },
])

const totalSumm = ref(0)
const totalExpense = ref(0)
const totalDeals = ref(0)
const comissions = ref(0)
async function getDataHeader() {
  const { data = null, error = null }: { data: any; error: any } =
    await useFetch(
      `/api${routePath === '/stats' ? routePath : apiRoute}/statsHeader`,
      {
        method: 'GET',
        params: {
          // type: route.query.type,
          period: headerPeriod.value,
        },
        watch: false,
      }
    )
  if (data.value) {
    totalSumm.value = data.value.totalSumm
    totalExpense.value = data.value.totalExpense
    totalDeals.value = data.value.totalDeals
    comissions.value = data.value.comissions
  }
  headerDataLoading.value = false
}
await getDataHeader()

async function changeMP(e: any) {
  return navigateTo(
    '/stats/' +
      e.value +
      `?type=${route.query.type}&period=${route.query.period}&headerPeriod=${route.query.headerPeriod}&deliveryPeriod=${route.query.deliveryPeriod}`
  )
}
function selectHeaderText() {
  const index = periods.findIndex((period) =>
    route.query.headerPeriod
      ? period.value === route.query.headerPeriod
      : period.value === 'today'
  )
  return periods[index].title
}
function changeHeaderPeriod(e: any) {
  headerDataLoading.value = true
  headerPeriod.value = e.value
  router.push(
    `${routePath}?type=${route.query.type}&period=${route.query.period}&headerPeriod=${e.value}&deliveryPeriod=${route.query.deliveryPeriod}`
  )
  getDataHeader()
}
function selectMpText() {
  const parts = routePath.split('/')
  return parts.length > 2
    ? parts[2].charAt(0).toUpperCase() + parts[2].slice(1)
    : 'Все'
}
</script>

<template>
  <div
    class="bg-base-100 rounded-lg drop-shadow-sm w-full p-3 pr-0 sm:p-6 flex flex-col gap-5 mt-4"
  >
    <div class="flex justify-between pr-3 sm:pr-0">
      <h2 class="font-semibold text-xl">Статистика</h2>
      <div class="flex gap-2">
        <CustomSelect
          class="lg:flex"
          :class="'sm:min-w-[120px]'"
          :status-text="selectMpText()"
          :tabs="MPTabs"
          @change-value="changeMP"
        />
        <CustomSelect
          class="lg:flex"
          :class="'sm:min-w-[120px]'"
          :status-text="selectHeaderText()"
          :tabs="periods"
          @change-value="changeHeaderPeriod"
        />
      </div>
    </div>
    <div class="overflow-x-auto">
      <!-- Обертка для горизонтальной прокрутки -->
      <div class="flex gap-3.5 sm::pr-6">
        <div
          v-for="item in stats"
          class="flex flex-col gap-3 w-[20%] min-w-[200px] md:min-w-0 rounded-lg bg-neutral-focus px-3.5 py-3"
        >
          <nuxt-img
            class="w-6 h-6 3xl:w-8 3xl:h-8"
            :src="`/icons/figma/stats/${item.icon}.svg`"
            alt="stats1"
          />
          <span
            class="text-neutral-content text-sm text-opacity-70 3xl:text-xl"
          >
            {{ item.title }}
          </span>
          <span
            v-if="!headerDataLoading"
            class="text-neutral-content text-2xl mt-auto 3xl:text-3xl"
          >
            {{ item.value }}
          </span>
          <span
            v-else
            class="loading loading-spinner loading-md text-primary"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>
