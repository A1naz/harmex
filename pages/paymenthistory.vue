<script setup lang="ts">
import { usePrimeVue } from 'primevue/config'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'История платежей',
})
const autoTarget = ref(true)

const target = ref(null)
const targetIsVisible = ref(false)
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }], observerElement) => {
    targetIsVisible.value = isIntersecting
  },
)
const skip = ref(50)
const dateFilter = ref('all')
const end = ref(false)
const store = useMainStore()
const filterType = ref('all')
const PrimeVue = usePrimeVue()
const { width, height } = useWindowSize()
const route = useRoute()
const currency = useCurrency()
const history = ref([]) as any
const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'uuid',
})
async function getPaymentHistory() {
  const { data, error } = await useFetch('/api/paymenthistory/get', {
    method: 'GET',
    query: {
      type: filterType.value,
      skip: 0,
      limit: 50,
    },

  })
  history.value = data.value
}
await getPaymentHistory()


async function selectType(e: Event) {
  const target = e.target as HTMLSelectElement
  filterType.value = target.value
  skip.value = 50
  end.value = false
  const { data } = await useFetch('/api/paymenthistory/get', {
    method: 'GET',
    query: {
      type: filterType.value,
      limit: 50,
    },
  })
  history.value = data.value
}
async function findPaymentHistory(value: string, type: string) {
  if (!value) {
    autoTarget.value = true
    await getPaymentHistory()
    search.loading = false
    return
  }
  const { data, error } = await useFetch('/api/paymenthistory/search', {
    query: {
      string: value,
      type,
    },
  })
  if (data.value)
    history.value = data.value

  search.loading = false
}

const findPaymentHistoryDebounced = useDebounceFn(findPaymentHistory, 1000)

async function onSearchInput(event: Event) {
  const newValue = (event.target as HTMLInputElement).value
  autoTarget.value = false
  search.loading = true
  findPaymentHistoryDebounced(search.text, search.type)
}
async function selectFilterDate(e: Event) {
  const target = e.target as HTMLSelectElement
  dateFilter.value = target.value
  skip.value = 50
  end.value = false
  const { data } = await useFetch('/api/paymenthistory/get', {
    method: 'GET',
    query: {
      dateFilter: dateFilter.value,
      limit: 50,
    },
  })
  history.value = data.value
}

function openInfoModal() {
  store.infoModal = true
  store.infoType = 'paymenthistory'
}

watch(targetIsVisible, async (isVisible) => {
  if (isVisible && autoTarget.value && history.value.length >= 50) {
    if (end.value)
      return
    const { data, error } = await useFetch('/api/paymenthistory/get', {
      method: 'GET',
      query: {
        dateFilter: dateFilter.value,
        type: filterType.value,
        limit: 50,
        skip: skip.value,
      },
      headers: useRequestHeaders(['cookie']) as HeadersInit,
    })
    if ((data.value as any)?.length === 0) {
      end.value = true
      return
    }
    history.value = [...history.value, ...data.value! as any]
    skip.value += 50
  }
})
function getHistoryType(type: string) {
  let result = ''
  switch (type) {
    case 'buyouts':
      result = 'Выкуп'
      break
    case 'buyouts service':
      result = 'Оплата выкупа'
      break
    case 'reviews':
      result = 'Отзыв'
      break
    case 'likes':
      result = 'Лайк'
      break
    case 'productlikes':
      result = 'Лайк на товар / бренд'
      break
    case 'carts':
      result = 'Добавление в корзину'
      break
    case 'questions':
      result = 'Вопрос'
      break
  }
  return result
}
const router = useRouter()

function openBuyout(data: any) {
    const uuid = data.basisoperation.slice(data.basisoperation.indexOf('#') + 1, data.basisoperation.length)
  router.push(`/buyouts?uuid=${uuid}`)
}
function openReview(data: any) {
    const uuid = data.basisoperation.slice(data.basisoperation.indexOf(' ') + 1, data.basisoperation.length)
    router.push(`/reviews?status=published&uuid=${uuid}`)
}

</script>

