<script setup lang="ts">
import { useNotification } from '@kyvg/vue3-notification'

const isPageBtnsDisabled = ref(false)
const limit = ref(50)
const page = ref(1)
const feedbacksCount = ref(0)
const maxPage = computed(() => Math.ceil(feedbacksCount.value / limit.value))
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Добавить лайки',
})
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
  const { data, error }: any = await useFetch(
    '/api/wildberries/likes/productReviews',
    {
      method: 'GET',
      headers: useRequestHeaders(['cookie']) as HeadersInit,
      query: {
        article: savedArticle.value,
        limit: limit.value * page.value,
        page: page.value,
        sortBy: sortBy.value ?? 'date',
      },
    }
  )
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
  modalShow.value = false
  sortReviews()
}

async function increaseReviews() {
  limit.value += 50
  const { data, error }: any = await useFetch(
    '/api/wildberries/likes/productReviews',
    {
      method: 'GET',
      headers: useRequestHeaders(['cookie']) as HeadersInit,
      query: {
        article: savedArticle.value,
        limit: limit.value,
        sortBy: sortBy.value ?? 'date',
      },
    }
  )
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
  // const userOffsetMinutes = new Date().getTimezoneOffset()
  // const userTimezoneOffsetHours = -userOffsetMinutes / 60
  // const userTimezoneOffsetMinutesRemainder = -userOffsetMinutes % 60
  const { data, error } = await useFetch('/api/wildberries/likes/create', {
    method: 'POST',
    body: {
      article: savedArticle.value,
      reviews: changedReviews.value,
      period: period.value,
    },
    // query: {
    //   userTimezoneOffsetHours,
    //   userOffsetMinutes: userTimezoneOffsetMinutesRemainder,
    // },
  })
  if (error.value) {
    notify({
      type: 'error',
      title: 'Ошибка',
      text: error.value.message,
    })
    isCreateButtonDisabled.value = false
    return
  }
  if (data.value) {
    notify({
      type: 'success',
      title: 'Успешно',
    })
    return router.push('/likes')
    isCreateButtonDisabled.value = false
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

async function swapPage(value: number) {
  if (value === -1 && page.value <= 1) {
    return
  }

  if (value === 1 && page.value >= maxPage.value) {
    notify({
      type: 'error',
      text: 'Последняя страница',
    })
    return
  }
  isPageBtnsDisabled.value = true
  page.value += value
  await getProductReviews()
  isPageBtnsDisabled.value = false
}

const modalShow = ref<boolean>(true)
const closeModal = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains('modalCustom')) {
    modalShow.value = false
  }
}
function selectPeriod(event: any) {
  period.value = event.target.value
}

function handleArticleChanged(
  periodChanged: any,
  reviewsChanged: any,
  feedbacksCountChanged: any,
  articleChanged: any
) {
  modalShow.value = false
  savedArticle.value = articleChanged
  period.value = periodChanged
  feedbacksCount.value = feedbacksCountChanged
  reviews.value = reviewsChanged
  sortReviews()
}
</script>

