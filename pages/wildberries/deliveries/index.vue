<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  middleware: 'auth',
  title: 'Доставки',
})

const openAll = ref(false)
const route = useRoute()
const deliveries = ref([]) as any
const autoTarget = ref(true)
const codeInputMob = ref()
const loadingExport = ref(false)
const status = computed(() => route.query?.status || 'all')
const loading = ref(false)
const search = ref<any>({
  text: '',
  loading: false,
  error: false,
  type: 'article',
})

// function selectStatus(e: Event) {
//   const target = e.target as HTMLSelectElement
//   router.push({
//     path: '/delivery',
//     query: {
//       status: target.value,
//     },
//   })
// }
const modalInfo = reactive({
  src: '',
  code: 0,
})
const modal = ref(false)
const statusModal = ref(false)
const penaltyModal = ref(false)
const currentStatusdDelivery = ref<any[]>([])
const currentDelivery = ref<any>()
function openModal(code: number, src: string, info: any) {
  modalInfo.src = src
  modalInfo.code = code
  modal.value = true
  currentDelivery.value = info
}
function openStatusModal(statusdelivery: any[]) {
  currentStatusdDelivery.value = statusdelivery
  statusModal.value = true
}
const target = ref(null)
const targetIsVisible = ref(false)

// eslint-disable-next-line unused-imports/no-unused-vars
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    targetIsVisible.value = isIntersecting
  },
)
const skip = ref(50)
const end = ref(false)
async function getDeliveries() {
  loading.value = true
  const { data } = await useFetch('/api/wildberries/delivery/get', {
    method: 'GET',
    query: {
      status: status.value ?? 'all',
      limit: 50,
    },
  })
  deliveries.value = data.value
  loading.value = false
}
getDeliveries()

async function exportReadyXLS() {
  loadingExport.value = true
  const { data } = await useFetch('/api/wildberries/delivery/exportReady', {
    responseType: 'blob',
  })
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]))
  const fileLink = document.createElement('a')
  fileLink.href = fileURL
  fileLink.setAttribute('download', 'Готовы к выдаче Wildberries.xlsx')
  document.body.appendChild(fileLink)
  fileLink.click()
  loadingExport.value = false
}
async function exportXLS() {
  loadingExport.value = true
  const { data, error } = await useFetch('/api/wildberries/delivery/export', {
    responseType: 'blob',
  })
  if (error.value) {
    notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: 'Не удалось экспортировать данные',
    })
    loadingExport.value = false
    return
  }
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]))
  const fileLink = document.createElement('a')
  fileLink.href = fileURL
  fileLink.setAttribute('download', 'Общая таблица Wildberries.xlsx')
  document.body.appendChild(fileLink)
  fileLink.click()
  loadingExport.value = false
}
async function exportReadyUntilPenaltyXLS() {
  loadingExport.value = true
  const { data, error } = await useFetch(
    '/api/wildberries/delivery/exportReadyUntilPenalty',
    {
      responseType: 'blob',
    },
  )
  if (error.value) {
    notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: 'Не удалось экспортировать данные',
    })
    loadingExport.value = false
    return
  }
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]))
  const fileLink = document.createElement('a')
  fileLink.href = fileURL
  fileLink.setAttribute(
    'download',
    'Готовы к выдаче Wildberries до штрафа.xlsx',
  )
  document.body.appendChild(fileLink)
  fileLink.click()
  loadingExport.value = false
}

async function findDeliveries(value: string, type: string) {
  if (!value) {
    autoTarget.value = true
    await getDeliveries()
    search.value.loading = false
    return
  }
  const { data } = await useFetch('/api/wildberries/delivery/search', {
    query: {
      string: value,
      type,
    },
  })
  if (data.value)
    deliveries.value = data.value

  search.value.loading = false
}

const findDeliveriesDebounced = useDebounceFn(findDeliveries, 1000)

async function onSearchInput() {
  autoTarget.value = false
  search.value.loading = true
  findDeliveriesDebounced(search.value.text, search.value.type)
}

// function openInfoModal() {
//   store.infoModal = true
// }

watch(targetIsVisible, async (isVisible) => {
  if (isVisible && autoTarget.value && deliveries.value.length >= 50) {
    if (end.value)
      return
    const { data } = await useFetch('/api/wildberries/delivery/get', {
      method: 'GET',
      query: {
        status: route.query?.status || 'all',
        limit: 50,
        skip: skip.value,
      },
    })
    if ((data.value as any)?.length === 0) {
      end.value = true
      return
    }
    deliveries.value = [...deliveries.value, ...(data.value! as any)]
    skip.value += 50
  }
})

watch(
  () => status.value,
  async () => {
    skip.value = 50
    end.value = false
    const { data } = await useFetch('/api/wildberries/delivery/get', {
      method: 'GET',
      query: {
        status: status.value ?? 'all',
        limit: 50,
      },
    })
    deliveries.value = data.value
  },
  { deep: true, immediate: true },
)

const filters = [
  {
    title: 'Все доставки',
    optionValue: 'all',
    params: '',
    queryStatus: undefined,
  },
  {
    title: 'Активные',
    optionValue: 'active',
    params: '?status=active',
    queryStatus: 'active',
  },
  {
    title: 'Завершенные',
    optionValue: 'completed',
    params: '?status=completed',
    queryStatus: 'completed',
  },
  {
    title: 'В пути',
    optionValue: 'onTheWay',
    params: '?status=onTheWay',
    queryStatus: 'onTheWay',
  },
  {
    title: 'Готовы к выдаче',
    optionValue: 'pickupReady',
    params: '?status=pickupReady',
    queryStatus: 'pickupReady',
  },
  {
    title: 'Отмененные',
    optionValue: 'canceled',
    params: '?status=canceled',
    queryStatus: 'canceled',
  },
  // {
  //   title: 'В архиве',
  //   optionValue: 'archived',
  //   params: '?status=archived',
  //   queryStatus: 'archived',
  // },
]

