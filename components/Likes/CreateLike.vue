<script setup lang="ts">
import { useNotification } from '@kyvg/vue3-notification'

const props = defineProps({
  show: { type: Boolean, required: true },
})

const emit = defineEmits(['closeModal'])

const isPageBtnsDisabled = ref(false)
const limit = ref(50)
const page = ref(1)
const feedbacksCount = ref(0)
const { notify } = useNotification()
const changedReviews = ref<any>([])
const isCreateButtonDisabled = ref(false)

const route = useRoute()
const router = useRouter()
const reviews = ref<any>([])
const article = ref('')
const savedArticle = ref('')
const loading = ref(false)
const selectSortBy = ref('')
const sortBy = computed(() => route.query?.sortBy || 'date')

async function getProductReviews() {
  reviews.value = []
  loading.value = true
  changedReviews.value = []
  savedArticle.value = article.value
  const { data, error }: any = await useFetch('/api/likes/productReviews', {
    method: 'GET',
    headers: useRequestHeaders(['cookie']) as HeadersInit,
    query: {
      article: savedArticle.value,
      limit: limit.value * page.value,
      page: page.value,
      sortBy: sortBy.value ?? 'date',
    },
  })
  loading.value = false
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value.data.message,
      type: 'error',
    })
    return
  }
  if (data.value?.feedbacks.length < 1) {
    notify({
      title: 'Отзывы не найдены',
    })
  }
  const initial = (data.value.feedbacks as any).map((review: any) => {
    review.addLikes = 0
    review.addDislikes = 0
    return review
  }) as any[]
  reviews.value = initial
  feedbacksCount.value = data.value.feedbacksCount
  emit('closeModal', period.value, reviews.value,feedbacksCount.value, savedArticle.value)
  sortReviews()
}

async function increaseReviews() {
  limit.value += 50
  const { data, error }: any = await useFetch('/api/likes/productReviews', {
    method: 'GET',
    headers: useRequestHeaders(['cookie']) as HeadersInit,
    query: {
      article: savedArticle.value,
      limit: limit.value,
      sortBy: sortBy.value ?? 'date',
    },
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value.data.message,
      type: 'error',
    })
    return
  }
  if (!data.value.length) {
    notify({
      title: 'Отзывы не найдены',
    })
  }
  const initial = (data.value as any).map((review: any) => {
    review.addLikes = 0
    review.addDislikes = 0
    return review
  }) as any[]
  reviews.value.push(...initial)
  sortReviews()
}

function addLike(id: string) {
  reviews.value.map((review: any) => {
    if (review.id === id) review.addLikes++
    return review
  })
  changedReviews.value.find((review: any) => review.id === id)
    ? (changedReviews.value = changedReviews.value.map((review: any) => {
        if (review.id === id) review.likes++

        return review
      }))
    : changedReviews.value.push({
        id,
        likes: 1,
        dislikes: 0,
    })
}

function removeLike(id: string) {
  reviews.value.map((review: any) => {
    if (review.id === id) review.addLikes--
    return review
  })
  const review = changedReviews.value.find((review: any) => review.id === id)
  if (review) {
    if (review.likes > 1) {
      changedReviews.value = changedReviews.value.map((review: any) => {
        if (review.id === id) review.likes--

        return review
      })
    } else {
      if (review.likes === 1 && review.dislikes === 0) {
        changedReviews.value = changedReviews.value.filter(
          (review: any) => review.id !== id
        )
      } else {
        changedReviews.value = changedReviews.value.map((review: any) => {
          if (review.id === id) review.likes--

          return review
        })
      }
    }
  }
}
function addDislike(id: string) {
  reviews.value.map((review: any) => {
    if (review.id === id) review.addDislikes++
    return review
  })
  changedReviews.value.find((review: any) => review.id === id)
    ? (changedReviews.value = changedReviews.value.map((review: any) => {
        if (review.id === id) review.dislikes++

        return review
      }))
    : changedReviews.value.push({
        id,
        likes: 0,
        dislikes: 1,
      })
}
function removeDislike(id: string) {
  reviews.value.map((review: any) => {
    if (review.id === id) review.addDislikes--
    return review
  })
  const review = changedReviews.value.find((review: any) => review.id === id)
  if (review) {
    if (review.dislikes > 1) {
      changedReviews.value = changedReviews.value.map((review: any) => {
        if (review.id === id) review.dislikes--
        return review
      })
    } else {
      if (review.likes === 0 && review.dislikes === 1) {
        changedReviews.value = changedReviews.value.filter(
          (review: any) => review.id !== id
        )
      } else {
        changedReviews.value = changedReviews.value.map((review: any) => {
          if (review.id === id) review.dislikes--
          return review
        })
      }
    }
  }
}
async function selectSorting(e: any) {
  page.value = 1

  selectSortBy.value = e.target.value
  router.push({
    query: {
      sortBy: e.target.value,
    },
  })
  await getProductReviews()
}
async function save() {
  isCreateButtonDisabled.value = true
  const userOffsetMinutes = new Date().getTimezoneOffset()
  const userTimezoneOffsetHours = -userOffsetMinutes / 60
  const userTimezoneOffsetMinutesRemainder = -userOffsetMinutes % 60

  const { data, error } = await useFetch('/api/likes/create', {
    method: 'POST',
    body: {
      article: savedArticle.value,
      reviews: changedReviews.value,
      period: period.value,
    },
    query: {
      userTimezoneOffsetHours,
      userOffsetMinutes: userTimezoneOffsetMinutesRemainder,
    },
  })
  if (error.value) {
    notify({
      type: 'error',
      title: 'Ошибка',
      text: error.value.message,
    })
    return
  }
  if (data.value) {
    notify({
      type: 'success',
      title: 'Успешно',
    })
    return router.push('/likes')
  }
}

