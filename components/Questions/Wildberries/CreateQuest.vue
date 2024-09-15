<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
  show: { type: Boolean, required: true },
})

const emit = defineEmits(['closeModal','create'])

const questions = ref([]) as any
const amount = ref(0)
const now = useNow()
const publishDate = ref(now.value)
const { $dayjs } = useNuxtApp()
const loadingUrl = ref(false)
const questionText = ref('')
const article = ref('')
const sex = ref('male')
const creating = ref(false)
const productData = ref<any>(null)
const urlError = ref(false)
async function getQuestions() {
  const { data, error } = await useFetch('/api/wildberries/questions/get', { method: 'GET' })
  if (data.value)
    questions.value = data.value
  if (error.value)
    notify({ type: 'error', title: 'Не удалось получить лайки', text: error.value.message })
}
await getQuestions()
async function create() {
  creating.value = true
  console.log('publishDate', publishDate.value)
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
  {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data?.message,
      type: 'error',
      duration: 3000,
    })
    creating.value = false
    return 
  }
  if (data.value) {
    notify({ type: 'success', title: 'Успешно' })
    removeProduct()
    publishDate.value = now.value
    creating.value = false
    emit('create')
  }
}
async function getProductInfo() {
  if (!article.value)
    return

  const { data, error } = await useFetch(`/api/wildberries/product/${article.value}`, {
    method: 'GET',
  })
  if ((data.value as any)?.product) {
    productData.value = (data.value as any).product
    urlError.value = false
  }
  if (error.value)
    urlError.value = true

  loadingUrl.value = false
}
let timeout = null as NodeJS.Timeout | null
async function changeUrl() {
  if (article.value === '')
    return
  loadingUrl.value = true
  if (timeout)
    clearTimeout(timeout)
  timeout = setTimeout(getProductInfo, 2000)
}
function selectSex(event: any) {
  sex.value = event.target.value
}
function removeProduct() {
  productData.value = null
  article.value = ''
  amount.value = 0
}

function convertToMoscowTime(dateString: any): Date {
    const date = new Date(dateString);
    
    const utcOffset = date.getTimezoneOffset() / 60;
    
    date.setHours(date.getHours() + utcOffset);

    const moscowOffset = 3;

    date.setHours(date.getHours() + moscowOffset);

    return date;
}
</script>

<template>
    <div
      v-if="props.show === true"
      @click="$emit('closeModal')"
      class="modalCustom fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm"
    >
      <div class="flex flex-col bg-base-100 rounded-lg w-full max-w-[690px] gap-5 p-4" @click.stop>
        <div class="flex justify-between">
          <div class="font-medium text-lg">Добавить вопрос</div>
          <button class="text-gray-500 hover:text-gray-700 self-end mb-2" @click="$emit('closeModal')">
            <Icon name="material-symbols:close-rounded" size="24" />
          </button>
        </div>
        <div class=" bg-base-100 rounded-lg">
          <div class="flex mb-2 flex-col gap-4">
            <div class="flex gap-4 flex-col lg:flex-row sm:flex-wrap ">
                <div>
                    <div>Артикул:</div>
                    <div class="input-group w-full mt-2">
                        <input
                        v-model="article"
                        :class="{
                            'input-error': urlError,
                            'input-success': productData,
                        }"
                        :disabled="productData"
                        tabindex="0" class="input input-sm lg:input-md w-full bg-base-200 text-gray-500" placeholder="12312312" type="text" @input="changeUrl"
                        >
                        <button
                        :class="{
                            'btn-disabled': !productData,
                        }"
                        class="btn btn-ghost btn-sm lg:btn-md btn-circle bg-base-300" @click="removeProduct"
                        >
                        <span v-show="loadingUrl" class="loading loading-spinner loading-xs p-2" />

                        <!-- Insert a backspace svg -->
                        <div v-if="!loadingUrl">
                            <IconCSS v-if="productData" class="w-6 h-6" name="fluent:backspace-24-regular" />
                        </div>
                        </button>
                    </div>
                </div>
                <div>
                    <div>Пол:</div>
                    <select class="select select-sm lg:select-md w-full mt-2 bg-base-200 text-gray-500" @change="selectSex">
                        <option value="male">
                        Мужской
                        </option>
                        <option value="female">
                        Женский
                        </option>
                    </select>
                </div>
                <div>
                    <div>Дата публикации:</div>
                    <div class="relative w-full  lg:p-2 rounded-lg mt-2 bg-base-200 text-gray-500">
                        <div class="absolute left-3 top-1.5 lg:left-14 lg:top-3.5 text-sm">
                        {{ publishDate <= now ? 'Опубликовать сейчас'
                            : $dayjs(publishDate).format('DD.MM.YYYY HH:mm') }}
                        </div>
                        <div class="w-60 lg:opacity-0 cursor-pointer ml-auto" style="z-index: 9999999">
                        <DatePicker timezone="Europe/Moscow" v-model="publishDate" class="w-40" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col justify-start gap-1 w-full">
                <div>Вопрос к товару:</div>
              <textarea v-model="questionText" rows="1" class="textarea w-full py-0 h-4 mt-2 bg-base-200 text-gray-500" />
              <label class="label py-0">
                <span class="label-text-alt">От 10 до 1000 символов</span></label>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <button
              class="btn btn-ghost hidden lg:flex w-full max-w-[calc(25%)] btn-primary"
              @click="$emit('closeModal')"
            >
              Отмена
            </button>
            <button
            :disabled="creating"
              :class="{
                'btn-disabled': !productData || !questionText,
              }" class="btn w-full  lg:max-w-[calc(25%)] btn-primary dark:bg-primary bg-[#b2baff] hover:bg-[#6675FF] border-none text-base-content"
              @click="create"
            >
              Добавить
            </button>
            
          </div>
          <div v-if="productData" class="productinfo mt-4">
            <div>Информация о товаре:</div>
            <div class="flex gap-4 mt-2 items-start">
              <nuxt-img width="32" class="rounded-lg object-contain w-8" :src="productData.image" />
              <div class="article">
                <a
                :href="`https://www.wildberries.ru/catalog/${productData.article}/detail.aspx`"
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