const customLinks = filters.map(filter => ({
  title: filter.title,
  slot: '/wildberries/deliveries',
  query: filter.params,
}))

const statusText = computed(() => {
  return filters.find((el: any) => el.queryStatus === route.query.status)?.title
})

function updateSearchType(filter: any) {
  search.value.type = filter.value
}
</script>

<template>
  <div>
    <div class="flex justify-start lg:justify-between  mb-4 items-center mt-4">
      <div class="flex relative gap-2 lg:gap-3 flex-col lg:flex-row w-full lg:w-full">
        <div v-if="deliveries.length" class="export lg:absolute right-0 top-0">
          <button
            v-if="loadingExport"
            disabled
            class="btn btn-sm btn-primary bg-opacity-20 border-none text-base-content mr-2"
          >
            <span
              class="loading loading-spinner loading-sm text-primary"
            />
          </button>
          <div v-else class="dropdown lg:dropdown-end z-10">
            <label
              tabindex="0"
              class="btn btn-sm btn-primary bg-[#eff0ff] dark:bg-primary dark:bg-opacity-20 border-none text-base-content"
            >XLS</label>
            <ul
              tabindex="0"
              class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-1"
            >
              <li><a @click="exportReadyXLS">Готовы к выдаче Excel</a></li>

              <li><a @click="exportXLS">Общая таблица Excel</a></li>
              <li><a @click="exportReadyUntilPenaltyXLS">До штрафа</a></li>
            </ul>
          </div>
        </div>
        <div class="w-full flex gap-1 lg:gap-2 ">
          <div class="flex gap-1  lg:gap-3 flex-nowrap whitespace-nowrap">
            <span><CustomSelect
              class="h-[2rem]  min-w-[95px]"
              :status-text="statusText"
              :links="customLinks"
            /> </span>
          </div>
          <div class="flex lg:ml-auto gap-0.5 lg:gap-3">
            <CustomSelect
              class="h-[2rem] bg-[#f4f4f4]"
              :tabs="[
                { title: 'Артикул', value: 'article' },
                { title: 'ID выкупа', value: 'uuid' },
              ]"
              @change-value="updateSearchType"
            />
          </div>
          <div class="absolute right-0 top-0 w-[calc(100%-60px)] lg:w-fit lg:static lg:mr-[60px]">
            <label class="w-full flex bg-[#ececed] rounded-lg items-center">
              <input
                ref="codeInputMob"
                v-model="search.text"
                type="text"
                class="input input-sm bg-transparent rounded-r-none w-full"
                placeholder="Поиск"
                @input="onSearchInput()"
              >
              <span
                v-if="search.loading"
                class="loading loading-spinner loading-xs flex justify-end p-2"
              />
              <Icon
                v-else
                class="text-[#8f8e93] flex justify-end pr-2"
                name="tabler:search"
                size="30"
                @click="codeInputMob.focus()"
              />
            </label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="deliveries?.length" class="grid grid-cols-1 gap-4 mt-4 w-full">
      <TransitionSlide
        group
        tag="ul"
        class="flex flex-col md:flex-row navbar:flex-col lg:flex-row gap-3"
      >
        <ul class="flex flex-col gap-3 lg:w-[49%] navbar:w-full">
          <li
            v-for="(delivery, index) of deliveries.slice(
              0,
              Math.ceil(deliveries.length / 2),
            )"
            :key="index"
            class="overflow-visible z-0"
          >
            <DeliveryWildberriesExpand
              :state="openAll"
              :info="delivery"
              @open-modal="openModal"
              @open-status-modal="openStatusModal"
              @open-penalty-modal="penaltyModal = true"
            />
          </li>
        </ul>
        <ul class="flex flex-col gap-3 lg:w-[49%] navbar:w-full">
          <li
            v-for="(delivery, index) of deliveries.slice(
              Math.ceil(deliveries.length / 2),
            )"
            :key="index"
            class="overflow-visible z-0"
          >
            <DeliveryWildberriesExpand
              :state="openAll"
              :info="delivery"
              @open-modal="openModal"
              @open-status-modal="openStatusModal"
              @open-penalty-modal="penaltyModal = true"
            />
          </li>
        </ul>
      </TransitionSlide>
      <DeliveryWildberriesQrModal
        v-if="modal"
        :code="modalInfo.code"
        :src="modalInfo.src"
        :info="currentDelivery"
      />
    </div>
    <Hero v-else-if="!loading" />
    <div v-else class="w-full mt-5 flex justify-center items-center">
      <span class="loading loading-dots loading-lg text-primary" />
    </div>
    <DeliveryPenaltyModal :state="penaltyModal" @close="penaltyModal = false" />
    <DeliveryStatusModal
      v-if="deliveries?.length"
      :statusdelivery="currentStatusdDelivery"
      :state="statusModal"
      @close="statusModal = false"
    />
    <div
      ref="target"
      class="flex justify-center items-center"
      style="height: 60px"
    />
  </div>
</template>

<style scoped></style>
