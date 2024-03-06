<script setup lang="ts">
import { useNotification } from '@kyvg/vue3-notification'
import { UseImage } from '@vueuse/components'

const config = useRuntimeConfig()

const props = defineProps({
  review: {} as any,
  state: { type: Boolean, required: true },
  uuid: { type: String, required: true },
  deliveryid: { type: String, required: true },
})
const emit = defineEmits(['close', 'publish'])

const headers = useRequestHeaders(['cookie']) as HeadersInit
const closeButton = ref<HTMLElement>()
const { notify } = useNotification()
const { upload, getPublicUrl, remove } = useS3Object()
const now = useNow()
const { restrictUrl } = useValidation()

const inputs: any = {
  file1: ref(),
  file2: ref(),
  file3: ref(),
  file4: ref(),
  file5: ref(),
}

const form = reactive({
  text: '',
  rating: 5,
  date: now.value,
  photos: [
    {
      url: '',
      public: '',
    },
    {
      url: '',
      public: '',
    },
    {
      url: '',
      public: '',
    },
    {
      url: '',
      public: '',
    },
    {
      url: '',
      public: '',
    },
  ],
})

const textValidation = computed(() => {
  return restrictUrl(form.text)
})
const textValidError = computed(() => {
  return textValidation.value
    ? ''
    : 'В тексте присутствуют запрещенные символы (нельзя указывать ссылки)'
})

function useDraft(draft: IReviewDraft) {
  form.text = draft.text
}

const defaultDelIndex = props.review.delivs.findIndex(
  (rev: any) => rev.delivId == props.deliveryid
)
const selectedDeliv = ref({
  deliveryid: props.review.delivs[defaultDelIndex].delivId,
  uuid: props.review.delivs[defaultDelIndex].buyoutId,
})

const loadingIndex = ref(null) as Ref<number | null>

async function uploadToS3(event: Event, index: number) {
  loadingIndex.value = index
  const fileList = (event.target! as HTMLInputElement).files
  const files = Array.from(fileList!)
  if (!files) return

  if (
    files[0] &&
    files[0].name &&
    files[0].name.toLowerCase().endsWith('.webp')
  ) {
    notify({
      title: 'Что-то пошло не так',
      text: 'Нельзя загружать вебпикчи',
      type: 'error',
      duration: 3000,
    })

    loadingIndex.value = null
    return
  }

  const { data, error } = await upload({
    files,
    url: null,
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: 'Не удалось загрузить фото',
      type: 'error',
      duration: 3000,
    })
  }
  if (data.value) {


    console.log(`${config.public.DOMAIN_API_IMAGES_URL}reviewImages/${data.value[0].key}`);

      form.photos[index] = {
        url: `${config.public.DOMAIN_API_IMAGES_URL}reviewImages/${data.value[0].key}`,
        public: `${config.public.DOMAIN_API_IMAGES_URL}reviewImages/${data.value[0].key}`,
      }
    }


  setTimeout(() => {
    loadingIndex.value = null
  }, 1500)
}
async function clearForm() {
  form.date = new Date()
  form.text = ''
  form.rating = 5

  loadingIndex.value = null
  form.photos = [
    {
      url: '',
      public: '',
    },
    {
      url: '',
      public: '',
    },
    {
      url: '',
      public: '',
    },
    {
      url: '',
      public: '',
    },
    {
      url: '',
      public: '',
    },
  ]
}

async function publishReview() {
  const photos = form.photos
  for await (const photo of photos) {
    try {
    } catch {
      notify({
        title: 'Что-то пошло не так',
        text: 'Не удалось загрузить все фото, попробуйте еще раз',
      })
    }
  }
  const { data, error } = await useFetch('/api/wildberries/review/publish', {
    method: 'POST',
    body: {
      ...form,
      deliveryid: selectedDeliv.value.deliveryid,
      buyoutuuid: selectedDeliv.value.uuid,
    },
    headers,
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data?.message,
      type: 'error',
      duration: 3000,
    })
    return
  }
  notify({
    title: 'Успешно',
    text: 'Отзыв успешно опубликован',
    type: 'success',
    duration: 3000,
  })
  emit('close')
  emit('publish')
}

