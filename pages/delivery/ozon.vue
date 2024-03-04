<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
import { useMainStore } from '../../stores/main'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Доставки',
})
const openAll = ref(false)
const route = useRoute()
const router = useRouter()
const store = useMainStore()
const mpStore = useMPStore()
const MPSelect = ref()
const selectedMP = ref(mpStore.selectedMP || 'wildberries')
const deliveries = ref([]) as any
const autoTarget = ref(true)
const status = computed(() => route.query?.status || 'all')
const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'article',
})
const MPTabs = [
  { title: 'ozon', value: 'ozon' },
  { title: 'wildberries', value: 'wildberries' },
]
function selectStatus(e: Event) {
  const target = e.target as HTMLSelectElement
  router.push({
    path: '/delivery',
    query: {
      status: target.value,
    },
  })
}
const modalInfo = reactive({
  src: '',
  code: 0,
})
const modal = ref(false)
const statusModal = ref(false)
const penaltyModal = ref(false)
const currentStatusdDelivery = ref<any[]>([])
function openModal(code: number, src: string) {
  modalInfo.src = src
  modalInfo.code = code
  modal.value = true
}
function openStatusModal(statusdelivery: any[]) {
  currentStatusdDelivery.value = statusdelivery
  statusModal.value = true
}
const target = ref(null)
const targetIsVisible = ref(false)
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }], observerElement) => {
    targetIsVisible.value = isIntersecting
  },
)
const skip = ref(50)
const end = ref(false)
async function getDeliveries() {
  const { data, error } = await useFetch('/api/ozon/delivery/get', {
    method: 'GET',
    query: {
      status: status.value ?? 'all',
      limit: 50,
    },
  })
  deliveries.value = data.value
}
await getDeliveries()

async function exportReadyXLS() {
  const { data } = await useFetch('/api/ozon/delivery/exportReady', {
    responseType: 'blob',
  })
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]))
  const fileLink = document.createElement('a')
  fileLink.href = fileURL
  fileLink.setAttribute('download', 'Готовы к выдаче.xlsx')
  document.body.appendChild(fileLink)
  fileLink.click()
}
async function exportXLS() {
  const { data, error } = await useFetch('/api/ozon/delivery/export', {
    responseType: 'blob',
  })
  if (error.value) {
    notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: 'Не удалось экспортировать данные',
    })
    return
  }
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]))
  const fileLink = document.createElement('a')
  fileLink.href = fileURL
  fileLink.setAttribute('download', 'Общая таблица.xlsx')
  document.body.appendChild(fileLink)
  fileLink.click()
}

async function findDeliveries(value: string, type: string) {
  if (!value) {
    autoTarget.value = true
    await getDeliveries()
    search.loading = false
    return
  }
  const { data, error } = await useFetch('/api/ozon/delivery/search', {
    query: {
      string: value,
      type,
    },
  })
  if (data.value)
    deliveries.value = data.value

  search.loading = false
}

const findDeliveriesDebounced = useDebounceFn(findDeliveries, 1000)

async function onSearchInput(event: Event) {
  const newValue = (event.target as HTMLInputElement).value
  autoTarget.value = false
  search.loading = true
  findDeliveriesDebounced(search.text, search.type)
}

const isInfoModal = ref<boolean>(false)
function toggleInfoModal() { 
    isInfoModal.value = !isInfoModal.value 
}

watch(targetIsVisible, async (isVisible) => {
  if (isVisible && autoTarget.value && deliveries.value.length >= 50) {
    if (end.value)
      return
    const { data, error } = await useFetch('/api/ozon/delivery/get', {
      method: 'GET',
      query: {
        status: route.query?.status || 'all',
        limit: 50,
        skip: skip.value ? skip.value : 0,
      },
    })
    if ((data.value as any)?.length === 0) {
      end.value = true
      return
    }
    deliveries.value = [...deliveries.value, ...data.value! as any]
    skip.value += 50
  }
})

