<script setup lang="ts">
import { notify, useNotification } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Лайки на отзывы',
})
const store = useMainStore()
const mpStore = useMPStore()
const mpChange = useMPChange()
const router = useRouter()
const review_likes = ref<any>([])
const sortPage = ref('all')
const sortPageDate = ref('')
const MPSelect = ref()
const loading = ref(true)
const logModal = ref(false)
const selectedLike = ref({
  uuid: '',
})
const selectedMP = ref<any>(
  mpStore.selectedMP.charAt(0).toUpperCase() + mpStore.selectedMP.slice(1)
  || 'Wildberries',
)
const { width, height } = useWindowSize()
// const { data, error } = await useFetch(`/api/${selectedMP.value}/likes/get`)
// review_likes.value = data.value

const limit = ref(50)
const skip = ref(0)
const end = ref(false)
const target = ref(null)
const targetIsVisible = ref(false)
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }], observerElement) => {
    targetIsVisible.value = isIntersecting
  },
)
watch(targetIsVisible, async (isVisible) => {
  if (!end.value && isVisible && review_likes.value.length >= limit.value) {
    await getLikes()
  }
})
onMounted(() => {
  setText()
})
async function setText() {
  loading.value = true
  MPSelect.value?.updateText(mpStore.selectedMP || 'wildberries')
  setTimeout(() => getLikes(), 100)
}

const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'article',
})
const codeInput = ref()
// review_likes.value = data.value
function getStatus(status: string) {
  if (status === 'created')
    return 'Создан'
  else if (status === 'work')
    return 'В работе'
  else if (status === 'busy')
    return 'В работе'
  else if (status === 'completed')
    return 'Завершен'
  else if (status === 'nofunds')
    return 'Недостаточно средств'
  else if (status === 'deleting')
    return 'На удалении'
  else if (status === 'deleted')
    return 'Удален'
  else if (status === 'canceled')
    return 'Отменен'
}

async function resumeStatus(item: any) {
  const { data, error } = await useFetch(
    `/api/wildberries/likes/resume`,
    {
      method: 'POST',
      body: {
        item,
      },
      watch: false,
    },
  )
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
      text: 'Лайк на отзыв успешно возвращен в работу',
      duration: 3000,
    })
    selectFilterDate({ value: sortPage.value })
  }
}

const likesIsExist = computed(() => {
  const page = mpChange.pages.find(
    el => el.value === mpStore.selectedMP.toString(),
  )
  const likesReview = page?.likes?.find(el => el.value === 'likes')

  if (page && likesReview) {
    return page.value
  }
  else {
    const mpWithLikes = mpChange.pages.find(el =>
      el.likes?.some(like => like.value === 'likes'),
    )
    return mpWithLikes?.value
  }
})

function firstLetterUppercase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

async function getLikes() {
  const { data, error } = await useFetch(
    `/api/wildberries/likes/get`,
    {
      method: 'GET',
      query: {
        statusQuery: sortPage.value,
        dateFilter: sortPageDate.value,
        string: search.text,
        type: search.type,
        limit: limit.value,
        skip: skip.value,
      },
    },
  )
  if ((data.value as any)?.length === 0) {
    loading.value = false
    end.value = true
    return
  }
  if (data.value) {
    review_likes.value = [...review_likes.value, ...(data.value! as any)]
    loading.value = false
  }

  if (error.value) {
    notify({
      type: 'error',
      title: 'Не удалось получить лайки',
      text: error.value.message,
    })
  }
  skip.value += limit.value
  loading.value = false
}

const reviewRemoveModalClose: any = ref(null)
const idForRemove = ref('')
function openRemoveReviewModal(id: any) {
  idForRemove.value = id

  reviewRemoveModalClose.value?.click()
}

async function deleteLike() {
  const { data, error } = await useFetch('/api/likes/delete', {
    method: 'DELETE',
    body: {
      id: idForRemove.value,
    },
  })

  if (data.value) {
    getLikes()
  }
  else if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value.data?.message,
      type: 'error',
      duration: 3000,
    })
  }
}

async function selectFilterDate(e: any, date?: boolean) {
  if (date) {
    sortPageDate.value = e.value
  }
  else {
    sortPage.value = e.value
  }
  loading.value = true
  review_likes.value = []
  skip.value = 0
  end.value = false
  await getLikes()
}

