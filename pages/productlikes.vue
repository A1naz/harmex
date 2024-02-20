<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Лайки на товар/бренд',
})
const store = useMainStore()
const product_likes = ref([]) as any
const amount = ref(0)
const loadingUrl = ref(false)
const url = ref('')
const period = ref('3h')
const { width, height } = useWindowSize()
const productData = ref<any>(null)
const urlError = ref(false)
const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'name',
})
const codeInput = ref()
async function getProductLikes() {
  const { data, error } = await useFetch('/api/productlikes/get', {
    method: 'GET',
  })
  if(data.value) product_likes.value = data.value
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
}
await getProductLikes()
async function create() {
  const { data, error } = await useFetch('/api/productlikes/create', {
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
    notify({ type: 'success', title: 'Упешно' })
    getProductLikes()
  }
}
async function sendUrl() {
  const { data, error } = await useFetch('/api/productlikes/extract', {
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
}
function removeProduct() {
  productData.value = null
  url.value = ''
  amount.value = 0
}
onMounted(() => {})

const reviewRemoveModalClose: any = ref(null)
const idForRemove = ref('')
function openRemoveReviewModal(id: any,name: any) {
  idForRemove.value = id
  reviewRemoveModalClose.value?.click()
}

async function deleteLike() {
  const { data, error } = await useFetch('/api/productlikes/delete', {
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
const modalShow = ref<boolean>(false)
const closeModal = (event: MouseEvent) => {
    if ((event.target as HTMLElement).classList.contains('modalCustom')){
      modalShow.value = false
      currentFilter.value = ''
    }
}

async function selectFilterDate(e: any) {
  const target = e
  const { data } = await useFetch('/api/productlikes/get', {
    method: 'GET',
    query: {
      dateFilter: target.value,
    },
    watch: false,
  })
  product_likes.value = data.value
}
async function findBuyouts(value: string, type: string) {
  if (!value) {
    search.loading = false
    getProductLikes()
    return
  }
  console.log('Searching: ', value, 'type: ', type)
  const { data, error } = await useFetch('/api/productlikes/search', {
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
  console.log(search.type)
  findBuyoutsDebounced(search.text, search.type)
}
const updateSearchType = (filter: any) => {
  search.type = filter.value;
}
</script>

<template>
  <div >
    
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
      <div v-if="modalShow" @click="closeModal" class="modalCustom fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm">
       
        <div class="flex flex-col bg-base-100 rounded-lg w-full max-w-[810px] gap-5 p-4 ">
          <div class="flex justify-between">
            <div class="font-medium text-lg">Лайк на товар/бренд</div>
            <!-- <CustomSelect :rangesConfig="['Лайки на товар/бренд', 'Лайки на отзыв']" :category="true" @change-text="changePage"/> -->
            <button class="text-gray-500 hover:text-gray-700 self-end mb-2" @click="modalShow = false ; currentFilter = ''">
              <Icon name="material-symbols:close-rounded" size="24" />
            </button>
          </div>
          
          <!-- <div v-if="currentFilter == 'Лайки на товар/бренд'" class="bg-base-100 rounded-lg"> -->
          <div class="bg-base-100 rounded-lg">
            <div  class="flex flex-wrap items-center gap-6 mb-2">
              <div class="relative">
               
                <div>Вставьте ссылку:</div> 
                <div class="input-group w-64 min-h-min md:min-h-[48px] mt-2">
                  <input
                    v-model="url"
                    :class="{
                      'input-error': urlError,
                      'input-success': productData,
                    }"
                    :disabled="productData"
                    tabindex="0"
                    class="input w-full input-sm bg-base-200 min-h-min md:min-h-[48px] text-lg"
                    placeholder="Введите ссылку"
                    type="text"
                    @input="changeUrl"
                  />
                  <button
                    :class="{
                      'btn-disabled': !productData,
                    }"
                    class="btn btn-sm btn-ghost btn-circle bg-base-100 min-h-min md:min-h-[48px]"
                    @click="removeProduct"
                  >
                    <span
                      v-show="loadingUrl"
                      class="loading loading-spinner loading-xs p-2"
                    />

                    <!-- Insert a backspace svg -->
                    <div v-if="!loadingUrl">
                      <IconCSS
                        v-if="productData"
                        class="w-6 h-6"
                        name="fluent:backspace-24-regular"
                      />
                    </div>
                  </button>
                </div>
              </div>
              <div>
                <div>Количество:</div>
                <div class="relative flex items-center justify-center ml-auto mt-2">
                  <button
                    :disabled="amount <= 0"
                    class="absolute left-0 btn btn-ghost btn-sm btn-square min-h-min md:min-h-[48px]"
                    @click="amount -= 10"
                  >
                    <IconCSS size="16" name="ic:round-minus" />
                  </button>
                  <div class="input-sm rounded-lg w-24 text-center bg-base-200 min-h-min md:min-h-[48px] pt-2.5 text-lg">
                    {{ amount }}
                  </div>
                  <button
                    :disabled="amount >= 1000"
                    :class="{
                      'btn-disabled': !productData,
                    }"
                    class="absolute right-0 btn btn-ghost btn-sm btn-square min-h-min md:min-h-[48px]"
                    @click="amount += 10"
                  >
                    <IconCSS size="16" name="ic:round-plus" />
                  </button>
                </div>
              </div>
              <div>
                <div>Период выполнения:</div>
                <select
                  :disabled="!productData"
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
              <div
                v-if="productData && productData.type === 'brand'"
                class="productinfo"
              >
                <div>Информация о бренде:</div>
                <div class="flex gap-4 mt-2 items-start">
                  <nuxt-img
                    class="rounded-lg object-contain h-8"
                    :src="productData.image"
                  />
                  <div class="name truncate">
                    {{ productData.name }}
                  </div>
                </div>
              </div>
              <div class="w-full ml-auto self-end justify-end lg:w-40">
                <button
                  :class="{
                    'btn-disabled': !productData || amount <= 0,
                  }"
                  class="btn w-full btn-primary"
                  @click="create"
                >
                  Добавить
                </button>
              </div>
            </div>
            <div
              v-if="productData && productData.type === 'product'"
              class="productinfo mt-4"
            >
              <div>Информация о товаре:</div>
              <div class="flex gap-4 mt-2 items-start">
                <nuxt-img
                  width="32"
                  class="rounded-lg object-contain w-8"
                  :src="productData.image"
                />
                <div class="article">
                  <a
                  :href="`https://www.ozon.ru/product/${productData.article}`"
                    target="_blank"
                    class="text-sm text-secondary link link-hover"
                  >
                    {{ productData.article }}
                  </a>
                </div>
                <div class="name truncate">
                  {{ productData.name }}
                </div>
                <div class="price">
                  {{ productData.priceText }}
                </div>
              </div>
            </div>
          </div>
          <!-- <div v-if="currentFilter == 'Лайки на отзыв'" class="bg-base-100 rounded-lg">
            <p class=text-red-500>Создание новых лайков на отзывы временно отключено.</p>
          </div> -->
        </div>
      </div>
    <div class="flex mt-4 flex-col lg:flex-row lg:justify-between gap-2">
      <div class="flex gap-1 lg:gap-4">
        <button class="btn btn-primary font-normal btn-sm" @click="modalShow = !modalShow" @click.stop><Icon name="fluent:add-24-filled" size="15" /> <span class="hidden lg:flex">Лайки</span></button>
        <CustomSelect class="hidden lg:flex" :class="'sm:min-w-[120px]'" :tabs = "[{title: 'Все лайки', value: 'all'}, {title: 'Активные', value: 'work'}, {title: 'Завершенные', value: 'completed'}]" @change-value="selectFilterDate"/>
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
            class="absolute right-2 top-2 loading loading-spinner loading-xs p-2 "
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
        <!-- <CustomDrop
        class="lg:hidden"
            :statusText="'Лайки на товар/бренд'"
            :tabs="[{title: 'Лайки на отзывы', slot: '', query: ''}]"
            :route="'/likes'"
            :class="'bg-base-300'"
        /> -->
        <CustomSelect class="lg:hidden" :class="'sm:min-w-[120px]'" :tabs = "[{title: 'Все лайки', value: 'all'}, {title: 'Активные', value: 'work'}, {title: 'Завершенные', value: 'completed'}]" @change-value="selectFilterDate"/>
        <CustomSelect :class="'bg-base-300 sm:min-w-[120px]'" :tabs = "[{title: 'За все время', value: 'all'}, {title: 'Сегодня', value: 'today'}, {title: '3 дня', value: '3days'}, {title: 'Неделя', value: '7days'}]" @change-value="selectFilterDate"/>
        <CustomSelect :class="'bg-base-300'" :tabs = "[{title: 'Название', value: 'name'}]" @change-value="updateSearchType" />
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
    <!-- <div class="mb-4 mt-6 bg-base-100 p-6 rounded-lg">
      <div class="flex flex-wrap items-center gap-6 mb-2">
        <div class="relative">
          <div>Ссылка на бренд или товар:</div>
          <div class="input-group w-64 mt-2">
            <input
              v-model="url"
              :class="{
                'input-error': urlError,
                'input-success': productData,
              }"
              :disabled="productData"
              tabindex="0"
              class="input w-full input-sm bg-base-200"
              placeholder="Введите ссылку"
              type="text"
              @input="changeUrl"
            />
            <button
              :class="{
                'btn-disabled': !productData,
              }"
              class="btn btn-sm btn-ghost btn-circle bg-base-100"
              @click="removeProduct"
            >
              <span
                v-show="loadingUrl"
                class="loading loading-spinner loading-xs p-2"
              />

              <div v-if="!loadingUrl">
                <IconCSS
                  v-if="productData"
                  class="w-6 h-6"
                  name="fluent:backspace-24-regular"
                />
              </div>
            </button>
          </div>
        </div>
        <div>
          <div>Количество:</div>
          <div class="relative flex items-center ml-auto mt-2">
            <button
              :disabled="amount <= 0"
              class="absolute left-0 btn btn-ghost btn-sm btn-square"
              @click="amount -= 10"
            >
              <IconCSS size="16" name="ic:round-minus" />
            </button>
            <div class="input-sm rounded-lg w-24 text-center bg-base-200">
              {{ amount }}
            </div>
            <button
              :disabled="amount >= 1000"
              :class="{
                'btn-disabled': !productData,
              }"
              class="absolute right-0 btn btn-ghost btn-sm btn-square"
              @click="amount += 10"
            >
              <IconCSS size="16" name="ic:round-plus" />
            </button>
          </div>
        </div>
        <div>
          <div>Период выполнения:</div>
          <select
            :disabled="!productData"
            class="select w-44 select-sm mt-2"
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
        <div
          v-if="productData && productData.type === 'brand'"
          class="productinfo"
        >
          <div>Информация о бренде:</div>
          <div class="flex gap-4 mt-2 items-start">
            <nuxt-img
              class="rounded-lg object-contain h-8"
              :src="productData.image"
            />
            <div class="name truncate">
              {{ productData.name }}
            </div>
          </div>
        </div>
        <div class="w-full ml-auto self-end justify-end lg:w-40">
          <button
            :class="{
              'btn-disabled': !productData || amount <= 0,
            }"
            class="btn w-full btn-primary"
            @click="create"
          >
            Добавить
          </button>
        </div>
      </div>
      <div
        v-if="productData && productData.type === 'product'"
        class="productinfo mt-4"
      >
        <div>Информация о товаре:</div>
        <div class="flex gap-4 mt-2 items-start">
          <nuxt-img
            width="32"
            class="rounded-lg object-contain w-8"
            :src="productData.image"
          />
          <div class="article">
            <a
            :href="`https://www.ozon.ru/product/${productData.article}`"
              target="_blank"
              class="text-sm text-secondary link link-hover"
            >
              {{ productData.article }}
            </a>
          </div>
          <div class="name truncate">
            {{ productData.name }}
          </div>
          <div class="price">
            {{ productData.priceText }}
          </div>
        </div>
      </div>
    </div> -->
    <div v-if="product_likes.length" class="mt-6">
      <DataTable
        class="bg-base-200"
        :value="product_likes"
         showGridlines
      >
        <!-- <Column class="bg-base-100 text-center border-r border-base-200" field="place" header="№" 
        :pt="{
                headerCell:  { class: [
                      'border-none text-base-content font-normal'
                  ] },
              }"
        /> -->
        <Column class="bg-base-100 text-center border-r border-base-200" field="image" header="Фото"
        :pt="{
                headerCell:  { class: [
                      'border-none text-base-content font-normal'
                  ] },
              }"
        >
          <template #body="{ data }">
            <div
              style="
                width: 28px;
                height: 36px;
                overflow: visible;
                position: relative;
                border-radius: 4px;
              "
            >
              <div class="dropdown dropdown-hover">
                <label tabindex="0">
                  <nuxt-img
                    class="rounded-lg z-0"
                    alt=""
                    loading="lazy"
                    fit="fill"
                    :src="data.image"
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
                    :src="data.image"
                  />
                </ul>
              </div>
            </div>
          </template>
        </Column>
        <Column class="bg-base-100 text-center border-r border-base-200"  field="link" header="Название"
        :pt="{
                headerCell:  { class: [
                      'border-none text-base-content font-normal'
                  ] },
              }"
        >
          <template #body="{ data }">
            <a
              :href="data.url"
              target="_blank"
              class="text-primary link link-hover"
            >
              <span >{{ data.name }}</span>
            </a>
          </template>
        </Column>
        <Column class="bg-base-100 text-center truncate border-r border-base-200"  field="link" header="Ссылка"
        :pt="{
                headerCell:  { class: [
                      'border-none text-base-content font-normal'
                  ] },
              }"
        >
          <template #body="{ data }">
            <a
              :href="data.url"
              target="_blank"
              class="text-base-content link link-hover w-[30px] break-all"
            >
              <span>{{ data.url }}</span>
            </a>
          </template>
        </Column>
        <Column class="bg-base-100 text-center border-r border-base-200" field="type" header="Тип"
        :pt="{
                headerCell:  { class: [
                      'border-none text-base-content font-normal'
                  ] },
              }"
        >
          <template #body="{ data }">
            <div>{{ data.type === 'brand' ? 'Бренд' : 'Товар' }}</div>
          </template>
        </Column>
        <Column class="bg-base-100 text-center border-r border-base-200" field="amount" header="Количество" 
        :pt="{
                headerCell:  { class: [
                      'border-none text-base-content font-normal'
                  ] },
              }"
        />

        <Column class="bg-base-100 text-center" field="status" header="Статус"
        :pt="{
                headerCell:  { class: [
                      'border-none text-base-content font-normal'
                  ] },
              }"
        >
          <template #body="{ data }">
            <div
              :class="{
                'bg-error text-base-content rounded-lg py-1 px-2  text-center': data.status === 'nofunds',
                'bg-primary bg-opacity-20 text-base-content rounded-lg py-1 px-2  text-center': data.status === 'created',
                'bg-warning text-base-content rounded-lg py-1 px-2  text-center': data.status === 'work',
                'bg-success text-base-content rounded-lg py-1 px-2 text-center': data.status === 'completed',
              }"
            >
              {{ getStatus(data.status) }}
            </div>
          </template>
        </Column>
        <Column class="bg-base-100 text-center border-r border-base-200" field="createdDate" header="Дата создания"
        :pt="{
                headerCell:  { class: [
                      'border-none text-base-content font-normal'
                  ] },
              }"
        >
          <template #body="{ data }">
            <div class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center">
              {{ defaultDateShort(data.createdDate) }}
            </div>
          </template>
        </Column>
        <Column class="bg-base-100 text-center" field="endedDate" header="Дата завершения"
        :pt="{
                headerCell:  { class: [
                      'border-none text-base-content font-normal'
                  ] },
              }"
        >
          <template #body="{ data }">
            <div v-if="data.endedDate" class="bg-primary bg-opacity-10 rounded-lg p-0.5 text-center">
              {{ defaultDateShort(data.endedDate) }}
            </div>
            <div v-else
            :class="{'flex justify-between self-end mr-4': data.status === 'created',}"
            >
              <div class="mt-1">Нет</div>
              <button
                v-if="data.status === 'created'"
                class="btn btn-ghost bg-red-500 bg-opacity-70 text-base-contetn btn-sm -ml-16 -mr-4"
                @click="openRemoveReviewModal(data.id, data.name)"
              >
                Удалить
              </button></div>
          </template>
        </Column>

        <!-- <Column class="bg-base-100 text-center max-w-0 " header=" ">
          <template #body="{ data }">
            <div v-if="data.status === 'created'">
              <button
                class="btn btn-ghost text-error btn-sm -ml-16 -mr-4"
                @click="openRemoveReviewModal(data.id)"
              >
                Удалить
              </button>
            </div>
          </template>
        </Column> -->
      </DataTable>
      <!-- <ul v-else class="w-full lg:hidden">
        <li
          v-for="(item, index) in product_likes"
          :key="index"
          class="pb-3 sm:pb-4"
        >
          <div
            tabindex="0"
            class="relative collapse collapse-arrow bg-base-200 rounded-box"
          >
            <div class="collapse-title font-medium">
              <div class="text-gray-400 right-3 date text-start text-xs pb-2">
                <div>
                  {{ defaultDate(item.createdDate) }}
                </div>
              </div>
              <div class="flex gap-6 items-center w-full">
                <div class="flex gap-4 items-start flex-wrap">
                  <div class="image">
                    <nuxt-img
                      width="32"
                      class="rounded-lg object-contain"
                      :src="item.image"
                    />
                  </div>
                  <div class="article flex flex-col gap-0.5">
                    <div class="text-xs">Ссылка</div>
                    <a
                      :href="item.url"
                      target="_blank"
                      class="text-secondary link link-hover text-sm truncate"
                    >
                    <div class="">{{ item.name }}</div>
                    </a>
                  </div>
                  <div class="status flex flex-col gap-0.5">
                    <div class="text-xs">Статус</div>
                    <div
                      class="text-sm"
                      :class="{
                        'text-warning':
                          item.status === 'created' || item.status === 'work',
                        'text-success': item.status === 'completed',
                      }"
                    >
                      <div>
                        {{ getStatus(item.status) }}
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <div class="text-xs">Количество</div>
                    <div class="text-sm">
                      {{ item.amount }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="collapse-content flex gap-4">
              <div class="flex flex-col">
                <dt class="mb-1 text-gray-500 text-sm dark:text-gray-400">
                  Тип
                </dt>
                <dd class="font-semibold text-sm">
                  <div>{{ item.type === 'brand' ? 'Бренд' : 'Товар' }}</div>
                </dd>
              </div>
              <div class="flex flex-col">
                <dt class="mb-1 text-gray-500 text-sm dark:text-gray-400">
                  Дата завершения
                </dt>
                <dd class="font-semibold text-sm">
                  <div v-if="item.endedDate">
                    {{ defaultDate(item.endedDate) }}
                  </div>
                  <div v-else>Нет</div>
                </dd>
              </div>
            </div>
            <div class="ml-4 mb-2" v-if="item.status === 'created'">
              <button
              class="btn btn-sm btn-error"
              @click="openRemoveReviewModal(item.id)"
              >
              Удалить
            </button>
          </div>
          </div>
        </li>
      </ul> -->
    </div>

    <Hero v-else />
  </div>

  <input type="checkbox" id="reviewRemoveModal" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box max-w-xs">
      <h3 class="font-normal text-lg text-center">Вы уверены, что хотитет удалить лайки к данному товару?</h3>
      <p class="py-2"></p>
      <div class="modal-action flex justify-between">
        <label
          for="reviewRemoveModal"
          class="btn btn-primary"
          ref="reviewRemoveModalClose"
          >Отмена</label
        >
        <label for="reviewRemoveModal" class="btn btn-error text-white" @click="deleteLike"
          >Удалить</label
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
::v-deep(th){
  background-color: rgba(99, 102, 241, 0.15) !important;
  
}
::v-deep(.p-column-header-content){
  text-align: center !important;
  display: flex;
  justify-content: center;
}

</style>