async function removePhoto(index: number) {
  const fileInput = inputs[`file${(index + 1) as 1 | 2 | 3 | 4 | 5}`]
  fileInput.value = null
  loadingIndex.value = index
  const url = form.photos[index].url

  form.photos[index] = {
    url: '',
    public: '',
  }
  const { data, error } = await remove({
    url,
  })
  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: 'Не удалось удалить фото',
      type: 'error',
      duration: 3000,
    })
    return
  }
  if (data.value) {
    form.photos[index] = {
      url: '',
      public: '',
    }
  }
  loadingIndex.value = null
}

watch(
  () => props.uuid,
  (uuid) => {
    clearForm()
  }
)

onMounted(() => {
  clearForm()
})
</script>

<template>
  <input id="review-modal" type="checkbox" class="modal-toggle" />
  <div
    ref="closeButton"
    :class="{
      'modal-open': state,
    }"
    class="modal overflow-x-hidden"
  >
    <div class="modal-box z-50">
      <label
        for="review-modal"
        class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
        @click="$emit('close')"
        >✕</label
      >
      <div class="flex flex-row justify-center -mt-4">
        <p class="text-xs text-gray-500 justify-self-center">
          - {{ review.article }} -
        </p>
      </div>

      <h3 class="text-xl font-bold mb-4">Оставить отзыв</h3>

      <div class="pb-2 font-medium">Доставка:</div>
      <select
        v-model="selectedDeliv"
        class="select w-full mb-4 bg-base-200 text-gray-500"
      >
        <option
          v-for="(rev, index) in review.delivs"
          :default="index == rev[defaultDelIndex]"
          :value="{ deliveryid: rev.delivId, uuid: rev.buyoutId }"
          class="m-6"
        >
          {{
            defaultDateShort(rev.updatedAt) +
            ' - пол: ' +
            rev.sex +
            ' - размер: ' +
            rev.sizeparam +
            ' - цена: ' +
            rev.pricebuy +
            'р.'
          }}
        </option>
      </select>

      <div class="flex flex-col gap-4">
        <div class="w-full">
          <div class="pb-2 font-medium">Отзыв о товаре</div>

          <textarea
            v-model="form.text"
            class="textarea w-full textarea-md bg-base-200"
            placeholder="Например, хороший телефон"
          />

          <div v-if="review.drafts" class="text-xs">
            черновики:
            <button
              v-for="draft in review.drafts"
              class="mx-1 text-primary hover:underline hover:cursor-pointer"
              @click="useDraft(draft)"
            >
              <p v-if="draft.draftName">{{ draft.draftName }}</p>
              <i v-else> {{ '<без названия>' }} </i>
            </button>
          </div>

          <div class="text-error">{{ textValidError }}</div>
        </div>

        <div>
          <div class="font-medium">Рейтинг</div>
          <div class="relative w-full py-6 bg-base-100 rounded-lg">
            <!-- <div class="absolute left-3 top-3 text-gray-400">Оценка</div> -->
            <div class="rating absolute left-0 top-3 gap-2">
              <input
                type="radio"
                name="rating-2"
                class="mask mask-star-2 bg-yellow-400"
                @input="form.rating = 1"
              />
              <input
                type="radio"
                name="rating-2"
                class="mask mask-star-2 bg-yellow-400"
                @input="form.rating = 2"
              />
              <input
                type="radio"
                name="rating-2"
                class="mask mask-star-2 bg-yellow-400"
                @input="form.rating = 3"
              />
              <input
                type="radio"
                name="rating-2"
                class="mask mask-star-2 bg-yellow-400"
                @input="form.rating = 4"
              />
              <input
                type="radio"
                name="rating-2"
                class="mask mask-star-2 bg-yellow-400"
                checked
                @input="form.rating = 5"
              />
            </div>
          </div>
        </div>

        <div>
          <div class="pb-2 font-medium">
            Запланировать отзыв
            <span class="text-xs font-normal text-gray-500"
              >(по Московскому времени)</span
            >
          </div>
          <div class="relative w-full p-6 bg-base-200 rounded-lg">
            <div class="absolute left-3 top-3 text-gray-500">
              {{
                form.date <= now
                  ? 'Опубликовать сейчас'
                  : defaultDate(form.date)
              }}
            </div>
            <div class="absolute right-3 top-2 w-30" style="z-index: 9999999">
              <DatePicker v-model="form.date" />
            </div>
          </div>
        </div>
        <div>
          <div class="font-medium">Фото</div>
          <p class="mb-2 text-sm font-light text-gray-500">
            Разрешены фото в формате PNG, JPG.
          </p>
          <ClientOnly>
            <div
              class="flex gap-2 items-center overflow-x-scroll flex-nowrap basis-32 pb-4 scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin scrollbar-rounded-[12px]"
            >
              <div v-for="(photo, index) of form.photos" :key="index">
                <div
                  class="border border-base-300 relative text-primary hover:text-primary-focus cursor-pointer w-32 h-32 hover:bg-base-200 rounded-lg flex-none"
                >
                  <div
                    v-if="photo.url"
                    class="absolute right-0 top-0 z-50"
                    @click="removePhoto(index)"
                  >
                    <label for="photo" class="btn btn-sm btn-circle btn-ghost"
                      >✕</label
                    >
                  </div>

                  <label
                    v-show="!photo.public"
                    class="file-select w-full h-full flex justify-center items-center hover:cursor-pointer"
                  >
                    <div
                      v-show="loadingIndex === index"
                      class="absolute inset-0 flex items-center justify-center"
                    >
                      <Icon name="mdi:loading" class="h-8 w-8 animate-spin" />
                    </div>
                    <input
                      :ref="(el: any) => (inputs[`file${(index + 1)}`] = el)"
                      type="file"
                      accept="image/png, image/gif, image/jpeg"
                      class="hidden"
                      @change="(e: Event) => uploadToS3(e, index)"
                    />
                    <IconCSS
                      v-show="loadingIndex !== index"
                      name="material-symbols:add-photo-alternate-outline"
                      class="text-base-content bg-primary"
                      size="30"
                    />
                  </label>

                  <div v-show="photo.public" class="absolute inset-0">
                    <UseImage :src="photo.public">
                      <template #default>
                        <nuxt-img
                          :src="photo.public"
                          fit="contain"
                          class="w-full h-full object-contain rounded-lg"
                          loading="lazy"
                        />
                      </template>
                      <template #loading>
                        <div
                          class="absolute inset-0 flex items-center justify-center"
                        >
                          <Icon
                            name="mdi:loading"
                            class="h-8 w-8 animate-spin"
                          />
                        </div>
                      </template>
                      <template #error>
                        <div
                          class="absolute inset-0 flex items-center justify-center"
                        >
                          <div class="text-red-500 text-center">
                            Ошибка загрузки
                          </div>
                        </div>
                      </template>
                    </UseImage>
                  </div>
                </div>
              </div>
            </div>
          </ClientOnly>
        </div>
      </div>
      <div class="modal-action justify-between">
        <div>
          <button
            class="btn btn-sm btn-ghost btn-outline border-none text-error"
            @click="clearForm"
          >
            Сбросить
          </button>
        </div>
        <div class="flex gap-2">
          <label
            for="review-modal"
            class="btn btn-sm btn-ghost"
            @click="$emit('close')"
            >Отмена</label
          >
          <button
            for="review-modal"
            class="btn btn-primary btn-sm bg-opacity-20 border-none text-base-content"
            :disabled="!textValidation"
            @click="publishReview"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type='file']::file-selector-button {
  display: none;
}

input[type='file']::-webkit-file-upload-button {
  display: block;
  width: 0;
  height: 0;
  margin-left: -100%;
}

input[type='file']::-ms-browse {
  display: none;
}
</style>