async function findBuyouts(value: string, type: string) {
  review_likes.value = []
  skip.value = 0
  end.value = false
  if (!value) {
    search.loading = false
    await getLikes()
    return
  }
  loading.value = true
  await getLikes()

  search.loading = false
}

const findBuyoutsDebounced = useDebounceFn(findBuyouts, 1000)

async function onSearchInput(event: Event) {
  const newValue = (event.target as HTMLInputElement).value
  search.loading = true
  findBuyoutsDebounced(search.text, search.type)
}
function updateSearchType(filter: any) {
  search.type = filter.value
}

async function selectMP(value: any) {
  review_likes.value = []
  skip.value = 0
  end.value = false
  mpStore.changeMp(value.value, 'likes')
  selectedMP.value = mpStore.selectedMP
  getLikes()
}
const links = computed(() => {
  const links = ref([
    { title: 'Товар/бренд', slot: '/productlikes', query: '' },
  ])
  if (mpStore.selectedMP !== 'avito') {
    links.value.push({ title: 'Отзывы', slot: '/likes', query: '' })
  }
  if (mpStore.selectedMP === 'ozon') {
    links.value.push({ title: 'Вопрос', slot: '/questionlikes', query: '' })
  }
  return links.value
})
</script>

<template>
  <div>
    <div class="flex mt-4 flex-col lg:flex-row lg:justify-between gap-2 mb-4">
      <div class="flex gap-1 navbar:gap-2 lg:gap-3">
        <NuxtLink
          v-if="store.client.username == 'test'"
          to="/likes/create"
          class="btn btn-primary dark:bg-primary bg-[#6675ff] border-none font-normal btn-sm"
        >
          <Icon name="fluent:add-24-filled" size="24" />
          <span class="hidden lg:flex">Лайки</span>
        </NuxtLink>
        <CustomSelect
          v-if="width < 1024"
          class="lg:hidden -mr-2"

          status-text="Отзывы"
          :links="mpStore.sortLikes(mpStore.selectedMP.toString())"
        />
        <CustomSelect
          ref="MPSelect"
          class="hidden lg:flex min-w-[105px]"

          :status-text="firstLetterUppercase(likesIsExist)"
          :tabs="store.client.username == 'test' ? mpChange.pages.filter((e: any) => Array.isArray(e.likes) && e.likes.length > 0) : mpChange.pages.filter((e: any) => !e.test && Array.isArray(e.likes) && e.likes.length > 0)"
          @change-value="selectMP"
        />

        <CustomSelect
          class="hidden lg:flex min-w-[95px] navbar:min-w-[20px]"

          status-text="Отзывы"
          :links="mpStore.sortLikes(mpStore.selectedMP.toString())"
        />

        <CustomSelect
          class="hidden lg:flex min-w-[100px] navbar:min-w-[20px]"

          :tabs="[
            { title: 'Все лайки', value: 'all' },
            { title: 'Активные', value: 'work' },
            { title: 'Завершенные', value: 'completed' },
            { title: 'Недостаточно средств', value: 'nofunds' },
            { title: 'В архиве', value: 'archived' },
          ]"
          @change-value="selectFilterDate"
        />

        <div class="relative justify-end flex-grow-0 w-full lg:hidden">
          <input
            ref="codeInput"
            v-model="search.text"
            type="text"
            class="input input-sm w-full bg-base-300 bg-opacity-40 text-gray-500"
            placeholder="Поиск"
            @input="onSearchInput($event)"
          >
          <span
            v-if="search.loading"
            class="absolute right-2 top-2 loading loading-spinner loading-xs p-2"
          />
          <Icon
            v-if="search.text == '' && !search.loading"
            class="absolute right-0.5 p-2 my-auto text-gray-500"
            name="tabler:search"
            size="35"
            @click="codeInput.focus()"
          />
        </div>
      </div>
      <div class="flex gap-1 lg:gap-3">
        <CustomSelect
          ref="MPSelect"
          class="lg:hidden min-w-[105px]"

          :status-text="firstLetterUppercase(likesIsExist || 'wildberries')"
          :tabs="store.client.username == 'test' ? mpChange.pages.filter((e: any) => Array.isArray(e.likes) && e.likes.length > 0) : mpChange.pages.filter((e: any) => !e.test && Array.isArray(e.likes) && e.likes.length > 0)"
          @change-value="selectMP"
        />
        <CustomSelect
          class="lg:hidden min-w-[95px]"

          :tabs="[
            { title: 'Все лайки', value: 'all' },
            { title: 'Активные', value: 'work' },
            { title: 'Завершенные', value: 'completed' },
            { title: 'Недостаточно средств', value: 'nofunds' },
          ]"
          @change-value="selectFilterDate"
        />

        <CustomSelect
          class="bg-[#f4f4f4] sm:min-w-[120px] navbar:min-w-[100px]"
          :tabs="[
            { title: 'За все время', value: 'all' },
            { title: 'Сегодня', value: 'today' },
            { title: '3 дня', value: '3days' },
            { title: 'Неделя', value: '7days' },
          ]"
          @change-value="selectFilterDate($event, true)"
        />

        <CustomSelect
          class="bg-[#f4f4f4]"
          :tabs="[{ title: 'Артикул', value: 'article' }]"
          @change-value="updateSearchType"
        />
        <div class="relative justify-end flex-grow-0 w-full hidden lg:flex">
          <input
            ref="codeInput"
            v-model="search.text"
            type="text"
            class="input input-sm w-full bg-base-300 bg-opacity-40 text-gray-500"
            placeholder="Поиск"
            @input="onSearchInput($event)"
          >
          <span
            v-if="search.loading"
            class="absolute right-2 loading loading-spinner loading-xs p-2 mt-2"
          />
          <Icon
            v-if="search.text == '' && !search.loading"
            class="absolute right-0.5 p-2 my-auto text-gray-500"
            name="tabler:search"
            size="35"
            @click="codeInput.focus()"
          />
        </div>
      </div>
    </div>
    <div
      v-if="store.client.username !== 'test'"
      class="text-red-500 ml-1 mt-1 mb-2"
    >
      Функционал временно недоступен
    </div>
    <div v-if="review_likes.length && !loading">
      <table class="table table-sm">
        <!-- head -->
        <thead>
          <tr class="bg-primary bg-opacity-5">
            <!-- <th class="text-center">№</th> -->
            <th class="text-center rounded-tl-2xl">
              Фото
            </th>
            <th class="text-center">
              Артикул
            </th>
            <th class="text-center">
              Количество
            </th>
            <th class="text-center">
              Статус
            </th>
            <th class="text-center">
              Дата создания
            </th>
            <th class="text-center">
              Дата завершения
            </th>
            <th class="text-center">
              Сроки выполнения
            </th>
            <th class="text-center rounded-tr-2xl">
              Инфо
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in review_likes"
            :key="index"
            class="bg-base-100 border-b-0"
          >
            <!-- <td class="text-center border-x border-primary border-opacity-5">{{ item.place }}</td> -->
            <td
              class="text-center border-r border-primary border-opacity-5 mx-auto"
              :class="{ 'rounded-bl-2xl': index === review_likes.length - 1 }"
            >
              <div
                :style="`width: ${
                  selectedMP === 'Ozon' ? '40px' : '28px'
                }; height: ${
                  selectedMP === 'Ozon' ? '40px' : '36px'
                }; border-radius: 4px;`"
                class="mx-auto"
              >
                <div class="dropdown dropdown-hover">
                  <label tabindex="0">
                    <nuxt-img
                      class="rounded-lg z-0 w-full"
                      alt=""
                      loading="lazy"
                      fit="fill"
                      :src="item.image"
                    />
                  </label>
                  <ul
                    tabindex="0"
                    class="dropdown-content mt-4 p-2 shadow bg-base-100 rounded-box w-52 z-[1]"
                  >
                    <nuxt-img
                      class="rounded-lg z-[1]"
                      loading="lazy"
                      fit="fill"
                      :src="item.image"
                    />
                  </ul>
                </div>
              </div>
            </td>
            <td
              class="text-center border-r border-primary border-opacity-5 text-primary"
            >
              <a
                :href="
                  mpStore.selectedMP === 'wildberries'
                    ? `https://www.wildberries.ru/catalog/${item.article}/detail.aspx`
                    : mpStore.selectedMP === 'avito'
                      ? `https://www.avito.ru/${item.article}`
                      : `https://www.ozon.ru/product/${item.article}`
                "
                target="_blank"
                class="text-primary link link-hover"
              >
                {{ item.article }}
              </a>
            </td>
            <td class="text-center border-r border-primary border-opacity-5">
              <div class="flex flex-col">
                <span>Да: {{ item.likes }}</span>
                <span>Нет: {{ item.dislikes }}</span>
              </div>
            </td>

            <td class="text-center border-r border-primary border-opacity-5">
              <div
                class="whitespace-nowrap"
                :class="{
                  'text-red-500 rounded-full py-1 px-2  text-center':
                    item.status === 'nofunds',
                  'bg-primary bg-opacity-20 text-base-content rounded-full py-1 px-2  text-center':
                    item.status === 'created',
                  'bg-success text-base-content rounded-full py-0.5 px-1.5 text-center':
                    item.status === 'work',
                  'bg-success text-base-content rounded-full py-0.5 px-2 text-center':
                    item.status === 'completed',
                }"
              >
                {{ getStatus(item.status) }}
              </div>
              <button
                v-if="item.status === 'nofunds'"
                class="btn btn-ghost btn-sm btn-square text-base-content hover:text-primary w-full rounded-full mt-1 border-[#6675ff] dark:border-primary dark:border-opacity-20"
                @click="resumeStatus(item)"
              >
                Возобновить
              </button>
            </td>
            <td class="text-center border-r border-primary border-opacity-5">
              <div
                class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
              >
                {{ $dayjs(item.createdDate).format('DD.MM.YYYY') }}
              </div>
            </td>
            <td class="text-center border-r border-primary border-opacity-5">
              <div
                v-if="item.endedDate"
                class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
              >
                {{ $dayjs(item.endedDate).format('DD.MM.YYYY') }}
              </div>
            </td>
            <td
              class="text-center whitespace-pre-wrap max-w-[300px] overflow-x-auto border-r border-primary border-opacity-5"
            >
              <div v-if="item.period">
                <div>{{ item.period }}</div>
              </div>
              <div v-else>
                Нет
              </div>
            </td>
            <td
              class="text-center whitespace-pre-wrap overflow-x-auto border-r border-primary border-opacity-5 w-[40px]"
              :class="{ 'rounded-br-2xl': index === review_likes.length - 1 }"
            >
              <div class="rounded-lg p-0.5 text-center">
                <button
                  class="btn btn-primary btn-sm btn-square mb-2"
                  @click=";[(selectedLike = item), (logModal = true)]"
                >
                  <svg
                    data-v-f136eeaa=""
                    data-v-a5d236d9=""
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    aria-hidden="true"
                    role="img"
                    class="icon"
                    width="20px"
                    height="20px"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      fill-rule="evenodd"
                      d="M4 7h8.17a3.001 3.001 0 0 1 5.66 0H20a1 1 0 1 1 0 2h-2.17a3.001 3.001 0 0 1-5.66 0H4a1 1 0 0 1 0-2m0 8h2.17a3.001 3.001 0 0 1 5.66 0H20a1 1 0 1 1 0 2h-8.17a3.001 3.001 0 0 1-5.66 0H4a1 1 0 1 1 0-2"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <div ref="target" class="flex justify-center items-center h-4" />
        </tbody>
      </table>
      <div ref="target" class="flex justify-center items-center h-4" />
    </div>

    <Hero v-else-if="!loading" />
    <div v-else class="w-full mt-5 flex justify-center items-center">
      <span class="loading loading-dots loading-lg text-primary" />
    </div>
    <input id="reviewRemoveModal" type="checkbox" class="modal-toggle">
    <div class="modal">
      <div class="modal-box max-w-xs">
        <h3 class="font-bold text-lg text-center">
          Вы уверены?
        </h3>
        <p class="py-2" />
        <div class="modal-action flex justify-between">
          <label
            ref="reviewRemoveModalClose"
            for="reviewRemoveModal"
            class="btn btn-primary"
          >Отмена</label>
          <label
            for="reviewRemoveModal"
            class="btn btn-error"
            @click="deleteLike"
          >Удалить</label>
        </div>
      </div>
    </div>
  </div>
  <LogModal :info="selectedLike" :state="logModal" @close="logModal = false" />
</template>

<style>
.p-datatable-wrapper {
  @apply overflow-visible !important;
}
</style>
