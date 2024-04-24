<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const routePath = route.path.endsWith('/') ? route.path.slice(0, -1) : route.path;
const apiRoute = '/'+( route.path === '/stats' ? route.path + '/' : route.path.startsWith('/stats/') ? route.path.split('/').slice(2).join('/') + '/' + route.path.split('/').slice(1, 2).join('/') : '');

const store = useMainStore()
const currentId = ref('')
const isCopied = ref(false)

const purchaseDelivery = ref(0)
const inTransit = ref(0)
const readyToPickup = ref(0)
const received = ref(0)
const cancelled = ref(0)
const reviews = ref(0)
const lastElements = ref<any>([])

const deliveryPeriod = ref(route.query.deliveryPeriod)
const deliveryDataLoading = ref(false)
const searchQuery = ref('')
const searchLoading = ref(false)
const filteredElements = ref<any>([])
const deliveryQuery = ref('all')
const deliveryStatsLoading = ref(false)

const periods = [
      { title: 'Сегодня', value: 'today' },
      { title: 'Вчера', value: 'yesterday' },
      { title: 'Неделя', value: 'week' },
      { title: 'Этот месяц', value: 'month' },
      { title: 'Прошлый месяц', value: 'lastMonth' },
    ];

    const deliveryType = [
  { title: 'Все', value: 'all', bd: 'all' },
  { title: 'В пути', value: 'inTransit', bd: 'В пути' },
  { title: 'Готовы к выдаче', value: 'ready', bd: routePath === '/stats/ozon' ? 'Ожидает получения до' :  'Готов к выдаче' },
  { title: 'Получено', value: 'picked', bd: routePath === '/stats/ozon' ? 'Получен' :  'Получено' },
  { title: 'Отменено', value: 'canceled', bd: 'Отменено' },
];

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
async function getLast() {
  lastElements.value = []
  const { data, error }: any = await useFetch(`/api${routePath === '/stats' ? routePath : apiRoute}/statsDelivery`, {
    method: 'GET',
    params: {
      // type: route.query.type,
      period: deliveryPeriod.value,
      type: deliveryQuery.value,
    },
    watch: false,
  })
  if (data.value) {
//     lastElements.value = [...lastElements.value, ...(data.value.lastElements! as any)]
//     filteredElements.value = lastElements.value.map((element: any) => {
//     return {
//       ...element, 
//       purchaseDate: element.purchaseDate ? defaultDateShort(element.purchaseDate) : '-',
//       receiptDate: element.receiptDate ? defaultDateShort(element.receiptDate) : '-',
//       receiveDate: element.receiveDate ? defaultDateShort(element.receiveDate) : '-',
//     };
// });
    purchaseDelivery.value = data.value.purchase
    inTransit.value = data.value.inTransit
    readyToPickup.value = data.value.ready
    received.value = data.value.received
    cancelled.value = data.value.cancelled
    reviews.value = data.value.reviews
  }
  deliveryDataLoading.value = false
  deliveryStatsLoading.value = false 
}
async function getLastContinue() {
  const { data, error }: any = await useFetch(`/api${routePath === '/stats' ? routePath : apiRoute}/statsDelivery`, {
    method: 'GET',
    params: {
      // type: route.query.type,
      period: deliveryPeriod.value,
      type:  deliveryType.find(type => type.value === deliveryQuery.value)?.bd,
      limit: limit.value,
      skip: skip.value,
      searchQuery: searchQuery.value,
    },
    watch: false,
  })
  if ((data.value as any)?.length === 0) {
    loading.value = false
    end.value = true
    return
  }
  if (data.value) {
    lastElements.value = [...lastElements.value, ...(data.value.lastElements! as any)]
  }
  skip.value += limit.value
  loading.value = false
  
  deliveryDataLoading.value = false
  deliveryStatsLoading.value = false 
}
await getLast()
await getLastContinue()

watch(targetIsVisible, async (isVisible) => {
  if (!end.value && isVisible && lastElements.value.length >= limit.value)
    await getLastContinue()
})

const deliveryStats = computed(() => [
  {
    title: 'Выкуплено',
    value: purchaseDelivery.value,
  },
  {
    title: 'Доступных отзывов',
    value: reviews.value,
  },
  {
    title: 'В пути',
    value: inTransit.value,
  },
  {
    title: 'Готовы к выдаче',
    value: readyToPickup.value,
  },
  {
    title: 'Получено',
    value: received.value,
  },
  {
    title: 'Отменено',
    value: cancelled.value,
  }
])

