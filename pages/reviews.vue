<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Отзывы',
})

const route = useRoute()
// const end = ref(false)

const store = useMainStore()
const router = useRouter()

const status = ref(route.query?.status ?? 'available')


const target = ref(null)
const targetIsVisible = ref(false)
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }], observerElement) => {
    targetIsVisible.value = isIntersecting
  }
)



const limit = ref<number>(25)
const skip = ref<number>(0)

// const isFetch = ref(false)

const currentTab = ref('')
const endpoint = computed(()=> currentTab.value == 'available' ? 'available' : 'published')

const query = ref({
    limit: limit.value, 
    skip: skip.value, 
    status: currentTab.value
})
const search = reactive<any>({})

const { data: reviews, error } = await useAsyncData(
  'reviews',
  () => $fetch( `/api/review/${endpoint.value}`, {
    method: 'GET',
    // baseURL: 'https://api.roastandbrew.coffee',
    params: {
      ...query.value,
    //   search: search.value,
    }
  } ), {
    watch: [query]
  }
);

// const { data } = await useFetch(`/api/review/${endpoint}`, {
//         method: 'GET',
//         query: {...query},
//     })
// const reviews = computed(()=> data.value )


// async function _getData() {
//     if(!isFetch.value) return
    
//     let endpoint = 'published'
//     const query = {
//         limit, 
//         skip, 
//         status: currentTab.value
//     }

//     if (currentTab.value === 'available') {
//         query.status = ''
//         endpoint = 'available'
//     }

//     const { data } = await useFetch(`/api/review/${endpoint}`, {
//         method: 'GET',
//         query: {...query},
//         watch: false
//     })
//     if (data.value) {
//         // if (data.value === 0) end.value = true
//         else reviews.value = [...reviews.value, ...data.value]
//     }
//     loadingListDebounce()
// }
// const _getDataDebounced = useDebounceFn(()=> _getData() , 700)
// function getReviews(){
//     isFetch.value = true
//     _getDataDebounced()
// }
// const loadingListDebounce = useDebounceFn(()=> {isFetch.value = false} , 500)  

const openedPhoto = ref('')
const selectedUUID = ref('')

// async function findReviews(value: string, type: string) {
//     let res
//     if (!value) {
//         autoTarget.value = true
//         skip.value = 0
//         getReviews()
//         search.loading = false
//     }

//     if (status.value === 'available') {
//         res = await useFetch(`/api/review/available`, {
//             method: 'GET',
//             query: {
//                 search: { string: value, type}
//             },
//         })
//     } else {
//         res = await useFetch<any[]>('/api/review/searchReviews', {
//             query: {
//                 string: value,
//                 type,
//                 status: status.value,
//             },
//         })
//     }
//     if (res && res.data?.value) reviews.value = [...res.data.value]
//     search.loading = false
// }

// const findReviewsDebounced = useDebounceFn(findReviews, 1000)

function onSearchInput() {
//   autoTarget.value = false
//   search.loading = true
//   findReviewsDebounced(search.text, search.type)
}

function openInfoModal() {
  store.infoModal = true
  store.infoType = 'reviews'
}

function openPhoto(src: string) {
  openedPhoto.value = src
}
const selectedDelivery = ref('')
const modalOpen = ref(false)

function openModal(uuid: string, deliveryid: string) {
  selectedUUID.value = uuid
  selectedDelivery.value = deliveryid
  modalOpen.value = true
}
function closeModal() {
  modalOpen.value = false
}
function goToPublished() {
  closeModal()
  router.push('/reviews?status=published')
}

const uuidForRemove = ref('')
const reviewRemoveModalClose: any = ref(null)
function openRemoveReviewModal(uuid: any) {
  uuidForRemove.value = uuid
  reviewRemoveModalClose.value?.click()
}

async function removeReview() {
//   const { data, error } = await useFetch('/api/review/delete', {
//     method: 'GET',
//     query: {
//       id: uuidForRemove.value,
//     },
//   })
//   if (data.value) {
//     notify({
//       title: 'Отзыв удален',
//       text: 'Ваш отзыв выставлен на удаление',
//       type: 'success',
//     })
//     const startIn = reviews.value.find( rev => rev.uuid == uuidForRemove.value)
//     reviews.value.splice(startIn, 1)
//   }
//   if (error.value) {
//     notify({
//       title: 'Что-то пошло не так',
//       text: error.value.data?.message,
//       type: 'error',
//       duration: 3000,
//     })
//   }
}

// watch(()=> targetIsVisible.value, (isVisible) => {
//     if (
//         isVisible &&
//         autoTarget.value &&
//         !isFetch.value &&
//         !end.value
//     ) {
//         skip.value += limit.value
//         // getReviews()
//     }
// })

onMounted( () => {
    if (route.query?.uuid && route.query?.uuid.length > 0) {
        const uuid = route.query?.uuid
        if (uuid && typeof uuid == 'string') {
            search.value = { uuidReview: uuid }
            onSearchInput()
        }
    } else if(route.query.status) {
        currentTab.value = route.query.status.toString()
    } else {
        currentTab.value = 'available'
        router.push('/reviews?status=available')
    }
    // getReviews()
})

