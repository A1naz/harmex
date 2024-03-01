<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Лайки на товар/бренд',
})
const store = useMainStore()
const mpStore = useMPStore()
const router = useRouter()
const MPSelect = ref()
const selectedMP = ref(mpStore.selectedMP || 'wildberries')
const product_likes = ref([]) as any
const amount = ref(0)
const loadingUrl = ref(false)
const url = ref('')
const period = ref('3h')
const { width, height } = useWindowSize()
const productData = ref<any>(null)
const urlError = ref(false)
const modalShow = ref<boolean>(false)

const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'name',
})
const codeInput = ref()
async function getProductLikes() {
  modalShow.value = false
  const { data, error } = await useFetch('/api/productlikes/get', {
    method: 'GET',
  })
  if (data.value) product_likes.value = data.value
  //   if (data.value) {
  //     product_likes.value = data.value.map(product => {
  //         if (product.url) {
  //             const articleId = product.url.match(/\d+/);
  //             if (articleId) {
  //                 return { ...product, article: articleId[0] };
  //             }
  //         }
  //         return product;
  //     });
  // }
  if (error.value)
    notify({
      type: 'error',
      title: 'Не удалось получить лайки',
      text: error.value.message,
    })
}
await getProductLikes()
async function create() {
  const { data, error } = await useFetch('/api/productlikes/create', {
    method: 'POST',
    body: {
      url: url.value,
      amount: amount.value,
      period: period.value,
      productData: productData.value,
    },
  })
  if (error.value)
    return notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: error.value.message,
    })
  if (data.value) {
    notify({ type: 'success', title: 'Упешно' })
    getProductLikes()
  }
  modalShow.value = false
  removeProduct()
}
async function sendUrl() {
  const { data, error } = await useFetch('/api/productlikes/extract', {
    method: 'POST',
    body: {
      url: url.value,
    },
  })
  if (data.value) {
    productData.value = data.value
    urlError.value = false
  }
  if (error.value) urlError.value = true

  loadingUrl.value = false
}

let timeout = null as NodeJS.Timeout | null
async function changeUrl() {
  if (url.value === '') return
  loadingUrl.value = true
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(sendUrl, 2000)
}
function selectPeriod(event: any) {
  period.value = event.target.value
}
function getStatus(status: string) {
  if (status === 'created') return 'Создан'
  else if (status === 'work') return 'В работе'
  else if (status === 'completed') return 'Завершен'
  else if (status === 'nofunds') return 'Недостаточно средств'
  else if (status === 'canceled') return 'Отменен'
}
function removeProduct() {
  productData.value = null
  url.value = ''
  amount.value = 0
}
onMounted(() => {
  selectedMP.value = mpStore.selectedMP || 'wildberries'
  console.log(selectedMP.value)
  return navigateTo(`/productlikes/${selectedMP.value}`);
})

const reviewRemoveModalClose: any = ref(null)
const idForRemove = ref('')
function openRemoveReviewModal(id: any, name: any) {
  idForRemove.value = id
  reviewRemoveModalClose.value?.click()
}

async function deleteLike() {
  const { data, error } = await useFetch('/api/productlikes/delete', {
    method: 'DELETE',
    body: {
      id: idForRemove.value,
    },
  })

  if (data.value) {
    getProductLikes()
  } else if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value.data?.message,
      type: 'error',
      duration: 3000,
    })
  }
}

const currentFilter = ref('')
const changePage = (filter: string) => {
  currentFilter.value = filter
}
const closeModal = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains('modalCustom')) {
    modalShow.value = false
    currentFilter.value = ''
  }
}

async function selectFilterDate(e: any) {
  const target = e
  const { data } = await useFetch('/api/productlikes/get', {
    method: 'GET',
    query: {
      dateFilter: target.value,
    },
    watch: false,
  })
  product_likes.value = data.value
}

async function findBuyouts(value: string, type: string) {
  if (!value) {
    search.loading = false
    getProductLikes()
    return
  }
  const { data, error } = await useFetch('/api/productlikes/search', {
    query: {
      string: value,
      type,
    },
    watch: false,
  })
  if (data.value) product_likes.value = data.value

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
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <div>
      <span class="loading loading-dots loading-lg text-primary"></span>
    </div>
  </div>
</template>

<style scoped>
::v-deep(th) {
  background-color: rgba(99, 102, 241, 0.15) !important;
}
::v-deep(.p-column-header-content) {
  text-align: center !important;
  display: flex;
  justify-content: center;
}
</style>
