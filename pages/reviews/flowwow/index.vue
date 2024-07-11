<script setup lang="ts">
if (useMainStore().client.username !== 'test') {
useMPStore().selectedMP = 'wildberries'
useMPStore().selectedMP = 'wildberries'
navigateTo('/buyouts/wildberries')
}

import { notify } from '@kyvg/vue3-notification'
import { SelectOptionsReviews as SelectOptions } from '@/data/enums'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Отзывы Flowwow',
})

const { getData } = useApi()

const route = useRoute()
const end = ref(false)

const store = useMainStore()
const mpStore = useMPStore()
const router = useRouter()

const status = ref(route.query?.status ?? 'available')
const logModal = ref(false)
const selectedReview = ref({
  uuid: '',
})

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
  currentTab.value == 'available' ? 'available' : 'published'
)

const isFetch = ref(true)
const reviews = ref<any>([])
const fetchData = async () => {
  isFetch.value = true
  const response: any = await $fetch(
    `/api/flowwow/review/${endpoint.value}`,
    {
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
    }
  )
  if (response) {
    reviews.value = [...reviews.value, ...response]
    if (response.length < limit.value) end.value = true
  }
  isFetch.value = false
  loading.value = false
}

function changeTab(tab: any) {
  reviews.value = []
  skip.value = 0
  end.value = false
  currentTab.value = tab.value
  router.push(`/reviews/flowwow?status=${tab.value}`)
  fetchData()
}

function selectText() {
  const index = tabs.findIndex((item) =>
    route.query?.status
      ? item.value == route.query?.status
      : item.value == 'available'
  )
  if (index == -1) {
    return 'Доступные'
  }
  return tabs[index].name
}

