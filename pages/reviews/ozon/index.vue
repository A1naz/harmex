<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'
import { SelectOptionsReviews as SelectOptions } from '@/data/enums'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Отзывы Ozon',
})

const { getData } = useApi()

const route = useRoute()
const end = ref(false)

const store = useMainStore()
const router = useRouter()

const status = ref(route.query?.status ?? 'available')

const MPTabs = store.client.username == 'test'
    ? [
        { title: 'Ozon', value: 'ozon' },
        { title: 'Wildberries', value: 'wildberries' },
      ]
    : [{ title: 'Wildberries', value: 'wildberries' }]

const target = ref(null)
const targetIsVisible = ref(false)
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }], observerElement) => {
    targetIsVisible.value = isIntersecting
  }
)

const tabs = [
  { value: 'published', name: 'Опубликованные' },
  { value: 'available', name: 'Доступные' },
  { value: 'work', name: 'В работе' },
  { value: 'canceled', name: 'Отмененные' },
  // { value: 'deleting', name: 'На удалении' },
  { value: 'deleted', name: 'Удаленные' },
  // { value: 'nofunds', name: 'Недостаточно средств' },
]

const searchOptions = ref([
  { value: SelectOptions.article, name: 'Артикул' },
  { value: SelectOptions.uuidBuyout, name: 'ID выкупа' },
  { value: SelectOptions.idReview, name: 'ID отзыва' },
])

const skip = ref<number>(0)
const limit = ref<number>(25)
const search = ref<any>({ type: 'article', text: '' })

const searchType = ref<SelectOptions>(SelectOptions.article)
const searchText = ref('')

const currentTab = ref<string>('')
const endpoint = computed(() =>
  currentTab.value == 'available' ? 'available' : 'published'
)

const isFetch = ref(true)
const reviews = ref<any>([])
const fetchData = async () => {
  isFetch.value = true
  const response = await $fetch(`/api/ozon/review/${endpoint.value}`, {
    method: 'GET',
    params: {
      skip: skip.value,
      limit: limit.value,
      tab: currentTab.value,
      search:
        searchText.value.length > 0
          ? { [searchType.value]: searchText.value }
          : {},
    },
  })
  if (response) {
    reviews.value = [...reviews.value, ...response]
    if (response.length < limit.value) end.value = true
  }
  isFetch.value = false
}

