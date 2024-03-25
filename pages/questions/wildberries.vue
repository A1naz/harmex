<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Вопросы',
})
const store = useMainStore()
const mpStore = useMPStore()
const selectedMP = ref(mpStore.selectedMP || 'wildberries')
const questions = ref([]) as any
const amount = ref(0)
const now = useNow()
const publishDate = ref(now.value)
const loadingUrl = ref(false)
const questionText = ref('')
const article = ref('')
const sex = ref('male')
const { width, height } = useWindowSize()
const productData = ref<any>(null)
const urlError = ref(false)
const modalShow = ref<boolean>(false)
const route = useRoute()
const router = useRouter()
const MPTabs = [
  { title: 'Wildberries', value: 'wildberries' },
  { title: 'Ozon', value: 'ozon' },
]

async function getQuestions() {
  modalShow.value = false
  const { data, error } = await useFetch('/api/wildberries/questions/get', {
    method: 'GET',
  })
  if (data.value) questions.value = data.value
  if (error.value)
    notify({
      type: 'error',
      title: 'Не удалось получить лайки',
      text: error.value.message,
    })
}
await getQuestions()
async function create() {
  const { data, error } = await useFetch('/api/wildberries/questions/create', {
    method: 'POST',
    body: {
      article: article.value,
      publishDate: publishDate.value,
      gender: sex.value,
      productData: productData.value,
      questionText: questionText.value,
    },
  })
  if (error.value)
    return notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: error.value.message,
    })
  if (data.value) {
    notify({ type: 'success', title: 'Упешно' })
    removeProduct()
    publishDate.value = now.value
    getQuestions()
  }
}
async function getProductInfo() {
  if (!article.value) return

  const { data, error } = await useFetch(
    `/api/wildberries/product/${article.value}`,
    {
      method: 'GET',
    }
  )
  if ((data.value as any)?.product) {
    productData.value = (data.value as any).product
    urlError.value = false
  }
  if (error.value) urlError.value = true

  loadingUrl.value = false
}
let timeout = null as NodeJS.Timeout | null
async function changeUrl() {
  if (article.value === '') return
  loadingUrl.value = true
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(getProductInfo, 2000)
}
function selectSex(event: any) {
  sex.value = event.target.value
}
function getStatus(status: string) {
  if (status === 'created') return 'Создан'
  else if (status === 'work') return 'В работе'
  else if (status === 'completed') return 'Завершен'
  else if (status === 'nofunds') return 'Недостаточно средств'
  else if (status === 'spam') {
    return 'Определен как спам'
  }
}
function removeProduct() {
  productData.value = null
  article.value = ''
  amount.value = 0
}
onMounted(() => {
  if (route.query.modalShow) {
    modalShow.value = route.query.modalShow === 'true'
    const query = { ...route.query }
    delete query.modalShow
    router.push({ query })
  }
})

const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'article',
})
const codeInput = ref()

async function selectFilterDate(e: any) {
  const target = e
  const { data } = await useFetch('/api/wildberries/questions/get', {
    method: 'GET',
    query: {
      dateFilter: target.value,
    },
    watch: false,
  })
  questions.value = data.value
}

async function findBuyouts(value: string, type: string) {
  if (!value) {
    search.loading = false
    await getQuestions()
    return
  }
  const { data, error } = await useFetch('/api/wildberries/questions/get', {
    query: {
      string: value,
      type,
    },
    watch: false,
  })
  if (data.value) questions.value = data.value

  search.loading = false
}

const findBuyoutsDebounced = useDebounceFn(findBuyouts, 1000)

async function onSearchInput(event: Event) {
  const newValue = (event.target as HTMLInputElement).value
  search.loading = true
  findBuyoutsDebounced(search.text, search.type)
}

const updateSearchType = (filter: any) => {
  search.type = filter.value
}

function changeFilter(e: any) {
  mpStore.selectedMP = e.value
  return navigateTo('/questions/' + e.value)
}
</script>

