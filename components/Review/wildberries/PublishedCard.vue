<script setup lang="ts">
import { UseImage } from '@vueuse/components'
const router = useRouter()
const config = useRuntimeConfig()

const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})
const emit = defineEmits([
  'callback',
  'remove',
  'openModal',
  'openImage',
  'removeReview',
])
const { $dayjs } = useNuxtApp()
onMounted(() => {})
const getStatus = computed(() => {
  switch (props.info.status) {
    case 'created':
      return 'Создан'
    case 'waiting':
      return 'В очереди'
    case 'working':
      return 'В работе'
    case 'published':
      return 'Опубликован'
    case 'canceled':
      return 'Отменен'
    case 'nofunds':
      return 'Недостаточно средств'
    case 'deleted':
      return 'Удален'
    case 'deleting':
      return 'На удалении'
  }
})

function openBuyout() {
  router.push(`/buyouts?uuid=${props.info.buyoutuuid}`)
}

function removeReview() {
  emit('removeReview', props.info.id)
}
</script>

<template>
  <div class="buyout-card card bg-base-100 shadow-lg">
    <div
      class="card-body flex-shrink-0 flex flex-col justify-start p-4 relative"
    >
      <div>
        {{ defaultDate(info.date) }}
      </div>
      <div class="flex justify-between item gap-2 mb-2 flex-wrap">
        
        <h2 v-if="info.draftName" class="card-title">{{ info.draftName }}</h2>
        <h2 v-else class="card-title">Отзыв</h2>
        <div class="">
          <span
            :class="{
              'bg-success bg-opacity-50 text-green-500':
                info.status === 'working' || info.status === 'published',
              'bg-warning bg-opacity-50 text-amber-500':
                info.status === 'waiting' ||
                info.status === 'created' ||
                info.status === 'nofunds',
              'bg-error bg-opacity-50 text-red-500':
                info.status === 'canceled' ||
                info.status === 'deleted' ||
                info.status === 'deleting',
            }"
            class="text-black p-1.5 px-4 rounded-lg text-center"
            >{{ getStatus }}
          </span>
          <button
            v-if="info.status === 'published'"
            @click="emit('removeReview', info.id)"
            class="btn btn-sm bg-error text-base-content bg-opacity-50 hover:text-base-100 hover:bg-red-500 hover:bg-opacity-100 ml-1"
          >
            Удалить
          </button>
          <!-- <div
            class="dropdown dropdown-bottom dropdown-end"
            v-if="info.status === 'published'"
          >
            <label tabindex="0" class="btn ml-1 -mr-3 -mt-3 p-1">
              <Icon name="ph:dots-three-outline-vertical-fill" size="18" />
            </label>
            <ul
              tabindex="0"
              class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
              </li>
            </ul>
          </div> -->
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col">
          <div class="relative w-full rounded-lg">
            <label
              class="text-[0.6rem] link link-hover sm:text-[0.8rem] lg:text-xs text-gray-500 hover:text-primary truncate z-10"
              @click="openBuyout"
              >#{{ info.buyoutuuid }}</label
            >
            <div class="truncate">
              {{ info.name }}
            </div>
            <a
              :href="`https://www.ozon.ru/product/${info.article}`"
              target="_blank"
              class="text-sm text-primary link link-hover"
            >
              {{ info.article }}
            </a>
          </div>
        </div>
        

        <div>
          <div class="font-bold">Рейтинг</div>
          <div class="relative w-full rounded-lg">
            <div class="rating gap-2">
              <input
                type="radio"
                disabled
                :checked="info.rating === 1"
                :name="`rating${index}`"
                class="mask mask-star-2 bg-yellow-400"
              />
              <input
                type="radio"
                disabled
                :checked="info.rating === 2"
                :name="`rating${index}`"
                class="mask mask-star-2 bg-yellow-400"
              />
              <input
                type="radio"
                disabled
                :checked="info.rating === 3"
                :name="`rating${index}`"
                class="mask mask-star-2 bg-yellow-400"
              />
              <input
                type="radio"
                disabled
                :checked="info.rating === 4"
                :name="`rating${index}`"
                class="mask mask-star-2 bg-yellow-400"
              />
              <input
                type="radio"
                disabled
                :checked="info.rating === 5"
                :name="`rating${index}`"
                class="mask mask-star-2 bg-yellow-400"
              />
            </div>
          </div>
        </div>
        <div class="w-full">
          <div class="font-bold">Отзыв о товаре</div>
          <div
            class="w-full bg-base-100 h-auto overflow-y-auto scrollbar-thumb-primary scrollbar-track-base-100 scrollbar-thin"
          >
            {{ info.text }}
          </div>
        </div>
        <!-- <div>
          <div class="font-bold">Дата отзыва</div>
          <div class="relative w-full rounded-lg">
            <div>
              {{ defaultDate(info.date) }}
            </div>
          </div>
        </div> -->
        <div>
          <div class="font-bold pb-2">Фото</div>

          <div
            class="flex gap-2 items-center overflow-x-auto flex-nowrap basis-32 pb-4 scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin scrollbar-rounded-[12px]"
          >
            <div v-for="(photo, i) of info.images" :key="i">
              <label v-if="photo" for="reviewImageModal">
                <div
                  class="border border-base-300 relative text-primary hover:text-primary-focus cursor-pointer w-16 h-16 hover:bg-base-200 rounded-lg flex-none"
                  @click="() => emit('openImage', config.public.DOMAIN_API_IMAGES_URL + 'reviewImages/' + photo)"
                >
                  <div class="absolute inset-0">
                    <UseImage :src="config.public.DOMAIN_API_IMAGES_URL + 'reviewImages/' + photo">
                      <template #default>
                        <nuxt-img
                          :src="config.public.DOMAIN_API_IMAGES_URL + 'reviewImages/' + photo"
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
                            class="loader ease-linear h-8 w-8 animate-spin"
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
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
