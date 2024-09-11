<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
  show: { type: Boolean, required: true },
})

const emit = defineEmits(['closeModal', 'create'])

const viewings = ref([]) as any
const amount = ref(10)
const now = useNow()
const dates = ref<Date[]>([new Date(), new Date()])
const loading = ref(false)
const searchText = ref('')
const article = ref('')
const searchType = ref('advertisement')
const productData = ref<any>(null)
const anonim = ref(false)
const urlError = ref(false)
const creating = ref(false)

const timer = ref(25)
const timerRunning = ref(false)
const timerFinished = ref(false)
let interval: any
const startTimer = () => {
  timer.value = 25
  timerRunning.value = true
  interval = setInterval(() => {
    if (timer.value > 0 && creating.value) {
      timer.value--
    } else {
      clearInterval(interval)
      timerRunning.value = false
      timerFinished.value = true
    }
  }, 1000)
}

async function getViewings() {
  // @ts-ignore
  const { data, error } = await useFetch('/api/ozon/viewings/get', {
    method: 'GET',
  })
  if (data.value) viewings.value = data.value
  if (error.value)
    notify({
      type: 'error',
      title: 'Не удалось получить лайки',
      text: error.value.message,
    })
}
await getViewings()
async function create() {
  creating.value = true
  startTimer()

  await getProductInfo()
  if (!productData.value) return

  // @ts-ignore
  const { data, error } = await useFetch('/api/ozon/viewings/create', {
    method: 'POST',
    body: {
      article: article.value,
      dateStart: dates.value[0],
      dateEnd: dates.value[1],
      searchType: searchType.value,
      productData: productData.value,
      searchQuery: searchText.value,
      amount: amount.value,
    },
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data?.message,
      type: 'error',
      duration: 3000,
    })
    creating.value = false
    return
  }
  // notify({ type: 'error', title: 'Что-то пошло не так', text: error.value.message })
  if (data.value) {
    notify({ type: 'success', title: 'Успешно' })
    removeProduct()
    dates.value = [now.value, now.value]
    creating.value = false
    emit('create')
  }
}
async function getProductInfo() {
  if (!article.value) return

  productData.value = null
  const { data, error } = await useFetch(`/api/ozon/product/${article.value}`, {
    method: 'GET',
  })
  if ((data.value as any)?.product) {
    productData.value = (data.value as any).product
    urlError.value = false
  }
  if (error.value) {
    notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: 'Не удалось получить информацию о продукте',
    })
  }

  loading.value = false
}
let timeout = null as NodeJS.Timeout | null

function selectSearchType(event: any) {
  searchType.value = event.target.value
}
function removeProduct() {
  productData.value = null
  article.value = ''
  amount.value = 0
}

const isBtnDisabled = computed(() => {
  if (article.value === '' || amount.value === 0 || loading.value) return true
  return false
})
</script>

<template class="font-mono">
  <div
    v-if="props.show === true"
    @click="$emit('closeModal')"
    class="modalCustom fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm"
  >
    <div
      class="flex flex-col bg-base-100 rounded-lg w-full max-w-[440px] gap-5 p-4"
      @click.stop
    >
      <div class="flex justify-between">
        <div class="font-medium text-[22px]">Просмотры</div>
        <button
          class="text-gray-500 hover:text-gray-700 self-end mb-2"
          @click="$emit('closeModal')"
        >
          <Icon name="material-symbols:close-rounded" size="24" />
        </button>
      </div>
      <div class="bg-base-100 rounded-lg font-medium text-[16px]">
        <div class="flex mb-2 flex-col gap-4">
          <div class="flex gap-4 flex-col flex-wrap">
            <div>
              <div>Артикул:</div>
              <div class="w-full">
                <input
                  v-model="article"
                  class="input w-full bg-[#f7f7f7] dark:bg-base-200"
                  placeholder="123123"
                  type="number"
                />
              </div>
            </div>
            <div>
              <div>Поисковый запрос:</div>
              <div class="w-full">
                <input
                  v-model="searchText"
                  class="input w-full bg-[#f7f7f7] dark:bg-base-200 font-medium text-[16px]"
                  placeholder="Часы"
                  type="text"
                />
              </div>
            </div>
            <div>
              <div>Просмотры:</div>
              <select
                class="select select-sm lg:select-md w-full mt-2 bg-[#f7f7f7] dark:bg-base-200"
                @change="selectSearchType"
              >
                <option value="advertisement">Просмотры в рекламе</option>
                <option value="search">Просмотры в поиске</option>
              </select>
            </div>
            <div>
              <div>Дата публикации:</div>
              <div class="w-full rounded-lg mt-2 bg-base-200">
                <ViewingsDateRangePicker v-model="dates" :start-date="now" />
              </div>
            </div>
          </div>
          <div class="flex flex-col justify-start gap-1 w-full">
            <div>
              Количество просмотров
              <input
                v-model="amount"
                class="input w-full bg-[#f7f7f7] dark:bg-base-200"
                placeholder="20"
                type="number"
              />
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button
            :disabled="isBtnDisabled || creating"
            class="btn w-full btn-primary dark:bg-primary bg-[#b2baff] hover:bg-[#6675FF] border-none text-base-content"
            @click="create"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="creating"
    style="background-color: rgb(37, 37, 42); opacity: 80%; z-index: 9999"
    class="fixed z-[50] top-0 left-0 right-0 bottom-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center"
  >
    <span class="text-white text-2xl text-center">
      До получения продукта и создания осталось приблизительно {{ timer }} сек.
    </span>
    <div class="ease-linear rounded-full mb-4">
      <Icon name="mdi:loading" class="h-20 w-20 animate-spin text-white" />
    </div>
  </div>
</template>

<style scoped></style>