<template>
  <div>
    <div class="flex flex-row items-center mt-4">
      <h1 class="text-2xl font-bold ">
        История платежей
      </h1>
        <InfoButton @openModal="openInfoModal" class="mr-6 ml-0 md:mr-2 md:ml-2" />
    </div>
    <p class="text-xs font-light mt-1 lg:text-sm mb-6">
      Здесь можно увидеть движение вашего баланса
    </p>
    <div class="flex gap-4 mb-8 mt-6 items-center justify-between flex-wrap">
      <div class="flex items-center gap-2">
        <div class="flex gap-4 items-center">
            <ExportXls 
                api="/api/paymenthistory/export"
                fileName="Финансовый отчет услуг TOPVTOP.xlsx"
                :isVisible="history.length ? true : false"
            />
        </div>
        <select class="select select-bordered select-sm" @change="selectType">
          <option value="all">
            Все
          </option>
          <option value="buyouts">
            Выкупы
          </option>
          <option value="reviews">
            Отзывы
          </option>
          <option value="questions">
            Вопросы
          </option>
        </select>
        <select class="select select-bordered select-sm" @change="selectFilterDate">
          <option value="all">
            За все время
          </option>
          <option value="today">
            Сегодня
          </option>
          <option value="3days">
            3 дня
          </option>
          <option value="7days">
            Неделя
          </option>
        </select>
      </div>

      <div class="flex gap-1 items-center">
        <select v-model="search.type" disabled class="select select-bordered select-sm">
          <option value="uuid">
            Основание / ID
          </option>
        </select>
        <div class="relative flex items-center flex-grow-0 w-full">
          <input v-model="search.text" type="text" class="input input-sm input-bordered" placeholder="Поиск" @input="onSearchInput($event)">

          <span
            v-if="search.loading"
            class="absolute right-2 loading loading-spinner loading-xs p-2"
          />
        </div>
      </div>
    </div>
    <div v-if="width > 1024">
      <DataTable sort-field="dataoperation" :sort-order="-1" class="bg-base-200 hidden lg:block" :value="history" removable-sort>
        <Column field="summ" sortable header="Сумма">
          <template #body="{ data }">
            {{ currency.format(data.summ) }}
          </template>
        </Column>
        <Column field="typeoperations" sortable header="Тип операции" />
        <Column field="type" sortable header="Услуга">
          <template #body="{ data }">
            <div class="">
              {{ getHistoryType(data.type) }}
            </div>
          </template>
        </Column>
        <Column field="article" sortable header="Артикул">
          <template #body="{ data }">
            <div class="">
              <a
                :href="`https://www.wildberries.ru/catalog/${data.article}/detail.aspx`" target="_blank"
                class="text-sm text-secondary link link-hover"
              >
                {{ data.article }}
              </a>
            </div>
          </template>
        </Column>

        <Column field="basisoperation" sortable header="Основание операции">
          <template #body="{ data }">
            <div v-if="data.type === 'buyouts' || data.type === 'buyouts service'">
              <label
                class="link link-hover hover:text-primary truncate z-10"
                @click="openBuyout(data)"
              >
                {{ data.basisoperation }}</label>
            </div>
            <div v-else-if="data.type === 'reviews'">
              <label
                class="link link-hover hover:text-primary truncate z-10"
                @click="openReview(data)"
              >
                {{ data.basisoperation }}</label>
            </div>
            <div v-else>
              {{ data.basisoperation }}
            </div>
          </template>
        </Column>
        <Column field="dataoperation" sortable header="Дата">
          <template #body="{ data }">
            <div class="">
              {{ defaultDate(data.dataoperation) }}
            </div>
          </template>
        </Column>
        <Column field="comment" sortable header="Комментарий" />
      </DataTable>
      <div ref="target" class="flex justify-center items-center h-4" />
    </div>
    <ul v-else class="w-full lg:hidden">
      <li v-for="(item, index) in history" :key="index" class="pb-3 sm:pb-4">
        <div tabindex="0" class="collapse collapse-arrow bg-base-200 rounded-box">
          <div class="collapse-title font-medium ">
            <div class="mb-2 text-sm text-start">
              {{ item.basisoperation }}
            </div>
            <div class="flex gap-6 justify-between items-center">
              <div class="flex gap-2">
                <div class="sum">
                  {{ item.typeoperations === 'Приход' ? '+' : '-' }}
                  {{ currency.format(item.summ) }}
                </div>
              </div>
              <div class="date text-xs text-gray-500 dark:text-gray-400">
                {{ defaultDate(item.dataoperation) }}
              </div>
            </div>
          </div>
          <div class="collapse-content">
            <div class="flex flex-col">
              <dd class="font-semibold text-sm">
                <a
                :href="`https://www.wildberries.ru/catalog/${item.article}/detail.aspx`" target="_blank"
                class="text-sm text-secondary link link-hover"
              >
                {{ item.article }}
              </a>
              </dd>
              <dt  class="mb-1 text-gray-500 text-sm  dark:text-gray-400">
                <dd class="font-semibold text-sm">
                  Услуга - {{getHistoryType(item.type) }}
                </dd>
              </dt>
              <dt v-if="item.comment" class="mb-1 text-gray-500 text-sm  dark:text-gray-400">
                <dd class="font-semibold text-sm">
                  Комментарий - {{ item.comment }}
                </dd>
              </dt>
            </div>
          </div>
        </div>
      </li>
      <div ref="target" class="flex justify-center items-center p-4 h-4" />
    </ul>
  </div>
</template>

<style>
.p-datatable-wrapper {
 @apply bg-base-200 rounded-lg
}
.p-datatable {
  @apply bg-base-200 rounded-lg
}
.p-datatable-table {
  @apply table table-zebra rounded-lg
}
.p-column-header-content {
  @apply flex gap-2
}
.p-column-header-content {
  @apply normal-case text-base
}
</style>