function selectDeliveryText() {
  const index = periods.findIndex(period => route.query.deliveryPeriod ? period.value === route.query.deliveryPeriod : period.value === 'today');
  return periods[index].title 
}

async function changeDelivery(e: any) {
  deliveryQuery.value = e.value
  deliveryDataLoading.value = true  
  deliveryStatsLoading.value = true
  skip.value = 0
  lastElements.value = []
  await getLastContinue()
}

function changeDeliveryPeriod(e: any) {
  deliveryDataLoading.value = true
  deliveryStatsLoading.value = true
  deliveryPeriod.value = e.value
  skip.value = 0
  router.push(`${routePath}?type=${route.query.type}&period=${route.query.period}&headerPeriod=${route.query.headerPeriod}&deliveryPeriod=${e.value}`)
  getLast()
  getLastContinue()
}

const filterElementsDebounced = useDebounceFn(filterElements, 1000)
async function filterElements() {
  // filteredElements.value = lastElements.value.map((element: any) => {
  // return {
  //     ...element, 
  //     purchaseDate: element.purchaseDate ? defaultDateShort(element.purchaseDate) : '-',
  //     receiptDate: element.receiptDate ? defaultDateShort(element.receiptDate) : '-',
  //     receiveDate: element.receiveDate ? defaultDateShort(element.receiveDate) : '-',
  //   };
  // });
  // if(searchQuery.value === '') {
  //   searchLoading.value = false
  //   deliveryDataLoading.value = false
  //   getLastContinue()
  //   return
  // }
  // filteredElements.value = filteredElements.value.filter((element: any) =>
  //   Object.values(element).some(value =>
  //     String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
  //   )
  // );
  skip.value = 0
  lastElements.value = []
  await getLastContinue()
  deliveryDataLoading.value = false
  searchLoading.value = false
}
function search(){
  searchLoading.value = true
  deliveryDataLoading.value = true
  filterElementsDebounced()
}

function copyId(id: any){
  navigator.clipboard.writeText(id)
  currentId.value = id
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000) 
}
function articleNavigate(currentArticle: any, mp: any) {
  const link = mp === 'ozon' ? 
  `https://www.ozon.ru/product/${currentArticle}` : 
   mp === 'avito' ? 
    `https://www.avito.ru/${currentArticle}` : 
    `https://www.wildberries.ru/catalog/${currentArticle}/detail.aspx`;
  navigateTo(link, {
  open: {
    target: '_blank',
  }})
 

}
</script>

