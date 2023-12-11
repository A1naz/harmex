<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
import { SelectOptionsReviews as SelectOptions, InfoType } from '@/data/enums'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Отзывы',
})

const route = useRoute()
const end = ref(false)

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

const tabs = [
    {value: 'available', name: 'Доступные'}, 
    {value: 'published', name: 'Опубликованные'}, 
    {value: 'work', name: 'В работе'}, 
    {value: 'canceled', name: 'Отмененные'}, 
    {value: 'deleting', name: 'На удалении'}, 
    {value: 'deleted', name: 'Удаленные'},
    {value: 'nofunds', name: 'Недостаточно средств'}
]

const searchOptions = ref([
    {value: SelectOptions.article, name: 'Артикул'}, 
    {value: SelectOptions.uuidBuyout, name: 'ID выкупа'},
    {value: SelectOptions.idReview, name: 'ID отзыва'}
])

const skip = ref<number>(0)
const limit = ref<number>(25)
const search = ref<any>({type: 'article', text: ''})

const searchType = ref<SelectOptions>(SelectOptions.article)
const searchText = ref('')

const currentTab = ref<string>('')
const endpoint = computed(()=> currentTab.value == 'available' ? 'available' : 'published')

const isFetch = ref(true)
const reviews = ref<any>([])
const fetchData = async ()=> {
    isFetch.value = true
    const response = await $fetch( `/api/review/${endpoint.value}`, {
        method: 'GET',
        params: {
            skip: skip.value,
            limit: limit.value,
            tab: currentTab.value,
            search: searchText.value.length > 0 ? {[searchType.value]: searchText.value} : {}
        }
    })
    if (response) {
        reviews.value = [...reviews.value, ...response]
        if (response.length < limit.value) end.value = true
    }
    isFetch.value = false
}

function changeTab(tab: string){
    reviews.value = []
    skip.value = 0
    end.value = false
    currentTab.value = tab
    router.push(`/reviews?status=${tab}`)
    fetchData()
}


function onSearchInput(val: any) {
    reviews.value = []
    skip.value = 0 
    end.value = false
    fetchData()
}

const openedPhoto = ref('')
const selectedUUID = ref('')

function openInfoModal() {
  store.infoModal = true
}

function openPhoto(src: string) {
  openedPhoto.value = src
}
const selectedDelivery = ref('')
const modalOpen = ref(false)


const selectedArticle = ref<any>({})
function openModal(article: any, uuid: string, deliveryid: string) {
    selectedArticle.value = article
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
  const { data, error } = await useFetch('/api/review/delete', {
    method: 'GET',
    query: {
      id: uuidForRemove.value,
    },
  })
  if (data.value) {
    notify({
      title: 'Отзыв удален',
      text: 'Ваш отзыв выставлен на удаление',
      type: 'success',
    })
    const startIn = reviews.value.find( (rev: any) => rev.uuid == uuidForRemove.value)
    reviews.value.splice(startIn, 1)
  }
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value.data?.message,
      type: 'error',
      duration: 3000,
    })
  }
}

watch(()=> targetIsVisible.value, (isVisible) => {
    if (isVisible && !end.value) {
        skip.value += limit.value
        fetchData()
    }
})

onMounted( () => {
    if (route.query?.idReview && route.query?.idReview.length > 0) {
        const idReview = route.query?.idReview
        if (idReview && typeof idReview == 'string') {
            currentTab.value = 'published'
            searchType.value = SelectOptions.idReview
            searchText.value = idReview
        }
    } else if(route.query.status) {
        currentTab.value = route.query.status.toString()
    } else {
        currentTab.value = 'available'
        router.push('/reviews?status=available')
    }
    fetchData()
})



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
        <select v-model="searchType" class="select select-bordered select-sm">
            <option v-for="option in searchOptions" 
                :value="option.value"
                :key="'k-'+option.value"
                :default="option.value == SelectOptions.article"
                :hidden="option.value == SelectOptions.idReview && currentTab == 'available'"
                >{{ option.name }}</option>
        </select>
        <div class="relative flex items-center flex-grow-0 w-full">
            <input
                v-model="searchText"
                type="text"
                class="input input-sm input-bordered"
                placeholder="Поиск"
                @change="onSearchInput"
                />
            <span
                v-if="search.loading"
                class="absolute right-2 loading loading-spinner loading-xs p-2"
                />
        </div>
      </div>
    </div>

    <div v-if="reviews && reviews.length > 0">
      <div v-if="currentTab === 'available'" class="cards grid grid-cols-1 gap-4">
        <ReviewCard
          v-for="(review, index) of reviews"
          :key="index"
          :index="index"
          :info="review"
          @open-modal="(b: string, d: string)=> openModal(review, b, d )"
        />
      </div>
      <div v-else class="cards grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
        <ReviewPublishedCard
          @remove-review="openRemoveReviewModal"
          v-for="(review, index) of reviews"
          :key="index"
          :index="index"
          :info="review"
          @open-image="openPhoto"
        />
      </div>

      <div v-if="!isFetch && reviews && reviews.length > 0" ref="target" class="flex justify-center items-center h-4 mb-10" />
    
    </div>
    <div v-else-if="isFetch">Загрузка...</div>
    <Hero v-else />

    <ReviewModal
      v-if="modalOpen"
      :review="selectedArticle"

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