<template>
  <div>
    <!-- <h1 class="text-2xl font-bold mt-4">Добавить лайки</h1> -->
    <p class="font-light text-gray-500 mt-4 lg:text-sm">
      В целях безопасности все отзывы, на которых более 30 лайков или дизлайков,
      не выводятся в списке.
    </p>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Укажите необходимое количество лайков/дизлайков к каждому отзыву.
    </p>

    <!-- <div class="relative flex justify-between mb-4 mt-6 items-center">
      <select class="select select-bordered select-sm" @change="selectSorting">
        <option value="date" :selected="route.query.sortBy === 'date'">
          По дате
        </option>
        <option value="rating" :selected="route.query.sortBy === 'rating'">
          По рейтингу
        </option>
        <option value="rank" :selected="route.query.sortBy === 'rank'">
          По полезности
        </option>
      </select>

      <div>
        <div class="relative flex justify-end items-center flex-grow-0 w-60">
          <input
            v-model="article"
            type="number"
            placeholder="Артикул"
            class="input input-sm w-full bg-base-300 bg-opacity-40 text-gray-500"
            @keydown.enter="getProductReviews"
          />
          <button
            class="btn btn-ghost btn-sm absolute normal-case"
            @click="
              ;[(page = 1), (isPageBtnsDisabled = false), getProductReviews()]
            "
          >
            Найти
          </button>
        </div>
      </div>
    </div> -->
    <div class="flex justify-between my-2">
      <div></div>
      <!-- <div class="join" v-if="feedbacksCount">
        <button
          class="join-item btn btn-sm px-1"
          @click="swapPage(-1)"
          :disabled="isPageBtnsDisabled"
        >
          <Icon name="formkit:left" class="rounded-full  my-auto cursor-pointer hover:bg-opacity-50" size="22" />
        </button>
        <button class="join-item btn btn-sm hover:bg-base-200 border-none cursor-default">{{ page }}</button>
        <button
          class="join-item btn btn-sm px-1"
          @click="swapPage(1)"
          :disabled="isPageBtnsDisabled"
        >
        <Icon name="formkit:right" class="rounded-full  my-auto cursor-pointer hover:bg-opacity-50" size="22" />
        </button>
      </div> -->
    </div>
    <!-- <Transition name="fade">
     
      <div
        v-show="changedReviews.length"
        class="save rounded-lg lg:sticky py-4 px-8 z-[9999] inset-x-0 top-0 bg-neutral-focus flex flex-wrap items-center justify-between gap-2 mb-2"
      >
        <div class="info flex flex-col lg:flex-row items-center gap-4">
          <p class="text-xs font-bold text-neutral-content lg:text-sm">
            Всего отзывов: {{ changedReviews.length }}
          </p>
          <p class="text-xs text-neutral-content lg:text-sm font-bold">
            Лайков: {{ getAddedLikes().likes }}
          </p>
          <p class="text-xs text-neutral-content lg:text-sm font-bold">
            Дизлайков: {{ getAddedLikes().dislikes }}
          </p>

          <p
            class="text-xs text-neutral-content lg:text-sm font-bold hidden md:block"
          >
            Сроки выполнения:
          </p>
          <BuyoutDateRangePicker
            v-model="productDateRangeModel"
            class="w-32 hidden md:block"
            :start-date="startDate"
          />
        </div>
        <div class="save ml-auto flex flex-col lg:flex-row gap-2">
          <p
            class="text-xs text-neutral-content lg:text-sm font-bold block md:hidden"
          >
            Сроки выполнения:
          </p>
          <BuyoutDateRangePicker
            v-model="productDateRangeModel"
            class="w-32 block md:hidden"
            :start-date="startDate"
          />
          <button
            class="btn btn-ghost text-neutral-content btn-sm"
            @click="cancel"
          >
            Отмена
          </button>
          <button class="btn btn-primary btn-sm" @click="save">
            Сохранить
          </button>
        </div>
      </div>
    </Transition> -->
    <div
      v-if="changedReviews.length"
      class="fixed bottom-20 right-1 md:bottom-30 lg:right-5 z-[9999] w-60 sm:w-70 p-4 bg-base-100 rounded-lg border border-base-300 text-2xl"
    >
      <div class="flex gap-0.5">
        <IconCSS class="text-primary mr-1" name="mdi:bar-chart" size="22" />
        <span class="text-lg mr-auto">Статистика оценок</span>
      </div>
      <div class="info flex flex-col gap-1 mt-2">
        <!-- <div class="flex justify-between">
            <p class="text-xs font-bold text-base-content lg:text-sm">
            Всего отзывов: 
            </p>
            <span class="text-xs font-bold text-base-content lg:text-sm">{{ changedReviews.length }}</span>
          </div> -->
        <div class="flex gap-5 justify-around mb-1">
          <div class="flex gap-5">
            <p
              class="text-xs text-base-content lg:text-sm font-bold bg-primary bg-opacity-20 rounded-full px-3 py-1"
            >
              Да
            </p>
            <span
              class="text-xs text-base-content lg:text-sm font-bold my-auto"
              >{{ getAddedLikes().likes }}</span
            >
          </div>

          <div class="flex gap-5">
            <p
              class="text-xs text-base-content lg:text-sm font-bold bg-primary bg-opacity-20 rounded-full px-3 py-1"
            >
              Нет
            </p>
            <span
              class="text-xs text-base-content lg:text-sm font-bold my-auto"
              >{{ getAddedLikes().dislikes }}</span
            >
          </div>
        </div>
        <!-- <div class="flex gap-0.5 flex-col justify-between">
            <p
            class="text-xs text-base-content lg:text-sm font-bold my-auto"
          >
            Сроки выполнения:
          </p>
          <BuyoutDateRangePicker
            v-model="productDateRangeModel"
            class="w-full"
            :start-date="startDate"
          />
          </div> -->
      </div>
      <div class="save ml-auto flex gap-2 mt-1">
        <!-- <button
            class="btn btn-ghost text-base-content btn-sm"
            @click="cancel"
          >
            Отмена
          </button> -->
        <button
          class="btn btn-primary text-base-content bg-opacity-50 border-none btn-sm w-[100%] sm:w-[100%] rounded-full"
          @click="save"
          :disabled="isCreateButtonDisabled"
        >
          Создать лайки
          <Icon class="justify-end" name="formkit:right" size="20" />
        </button>
      </div>
    </div>
    <div
      v-if="reviews.length"
      class="cards grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-5 gap-4 mb-12"
    >
      <LikesReviewCard
        v-for="(review, index) of reviews"
        :key="review.id"
        :index="index"
        :add-likes="review.addLikes"
        :add-dislikes="review.addDislikes"
        :info="review"
        :article="savedArticle"
        @add-like="addLike"
        @remove-dislike="removeDislike"
        @add-dislike="addDislike"
        @remove-like="removeLike"
      />
      <!-- <div class="p-2 w-full col-span-1" />
      <div>
        <div class="flex justify-between mt-2 mb-10">
          <div></div>
          <div class="join mr-2" v-if="feedbacksCount">
            <button
              class="join-item btn"
              @click="swapPage(-1)"
              :disabled="isPageBtnsDisabled"
            >
              «
            </button>
            <button class="join-item btn">{{ page }}</button>
            <button
              class="join-item btn"
              @click="swapPage(1)"
              :disabled="isPageBtnsDisabled"
            >
              »
            </button>
          </div>
        </div>
      </div> -->
    </div>
    <LikesWildberriesCreateLike
      :show="modalShow"
      @close-modal="handleArticleChanged"
    />
  </div>
</template>

<style scoped></style>
