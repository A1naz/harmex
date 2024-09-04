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
const sortPage = ref('all')
const sortPageDate = ref('')
const { $dayjs } = useNuxtApp()
const cartForm = reactive({
  amount: 0,
  period: '3h',
  query: '',
  article: '',
  size: 'none',
})
const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'article',
})
const codeInput = ref()
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
const logModal = ref(false)
const selectedCart = ref({
  uuid: '',
})

const loading = ref(false)
const limit = ref(50)
const skip = ref(0)
const end = ref(false)
const target = ref(null)
const targetIsVisible = ref(false)
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }], observerElement) => {
    targetIsVisible.value = isIntersecting
  }
)
watch(targetIsVisible, async (isVisible) => {
  if (!end.value && isVisible && carts.value.length >= limit.value) {
    await getCarts()
  }
})
async function getCarts() {
  modalShow.value = false
  const { data, error } = await useFetch('/api/wildberries/cart/get', {
    method: 'GET',
    query: {
      statusQuery: sortPage.value,
      dateFilter: sortPageDate.value,
      string: search.text,
      type: search.type,
      limit: limit.value,
      skip: skip.value,
    },
    watch: false,
  })
  if ((data.value as any)?.length === 0) {
    loading.value = false
    end.value = true
    return
  }
  if (data.value) {
    carts.value = [...carts.value, ...(data.value! as any)]
    loading.value = false
  }

  if (error.value)
    notify({
      type: 'error',
      title: 'Не удалось получить корзины',
      text: error.value.message,
    })
  skip.value += limit.value
  loading.value = false
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
    notify({ type: 'success', title: 'Успешно' })
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
  else if (status === 'busy') return 'В работе'
  else if (status === 'completed') return 'Завершен'
  else if (status === 'archived') return 'В архиве'
  else if (status === 'nofunds') return 'Недостаточно средств'
  else return status
}

async function resumeStatus(item: any) {
  const { data, error } = await useFetch('/api/wildberries/cart/resume', {
    method: 'POST',
    body: {
      item: item,
    },
    watch: false,
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data?.message,
      type: 'error',
      duration: 3000,
    })
    return
  }
  if (data.value) {
    notify({
      type: 'success',
      title: 'Успешно',
      text: 'Корзина успешно возвращена в работу',
      duration: 3000,
    })
    selectFilterDate({ value: sortPage.value })
  }
}

function removeProduct() {
  productData.value = null
  article.value = ''
  amount.value = 0
}

async function selectFilterDate(e: any, date?: boolean) {
  if (date) {
    sortPageDate.value = e.value
  } else {
    sortPage.value = e.value
  }
  loading.value = true
  carts.value = []
  skip.value = 0
  end.value = false
  await getCarts()
}

async function findBuyouts(value: string, type: string) {
  carts.value = []
  skip.value = 0
  end.value = false
  if (!value) {
    search.loading = false
    await getCarts()
    return
  }
  loading.value = true
  await getCarts()

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
  mpStore.changeMp(e.value, 'cart')
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
          :disabled="store.client.username !== 'test'"
          @click="navigateTo(`/cart/create/`)"
          class="btn btn-primary dark:bg-primary bg-[#6675ff] border-none font-normal btn-sm"
        >
          <Icon name="fluent:add-24-filled" size="17" />
          <span class="hidden lg:flex">Корзина</span>
        </button>
        <CustomSelect
          class="hidden lg:flex"
          :class="'sm:min-w-[120px]'"
          :status-text="'Wildberries'"
          :tabs="mpStore.sortMp('cart')"
          @change-value="changeFilter"
        />
        <CustomSelect
          class="hidden lg:flex"
          :class="'sm:min-w-[120px]'"
          :tabs="[
            { title: 'Все корзины', value: 'all' },
            { title: 'Активные', value: 'work' },
            { title: 'Завершенные', value: 'completed' },
            { title: 'Недостаточно средств', value: 'nofunds' },
            { title: 'В архиве', value: 'archived' },
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
          :status-text="'Wildberries'"
          :tabs="mpStore.sortMp('cart')"
          @change-value="changeFilter"
        />
        <CustomSelect
          class="lg:hidden"
          :class="'sm:min-w-[120px]'"
          :tabs="[
            { title: 'Все корзины', value: 'all' },
            { title: 'Активные', value: 'work' },
            { title: 'Завершенные', value: 'completed' },
            { title: 'Недостаточно средств', value: 'nofunds' },
            { title: 'В архиве', value: 'archived' },
          ]"
          @change-value="selectFilterDate"
        />

        <CustomSelect
          :class="'bg-[#f4f4f4] sm:min-w-[120px]'"
          :tabs="[
            { title: 'За все время', value: 'all' },
            { title: 'Сегодня', value: 'today' },
            { title: '3 дня', value: '3days' },
            { title: 'Неделя', value: '7days' },
          ]"
          @change-value="selectFilterDate($event, true)"
        />

        <CustomSelect
          :class="'bg-[#f4f4f4]'"
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

    <div class="text-red-500 ml-1 mt-1" v-if="store.client.username !== 'test'">
      Функционал временно недоступен
    </div>

    <div v-if="carts.length && !loading" class="mt-4">
      <div>
        <CartWildberriesTable
          :get-status="getStatus"
          :resume-status="resumeStatus"
          :carts="carts"
          @log-modal="(item:any) => [(selectedCart = item), (logModal = true)]"
        />
        <div ref="target" class="flex justify-center items-center h-4" />
      </div>
      <!-- <div>
        <CartWildberriesCards :carts="carts" :get-status="getStatus" />
      </div> -->
    </div>
    <div v-else-if="!loading">
      <Hero />
    </div>
    <div
      v-if="loading"
      class="w-full mt-5 flex justify-center items-center h-80"
    >
      <span class="loading loading-dots loading-lg text-primary"></span>
    </div>
  </div>
  <CartWildberriesCreateCart
    :show="modalShow"
    @close-modal="modalShow = false"
    @create="getCarts()"
  />
  <LogModal :info="selectedCart" :state="logModal" @close="logModal = false" />
</template>

<style scoped></style>