function changeTab(tab: any) {
  reviews.value = []
  skip.value = 0
  end.value = false
  currentTab.value = tab.value
  router.push(`/reviews/ozon?status=${tab.value}`)
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

function openPhoto(src: string) {
  openedPhoto.value = src
}
const selectedDelivery = ref('')
const modalOpen = ref(false)

const getDrafts = async (art: any) => {
  const res = await getData('/review/drafts', {
    search: { article: { $in: ['', art] } },
  })
  if (res && res.length > 0) {
    selectedArticle.value = {
      ...selectedArticle.value,
      drafts: res,
    }
  }
}

const selectedArticle = ref<any>({})
function openModal(review: any, uuid: string, deliveryid: string) {
  selectedArticle.value = review
  getDrafts(review.article)
  selectedUUID.value = uuid
  selectedDelivery.value = deliveryid
  modalOpen.value = true
}
function closeModal() {
  modalOpen.value = false
}
function goToPublished() {
  closeModal()
  navigateTo('/reviews/ozon?status=available', {external: true})
 
}

const uuidForRemove = ref('')
const reviewRemoveModalClose: any = ref(null)
function openRemoveReviewModal(uuid: any) {
  uuidForRemove.value = uuid
  reviewRemoveModalClose.value?.click()
}

async function removeReview() {
  const { data, error } = await useFetch('/api/ozon/review/delete', {
    method: 'POST',
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
    const startIn = reviews.value.find(
      (rev: any) => rev.uuid == uuidForRemove.value
    )
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

watch(
  () => targetIsVisible.value,
  (isVisible) => {
    if (isVisible && !end.value) {
      skip.value += limit.value
      fetchData()
    }
  }
)

onMounted(() => {
  if (route.query?.idReview && route.query?.idReview.length > 0) {
    const idReview = route.query?.idReview
    if (idReview && typeof idReview == 'string') {
      currentTab.value = 'published'
      searchType.value = SelectOptions.idReview
      searchText.value = idReview
    }
  } else if (route.query.status) {
    currentTab.value = route.query.status.toString()
  } else {
    currentTab.value = 'available'
    router.push('/reviews/ozon?status=available')
  }
  fetchData()
})

const isInfoModal = ref<boolean>(false)
function toggleInfoModal() {
  isInfoModal.value = !isInfoModal.value
}
const statusText = computed(() => {
  return tabs.find((el: any) => el.value === route.query.status)?.name
})

async function changeMP(e: any) {
  return navigateTo(
    '/reviews/' +
      e.value +
      (route.query?.status ? '?status=' + route.query.status : '')
  )
}
function selectText() {
  const index = tabs.findIndex((item) =>route.query?.status ?  item.value == route.query?.status : item.value == 'available' )
  if (index == -1) {
    return 'Доступные'
  } 
  return tabs[index].name
}
const customLinks = tabs.map(filter => ({
  title: filter.name,
  value: filter.value
}));
</script>

<template>
  <div>
    <div class="page-header">
      <!-- <div class="flex items-center gap-2 mt-4">
        <h1 class="text-2xl font-bold">Отзывы</h1>
        <InfoButton @openModal="toggleInfoModal" />
      </div> -->

      <!-- <InfoModal 
        :isModal="isInfoModal" 
        title="Отзывы"
        ytSrc='https://www.youtube.com/embed/Zc0RYzPzNfY?si=LTgHXnmGixsDkmoG'
        @changeVisibility="toggleInfoModal"
        >
        <p>
            На каждый полученный артикул можно оставить отзыв. Оплачивается отдельно
            от выкупа согласно вашему тарифу.
        </p>
        <p>
            Стоимость одного отзыва -
            <span class="font-bold"> {{ store.tariffString('review') }} </span>
            Стоимость удаления отзыва
            <span class="font-bold"> 100р. </span>

            Все услуги оказываются по Московскому времени.
        </p>
        </InfoModal> -->
    </div>

    <div class="flex justify-between mb-2 mt-4 items-center flex-wrap gap-2">
      <div class="flex w-full gap-2 lg:hidden">
        <ExportXls
          api="/api/review/export"
          fileName="MARKETMONSTR Доступные отзывы"
          :isVisible="true"
        />
        <input
          v-model="searchText"
          type="text"
          class="input input-sm input-bordered w-full"
          placeholder="Поиск"
          @change="onSearchInput"
        />
      </div>
      <div class="flex gap-2 flex-wrap lg:hidden">
        <CustomSelect
          class="lg:hidden"
          :class="'navbar:min-w-[120px]'"
          :tabs="customLinks"
          :status-text="selectText()"
          @change-value="changeTab"
        />
        <select v-model="searchType" class="select select-bordered select-sm">
          <option
            v-for="option in searchOptions"
            :value="option.value"
            :key="'k-' + option.value"
            :default="option.value == SelectOptions.article"
            :hidden="
              option.value == SelectOptions.idReview &&
              currentTab == 'available'
            "
          >
            {{ option.name }}
          </option>
        </select>
        <!-- <NuxtLink
          to="/reviews/ozon/drafts"
          class="btn btn-sm btn-primary bg-opacity-20 border-none text-base-content"
          >Черновики</NuxtLink
        > -->
      </div>
      <div class="gap-2 hidden lg:flex">
        <CustomSelect
          class="hidden lg:flex"
          :class="'sm:min-w-[120px]'"
          :tabs="MPTabs"
          @change-value="changeMP"
        />
        <CustomSelect
          class="hidden lg:flex"
          :class="'navbar:min-w-[120px]'"
          :tabs="customLinks"
          :status-text="selectText()"
          @change-value="changeTab"
        />
        <!-- <NuxtLink
          to="/reviews/drafts"
          class="btn btn-sm btn-primary bg-opacity-20 border-none text-base-content"
          >Черновики</NuxtLink
        > -->
      </div>
      <div class="gap-2 items-center hidden lg:flex">
        <select v-model="searchType" class="select select-bordered select-sm">
          <option
            v-for="option in searchOptions"
            :value="option.value"
            :key="'k-' + option.value"
            :default="option.value == SelectOptions.article"
            :hidden="
              option.value == SelectOptions.idReview &&
              currentTab == 'available'
            "
          >
            {{ option.name }}
          </option>
        </select>
        <div class="w-full">
          <input
            v-model="searchText"
            type="text"
            class="input input-sm input-bordered"
            placeholder="Поиск"
            @change="onSearchInput"
          />
          <!-- <span
                v-if="search.loading"
                class="absolute right-2 loading loading-spinner loading-xs p-2"
                /> -->
        </div>
        <div class="flex gap-1 items-center">
          <ExportXls
            api="/api/review/export"
            fileName="MARKETMONSTR Доступные отзывы"
            :isVisible="true"
          />
        </div>
      </div>
    </div>

    <!-- <div class="search flex justify-between content-center my-4 flex-wrap gap-2">
      <div class="flex gap-1 items-center">
        <ExportXls
          api="/api/review/export"
          fileName="MARKETMONSTR Доступные отзывы"
          :isVisible="true"
        />
        <NuxtLink 
            to="/reviews/drafts" 
            class="btn btn-primary btn-sm"
            >Черновики</NuxtLink>
      </div>
      
    </div> -->

    <div v-if="reviews && reviews.length > 0" class="mt-6">
      <div
        v-if="currentTab === 'available'"
        class="cards grid grid-cols-1 gap-4"
      >
        <ReviewOzonCard
          v-for="(review, index) of reviews"
          :key="index"
          :index="index"
          :info="review"
          @open-modal="(b: string, d: string)=> openModal(review, b, d )"
        />
      </div>
      <div
        v-else
        class="cards grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-4"
      >
        <ReviewOzonPublishedCard
          @remove-review="openRemoveReviewModal"
          v-for="(review, index) of reviews"
          :key="index"
          :index="index"
          :info="review"
          @open-image="openPhoto"
        />
      </div>

      <div
        v-if="!isFetch && reviews && reviews.length > 0"
        ref="target"
        class="flex justify-center items-center h-4 mb-10"
      />
    </div>
    <div v-else-if="isFetch" class="w-full mt-5 flex justify-center items-center">
      <span class="loading loading-dots loading-lg text-primary"></span>
    </div>
    <Hero v-else />

    <ReviewOzonModal
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