function onSearchInput(val: any) {
  if (searchText.value !== '' && searchText.value.trim() === '') {
    return
  }
  loading.value = true
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
  const res = await getData('/flowwow/review/drafts', {
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
  const { data, error } = await useFetch('/api/flowwow/review/delete', {
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
    // const idReview = route.query?.idReview
    // if (idReview && typeof idReview == 'string') {
    //   currentTab.value = 'published'
    //   searchType.value = SelectOptions.idReview
    //   searchText.value = idReview
    // }
  } else if (route.query.status) {
    currentTab.value = route.query.status.toString()
  } else {
    currentTab.value = 'available'
    router.push('/reviews/flowwow?status=available')
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
  mpStore.changeMp(
    e.value,
    'reviews',
    route.query?.status ? '?status=' + route.query.status : ''
  )
}
const customLinks = tabs.map((filter) => ({
  title: filter.name,
  value: filter.value,
}))

async function resumeStatus(item: any) {
  const { data, error } = await useFetch(`/api/flowwow/review/resume`, {
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
      text: 'Отзыв успешно возвращен в работу',
      duration: 3000,
    })
    reviews.value = []
    skip.value = 0
    end.value = false
    fetchData()
  }
}

function openLogModal(uuid: any) {
  
}
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
          api="/api/flowwow/review/export"
          fileName="MARKETMONSTR Доступные отзывы"
          :isVisible="true"
        />
        <div class="flex w-full">
          <input
            v-model="searchText"
            type="text"
            class="input input-sm bg-base-300 bg-opacity-40 rounded-r-none w-full"
            placeholder="Поиск"
            @change="onSearchInput"
          />
          <div
            class="hover:bg-base-300 bg-base-300 bg-opacity-40 flex items-center px-2 rounded-r-lg cursor-pointer"
            @click="onSearchInput"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs" />
            <Icon v-else class="text-gray-500" name="tabler:search" size="20" />
          </div>
        </div>
      </div>

      <div class="flex gap-2 flex-wrap lg:hidden">
        <CustomSelect
          class="lg:hidden"
          :class="'sm:min-w-[120px]'"
          :status-text="'Flowwow'"
          :tabs="
            store.client.username == 'test'
              ? mpStore.sortMp('reviews')
              : mpStore.sortMp('reviews', true)
          "
          @change-value="changeMP"
        />
        <CustomSelect
          class=""
          :class="'navbar:min-w-[140px] w-[140px]'"
          :tabs="customLinks"
          :status-text="selectText()"
          @change-value="changeTab"
        />
        <select
          v-model="searchType"
          class="select bg-base-300 bg-opacity-20 select-sm"
        >
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
          to="/reviews/wildberries/drafts"
          class="btn btn-sm btn-primary bg-opacity-20 border-none text-base-content"
          >Черновики</NuxtLink
        > -->
      </div>
      <div class="gap-2 hidden lg:flex">
        <CustomSelect
          class="hidden lg:flex"
          :class="'sm:min-w-[120px]'"
          :status-text="'Flowwow'"
          :tabs="
            store.client.username == 'test'
              ? mpStore.sortMp('reviews')
              : mpStore.sortMp('reviews', true)
          "
          @change-value="changeMP"
        />
        <CustomSelect
          class="hidden lg:flex"
          :class="'navbar:min-w-[140px] w-[140px]'"
          :tabs="customLinks"
          :status-text="selectText()"
          @change-value="changeTab"
        />
        <!-- <div class="dropdown">
          <div
            tabindex="0"
            role="button"
            class="font-medium normal-case btn btn-primary bg-opacity-20 border-none text-base-content btn-sm w-[150px]"
          >
            <span>{{ statusText }}</span>
          </div>
          <ul
            tabindex="0"
            class="shadow dropdown-content z-[1] bg-base-100 p-1 rounded-lg mt-1 max-w-[150px]"
          >
            <li>
              <Button
                class="btn btn-ghost btn-xs normal-case font-medium w-full"
                v-for="tab in tabs"
                :class="[
                  'btn btn-ghost btn-sm normal-case font-medium',
                  { 'btn-active': tab.value === currentTab },
                ]"
                @click="changeTab(tab.value)"
              >
                {{ tab.name }}
              </Button>
            </li>
          </ul>
        </div> -->
        <!-- <NuxtLink
          to="/reviews/wildberries/drafts"
          class="btn btn-sm btn-primary bg-opacity-20 border-none text-base-content"
          >Черновики</NuxtLink
        > -->
      </div>
      <div class="gap-2 items-center hidden lg:flex">
        <select
          v-model="searchType"
          class="select bg-base-300 bg-opacity-20 select-sm"
        >
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
        <div class="flex w-full">
          <input
            v-model="searchText"
            type="text"
            class="input input-sm bg-base-300 w-[134px] bg-opacity-40 rounded-r-none"
            placeholder="Поиск"
            @change="onSearchInput"
          />
          <div
            class="hover:bg-base-300 bg-base-300 bg-opacity-40 flex items-center px-2 rounded-r-lg cursor-pointer"
            @click="onSearchInput"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs" />
            <Icon v-else class="text-gray-500" name="tabler:search" size="20" />
          </div>
        </div>

        <div class="flex gap-1 items-center">
          <ExportXls
            api="/api/flowwow/review/export"
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
        <ReviewFlowwowCard
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
        <ReviewFlowwowPublishedCard
          @remove-review="openRemoveReviewModal"
          v-for="(review, index) of reviews"
          :key="index"
          :index="index"
          :info="review"
          @open-image="openPhoto"
          @resume-status="resumeStatus"
          @get-review="fetchData()"
          @log-modal="(item:any) => [(selectedReview = item), (logModal = true)]"
        />
      </div>

      <div
        v-if="!isFetch && reviews && reviews.length > 0"
        ref="target"
        class="flex justify-center items-center h-4 mb-10"
      />
    </div>
    <div
      v-else-if="isFetch"
      class="w-full mt-5 flex justify-center items-center"
    >
      <span class="loading loading-dots loading-lg text-primary"></span>
    </div>
    <Hero v-else />

    <ReviewFlowwowModal
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
      <div class="modal-box max-w-xs py-6 px-3">
        <h3 class="font-bold text-xl">Вы уверенны что хотите удалить отзыв?</h3>
        <p class="py-2.5">Стоимость услуги 100 рублей!</p>
        <div class="flex justify-between">
          <label
            for="reviewRemoveModal"
            class="btn btn-ghost w-1/2"
            ref="reviewRemoveModalClose"
            >Отмена</label
          >
          <label
            for="reviewRemoveModal"
            class="btn btn-[#ebedff] hover:bg-[#b2baff] w-1/2"
            @click="removeReview"
            >Удалить</label
          >
        </div>
      </div>
    </div>
  </div>
  <LogModal :info="selectedReview" :state="logModal" @close="logModal = false" />
</template>

<style scoped></style>
