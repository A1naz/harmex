<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Корзина',
})
const store = useMainStore()
const mpStore = useMPStore()
const selectedMP = ref(mpStore.selectedMP || 'wildberries')
const route = useRoute()
const router = useRouter()
const cartForm = reactive({
  amount: 0,
  period: '3h',
  query: '',
  article: '',
  size: 'none',
})
const carts = ref([]) as any
const amount = ref(0)
const loadingUrl = ref(false)
const period = ref('3h')
const query = ref('')
const article = ref('')
const size = ref('none')
const { width, height } = useWindowSize()
const productData = ref<any>(null)
const urlError = ref(false)
const modalShow = ref<boolean>(false)
const MPTabs =
  store.client.username == 'test'
    ? [
        { title: 'Wildberries', value: 'wildberries' },
        { title: 'Ozon', value: 'ozon' },
      ]
    : [{ title: 'Wildberries', value: 'wildberries' }]

async function getCarts() {
  modalShow.value = false
  const { data, error } = await useFetch('/api/wildberries/cart/get', {
    method: 'GET',
    watch: false,
  })
  if (data.value) carts.value = data.value
  if (error.value)
    notify({
      type: 'error',
      title: 'Не удалось получить лайки',
      text: error.value.message,
    })
}
await getCarts()
async function create() {
  const { data, error } = await useFetch('/api/wildberries/cart/create', {
    method: 'POST',
    body: {
      amount: amount.value,
      article: article.value,
      query: query.value,
      productData: productData.value,
      size: size.value,
      period: period.value,
    },
    watch: false,
  })
  if (error.value)
    return notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: error.value.message,
    })
  if (data.value) {
    notify({ type: 'success', title: 'Упешно' })
    removeProduct()
    getCarts()
  }
}
async function getProductInfo() {
  if (!article.value) return

  const { data, error } = await useFetch(
    `/api/wildberries/product/${article.value}`,
    {
      method: 'GET',
    }
  )
  if ((data.value as any)?.product) {
    productData.value = (data.value as any).product
    if (productData.value?.sizes && productData.value.sizes.length > 0) {
      size.value = productData.value.sizes[0]
    }
    urlError.value = false
  }
  if (error.value) urlError.value = true

  loadingUrl.value = false
}
let timeout = null as NodeJS.Timeout | null
async function changeUrl() {
  if (article.value === '') return
  loadingUrl.value = true
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(getProductInfo, 2000)
}
function selectPeriod(event: any) {
  period.value = event.target.value
}
function selectSize(event: any) {
  size.value = event.target.value
}
function getStatus(status: string) {
  if (status === 'created') return 'Создан'
  else if (status === 'work') return 'В работе'
  else if (status === 'completed') return 'Завершен'
  else if (status === 'nofunds') return 'Недостаточно средств'
  else return status
}
function removeProduct() {
  productData.value = null
  article.value = ''
  amount.value = 0
}

const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'article',
})
const codeInput = ref()

async function selectFilterDate(e: any) {
  const target = e
  const { data } = await useFetch('/api/wildberries/cart/get', {
    method: 'GET',
    query: {
      dateFilter: target.value,
    },
    watch: false,
  })
  carts.value = data.value
}

async function findBuyouts(value: string, type: string) {
  if (!value) {
    search.loading = false
    await getCarts()
    return
  }
  const { data, error } = await useFetch('/api/wildberries/cart/get', {
    query: {
      string: value,
      type,
    },
    watch: false,
  })
  if (data.value) carts.value = data.value

  search.loading = false
}

const findBuyoutsDebounced = useDebounceFn(findBuyouts, 1000)

async function onSearchInput(event: Event) {
  const newValue = (event.target as HTMLInputElement).value
  search.loading = true
  findBuyoutsDebounced(search.text, search.type)
}

const updateSearchType = (filter: any) => {
  search.type = filter.value
}

function changeFilter(e: any) {
  mpStore.selectedMP = e.value
  return navigateTo('/cart/' + e.value)
}

onMounted(() => {
  if (route.query.modalShow) {
    modalShow.value = route.query.modalShow === 'true'
    const query = { ...route.query }
    delete query.modalShow
    router.push({ query })
  }
})
</script>

