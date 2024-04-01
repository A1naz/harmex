<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Лайки на товар/бренд',
})
const store = useMainStore()
const mpStore = useMPStore()
const router = useRouter()
const route = useRoute()
const MPSelect = ref()
const selectedMP = ref(mpStore.selectedMP || 'wildberries')
const product_likes = ref([]) as any
const amount = ref(0)
const loadingUrl = ref(false)
const loading = ref(false)
const url = ref('')
const period = ref('3h')
const { width, height } = useWindowSize()
const productData = ref<any>(null)
const urlError = ref(false)
const modalShow = ref<boolean>(false)

const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'name',
})
const codeInput = ref()
async function getProductLikes() {
  modalShow.value = false
  loading.value = true
  const { data, error } = await useFetch('/api/ozon/productlikes/get', {
    method: 'GET',
  })
  if (data.value) product_likes.value = data.value
  //   if (data.value) {
  //     product_likes.value = data.value.map(product => {
  //         if (product.url) {
  //             const articleId = product.url.match(/\d+/);
  //             if (articleId) {
  //                 return { ...product, article: articleId[0] };
  //             }
  //         }
  //         return product;
  //     });
  // }
  if (error.value)
    notify({
      type: 'error',
      title: 'Не удалось получить лайки',
      text: error.value.message,
    })
  loading.value = false
}
await getProductLikes()
async function create() {
  const { data, error } = await useFetch('/api/ozon/productlikes/create', {
    method: 'POST',
    body: {
      url: url.value,
      amount: amount.value,
      period: period.value,
      productData: productData.value,
    },
  })
  if (error.value)
    return notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: error.value.message,
    })
  if (data.value) {
    notify({ type: 'success', title: 'Успешно' })
    getProductLikes()
  }
  modalShow.value = false
  removeProduct()
}
async function sendUrl() {
  const { data, error } = await useFetch('/api/ozon/productlikes/extract', {
    method: 'POST',
    body: {
      url: url.value,
    },
  })
  if (data.value) {
    productData.value = data.value
    urlError.value = false
  }
  if (error.value) urlError.value = true

  loadingUrl.value = false
}

let timeout = null as NodeJS.Timeout | null
async function changeUrl() {
  if (url.value === '') return
  loadingUrl.value = true
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(sendUrl, 2000)
}
function selectPeriod(event: any) {
  period.value = event.target.value
}
function getStatus(status: string) {
  if (status === 'created') return 'Создан'
  else if (status === 'work') return 'В работе'
  else if (status === 'completed') return 'Завершен'
  else if (status === 'nofunds') return 'Недостаточно средств'
  else if (status === 'canceled') return 'Отменен'
}
function removeProduct() {
  productData.value = null
  url.value = ''
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



const reviewRemoveModalClose: any = ref(null)
const idForRemove = ref('')
function openRemoveReviewModal(id: any, name: any) {
  idForRemove.value = id
  reviewRemoveModalClose.value?.click()
}

async function deleteLike() {
  const { data, error } = await useFetch('/api/ozon/productlikes/delete', {
    method: 'DELETE',
    body: {
      id: idForRemove.value,
    },
  })

  if (data.value) {
    getProductLikes()
  } else if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value.data?.message,
      type: 'error',
      duration: 3000,
    })
  }
}

const currentFilter = ref('')
const changePage = (filter: string) => {
  currentFilter.value = filter
}
const closeModal = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains('modalCustom')) {
    modalShow.value = false
    currentFilter.value = ''
  }
}

async function selectFilterDate(e: any) {
  loading.value = true
  const target = e
  const { data } = await useFetch('/api/ozon/productlikes/get', {
    method: 'GET',
    query: {
      dateFilter: target.value,
    },
    watch: false,
  })
  product_likes.value = data.value
  loading.value = false
}

async function changeFilter(e: any) {
  e.value === 'avito' ? router.push(`/productlikes/avito`) : mpStore.selectedMP = e.value
  if(e.value !== 'avito') router.push(`/productlikes`)
}

