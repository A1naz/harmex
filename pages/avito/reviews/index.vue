<script setup lang="ts">
import { SelectOptionsReviews as SelectOptions } from '@/data/enums'

const { notify } = useNotification()

definePageMeta({
  layout: 'app',
  middleware: 'auth',
  title: 'Отзывы Avito',
})

const route = useRoute()
const end = ref(false)

const router = useRouter()

const status = ref(route.query?.status ?? 'available')
const logModal = ref(false)
const selectedReview = ref({
  uuid: '',
})

const target = ref(null)
const targetIsVisible = ref(false)
// eslint-disable-next-line unused-imports/no-unused-vars
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    targetIsVisible.value = isIntersecting
  },
)

const tabs = [
  { value: 'published', name: 'Опубликованные' },
  { value: 'available', name: 'Доступные' },
  { value: 'work', name: 'В работе' },
  { value: 'canceled', name: 'Отмененные' },
  // { value: 'deleting', name: 'На удалении' },
  { value: 'deleted', name: 'Удаленные' },
  { value: 'nofunds', name: 'Недостаточно средств' },
  { value: 'reviewsUpdate', name: 'На проверке' },
]

const searchOptions = ref([
  { value: SelectOptions.article, name: 'Артикул' },
  { value: SelectOptions.uuidBuyout, name: 'ID выкупа' },
  { value: SelectOptions.idReview, name: 'ID отзыва' },
])

const skip = ref<number>(0)
const limit = computed(() => (currentTab.value == 'available' ? 1000 : 50))
const search = ref<any>({ type: 'article', text: '' })
const loading = ref(false)

const searchType = ref<SelectOptions>(SelectOptions.article)
const searchText = ref('')

const currentTab = ref<string>('')
const endpoint = computed(() =>
  currentTab.value == 'available' ? 'available' : 'published',
)