<template>
  <div>
    <!-- <h1 class="text-2xl font-bold mt-4">Корзина</h1> -->
    <div class="flex mt-4 flex-col lg:flex-row lg:justify-between gap-2">
      <div class="flex gap-1 lg:gap-4">
        <button
          @click="navigateTo(`/cart/create/`)"
          class="btn btn-primary font-normal btn-sm"
        >
          <Icon name="fluent:add-24-filled" size="17" />
          <span class="hidden lg:flex">Корзина</span>
        </button>
        <CustomSelect
          class="hidden lg:flex"
          :class="'sm:min-w-[120px]'"
          :tabs="MPTabs"
          @change-value="changeFilter"
        />
        <CustomSelect
          class="hidden lg:flex"
          :class="'sm:min-w-[120px]'"
          :tabs="[
            { title: 'Все корзины', value: 'all' },
            { title: 'Активные', value: 'work' },
            { title: 'Завершенные', value: 'completed' },
          ]"
          @change-value="selectFilterDate"
        />
        <div class="relative justify-end flex-grow-0 w-full lg:hidden">
          <input
            type="text"
            class="input input-sm w-full bg-base-300 bg-opacity-40 text-gray-500"
            placeholder="Поиск по вопросам"
            ref="codeInput"
            v-model="search.text"
            @input="onSearchInput($event)"
          />
          <span
            v-if="search.loading"
            class="absolute right-2 top-2 loading loading-spinner loading-xs p-2"
          />
          <Icon
            v-else
            class="absolute right-0.5 p-2 my-auto text-gray-500"
            name="tabler:search"
            size="35"
            @click="codeInput.focus()"
          />
        </div>
      </div>
      <div class="flex gap-2 lg:gap-5">
        <CustomSelect
          class="lg:hidden"
          :class="'sm:min-w-[120px]'"
          :tabs="MPTabs"
          @change-value="changeFilter"
        />
        <CustomSelect
          class="lg:hidden"
          :class="'sm:min-w-[120px]'"
          :tabs="[
            { title: 'Все корзины', value: 'all' },
            { title: 'Активные', value: 'work' },
            { title: 'Завершенные', value: 'completed' },
          ]"
          @change-value="selectFilterDate"
        />

        <CustomSelect
          :class="'bg-base-300 sm:min-w-[120px]'"
          :tabs="[
            { title: 'За все время', value: 'all' },
            { title: 'Сегодня', value: 'today' },
            { title: '3 дня', value: '3days' },
            { title: 'Неделя', value: '7days' },
          ]"
          @change-value="selectFilterDate"
        />

        <CustomSelect
          :class="'bg-base-300'"
          :tabs="[{ title: 'Артикул', value: 'article' }]"
          @change-value="updateSearchType"
        />
        <div class="relative justify-end flex-grow-0 w-full hidden lg:flex">
          <input
            ref="codeInput"
            v-model="search.text"
            type="text"
            class="input input-sm w-full bg-base-300 bg-opacity-40 text-gray-500"
            placeholder="Поиск по вопросам"
            @input="onSearchInput($event)"
          />
          <span
            v-if="search.loading"
            class="absolute right-2 loading loading-spinner loading-xs p-2 mt-2"
          />
          <Icon
            v-else
            class="absolute right-0.5 p-2 my-auto text-gray-500"
            name="tabler:search"
            size="35"
            @click="codeInput.focus()"
          />
        </div>
      </div>
    </div>
    <!-- <div class="collapse collapse-plus bg-base-100 rounded-box mb-4 mt-6">
      <input type="checkbox" />

      <div class="collapse-title text-xl font-medium">Добавить в корзину</div>
      <div class="collapse-content">
        <div class="bg-base-200 rounded-lg">
          
        </div>
      </div>
    </div> -->

    <div v-if="carts.length" class="mt-4">
      <div v-if="width >= 1024">
        <CartWildberriesTable :get-status="getStatus" :carts="carts" />
      </div>
      <div v-else>
        <CartWildberriesCards :carts="carts" :get-status="getStatus" />
      </div>
    </div>
    <div v-else>
      <Hero />
    </div>
  </div>
  <CartWildberriesCreateCart
    :show="modalShow"
    @close-modal="modalShow = false"
    @create="getCarts()"
  />
</template>

<style scoped></style>