<template>
  <div>
    <!-- <h1 class="text-2xl font-bold mt-4">
      Вопросы
    </h1> -->
    <!-- <p class="text-xs font-light mt-4 lg:text-sm">
      Выберите товар, чтобы добавить конкретные вопросы к нему
    </p>
    <p class="text-xs font-light mt-1 lg:text-sm">
      Стоимость одного вопроса -  
      <span class="font-bold"> {{ store.tariffString('questionProduct') }} </span>
      Все услуги оказываются по Московскому времени.
    </p> -->
    <QuestionsWildberriesCreateQuest
      :show="modalShow"
      @close-modal="modalShow = false"
      @create="getQuestions()"
    />
    <div class="flex mt-4 flex-col lg:flex-row lg:justify-between gap-2">
      <div class="flex gap-1 lg:gap-4">
        <button
          @click="navigateTo(`/questions/create/`)"
          class="btn btn-primary font-normal btn-sm"
        >
          <Icon name="fluent:add-24-filled" size="17" />
          <span class="hidden lg:flex">Вопрос</span>
        </button>
        <CustomSelect
          class="hidden lg:flex"
          :class="'sm:min-w-[120px]'"
          :tabs="MPTabs"
          @change-value="changeFilter"
        />
        <CustomSelect
          class="hidden lg:flex"
          :class="'sm:min-w-[120px]'"
          :tabs="[
            { title: 'Все вопросы', value: 'all' },
            { title: 'Активные', value: 'created' },
            { title: 'Завершенные', value: 'completed' },
          ]"
          @change-value="selectFilterDate"
        />

        <div class="relative justify-end flex-grow-0 w-full lg:hidden">
          <input
            type="text"
            class="input input-sm w-full bg-base-300 bg-opacity-40 text-gray-500"
            placeholder="Поиск"
            ref="codeInput"
            v-model="search.text"
            @input="onSearchInput($event)"
          />
          <span
            v-if="search.loading"
            class="absolute right-2 top-2 loading loading-spinner loading-xs p-2"
          />
          <Icon
            v-else
            class="absolute right-0.5 p-2 my-auto text-gray-500"
            name="tabler:search"
            size="35"
            @click="codeInput.focus()"
          />
        </div>
      </div>
      <div class="flex gap-2 lg:gap-5">
        <CustomSelect
          class="lg:hidden"
          :class="'sm:min-w-[120px]'"
          :tabs="MPTabs"
          @change-value="changeFilter"
        />
        <CustomSelect
          class="lg:hidden"
          :class="'sm:min-w-[120px]'"
          :tabs="[
            { title: 'Все вопросы', value: 'all' },
            { title: 'Активные', value: 'created' },
            { title: 'Завершенные', value: 'completed' },
          ]"
          @change-value="selectFilterDate"
        />

        <CustomSelect
          :class="'bg-base-300 sm:min-w-[120px]'"
          :tabs="[
            { title: 'За все время', value: 'all' },
            { title: 'Сегодня', value: 'today' },
            { title: '3 дня', value: '3days' },
            { title: 'Неделя', value: '7days' },
          ]"
          @change-value="selectFilterDate"
        />

        <CustomSelect
          :class="'bg-base-300'"
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
          />
          <span
            v-if="search.loading"
            class="absolute right-2 loading loading-spinner loading-xs p-2 mt-2"
          />
          <Icon
            v-else
            class="absolute right-0.5 p-2 my-auto text-gray-500"
            name="tabler:search"
            size="35"
            @click="codeInput.focus()"
          />
        </div>
      </div>
    </div>
    <!-- <div class="collapse collapse-plus bg-base-100 rounded-box mb-4 mt-6">
      <input type="checkbox" >

      <div class="collapse-title text-xl font-medium">
        Добавить вопрос
      </div>
      <div class="collapse-content">
        
      </div>
    </div> -->

    <div v-if="questions.length" class="mt-4 rounded-lg">
      <ClientOnly>
        <table class="table table-sm">
          <thead>
            <tr class="bg-primary bg-opacity-5">
              <!-- <th class="text-center">№</th> -->
              <th class="text-center">Фото</th>
              <th class="text-center">Артикул</th>
              <th class="text-center">Маркетплейс</th>
              <th class="text-center">Пол</th>
              <th class="text-center">Вопрос</th>
              <th class="text-center">Статус</th>
              <th class="text-center">Дата создания</th>
              <th class="text-center">Дата публикации</th>
            </tr>
          </thead>
          <tbody class="rounded-b-lg">
            <tr
              class="bg-base-100 border-b-0 rounded-b-lg"
              v-for="(item, index) in questions"
              :key="index"
            >
              <!-- <td class="text-center border-x border-primary border-opacity-5">{{ item.place }}</td> -->
              <td
                class="text-center border-r border-primary border-opacity-5 mx-auto"
              >
                <div
                  style="width: 28px; height: 36px; border-radius: 4px"
                  class="mx-auto"
                >
                  <div class="dropdown dropdown-hover">
                    <label tabindex="0">
                      <nuxt-img
                        class="rounded-lg z-0"
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
                        class="rounded-lg z-[9999]"
                        loading="lazy"
                        fit="fill"
                        :src="item.image"
                      />
                    </ul>
                  </div>
                </div>
              </td>
              <td
                class="text-center border-r border-primary border-opacity-5 text-base-content truncate"
              >
                <a
                  :href="`https://www.wildberries.ru/catalog/${item.article}/detail.aspx`"
                  target="_blank"
                  class="text-primary link link-hover text-sm"
                >
                  {{ item.article }}
                </a>
              </td>
              <td
                class="text-center border-r border-primary border-opacity-5 overflow-x-auto max-w-[250px] truncate"
              >
                Wildberries
              </td>
              <td
                class="text-center border-r border-primary border-opacity-5 overflow-x-auto max-w-[250px] truncate"
              >
                {{ item.gender === 'male' ? 'М' : 'Ж' }}
              </td>
              <td
                class="text-center border-r border-primary border-opacity-5 overflow-x-auto max-w-[250px] whitespace-normal break-words"
              >
                <div class="flex flex-col">
                  {{ item.text }}
                </div>
              </td>

              <td class="text-center border-r border-primary border-opacity-5">
                <div
                  :class="{
                    'bg-error text-base-content rounded-full py-1 px-2  text-center':
                      item.status === 'nofunds',
                    'text-error rounded-full py-1 px-2  text-center':
                      item.status === 'spam',
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
              </td>
              <td class="text-center border-r border-primary border-opacity-5">
                <div
                  class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
                >
                  {{ defaultDateShort(item.createdDate) }}
                </div>
              </td>
              <td class="text-center border-opacity-5">
                <div
                  v-if="item.publishDate"
                  class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
                >
                  {{ defaultDateShort(item.publishDate) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- <div v-else class="cards grid grid-cols-1 gap-4 lg:hidden">
          <div v-for="(item, index) in questions" :key="index" class="card card-compact bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="flex gap-4">
                <div class="image">
                  <nuxt-img width="32" class="rounded-lg object-contain" :src="item.image" />
                </div>
                <div class="article flex flex-col gap-0.5">
                  <div class="text-xs">
                    Артикул
                  </div>
                  <a
                  :href="`https://www.wildberries.ru/catalog/${item.article}/detail.aspx`" target="_blank"
                    class="text-primary link link-hover text-sm"
                  >
                    {{ item.article }}
                  </a>
                </div>
                <div class="status flex flex-col gap-0.5">
                  <div class="text-xs">
                    Статус
                  </div>
                  <div
                    class="text-sm"
                    :class="{
                  'bg-error text-base-content rounded-full py-1 px-2  text-center':
                    item.status === 'nofunds',
                  'text-error rounded-full py-1 px-2  text-center':
                  item.status === 'spam',
                  'bg-primary bg-opacity-20 text-base-content rounded-full py-1 px-2  text-center':
                    item.status === 'created',
                  'bg-success text-base-content rounded-full py-0.5 px-1.5 text-center':
                    item.status === 'work',
                  'bg-success text-base-content rounded-full py-0.5 px-2 text-center':
                    item.status === 'completed',
                }"
                  >
                    <div>
                      {{ getStatus(item.status) }}
                    </div>
                  </div>
                </div>
                <div class="date ml-auto text-xs text-end">
                  {{ defaultDate(item.createdDate) }}
                </div>
              </div>

              <div class="flex">
                <div class="article flex flex-col gap-0.5">
                  <p class="p-2 bg-base-200 mt-2 rounded-lg max-h-20 overflow-auto">
                    {{ item.text }}
                  </p>
                </div>
              </div>
              <div class="card-actions justify-start mt-2">
                <div>Дата публикации:</div>
                <div>
                  {{ defaultDate(item.publishDate) }}
                </div>
              </div>
            </div>
          </div>
        </div> -->
      </ClientOnly>
    </div>
    <Hero v-else />
  </div>
</template>

<style scoped></style>