const isFetch = ref(true)
const reviews = ref<any>([])
async function fetchData() {
  isFetch.value = true
  const response = await $fetch(`/api/avito/review/${endpoint.value}`, {
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
    if (response.length < limit.value)
      end.value = true
  }
  isFetch.value = false
  loading.value = false
}

function changeTab(tab: any) {
  reviews.value = []
  skip.value = 0
  end.value = false
  currentTab.value = tab.value
  router.push(`/avito/reviews?status=${tab.value}`)
  fetchData()
}

function onSearchInput() {
  if (searchText.value !== '' && searchText.value.trim() === '') {
    return
  }
  reviews.value = []
  skip.value = 0
  end.value = false
  loading.value = true
  fetchData()
}

const openedPhoto = ref('')
const selectedUUID = ref('')

function openPhoto(src: string) {
  openedPhoto.value = src
}
const selectedDelivery = ref('')
const modalOpen = ref(false)

const selectedArticle = ref<any>({})
function openModal(review: any, uuid: string, deliveryid: string) {
  selectedArticle.value = review
  // getDrafts(review.article)
  selectedUUID.value = uuid
  selectedDelivery.value = deliveryid
  modalOpen.value = true
}
function closeModal() {
  modalOpen.value = false
}
function goToPublished() {
  closeModal()
  reviews.value = []
  skip.value = 0
  end.value = false
  fetchData()
}

const uuidForRemove = ref('')
const reviewRemoveModalClose: any = ref(null)
function openRemoveReviewModal(uuid: any) {
  uuidForRemove.value = uuid
  reviewRemoveModalClose.value?.click()
}

async function removeReview() {
  const { data, error } = await useFetch('/api/avito/review/delete', {
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
      (rev: any) => rev.uuid == uuidForRemove.value,
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
  },
)

onMounted(() => {
  if (route.query?.idReview && route.query?.idReview.length > 0) {
    const idReview = route.query?.idReview
    if (idReview && typeof idReview == 'string') {
      currentTab.value = 'published'
      searchType.value = SelectOptions.idReview
      searchText.value = idReview
    }
  }
  else if (route.query.status) {
    currentTab.value = route.query.status.toString()
  }
  else {
    currentTab.value = 'available'
    router.push('/avito/reviews?status=available')
  }
  fetchData()
})

function selectText() {
  const index = tabs.findIndex(item => route.query?.status ? item.value == route.query?.status : item.value == 'available')
  if (index == -1) {
    return 'Доступные'
  }
  return tabs[index].name
}
const customLinks = tabs.map(filter => ({
  title: filter.name,
  value: filter.value,
}))

async function resumeStatus(item: any) {
  const { data, error } = await useFetch(`/api/avito/review/resume`, {
    method: 'POST',
    body: {
      item,
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
      text: 'Отзыв успешно возвращен в работу',
      duration: 3000,
    })
    reviews.value = []
    skip.value = 0
    end.value = false
    fetchData()
  }
}
</script>

<template>
  <div class="px-4 sm:px-16">
    <div class="page-header">
      <div class="breadcrumbs text-sm mt-8 flex w-full justify-between flex-wrap-reverse">
        <ul class="font-medium text-[18px] text-[#909090]">
          <li class="cursor-pointer">
            <NuxtLink to="/catalog" class="cursor-pointer text-[#909090]">
              Маркетплейсы
            </NuxtLink>
          </li>
          <li class="cursor-pointer">
            <NuxtLink to="/catalog/avito" class="cursor-pointer text-[#909090]">
              Avito
            </NuxtLink>
          </li>
          <li class="cursor-pointer text-[#1e2734]">
            Отзывы
          </li>
        </ul>
      </div>
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

    <div class="flex justify-start lg:justify-between  mb-4 items-center mt-4">
      <div class="flex relative gap-2 lg:gap-3 flex-col lg:flex-row w-full lg:w-full">
        <div class="export lg:absolute right-0 top-0">
          <ExportXls
            api="/api/avito/review/export"
            file-name="MARKETMONSTR Доступные отзывы"
            :is-visible="true"
          />
        </div>
        <div class="w-full flex gap-1 lg:gap-2 ">
          <div class="flex gap-1  lg:gap-3 flex-nowrap whitespace-nowrap">
            <span><CustomSelect
              class="h-[2rem]  min-w-[95px]"

              :tabs="customLinks"
              :status-text="selectText()"
              @change-value="changeTab"
            />
            </span>
          </div>
          <div class="flex lg:ml-auto gap-0.5 lg:gap-3">
            <CustomSelect
              class="h-[2rem] bg-[#f4f4f4]"
              :tabs="searchOptions.map((el: any) => ({ title: el.name, value: el.value }))"
              @change-value="(e: any) => (searchType = e.value)"
            />
          </div>
          <div class="absolute right-0 top-0 w-[calc(100%-60px)] lg:w-fit lg:static lg:mr-[60px]">
            <label class="w-full flex bg-[#ececed] rounded-lg items-center">
              <input
                v-model="searchText"
                type="text"
                class="input input-sm w-[134px] bg-transparent bg-opacity-40 rounded-r-none "
                placeholder="Поиск"
                @change="onSearchInput"
              >
              <div class="hover:bg-transparent bg-transparent bg-opacity-40 flex items-center px-2 rounded-r-lg cursor-pointer " @click="onSearchInput">
                <span
                  v-if="loading"
                  class="loading loading-spinner loading-xs "
                />
                <Icon
                  v-else
                  class="text-gray-500 "
                  name="tabler:search"
                  size="20"
                />
              </div>
            </label>
          </div>
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
        <ReviewAvitoCard
          v-for="(review, index) of reviews"
          :key="index"
          :index="index"
          :info="review"
          @open-modal="(b: string, d: string) => openModal(review, b, d)"
        />
      </div>
      <div
        v-else
        class="cards grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-4"
      >
        <ReviewAvitoPublishedCard
          v-for="(review, index) of reviews"
          :key="index"
          :index="index"
          :info="review"
          @remove-review="openRemoveReviewModal"
          @open-image="openPhoto"
          @resume-status="resumeStatus"
          @get-review="fetchData"
          @log-modal="(item:any) => [(selectedReview = item), (logModal = true)]"
        />
      </div>

      <div
        v-if="!isFetch && reviews && reviews.length > 0"
        ref="target"
        class="flex justify-center items-center h-10 mb-10"
      />
    </div>
    <div v-else-if="isFetch" class="w-full mt-5 flex justify-center items-center">
      <span class="loading loading-dots loading-lg text-primary" />
    </div>
    <Hero v-else />

    <ReviewAvitoModal
      v-if="modalOpen"
      :review="selectedArticle"
      :deliveryid="selectedDelivery"
      :state="modalOpen"
      :uuid="selectedUUID"
      @publish="goToPublished"
      @close="closeModal"
    />

    <!-- Put this part before </body> tag -->
    <input id="reviewImageModal" type="checkbox" class="modal-toggle">

    <label for="reviewImageModal" class="modal cursor-pointer">
      <label
        for=""
        class="modal-box min-w-0 max-w-5xl max-h-[80vh] p-0 overflow-hidden"
      >
        <label
          for="reviewImageModal"
          class="btn btn-sm btn-ghost btn-circle absolute right-2 top-2"
        >✕</label>
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
    <input id="reviewRemoveModal" type="checkbox" class="modal-toggle">
    <div class="modal">
      <div class="modal-box max-w-xs py-6 px-3">
        <h3 class="font-bold text-xl">
          Вы уверенны что хотите удалить  отзыв?
        </h3>
        <p class="py-2.5">
          Стоимость услуги 100 рублей!
        </p>
        <div class="flex justify-between">
          <label
            ref="reviewRemoveModalClose"
            for="reviewRemoveModal"
            class="btn btn-ghost w-1/2"
          >Отмена</label>
          <label
            for="reviewRemoveModal"
            class="btn btn-[#ebedff] hover:bg-[#b2baff] w-1/2"
            @click="removeReview"
          >Удалить</label>
        </div>
      </div>
    </div>
  </div>
  <LogModal :info="selectedReview" :state="logModal" @close="logModal = false" />
</template>

<style scoped></style>