async function findBuyouts(value: string, type: string) {
  if (!value) {
    search.loading = false
    getProductLikes()
    return
  }
  const { data, error } = await useFetch('/api/ozon/productlikes/search', {
    query: {
      string: value,
      type,
    },
    watch: false,
  })
  if (data.value) product_likes.value = data.value

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
</script>

<template>
  <div>
    <!-- <h1 class="text-2xl font-bold mt-4">Лайки на товар/бренд</h1> -->
    <!-- <p class="text-xs font-light mt-4 lg:text-sm">
      Выберите товар или бренд, чтобы повысить количество добавлений в
      «Избранное»
    </p> -->
    <!-- <p class="text-xs font-light mt-1 lg:text-sm">
      Стоимость одного добавления - 
      <span class="font-bold"> {{ store.tariffString('likeProduct') }} </span>
      Все услуги оказываются по Московскому времени.
    </p> -->
    <ProductLikesOzonCreateLike
      :show="modalShow"
      @close-modal="modalShow = false"
      @create="getProductLikes()"
    />

    <div class="flex mt-4 flex-col lg:flex-row lg:justify-between gap-2">
      <div class="flex gap-1 lg:gap-4">
        <button
          class="btn btn-primary font-normal btn-sm"
          @click="navigateTo(`/productlikes/create/`)"
          @click.stop
        >
          <Icon name="fluent:add-24-filled" size="24" />
          <span class="hidden lg:flex">Лайки</span>
        </button>
        <CustomSelect
          class="hidden lg:flex"
          :class="'sm:min-w-[120px]'"
          :status-text="'Ozon'"
          :tabs="mpStore.MPTabs"
          @change-value="changeFilter"
        />
        <CustomSelect
          class="hidden lg:flex"
          :class="'sm:min-w-[120px]'"
          :tabs="[
            { title: 'Все лайки', value: 'all' },
            { title: 'Активные', value: 'work' },
            { title: 'Завершенные', value: 'completed' },
          ]"
          :links="[{ title: 'Отзывы', slot: '/likes', query: '' }]"
          @change-value="selectFilterDate"
        />

        <div class="relative justify-end flex-grow-0 w-full lg:hidden">
          <input
            ref="codeInput"
            v-model="search.text"
            type="text"
            class="input input-sm w-full bg-base-300 bg-opacity-40 text-gray-500"
            placeholder="Поиск по лайкам"
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
          :status-text="'Ozon'"
          :tabs="mpStore.MPTabs"
          @change-value="changeFilter"
        />
        <CustomSelect
          class="lg:hidden"
          :class="'sm:min-w-[120px]'"
          :tabs="[
            { title: 'Все лайки', value: 'all' },
            { title: 'Активные', value: 'work' },
            { title: 'Завершенные', value: 'completed' },
          ]"
          :links="[{ title: 'Отзывы', slot: '/likes', query: '' }]"
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
          :tabs="[{ title: 'Название', value: 'name' }]"
          @change-value="updateSearchType"
        />
        <div class="relative justify-end flex-grow-0 w-full hidden lg:flex">
          <input
            ref="codeInput"
            v-model="search.text"
            type="text"
            class="input input-sm w-full bg-base-300 bg-opacity-40 text-gray-500"
            placeholder="Поиск по лайкам"
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
    <div v-if="product_likes.length" class="mt-6">
      <div v-if="loading" class="flex justify-center">
        <div>
          <span class="loading loading-dots loading-lg text-primary"></span>
        </div>
      </div>
      <table v-else class="table table-sm">
        <!-- head -->

        <thead>
          <tr class="bg-primary bg-opacity-5">
            <!-- <th class="text-center">№</th> -->
            <th class="text-center rounded-tl-2xl">Фото</th>
            <th class="text-center">Название</th>
            <th class="text-center">Ссылка</th>
            <th class="text-center">Тип</th>
            <th class="text-center">Количество</th>
            <th class="text-center">Статус</th>
            <th class="text-center">Дата создания</th>
            <th class="text-center rounded-tr-2xl">Дата завершения</th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="bg-base-200 border-b-0 border-primary"
            v-for="(item, index) in product_likes"
            :key="index"
          >
            <!-- <td class="text-center border-x border-primary border-opacity-5">{{ item.place }}</td> -->
            <td
              class="text-center border-r border-primary border-opacity-5 mx-auto bg-base-100" :class="{'rounded-bl-2xl': index === product_likes.length - 1}"
            >
              <div
                style="width: 40px; height: 40px; border-radius: 4px"
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
              class="text-center border-r border-primary border-opacity-5 text-base-content truncate bg-base-100"
            >
              <span class="whitespace-normal break-words max-w-[150px]">{{
                item.name
              }}</span>
            </td>
            <td
              class="text-center border-r border-primary border-opacity-5 text-primary overflow-x-auto max-w-xs truncate bg-base-100"
            >
              <a
                :href="item.url"
                target="_blank"
                class="text-primary link link-hover whitespace-normal break-words"
              >
                <span class="max-w-[150px] truncate">{{ item.url }}</span>
              </a>
            </td>
            <td class="text-center border-r border-primary border-opacity-5 bg-base-100">
              <div class="flex flex-col">
                {{ item.type === 'brand' ? 'Лайк на бренд' : 'Лайк на товар' }}
              </div>
            </td>
            <td class="text-center border-r border-primary border-opacity-5 bg-base-100">
              <div class="flex flex-col">
                {{ item.amount }}
              </div>
            </td>

            <td class="text-center border-r border-primary border-opacity-5 bg-base-100">
              <div
                :class="{
                  'bg-error text-base-content rounded-full py-1 px-2  text-center':
                    item.status === 'nofunds' ||
                    item.status === 'deleted' ||
                    item.status === 'canceled',
                  'bg-primary bg-opacity-20 text-base-content rounded-full py-1 px-2  text-center':
                    item.status === 'created',
                  'bg-success text-base-content rounded-full py-0.5 px-1.5 text-center':
                    item.status === 'work',
                  'bg-success text-base-content rounded-full py-0.5 px-2 text-center':
                    item.status === 'completed',
                }"
                class="whitespace-nowrap"
              >
                {{ getStatus(item.status) }}
              </div>
            </td>
            <td class="text-center border-r border-primary border-opacity-5 bg-base-100">
              <div
                class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
              >
                {{ defaultDateShort(item.createdDate) }}
              </div>
            </td>
            <td class="text-center border-r border-primary border-opacity-5 bg-base-100 " :class="{'rounded-br-2xl': index === product_likes.length - 1}">
              <div
                v-if="item.endedDate"
                class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center"
              >
                {{ defaultDateShort(item.endedDate) }}
              </div>
            </td>
          </tr>
          <div ref="target" class="flex justify-center items-center h-4" />
        </tbody>
      </table>
    </div>

    <Hero v-else />
  </div>

  <input type="checkbox" id="reviewRemoveModal" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box max-w-xs">
      <h3 class="font-normal text-lg text-center">
        Вы уверены, что хотитет удалить лайки к данному товару?
      </h3>
      <p class="py-2"></p>
      <div class="modal-action flex justify-between">
        <label
          for="reviewRemoveModal"
          class="btn btn-primary"
          ref="reviewRemoveModalClose"
          >Отмена</label
        >
        <label
          for="reviewRemoveModal"
          class="btn btn-error text-white"
          @click="deleteLike"
          >Удалить</label
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
::v-deep(th) {
  background-color: rgba(99, 102, 241, 0.15) !important;
}
::v-deep(.p-column-header-content) {
  text-align: center !important;
  display: flex;
  justify-content: center;
}
</style>
