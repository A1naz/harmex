<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
  show: { type: Boolean, required: true },
})

const emit = defineEmits(['closeModal', 'create'])
const product_likes = ref([]) as any
const amount = ref(0)
const loadingUrl = ref(false)
const url = ref('')
const urlError = ref(false)
const urlSuccess = ref('')
const period = ref('3h')
const { width, height } = useWindowSize()
const productData = ref<any>(null)
const search = reactive({
  text: '',
  loading: false,
  error: false,
  type: 'name',
})
const codeInput = ref()
async function getProductLikes() {
  const { data, error } = await useFetch('/api/wildberries/productlikes/get', {
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
}
await getProductLikes()
async function create() {
  const { data, error } = await useFetch(
    '/api/wildberries/productlikes/create',
    {
      method: 'POST',
      body: {
        url: url.value,
        amount: amount.value,
        period: period.value,
        productData: productData.value,
      },
    }
  )
  if (error.value)
    return notify({
      type: 'error',
      title: 'Что-то пошло не так',
      text: error.value.message,
    })
  if (data.value) {
    notify({ type: 'success', title: 'Успешно' })
    emit('create')
    return navigateTo('/productlikes/wildberries')
  }


}
async function sendUrl() {
  const { data, error } = await useFetch(
    '/api/wildberries/productlikes/extract',
    {
      method: 'POST',
      body: {
        url: url.value,
      },
    }
  )
  urlError.value = true

  if (data.value) {
    productData.value = data.value
    urlError.value = false
  }
  // if (error.value) urlError.value = true

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
function openRemoveReviewModal(id: any, name: any) {
  idForRemove.value = id
  reviewRemoveModalClose.value?.click()
}

async function deleteLike() {
  const { data, error } = await useFetch(
    '/api/wildberries/productlikes/delete',
    {
      method: 'DELETE',
      body: {
        id: idForRemove.value,
      },
    }
  )

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

async function selectCreatePage(e: any) {
  const target = e
  if (target.value == '/productlikes/wildberries?modalShow=true') {
    return
  } else {
    return navigateTo(target.value)
  }
}
</script>

<template>
  <div
    v-if="props.show === true"
    @click="$emit('closeModal')"
    class="modalCustom fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm"
  >
    <div
      class="flex flex-col bg-base-100 rounded-lg w-full max-w-[650px] lg:max-w-[810px] gap-5 p-4"
      @click.stop
    >
      <div class="flex justify-between">
        <ProductLikesWildberriesCustomSelect
          class="lg:flex"
          :class="'sm:min-w-[120px]'"
          :tabs="[
            {
              title: 'Лайки на товар/бренд',
              value: '/productlikes/create/wildberries',
            },
            {
              title: 'Лайки на отзыв',
              value: '/likes/create/wildberries',
            },
          ]"
          @change-value="selectCreatePage"
        />
        <button
          class="text-gray-500 hover:text-gray-700 self-end mb-5"
          @click="navigateTo('/productlikes/wildberries')"
        >
          <Icon name="material-symbols:close-rounded" size="24" />
        </button>
      </div>
      <div class="bg-base-100 rounded-lg">
        <div class="flex flex-wrap items-center gap-6 mb-2">
          <div class="relative">
            <div>Вставьте ссылку:</div>
            <div class="input-group w-64 min-h-min md:min-h-[48px] mt-2">
              <input
                v-model="url"
                :class="{
                  'input-error': urlError,
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
                class="btn btn-sm btn-ghost btn-circle bg-base-200 min-h-min md:min-h-[48px]"
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
              <div
                class="input-sm rounded-lg w-24 text-center bg-base-200 min-h-min md:min-h-[48px] md:pt-2.5 text-lg"
              >
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
                class="text-sm text-primary link link-hover"
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
    </div>
  </div>
</template>

<style scoped></style>