async function cancel() {
  changedReviews.value = []
  article.value = savedArticle.value
  getProductReviews()
}
function getAddedLikes() {
  const addedLikes = changedReviews.value.reduce(
    (acc: any, review: any) => {
      acc.likes += review.likes
      acc.dislikes += review.dislikes
      return acc
    },
    {
      likes: 0,
      dislikes: 0,
    }
  )
  return addedLikes
}
function sortReviews() {
  const val = sortBy.value
  if (val === 'date') {
    reviews.value = reviews.value.sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  } else if (val === 'rating') {
    reviews.value = reviews.value.sort((a: any, b: any) => {
      if (b.rating > a.rating) return 1
      else if (b.rating < a.rating) return -1
      else return 0
    })
  } else if (val === 'rank') {
    reviews.value = reviews.value.sort((a: any, b: any) => b.rank - a.rank)
  }
}
watch(
  () => sortBy.value,
  (route) => {
    selectSortBy.value = sortBy.value.toString()
    sortReviews()
  },
  { deep: true, immediate: true }
)

const startDate = ref(new Date(Date.now() + 1000 * 60 * 5))
const period = ref('3h')
function selectPeriod(event: any) {
  period.value = event.target.value
}


</script>

<template>
    <div
      v-if="props.show === true"
      class="modalCustom fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm"
    >
    <div
        class="flex flex-col bg-base-100 rounded-lg w-full max-w-[810px] gap-5 p-4"
      >
        <div class="flex justify-between">
          <div class="font-medium text-lg">Лайк на отзывы</div>
          <NuxtLink to="/likes" 
            class="text-gray-500 hover:text-gray-700 self-end mb-2"
          >
            <Icon name="material-symbols:close-rounded" size="24" />
          </NuxtLink>
        </div>
        <div class="bg-base-100 rounded-lg">
          <div class="flex flex-wrap items-center gap-6 mb-2">
            <div class="relative">
              <div>Вставьте ссылку:</div>
              <div class="input-group w-64 min-h-min md:min-h-[48px] mt-2">
                <input
                 v-model="article"
                  :class="{
                    'input-error': !reviews,
                    'input-success': reviews.length > 0,
                  }"
                  tabindex="0"
                  class="input w-full input-sm bg-base-200 min-h-min md:min-h-[48px] text-lg"
                  placeholder="Введите артикул"
                  type="text"
                  @keydown.enter="getProductReviews"
                />
              </div>
            </div>
            <div>
              <div>Период выполнения:</div>
              <select
                class="select w-44 select-sm mt-2 min-h-min md:min-h-[48px]"
                @change="selectPeriod"
              >
                <option value="3h">3 часа</option>
                <option value="12h">12 часов</option>
                <option value="1day">1 день</option>
                <option value="3days">3 дня</option>
                <option value="7days">7 дней</option>
                <option value="14days">14 дней</option>
              </select>
            </div>
            <div class="w-full ml-auto self-end justify-end lg:w-40">
              <button
              
                class="btn w-full btn-primary"
                @click=";[(page = 1), (isPageBtnsDisabled = false), getProductReviews()]"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </template>

<style scoped></style>