watch(() => status.value, async (newRoute) => {
  skip.value = 50
  end.value = false
  const { data } = await useFetch('/api/ozon/delivery/get', {
    method: 'GET',
    query: {
      status: status.value ?? 'all',
      limit: 50,
    },
  })
  deliveries.value = data.value
}, { deep: true, immediate: true })

const filters = [
    {title: 'Все доставки', optionValue: 'all', params: '', queryStatus: undefined},
    {title: 'Активные', optionValue: 'active', params: '?status=active', queryStatus: 'active'},    
    {title: 'Завершенные', optionValue: 'completed', params: '?status=completed', queryStatus: 'completed'},
    {title: 'В пути', optionValue: 'onTheWay', params: '?status=onTheWay', queryStatus: 'onTheWay'},
    {title: 'Готовы к выдаче', optionValue: 'pickupReady', params: '?status=pickupReady', queryStatus: 'pickupReady'},   
]
const statusText = computed(() => {
  return filters.find((el: any) => el.queryStatus === route.query.status)?.title
})

const updateSearchType = (filter: any) => {
  search.type = filter.value;
}

async function changeFilter(e: any) {
  mpStore.selectedMP = e.value
  return navigateTo(
    '/delivery/' +
      e.value +
      (route.query?.status ? '?status=' + route.query.status : '')
  )
}