<template>
   <div v-bind:class="{ 'copy-message': true, 'hide': !isCopied }" class="copy-message z-[999] fixed top-0 right-0 m-4 bg-[#D1FEB6] mr-7  rounded-md px-3 py-1 text-black">
    #{{ currentId }} скопирован
  </div>
  <div  class="bg-base-100 rounded-lg drop-shadow-sm w-full  flex flex-col gap-5 mt-4 ">
    <div class="flex gap-2 flex-col sm:flex-row justify-between px-3 sm:px-6 pt-6">
      <div class="join">
        <input 
          type="text" 
          v-model="searchQuery" 
          class="input bg-base-300 bg-opacity-40 input-sm w-full max-w-[200px] join-item border-none" 
          placeholder="Артикул"
          @input="search()"
        />
        <button class="btn btn-sm join-item bg-base-300 bg-opacity-40 border-none hover:bg-base-300 hover:bg-opacity-40" @click="search()">
           <span
              v-if="searchLoading"
              class="loading loading-spinner loading-xs"
            />
            <Icon
              v-else
              class="text-base-content text-opacity-50"
              name="tabler:search"
              size="20"
            />
        </button>
      </div>
      
      <div class="flex gap-2">
        <CustomSelect
          class="lg:flex"
          :class="'sm:min-w-[120px]'"
          :tabs="deliveryType"
          @change-value="changeDelivery"
        />
        <CustomSelect
          class="lg:flex"
          :class="'sm:min-w-[120px]'"
          :status-text="selectDeliveryText()"
          :tabs="periods"
          @change-value="changeDeliveryPeriod"
        />
      </div>
    </div>
    <div v-if="!deliveryDataLoading" class='px-3 sm:px-6 max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-base-200'>
      <table class="table border-collapse border border-primary border-opacity-5">
          <thead class="">
            <tr class="bg-primary bg-opacity-5">
              <th class="text-center">Артикул</th>
              <th class="text-center">ПВЗ</th>
              <th class="text-center">Статус</th>
              <th class="text-center">Когда был выкуплен</th>
              <th class="text-center">ID выкупа</th>
              <th class="text-center">Дата прихода на ПВЗ</th>
              <th class="text-center">Дата забора</th>
            </tr>
          </thead>
          <tbody v-if="lastElements.length">
            <tr v-for="element in lastElements">
              <td class="border-r border-primary border-opacity-5 text-center text-primary p-5 px-1" ><span class="link link-hover" @click="articleNavigate(element.article, element.mp)">{{ element.article }}</span></td>
              <td class="border-r border-primary border-opacity-5 overflow-x-auto text-center truncate max-w-[200px] xl:max-w-xs p-5 px-1">
                {{ element.pvz }}
              </td>
              <td 
                class="border-r border-primary border-opacity-5 text-center  p-5 px-1"
                :class="{'text-green-600': element.status === 'Готов к выдаче' || element.status.includes('Получен') || element.status.includes('Ожидает получения до'), 'text-red-700': element.status === 'Отменён' || element.status === 'Возврат средств', 'text-yellow-500': element.status === 'В пути'}"
              >{{ (element.status === 'Готов к выдаче' || element.status.includes('Получен') || element.status.includes('Ожидает получения до') ) ? 'Доставлен' : element.status }}</td>
              <td class="border-r border-primary border-opacity-5 text-center p-5px-1">
                <div class=" rounded-md  w-fit px-5 py-0.5 text-center mx-auto" :class="{'bg-primary bg-opacity-5': element.purchaseDate}">{{ element.purchaseDate ? defaultDateShort(element.purchaseDate) : '-'}}</div>
              </td>
              <td class="border-r border-primary border-opacity-5 text-center p-5 px-1">
                <div class="bg-base-content rounded-md bg-opacity-5 w-fit px-5 py-0.5 text-center mx-auto truncate max-w-[100px] cursor-pointer" @click="copyId(element.id)">{{ '#' + element.id }}</div>
              </td>
              <td class="border-r border-primary border-opacity-5 text-center p-5 px-1"><div class="rounded-md  w-fit px-5 py-0.5 text-center mx-auto" :class="{'bg-primary bg-opacity-5': element.receiptDate}">{{element.receiptDate ? defaultDateShort(element.receiptDate) : '-' }}</div></td>
              <td class="border-r border-primary border-opacity-5 text-center p-5 px-1">
                <div class="  rounded-md w-fit px-5 py-0.5 text-center mx-auto" :class="{'bg-green-400 bg-opacity-70': element.receiveDate}">{{ element.receiveDate ? defaultDateShort(element.receiveDate) : '-'  }}</div>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
                <td colspan="7">
                    <div class="col-span-7 w-full text-center mx-auto text-2xl font-bold my-2">Здесь ничего нет</div>
                </td>
            </tr>
        </tbody>
        </table>
        <div ref="target" class="flex justify-center items-center h-4" />
    </div>
    <span v-else class="loading loading-dots loading-lg text-primary mx-auto p-6"></span>
    <div class="grid grid-cols-2 sm:grid-cols-6 gap-3 w-full px-1 py-3 sm:px-6 sm:pb-5">
      <div v-for="item in deliveryStats" class="flex flex-col gap-2 p-3  rounded-lg bg-primary bg-opacity-5">
        <h2 class="font-semibold text-sm 3xl:text-xl">{{ item.title }}</h2>
        <span v-if="!deliveryStatsLoading" class="text-xl font-bold text-primary mt-auto 3xl:text-2xl">{{ item.value }}</span>
        <span v-else class="loading loading-spinner loading-md text-primary"></span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.copy-message {
  @apply fixed top-0 right-0 m-4 bg-lime-100 rounded-md px-3 py-1;
  transition: opacity 0.5s ease; /* Плавное изменение прозрачности в течение 1 секунды */
  opacity: 100; /* По умолчанию элемент видим */
}

.copy-message.hide {
  opacity: 0; /* Установка прозрачности 0, когда элемент скрыт */
}
</style>