const tabs = [
    {value: 'available', name: 'Доступные'}, 
    {value: 'published', name: 'Опубликованные'}, 
    {value: 'work', name: 'В работе'}, 
    {value: 'canceled', name: 'Отмененные'}, 
    {value: 'deleting', name: 'На удалении'}, 
    {value: 'deleted', name: 'Удаленные'},
    {value: 'nofunds', name: 'Недостаточно средств'}
]

function changeTab(tab: string){
    // reviews.value = []
    skip.value = 0
    // end.value = false
    currentTab.value = tab
    skip.value = 0
    router.push(`/reviews?status=${tab}`)
    // getReviews()
}

</script>

<template>
  <div>

    <div class="page-header">
      <div class="flex items-center gap-2 mt-4">
        <h1 class="text-2xl font-bold">Отзывы</h1>
        <InfoButton @openModal="openInfoModal" />
      </div>
      <p class="description">
        На каждый полученный артикул можно оставить отзыв. Оплачивается отдельно
        от выкупа согласно вашему тарифу.
      </p>
      <p class="text-xs font-light mt-1 lg:text-sm">
        Стоимость одного отзыва -
        <span class="font-bold"> {{ store.tariffString('review') }} </span>
        Стоимость удаления отзыва
        <span class="font-bold"> 100р. </span>

        Все услуги оказываются по Московскому времени.
      </p>
    </div>

    <div class="flex justify-between mb-2 mt-6 items-center">
      <div class="">
        <Button 
            v-for="tab in tabs" 
            :class="[
                'btn btn-ghost btn-sm normal-case font-medium',
                { 'btn-active': tab.value === currentTab },
            ]"
            @click="changeTab(tab.value)"
            > {{ tab.name }}</Button>
      </div>
    </div>

    <div class="search flex justify-between content-center my-4 flex-wrap gap-2">
      <div class="flex gap-1 items-center">
        <ExportXls
          api="/api/review/export"
          fileName="TOPVTOP Доступные отзывы"
          :isVisible="true"
        />
      </div>
      <div class="flex gap-1 items-center">
        <select v-model="search.type" class="select select-bordered select-sm">
          <option value="article">Артикул</option>
          <option value="uuid">ID выкупа</option>
          <option v-if="currentTab !== 'available'" value="uuidReview">
            ID отзыва
          </option>
        </select>
        <div class="relative flex items-center flex-grow-0 w-full">
          <input
            v-model="search.text"
            type="text"
            class="input input-sm input-bordered"
            placeholder="Поиск"
            @input="onSearchInput"
          />
          <span
            v-if="search.loading"
            class="absolute right-2 loading loading-spinner loading-xs p-2"
          />
        </div>
      </div>
    </div>

    <div v-if="reviews">
      <div v-if="currentTab === 'available'" class="cards grid grid-cols-1 gap-4">
        <ReviewCard
          v-for="(review, index) of reviews"
          :key="index"
          :index="index"
          :info="review"
          @open-modal="openModal"
        />
      </div>
      <div
        v-else
        class="cards grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-4"
      >
        <ReviewPublishedCard
          @remove-review="openRemoveReviewModal"
          v-for="(review, index) of reviews"
          :key="index"
          :index="index"
          :info="review"
          @open-image="openPhoto"
        />
      </div>
      <div ref="target" class="flex justify-center items-center h-4 mb-10" />
    </div>
    <div v-else>
        <Hero v-if="reviews" />
        <p v-else>загрузка...</p>
    </div>

    <ReviewModal
      v-if="modalOpen"
      :deliveryid="selectedDelivery"
      :state="modalOpen"
      :uuid="selectedUUID"
      @publish="goToPublished"
      @close="closeModal"
    />

    <!-- Put this part before </body> tag -->
    <input id="reviewImageModal" type="checkbox" class="modal-toggle" />

    <label for="reviewImageModal" class="modal cursor-pointer">
      <label
        for=""
        class="modal-box min-w-0 max-w-5xl max-h-[80vh] p-0 overflow-hidden"
      >
        <label
          for="reviewImageModal"
          class="btn btn-sm btn-ghost btn-circle absolute right-2 top-2"
          >✕</label
        >
        <nuxt-img
          v-if="openedPhoto"
          fit="contain"
          class="object-contain m-auto max-h-[80vh]"
          :src="openedPhoto || ''"
          loading="lazy"
        />
      </label>
    </label>
  </div>
  <div>
    <!-- You can open the modal using ID.showModal() method -->
    <!-- Put this part before </body> tag -->
    <input type="checkbox" id="reviewRemoveModal" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box max-w-xs">
        <h3 class="font-bold text-lg">Вы уверены?</h3>
        <p class="py-4">Стоимость услуги 100 рублей!</p>
        <div class="modal-action flex justify-between">
          <label
            for="reviewRemoveModal"
            class="btn btn-primary"
            ref="reviewRemoveModalClose"
            >Отмена</label
          >
          <label
            for="reviewRemoveModal"
            class="btn btn-error"
            @click="removeReview"
            >Удалить</label
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
