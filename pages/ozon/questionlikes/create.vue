<script setup lang="ts">
import { useNotification } from '@kyvg/vue3-notification'

// const isPageBtnsDisabled = ref(false)
const limit = ref(50)
const page = ref(1)
const feedbacksCount = ref(0)
// const maxPage = computed(() => Math.ceil(feedbacksCount.value / limit.value))
definePageMeta({
  layout: 'app',
  middleware: 'auth',
  title: 'Добавить лайки',
})
const { notify } = useNotification()
const changedReviews = ref<any>([])
const changedComments = ref<any>([])
const isCreateButtonDisabled = ref(false)

const modalShow = ref<boolean>(true)
const route = useRoute()
const router = useRouter()
const reviews = ref<any>([])
const article = ref('')
const savedArticle = ref('')
const loading = ref(false)
const selectSortBy = ref('')
const sortBy = computed(() => route.query?.sortBy || 'date')
const period = ref('3h')

async function getProductReviews() {
  reviews.value = []
  loading.value = true
  changedReviews.value = []
  savedArticle.value = article.value
  const { data, error }: any = await useFetch(
    '/api/ozon/questionlikes/productReviews',
    {
      method: 'GET',
      headers: useRequestHeaders(['cookie']) as HeadersInit,
      query: {
        article: savedArticle.value,
        limit: limit.value * page.value,
        page: page.value,
        sortBy: sortBy.value ?? 'date',
      },
      watch: false,
    },
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

// async function increaseReviews() {
//   limit.value += 50
//   const { data, error }: any = await useFetch(
//     '/api/ozon/questionlikes/productReviews',
//     {
//       method: 'GET',
//       headers: useRequestHeaders(['cookie']) as HeadersInit,
//       query: {
//         article: savedArticle.value,
//         limit: limit.value,
//         sortBy: sortBy.value ?? 'date',
//       },
//       watch: false,
//     },
//   )
//   if (error.value) {
//     notify({
//       title: 'Что-то пошло не так',
//       text: error.value.data.message,
//       type: 'error',
//     })
//     return
//   }
//   if (!data.value.length) {
//     notify({
//       title: 'Отзывы не найдены',
//     })
//   }
//   const initial = (data.value as any).map((review: any) => {
//     review.addLikes = 0
//     review.addDislikes = 0
//     return review
//   }) as any[]
//   reviews.value.push(...initial)
//   sortReviews()
// }

function addLike(id: string) {
  reviews.value.map((review: any) => {
    if (review.id === id)
      review.addLikes++
    return review
  })
  changedReviews.value.find((review: any) => review.id === id)
    ? (changedReviews.value = changedReviews.value.map((review: any) => {
        if (review.id === id)
          review.likes++

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
    if (review.id === id)
      review.addLikes--
    return review
  })
  const review = changedReviews.value.find((review: any) => review.id === id)
  if (review) {
    if (review.likes > 1) {
      changedReviews.value = changedReviews.value.map((review: any) => {
        if (review.id === id)
          review.likes--

        return review
      })
    }
    else {
      if (review.likes === 1 && review.dislikes === 0) {
        changedReviews.value = changedReviews.value.filter(
          (review: any) => review.id !== id,
        )
      }
      else {
        changedReviews.value = changedReviews.value.map((review: any) => {
          if (review.id === id)
            review.likes--

          return review
        })
      }
    }
  }
}
function addDislike(id: string) {
  reviews.value.map((review: any) => {
    if (review.id === id)
      review.addDislikes++
    return review
  })
  changedReviews.value.find((review: any) => review.id === id)
    ? (changedReviews.value = changedReviews.value.map((review: any) => {
        if (review.id === id)
          review.dislikes++

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
    if (review.id === id)
      review.addDislikes--
    return review
  })
  const review = changedReviews.value.find((review: any) => review.id === id)
  if (review) {
    if (review.dislikes > 1) {
      changedReviews.value = changedReviews.value.map((review: any) => {
        if (review.id === id)
          review.dislikes--
        return review
      })
    }
    else {
      if (review.likes === 0 && review.dislikes === 1) {
        changedReviews.value = changedReviews.value.filter(
          (review: any) => review.id !== id,
        )
      }
      else {
        changedReviews.value = changedReviews.value.map((review: any) => {
          if (review.id === id)
            review.dislikes--
          return review
        })
      }
    }
  }
}
// async function selectSorting(e: any) {
//   page.value = 1

//   selectSortBy.value = e.target.value
//   router.push({
//     query: {
//       sortBy: e.target.value,
//     },
//   })
//   await getProductReviews()
// }
async function save() {
  isCreateButtonDisabled.value = true
  // const userOffsetMinutes = new Date().getTimezoneOffset()
  // const userTimezoneOffsetHours = -userOffsetMinutes / 60
  // const userTimezoneOffsetMinutesRemainder = -userOffsetMinutes % 60
  const { data, error } = await useFetch('/api/ozon/questionlikes/create', {
    method: 'POST',
    body: {
      article: savedArticle.value,
      reviews: changedReviews.value,
      comments: changedComments.value,
      period: period.value,
    },
    watch: false,
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

    return router.push('/questionlikes')
    isCreateButtonDisabled.value = false
  }
}

// async function cancel() {
//   changedReviews.value = []
//   article.value = savedArticle.value
//   getProductReviews()
// }
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
    },
  )
  return addedLikes
}
function sortReviews() {
  const val = sortBy.value
  if (val === 'date') {
    reviews.value = reviews.value.sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }
  else if (val === 'rating') {
    reviews.value = reviews.value.sort((a: any, b: any) => {
      if (b.rating > a.rating)
        return 1
      else if (b.rating < a.rating)
        return -1
      else return 0
    })
  }
  else if (val === 'rank') {
    reviews.value = reviews.value.sort((a: any, b: any) => b.rank - a.rank)
  }
}
watch(
  () => sortBy.value,
  () => {
    selectSortBy.value = sortBy.value.toString()
    sortReviews()
  },
  { deep: true, immediate: true },
)

// async function swapPage(value: number) {
//   if (value === -1 && page.value <= 1) {
//     return
//   }

//   if (value === 1 && page.value >= maxPage.value) {
//     notify({
//       type: 'error',
//       text: 'Последняя страница',
//     })
//     return
//   }
//   isPageBtnsDisabled.value = true
//   page.value += value
//   await getProductReviews()
//   isPageBtnsDisabled.value = false
// }

function handleArticleChanged(
  periodChanged: any,
  reviewsChanged: any,
  feedbacksCountChanged: any,
  articleChanged: any,
) {
  modalShow.value = false
  savedArticle.value = articleChanged
  period.value = periodChanged
  feedbacksCount.value = feedbacksCountChanged
  reviews.value = reviewsChanged
  sortReviews()
}

function changeCommentLikes(
  reviewId: string,
  commentId: string,
  add: boolean,
  type: string,
) {
  const adding = add ? 1 : -1

  const isChangedCommentsIncludes = changedComments.value.findIndex(
    // eslint-disable-next-line eqeqeq
    (comment: any) => comment.id == commentId,
  )

  if (isChangedCommentsIncludes < 0) {
    if (type === 'likes') {
      changedComments.value.push({
        id: commentId,
        likes: 1,
        dislikes: 0,
      })
    }
    else {
      changedComments.value.push({
        id: commentId,
        likes: 0,
        dislikes: 1,
      })
    }
  }
  else {
    if (type === 'likes') {
      changedComments.value[isChangedCommentsIncludes].likes
        = changedComments.value[isChangedCommentsIncludes].likes + 1 * adding
    }
    else {
      changedComments.value[isChangedCommentsIncludes].dislikes
        = changedComments.value[isChangedCommentsIncludes].dislikes + 1 * adding
    }

    if (
      changedComments.value[isChangedCommentsIncludes].likes <= 0
      && changedComments.value[isChangedCommentsIncludes].dislikes <= 0
    ) {
      changedComments.value.splice(isChangedCommentsIncludes, 1)
    }
  }
}

function getAddedCommentsLikes() {
  const likes = {
    likes: 0,
    dislikes: 0,
    count: 0,
  }
  changedComments.value.forEach((comment: any) => {
    likes.likes += comment.likes
    likes.dislikes += comment.dislikes
  })
  likes.count = likes.likes + likes.dislikes
  return likes
}

const changedCommentsLikes = computed(() => getAddedCommentsLikes())
</script>

<template>
  <div class="px-4 sm:px-16">
    <!-- <h1 class="text-2xl font-bold mt-4">Добавить лайки</h1> -->
    <p class="font-light text-gray-500 mt-4 lg:text-sm">
      В целях безопасности все вопросы, на которых более 30 лайков или дизлайков,
      не выводятся в списке.
    </p>
    <p class="text-xs text-gray-500 font-light mt-1 lg:text-sm">
      Укажите необходимое количество лайков/дизлайков к каждому отзыву.
    </p>
    <!-- <div class="flex justify-between my-2">
      <div></div>
      <div class="join" v-if="feedbacksCount">
        <button
          class="join-item btn btn-sm px-1"
          @click="swapPage(-1)"
          :disabled="isPageBtnsDisabled"
        >
          <Icon
            name="formkit:left"
            class="rounded-full my-auto cursor-pointer hover:bg-opacity-50"
            size="22"
          />
        </button>
        <button
          class="join-item btn btn-sm hover:bg-base-200 border-none cursor-default"
        >
          {{ page }}
        </button>
        <button
          class="join-item btn btn-sm px-1"
          @click="swapPage(1)"
          :disabled="isPageBtnsDisabled"
        >
          <Icon
            name="formkit:right"
            class="rounded-full my-auto cursor-pointer hover:bg-opacity-50"
            size="22"
          />
        </button>
      </div>
    </div> -->

    <div
      v-if="changedReviews.length || changedComments.length"
      class="fixed bottom-20 right-1 md:bottom-30 lg:right-5 z-[9999] w-60 sm:w-70 p-4 bg-base-100 rounded-lg border border-base-300 text-2xl"
    >
      <div class="flex gap-0.5">
        <IconCSS class="text-primary mr-1" name="mdi:bar-chart" size="22" />
        <span class="text-lg mr-auto">Статистика оценок</span>
      </div>
      <div class="info flex flex-col gap-1 mt-2">
        <div class="flex gap-5 justify-around mb-1">
          <div class="flex gap-5">
            <p
              class="text-xs text-base-content lg:text-sm font-bold bg-primary bg-opacity-20 rounded-full px-3 py-1"
            >
              Да
            </p>
            <span
              class="text-xs text-base-content lg:text-sm font-bold my-auto"
            >{{ getAddedLikes().likes + changedCommentsLikes.likes }}</span>
          </div>

          <div class="flex gap-5">
            <p
              class="text-xs text-base-content lg:text-sm font-bold bg-primary bg-opacity-20 rounded-full px-3 py-1"
            >
              Нет
            </p>
            <span
              class="text-xs text-base-content lg:text-sm font-bold my-auto"
            >{{
              getAddedLikes().dislikes + changedCommentsLikes.dislikes
            }}</span>
          </div>
        </div>
      </div>
      <div class="save ml-auto flex gap-2 mt-1">
        <button
          class="btn btn-primary text-base-content bg-opacity-50 border-none btn-sm w-[100%] sm:w-[100%] rounded-full"
          :disabled="isCreateButtonDisabled"
          @click="save"
        >
          Создать лайки
          <Icon class="justify-end" name="formkit:right" size="20" />
        </button>
      </div>
    </div>
    <div
      v-if="reviews.length"
      class="cards grid grid-cols-1 xl:px-3 mt-5 gap-4 mb-12"
    >
      <QuestionLikesOzonReviewCard
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
        @change-comment-likes="changeCommentLikes"
      />
    </div>
    <QuestionLikesOzonCreateLike
      :show="modalShow"
      @close-modal="handleArticleChanged"
    />
  </div>
</template>

<style scoped></style>