const customLinks = filters.map(filter => ({
  title: filter.title,
  slot: '/delivery/ozon', 
  query: filter.params 
}));
</script>
<template>
  <div>
    <!-- <div class="flex items-center gap-2 mt-4">
      <h1 class="text-2xl font-bold ">
        Доставки
      </h1>
      <InfoButton @openModal="toggleInfoModal" />
    </div> -->


    <!-- <InfoModal 
        :isModal="isInfoModal" 
        title="Доставки"
        ytSrc='https://www.youtube.com/embed/-SxurcapPcA?si=AxKD5hXOxqc6ZjqJ'
        @changeVisibility="toggleInfoModal"
        >
        <p>
            В этом разделе можно отследить статусы выкупов после оплаты. Статус "Доставлен" означает, что товар можно
            забирать из пункта выдачи.
        </p>
        <p>
            Совершайте заборы ваших товаров в течение 7 дней с момента прибытия на ПВЗ. За каждый последующий день вы получаете штраф {{ store.tariffString('deliveryStorage') }} за единицу не забранного товара.
        </p>
        <p>
            Возвраты финансовых средств на не забранные товары с ПВЗ отсутствуют! Работаем по модели Выкупил - Забрал.
        </p> 
        <p>
            Все услуги оказываются по Московскому времени.
        </p>
    </InfoModal> -->


    <div class="">
      <div class="flex lg:hidden mt-2">
        <div v-if="deliveries.length" class="export">
          <div class="dropdown">
            <label tabindex="0" class="btn btn-sm btn-primary bg-opacity-20 border-none text-base-content mr-2">XLS</label>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
              <li>
                <NuxtLink target="blank" to="/delivery/export">
                  Готовы к выдаче PDF
                </NuxtLink>
              </li>
              <li><a @click="exportReadyXLS">Готовы к выдаче Excel</a></li>

              <li><a @click="exportXLS">Общая таблица Excel</a></li>
            </ul>
          </div>
        </div>
        <div class="relative flex items-center flex-grow-0 w-full">
          <input v-model="search.text" type="text" class="input input-sm bg-base-300 bg-opacity-40 text-gray-500 w-full" placeholder="Поиск" @input="onSearchInput($event)">

          <span
            v-if="search.loading"
            class="absolute right-2 loading loading-spinner loading-xs p-2"
          />
        </div>
        
      </div>
      <div class="flex gap-2 mt-2 lg:hidden">
        <CustomSelect
          class="lg:hidden"
          :class="'sm:min-w-[120px]'"
          :tabs="MPTabs"
          @change-value="changeFilter"
        />
        <CustomSelect
            class="lg:hidden"
            :class="'navbar:min-w-[120px]'"
            :links="customLinks"
          />
        <!-- <div class="dropdown  ">
              <div
                tabindex="0"
                role="button"
                class="font-medium normal-case btn-primary bg-opacity-20 border-none text-base-content btn btn-sm w-[120px]"
              >
                {{ statusText }}
              </div>
              <ul
                tabindex="0"
                class="shadow dropdown-content z-[1] bg-base-100 p-1 rounded-lg mt-1 max-w-[200px]"
              >
                <li>
                  <NuxtLink
                    v-for="filter in filters"
                    :to="'/buyouts' + filter.params"
                    :external="false"
                    :class="{
                      'btn-active': route.query.status === filter.queryStatus,
                    }"
                    class="btn btn-ghost btn-xs normal-case font-medium w-full"
                  >
                    <span>
                      {{ filter.title }}
                    </span>
                  </NuxtLink>
                </li>
              </ul>
            </div> -->
        <CustomSelect :class="'bg-base-300'" :tabs = "[{title: 'Артикул', value: 'article'}, {title: 'ID выкупа', value: 'uuid'}]" @change-value="updateSearchType" />
        <!-- <select v-model="search.type" class="select select-bordered select-sm">
              <option value="article">
                Артикул
              </option>
              <option value="uuid">
                ID выкупа
              </option>
            </select> -->
      </div>
      
      
      <div class="flex justify-between mb-2 mt-4 items-center flex-wrap gap-4">
        <div class="flex gap-2">
          <CustomSelect
          class="hidden lg:flex"
          :class="'sm:min-w-[120px]'"
          :tabs="MPTabs"
          @change-value="changeFilter"
        />
        <CustomSelect
          class="hidden lg:flex"
          :class="'navbar:min-w-[120px]'"
          :links="customLinks"
        />
        <!-- <div class="dropdown hidden lg:block">
              <div
                tabindex="0"
                role="button"
                class="font-medium normal-case btn-primary bg-opacity-20 border-none text-base-content btn btn-sm w-[120px]"
              >
                {{ statusText }}
              </div>
              <ul
                tabindex="0"
                class="shadow dropdown-content z-[1] bg-base-100 p-1 rounded-lg mt-1 max-w-[200px]"
              >
                <li>
                  <NuxtLink
                    v-for="filter in filters"
                    :to="'/delivery' + filter.params"
                    :external="false"
                    :class="{
                      'btn-active': route.query.status === filter.queryStatus,
                    }"
                    class="btn btn-ghost btn-xs normal-case font-medium w-full"
                  >
                    <span>
                      {{ filter.title }}
                    </span>
                  </NuxtLink>
                </li>
              </ul>
        </div>          -->
        </div>
        
      <!--<div class="hidden lg:block">
         <NuxtLink
            v-for="filter in filters"
            :to=" '/delivery' + filter.params"
            :external="false" 
            :class="{
                'btn-active': route.query.status === filter.queryStatus,
            }" 
            class="btn btn-ghost btn-sm normal-case font-medium"
        >
        {{ filter.title }}
        </NuxtLink>
      </div>
      <select
        class="select select-bordered select-sm lg:hidden"
        @change="selectStatus"
      >
      <option 
        v-for="filter in filters"
        :value="filter.optionValue" 
        :selected="route.query.status === filter.queryStatus"
        >
        {{ filter.title }}
        </option>
      </select> -->

      <div class="gap-4 hidden lg:flex">
        <!-- <div class="flex items-center">
          <input id="openAll" v-model="openAll" type="checkbox" class="checkbox checkbox-primary checkbox-sm">
          <label for="openAll" class="cursor-pointer select-none ml-2">Развернуть все</label>
        </div> -->
        <div class="search flex justify-between items-center gap-2">
          <div />
          <div class="flex gap-4 items-center">
            <CustomSelect :class="'bg-base-300'" :tabs = "[{title: 'Артикул', value: 'article'}, {title: 'ID выкупа', value: 'uuid'}]" @change-value="updateSearchType" />
            <!-- <select v-model="search.type" class="select select-bordered select-sm">
              <option value="article">
                Артикул
              </option>
              <option value="uuid">
                ID выкупа
              </option>
            </select> -->
            <div class="relative flex items-center flex-grow-0 w-full">
              <input v-model="search.text" type="text" class="input input-sm bg-base-300 bg-opacity-40 text-gray-500" placeholder="Поиск" @input="onSearchInput($event)">

              <span
                v-if="search.loading"
                class="absolute right-2 loading loading-spinner loading-xs p-2"
              />
            </div>
          </div>
        </div>
        <div v-if="deliveries.length" class="export">
          <div class="dropdown dropdown-end z-10">
            <label tabindex="0" class="btn btn-sm btn-primary bg-opacity-20 border-none text-base-content m-1">XLS</label>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <NuxtLink target="blank" to="/delivery/export">
                  Готовы к выдаче PDF
                </NuxtLink>
              </li>
              <li><a @click="exportReadyXLS">Готовы к выдаче Excel</a></li>

              <li><a @click="exportXLS">Общая таблица Excel</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
      </div>
      
    
    <!-- <div v-if="deliveries?.length" class="" >
      <TransitionSlide group tag="ul" class="flex md:hidden flex-col gap-3">
        <li v-for="(delivery, index) of deliveries" :key="index" class="overflow-visible z-0">
          <DeliveryExpand
            :state="openAll"
            :info="delivery" 
            @open-modal="openModal"
            @open-status-modal="openStatusModal"
            @open-penalty-modal="penaltyModal = true"
            
          />
        </li>
        <div ref="target" class="flex justify-center items-center h-40 md:h-10" />
      </TransitionSlide>
      <DeliveryQrModal v-if="modal" :code="modalInfo.code" :src="modalInfo.src" />
    </div> -->
    <div v-if="deliveries?.length" class="grid grid-cols-1 gap-4 mt-4 w-full">
      <TransitionSlide group tag="ul" class="flex flex-col md:flex-row navbar:flex-col lg:flex-row gap-3">
      <ul class="flex flex-col gap-3 lg:w-[49%] navbar:w-full">
      <li v-for="(delivery, index) of deliveries.slice(0, Math.ceil(deliveries.length / 2))" :key="index" class="overflow-visible z-0">
        <DeliveryExpandOzon
          :state="openAll"
          :info="delivery" 
          @open-modal="openModal"
          @open-status-modal="openStatusModal"
          @open-penalty-modal="penaltyModal = true"
        />
      </li>
    </ul>
    <ul class="flex flex-col gap-3 lg:w-[49%] navbar:w-full">
      <li v-for="(delivery, index) of deliveries.slice(Math.ceil(deliveries.length / 2))" :key="index" class="overflow-visible z-0">
        <DeliveryExpandOzon
          :state="openAll"
          :info="delivery" 
          @open-modal="openModal"
          @open-status-modal="openStatusModal"
          @open-penalty-modal="penaltyModal = true"
        />
      </li>
    </ul>
        <div ref="target" class="flex justify-center items-center h-40 md:h-10" />
      </TransitionSlide>
      <DeliveryQrModal v-if="modal" :code="modalInfo.code" :src="modalInfo.src" />
    </div>
    <Hero v-else />
    <DeliveryPenaltyModal :state="penaltyModal" @close="penaltyModal = false" />
    <DeliveryStatusModal v-if="deliveries?.length" :statusdelivery="currentStatusdDelivery" :state="statusModal" @close="statusModal = false" />
  </div>
</template>

<style scoped>

</style>
