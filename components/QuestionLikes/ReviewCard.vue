<script setup lang="ts">
import Rating from 'primevue/rating'

const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  addLikes: {
    type: Number,
    required: true,
  },
  addDislikes: {
    type: Number,
    required: true,
  },
  article: {
    type: String,
  },
})
const emit = defineEmits([
  'addLike',
  'removeLike',
  'addDislike',
  'removeDislike',
])

const disabledMinusLikes = computed(() => {
  return props.addLikes <= 0
})
const disabledMinusDislikes = computed(() => {
  return props.addDislikes <= 0
})
function addLike() {
  emit('addLike', props.info.id)
}
function removeLike() {
  emit('removeLike', props.info.id)
}

function addDislike() {
  emit('addDislike', props.info.id)
}
function removeDislike() {
  emit('removeDislike', props.info.id)
}
</script>

<template>
  <div v-if="info.likes <= 30 && info.dislikes <= 30" class="flex border gap-4 border-base-200 bg-base-100 rounded-lg p-4 w-full ">
    <div class="flex flex-col gap-3 h-full w-full">
      <div class="flex justify-between">
        <div class="date text-gray-500 text-sm w-full">
          {{ $dayjs(info.date).format('DD.MM.YYYY') }}
        </div>
        <div class="relative w-full rounded-lg max-w-[85px] sm:max-w-[100px]">
          <Rating
            class="flex flex-row items-center text-yellow-400 gap-1 sm:gap-2"
            :cancel="false"
            :model-value="info.rating"
          />
        </div>
      </div>
      <div class="flex gap-1.5">
        <div class="photo">
          <div class="w-12 h-12 photo-container">
            <!-- <nuxt-img class="rounded-xl" src="/img/Profile.png" /> -->
            <Icon
              name="mdi:account"
              size="40"
              class="bg-base-300 p-2 rounded-full opacity-40"
            />
          </div>
        </div>
        <div class="userinfo my-auto">
          <div class="name font-bold mb-2">
            {{ info.user.name }}
          </div>
        </div>
      </div>
      <div class="flex text-primary">
        <span> {{ article }}</span>
      </div>
      <div>
        <span class="font-medium">Отзыв:</span>
        <p class="text text-sm max-h-28 overflow-auto rounded-lg pb-2">
          {{ info.text }}
        </p>
      </div>
      <div class="flex flex-col gap-2.5 mt-auto">
        <span class="text-gray-400">Вам помог этот отзыв?</span>
        <div clas="flex">
          <div class="likes flex gap-2 items-center ">
            <span>Да</span>
            <div class="relative flex items-center">
              <button
                :disabled="disabledMinusLikes"
                class="absolute left-0 btn btn-ghost btn-sm btn-square"
                @click="removeLike"
              >
                <Icon size="16" name="ic:round-minus" />
              </button>
              <div class="input-sm rounded-lg w-24 text-center bg-base-200">
                {{ info.likes + addLikes }}
              </div>
              <button
                :disabled="addLikes >= 15"
                class="absolute right-0 btn btn-ghost btn-sm btn-square"
                @click="addLike"
              >
                <Icon size="16" name="ic:round-plus" />
              </button>
            </div>
            <div class="dislikes flex gap-2 items-center">
              <span>Нет</span>
              <div class="relative flex items-center ml-auto">
                <button
                  :disabled="disabledMinusDislikes"
                  class="absolute left-0 btn btn-ghost btn-sm btn-square"
                  @click="removeDislike"
                >
                  <Icon size="16" name="ic:round-minus" />
                </button>
                <div class="input-sm rounded-lg w-24 text-center bg-base-200">
                  {{ info.dislikes + addDislikes }}
                </div>
                <button
                  :disabled="addDislikes >= 15"
                  class="absolute right-0 btn btn-ghost btn-sm btn-square"
                  @click="addDislike"
                >
                  <Icon size="16" name="ic:round-plus" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="review flex flex-col w-full">
      <div class="flex justify-between items-center">

      </div>

      <div
        class="rank mt-6 flex flex-col xl:flex-row justify-between gap-6 items-center"
      >
        <div class="likes flex gap-2 items-center w-full">
          <span class="emoji">👍</span>
          <span>Лайков:</span>
          <div class="relative flex items-center ml-auto">
            <button
              :disabled="disabledMinusLikes"
              class="absolute left-0 btn btn-ghost btn-sm btn-square"
              @click="removeLike"
            >
              <Icon size="16" name="ic:round-minus" />
            </button>
            <div class="input-sm rounded-lg w-24 text-center bg-base-200">
              {{ info.likes + addLikes }}
            </div>
            <button
              :disabled="addLikes >= 15"
              class="absolute right-0 btn btn-ghost btn-sm btn-square"
              @click="addLike"
            >
              <Icon size="16" name="ic:round-plus" />
            </button>
          </div>
        </div>
        <div class="dislikes flex gap-2 items-center w-full">
          <span class="emoji">👎</span>
          <span>Дизлайков:</span>
          <div class="relative flex items-center ml-auto">
            <button
              :disabled="disabledMinusDislikes"
              class="absolute left-0 btn btn-ghost btn-sm btn-square"
              @click="removeDislike"
            >
              <Icon size="16" name="ic:round-minus" />
            </button>
            <div class="input-sm rounded-lg w-24 text-center bg-base-200">
              {{ info.dislikes + addDislikes }}
            </div>
            <button
              :disabled="addDislikes >= 15"
              class="absolute right-0 btn btn-ghost btn-sm btn-square"
              @click="addDislike"
            >
              <Icon size="16" name="ic:round-plus" />
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="addLikes >= 15 || addDislikes >= 15"
        class="warning text-warning text-center mt-4"
      >
        Не рекомендуем добавлять больше 15 лайков/дизлайков
      </div>
    </div> -->
  </div>
</template>

<style scoped></style>
