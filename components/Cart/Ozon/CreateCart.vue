<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
  show: { type: Boolean, required: true },
})

const emit= defineEmits(['closeModal','create'])

const { width } = useWindowSize()

const carts = ref([]) as any
const amount = ref(0)
const loadingUrl = ref(false)
const period = ref('3h')
const query = ref('')
const article = ref('')
const size = ref('none')
const creatingCart = ref(false)

const productData = ref<any>(null)
const urlError = ref(false)
async function getCarts() {
  const { data, error } = await useFetch('/api/ozon/cart/get', { method: 'GET', watch: false })
  if (data.value) carts.value = data.value
  if (error.value)
    notify({
      type: 'error',
      title: 'Не удалось получить лайки',
      text: error.value.message,
    })
}
await getCarts()
async function create() {
  creatingCart.value = true
  const { data, error } = await useFetch('/api/ozon/cart/create', {
    method: 'POST',
    body: {
      amount: amount.value,
      article: article.value,
      query: query.value,
      productData: productData.value,
      size: size.value,
      period: period.value,
    },
    watch: false,
  })
  if (error.value){
    creatingCart.value = false
    return notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: error.value.message,
    })}
  if (data.value) {
    creatingCart.value = false
    notify({ type: 'success', title: 'Успешно' })
    removeProduct()
    emit('create')
   
  }
}
async function getProductInfo() {
  if (!article.value) return

  const { data, error } = await useFetch(`/api/ozon/product/${article.value}`, {
    method: 'GET',
  })
  if ((data.value as any)?.product) {
    productData.value = (data.value as any).product
    if (productData.value?.sizes && productData.value.sizes.length > 0) {
      size.value = productData.value.sizes[0]
    }
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
function selectPeriod(event: any) {
  period.value = event.target.value
}
function selectSize(event: any) {
  size.value = event.target.value
}
function getStatus(status: string) {
  if (status === 'created') return 'Создан'
  else if (status === 'work') return 'В работе'
  else if (status === 'busy') return 'В работе'
  else if (status === 'completed') return 'Завершен'
  else if (status === 'nofunds') return 'Недостаточно средств'
  else return status
}
function removeProduct() {
  productData.value = null
  article.value = ''
  amount.value = 0
}
</script>

<template>
    <div
      v-if="props.show === true"
      @click="$emit('closeModal')"
      class="modalCustom fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm"
    >
      <div class="flex flex-col bg-base-100 rounded-lg w-full max-w-sm gap-3 px-4 py-2" @click.stop>
        <div class="flex justify-between">
          <div class="font-bold text-xl">Добавить корзину</div>
          <button class="text-gray-600 hover:text-gray-700 self-end mb-2" @click="$emit('closeModal')">
            <Icon name="material-symbols:close-rounded" size="24" />
          </button>
        </div>
        <div class=" bg-base-100 rounded-lg">
            <div class="flex items-center gap-3 mb-2 flex-wrap">
            <div class="relative w-full">
              <div class="font-medium ">Артикул:</div>
              <div class="input-group w-full mt-2">
                <input
                  v-model="article"
                  :class="{
                    'input-error': urlError,
                    'input-success': productData,
                  }"
                  :disabled="productData"
                  tabindex="0"
                  class="input input-sm lg:input-md w-full bg-base-200 text-gray-600"
                  placeholder="12312312"
                  type="number"
                  @input="changeUrl"
                />
                <button
                  :class="{
                    'btn-disabled': !productData,
                  }"
                  class="btn btn-ghost btn-sm lg:btn-md btn-circle bg-base-300"
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
            <div class="w-full">
              <div class="font-medium ">Ключевой запрос:</div>
              <input
                v-model="query"
                :disabled="!productData"
                placeholder="Носки"
                type="text"
                class="input input-sm lg:input-md w-full bg-base-200 text-gray-600 mt-2"
              />
            </div>
          </div>
          <div class="mt-4 flex gap-3 items-start flex-wrap flex-col">
            <div class="w-full flex gap-2.5">
            <div class="w-full">
              <div class="font-medium ">Размер:</div>
              <select
                :disabled="!productData?.sizes.length"
                class="select select-sm lg:select-md bg-base-200 text-gray-600 w-full mt-2"
                @change="selectSize"
              >
                <option v-if="!productData?.sizes.length" value="none">
                  Без размера
                </option>
                <option
                  v-for="(size, index) of productData?.sizes"
                  :key="index"
                  :value="size"
                >
                  {{ size == '0' ? 'Без размера' : size }}
                </option>
              </select>
            </div>
            <div class="gap-4 flex flex-col" :class="{'flex-wrap-reverse' : width <= 300}">
              <div class="">
                <div class="font-medium ">Количество:</div>
                <div class="relative flex items-center ml-auto mt-2">
                  <button
                    :disabled="amount <= 0"
                    :class="{'bg-base-200 text-base-300' : amount <= 0,
                    'text-primary' : productData,
                    }"
                    class="bg-base-200 absolute left-0 btn btn-ghost btn-sm btn-square min-h-min lg:min-h-[48px]"
                    @click="amount -= 10"
                  >
                    <IconCSS size="16" name="ic:round-minus" />
                  </button>
                  <div
                    :class="{
                      'bg-base-200': !productData,
                    }"
                    class="input-sm rounded-lg w-full min-h-min lg:min-h-[48px] lg:pt-2.5 text-center bg-base-100"
                  >
                    {{ amount }}
                  </div>
                  <button
                    :disabled="amount >= 1000"
                    :class="{
                      'btn-disabled bg-base-200 ': !productData,
                      'text-primary' : productData,
                    }"
                    class="bg-base-200 absolute right-0 btn btn-ghost btn-sm btn-square min-h-min lg:min-h-[48px]"
                    @click="amount += 10"
                  >
                    <IconCSS size="16" name="ic:round-plus" />
                  </button>
                </div>
              </div>
              
            </div>
            </div>
            <div class="flex flex-col w-full">
                <div class="font-medium ">Период выполнения:</div>
                <select
                  :disabled="!productData"
                  class="select w-full select-sm lg:select-md bg-base-200 text-gray-600 mt-2"
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
          </div>
            <button
            :disabled="creatingCart"
              :class="{
                'btn-disabled': !productData || !query,
              }"
              class="btn justify-start mt-3 w-full btn-primary"
              @click="create"
            >
            <span class="mx-auto"> Добавить</span>
             
            </button>

          <div v-if="productData" class="productinfo mt-4">
            <div class="flex text gap-4 mt-2 items-start">
              <nuxt-img
                width="48"
                class="rounded-lg object-contain w-12"
                loading="lazy"
                :src="productData.image"
              />
              <div class="article">
                <a
                :href="`https://www.ozon.ru/product/${productData.article}`"
                  target="_blank"
                  class="text-primary link link-hover"
                >
                  {{ productData.article }}
                </a>
              </div>
              <div class="name truncate">
                {{ productData.name }}
              </div>
              <div class="price white">
                {{ productData.priceText }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

<style scoped></style>
