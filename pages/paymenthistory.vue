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
const mpStore = useMPStore()
const filterType = ref('all')
const mp = ref('all')
const PrimeVue = usePrimeVue()
const { width, height } = useWindowSize()
const route = useRoute()
const currency = useCurrency()
const history = ref([]) as any
const loading = ref(false)
const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'uuid',
})
async function getPaymentHistory() {
  loading.value = true
  //@ts-ignore
  const { data, error } = await useFetch('/api/paymenthistory/get', {
    method: 'GET',
    query: {
      type: filterType.value,
      mp: mp.value,
      skip: 0,
      limit: 50,
    },

  })
  history.value = data.value
  loading.value = false
}
getPaymentHistory()


async function selectType(e: any) {
  const target = e
  filterType.value = target.value
  skip.value = 50
  end.value = false
  const { data } = await useFetch('/api/paymenthistory/get', {
    method: 'GET',
    query: {
      type: filterType.value,
      mp: mp.value,
      limit: 50,
    },
  })
  history.value = data.value
}
async function selectMp(e: any) {
  const target = e
  mp.value = target.value
  skip.value = 50
  end.value = false
  const { data } = await useFetch('/api/paymenthistory/get', {
    method: 'GET',
    query: {
      type: filterType.value,
      mp: mp.value,
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
      mp: mp.value,
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
async function selectFilterDate(e: any) {
  const target = e
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

watch(targetIsVisible, async (isVisible) => {
  if (isVisible && autoTarget.value && history.value.length >= 50) {
    if (end.value)
      return
    const { data, error } = await useFetch('/api/paymenthistory/get', {
      method: 'GET',
      query: {
        dateFilter: dateFilter.value,
        type: filterType.value,
        mp: mp.value,
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
    case 'review':
      result = 'Отзыв'
      break
    case 'likeReview':
      result = 'Лайк на отзыв'
      break
    case 'likeProduct':
      result = 'Лайк на товар / бренд'
      break
    case 'cart':
      result = 'Добавление в корзину'
      break
    case 'questionProduct':
      result = 'Вопрос'
      break
    case 'deliveryStorage':
      result = 'Штраф'
      break
      case 'reviewRemoving':
        result = 'Удаление отзыва'
        break
        case 'viewing':
          result = 'Просмотр'
  }
  return result
}
const router = useRouter()

function openBuyout(data: any) {
  
  const uuid = data.basisoperation.slice(data.basisoperation.indexOf('#') + 1, data.basisoperation.length)
  router.push(`/buyouts/${data.mp ? data.mp : 'wildberries'}?uuid=${uuid}`)
}
function openReview(data: any) {
    const idReview = data.basisoperation.slice(data.basisoperation.indexOf(' ') + 1, data.basisoperation.length)

    router.push(`/reviews/${data.mp ? data.mp : 'wildberries'}?status=published&idReview=${idReview}`)
}

const updateSearchType = (filter: any) => {
  search.type = filter.value
}
</script>

<template>
  <div v-if="!loading">

    <div class="flex lg:hidden gap-2 w-full mt-4">
      <ExportXls 
                :api="'/api/paymenthistory/export?mp=' + mp"
                fileName="Финансовый отчет услуг MARKETMONSTR.xlsx"
                :isVisible="history.length ? true : false"
            />

      <div class="relative flex items-center flex-grow-0 w-full">
          <input v-model="search.text" type="text" class="input input-sm bg-base-300 bg-opacity-40 text-gray-500 w-full" placeholder="Поиск" @input="onSearchInput($event)">

          <span
            v-if="search.loading"
            class="absolute right-2 loading loading-spinner loading-xs p-2"
          />
        </div>
    </div>
    <div class="flex gap-2 mb-8 mt-2 lg:mt-4 items-center lg:justify-between flex-wrap ">
      <div class="flex items-center gap-2">

        <CustomSelect
          :class="'sm:min-w-[120px]'"
          :tabs="[
      { title: 'Все', value: 'all' },
      { title: 'Ozon', value: 'ozon' },
      { title: 'Wildberries', value: 'wildberries' },
      { title: 'Avito', value: 'avito' },
      { title: 'Flowwow', value: 'flowwow' },
    ]"
          @change-value="selectMp"
        />
        <CustomSelect
          :class="'bg-[#f4f4f4] sm:min-w-[120px]'"
          :tabs="[
            { title: 'Все', value: 'all' },
            { title: 'Выкупы', value: 'buyouts' },
            { title: 'Отзывы', value: 'review' },
            { title: 'Лайки на отзывы', value: 'likeReview' },
            { title: 'Лайки на товар/бренд', value: 'likeProduct' },
            { title: 'Вопросы', value: 'questionProduct' },
            { title: 'Корзина', value: 'cart' },
            { title: 'Удаление отзыва', value: 'reviewRemoving' },
            { title: 'Штраф', value: 'deliveryStorage' },
            { title: 'Просмотры', value: 'viewing' },
          ]"
          @change-value="selectType"
        />
        <CustomSelect
        :class="'bg-[#f4f4f4] sm:min-w-[120px]'"
          :tabs="[
            { title: 'За все время', value: 'all' },
            { title: 'Сегодня', value: 'today' },
            { title: '3 дня', value: '3days' },
            { title: 'Неделя', value: '7days' },
          ]"
          @change-value="selectFilterDate"
        />
        
      </div>

      <div class="flex gap-1 items-center">
        <CustomSelect
          :class="'bg-[#f4f4f4] sm:min-w-[150px]'"
          :tabs="[{ title: 'Основание / ID', value: 'uuid' }]"
          @change-value="updateSearchType"
        />
        <div class="relative items-center flex-grow-0 w-full hidden lg:flex">
          <input v-model="search.text" type="text" class="input input-sm bg-base-300 bg-opacity-40 text-gray-500" placeholder="Поиск" @input="onSearchInput($event)">

          <span
            v-if="search.loading"
            class="absolute right-2 loading loading-spinner loading-xs p-2"
          />
        </div>
        <div class="gap-2 items-center hidden lg:flex">
            <ExportXls 
                :api="'/api/paymenthistory/export?mp=' + mp"
                fileName="Финансовый отчет услуг MARKETMONSTR.xlsx"
                :isVisible="history.length ? true : false"
            />
        </div>
      </div>
    </div>
    <div v-if="width >= 1024">
      <DataTable sort-field="dataoperation" :sort-order="-1" class="hidden lg:block" :value="history" removable-sort 
      :pt="{
                    headerRow:  { class: [
                        'bg-[#f1f2ff] dark:bg-primary dark:bg-opacity-10 border-none text-base-content rounded-t-3xl text-center '
                    ] },

                }"
      >
        <Column field="summ" sortable header="Сумма" class="border-r border-base-200"   
                :pt="{
                    bodyCell:  { class: [
                        'bg-base-100 '
                    ] },
                    headerCell:  { class: [
                        'rounded-tl-3xl border-none text-center mx-auto'
                    ] },
                }">
          <template #body="{ data }">
            {{ currency.format(data.summ) }}
          </template>
        </Column>
        <Column field="typeoperations" sortable header="Тип операции" class="border-r border-base-200"  :pt="{
                    bodyCell:  { class: [
                        'bg-base-100'
                    ] },
                    headerCell:  { class: [
                        'border-none'
                    ] },
                }"/>
         <Column field="mp" sortable header="Категория" class="border-r border-base-200"  :pt="{
                    bodyCell:  { class: [
                        'bg-base-100'
                    ] },
                    headerCell:  { class: [
                        'border-none'
                    ] },
                }">
          <template #body="{ data }">
            <div class="">
              {{ data.typeoperations === 'Приход' ? ' ' :
                data.mp ? data.mp.replace(/\b(\w)/, char => char.toUpperCase()) : 'Wildberries' }}
            </div>
          </template>
        </Column>
        <Column field="type" sortable header="Услуга" class="border-r border-base-200"  :pt="{
                    bodyCell:  { class: [
                        'bg-base-100'
                    ] },
                    headerCell:  { class: [
                        'border-none'
                    ] },
                }">
          <template #body="{ data }">
            <div class="">
              {{ getHistoryType(data.type) }}
            </div>
          </template>
        </Column>
        <Column field="article" sortable header="Артикул" class="border-r border-base-200"  :pt="{
                    bodyCell:  { class: [
                        'bg-base-100'
                    ] },
                    headerCell:  { class: [
                        'border-none'
                    ] },
                }">
          <template #body="{ data }">
            <div class="">
              <a
              :href="(!data.mp || data.mp === 'wildberries') ? `https://www.wildberries.ru/catalog/${data.article}/detail.aspx` : (data.mp === 'avito' ? `https://www.avito.ru/${data.article}` : `https://www.ozon.ru/product/${data.article}`)"
              target="_blank"
                class="text-sm text-primary link link-hover"
              >
                {{ data.article }}
              </a>
            </div>
          </template>
        </Column>

        <Column field="basisoperation" sortable header="Основание операции" class="border-r border-base-200"  :pt="{
                    bodyCell:  { class: [
                        'bg-base-100'
                    ] },
                    headerCell:  { class: [
                        'border-none'
                    ] },
                }">
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
        <Column field="dataoperation" sortable header="Дата" class="border-r border-base-200 "  :pt="{
                    bodyCell:  { class: [
                        'bg-base-100 text-primary'
                    ] },
                    headerCell:  { class: [
                        'border-none'
                    ] },
                }">
          <template #body="{ data }">
            <div class="">
              {{ defaultDate(data.dataoperation) }}
            </div>
          </template>
        </Column>
        <Column field="comment" sortable header="Комментарий" :pt="{
                    headerCell:  { class: [
                        'rounded-tr-3xl border-none'
                    ] },
                    bodyCell:  { class: [
                        'bg-base-100'
                    ] },
                }"/>
      </DataTable>
      <div ref="target" class="flex justify-center items-center h-4" />
    </div>
    <ul v-else class="w-full lg:hidden ">
      <li v-for="(item, index) in history" :key="index" class="pb-3 sm:pb-4">
        <div tabindex="0" class="collapse collapse-arrow bg-base-200 rounded-box">
          <input type="checkbox" class="peer" /> 
          <div class="collapse-title font-medium bg-base-100">
            <div class="mb-2 text-sm text-start">
              {{ item.basisoperation }}
            </div>
            <div class="flex gap-6 justify-between items-center">
              <div class="flex gap-2">
                <div class="sum">
                  {{ item.typeoperations === 'Приход' ? '+' : '-' }}
                  {{ currency.format(item.summ) }}
                </div>
                <div class="bg-base-300 rounded-md text-sm font-normal my-auto p-0.5 mt-1 px-2">
                    {{ item.mp ? item.mp.replace(/\b(\w)/, char => char.toUpperCase()) : 'Wildberries' }}
                </div>
              </div>
              <div class="date text-xs text-gray-500 dark:text-gray-400">
                {{ defaultDate(item.dataoperation) }}
              </div>
            </div>
          </div>
          <div class="collapse-content bg-base-100">
            <div class="flex flex-col">
              <dd class="font-semibold text-sm">
                <a
                :href="(!item.mp || item.mp === 'wildberries') ? `https://www.wildberries.ru/catalog/${item.article}/detail.aspx` : (item.mp === 'avito' ? `https://www.avito.ru/${item.article}` : `https://www.ozon.ru/product/${item.article}`)"
                class="text-sm text-primary link link-hover"
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
  <Hero v-else-if="!loading" />
    <div v-else class="w-full flex justify-center items-center mt-20">
      <span class="loading loading-dots loading-lg text-primary"></span>
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
  @apply table table-zebra rounded-lg text-center
}
.p-column-header-content {
  @apply flex gap-2 text-center mx-auto justify-center 
}
.p-column-header-content {
  @apply normal-case text-base text-center justify-center 
}
</style>
