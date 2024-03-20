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
  'changeCommentLikes',
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

function changeCommentLikes(type: string, add: boolean, commentId: string) {
  emit('changeCommentLikes', props.info.id, commentId, add, type)
}
</script>

<template>
  <div>
    <div
      v-if="info.likes <= 30 && info.dislikes <= 30"
      class="flex border gap-4 border-base-200 bg-base-100 rounded-lg p-4 w-full min-h-[200px]"
    >
      <div class="flex flex-col px-6 gap-2 h-full w-full">
        <div class="flex justify-between">
          <div class="date text-gray-500 text-sm w-full">
            {{ $dayjs(info.date).format('DD.MM.YYYY') }}
          </div>
          <div class="relative w-full rounded-lg max-w-[85px] sm:max-w-[100px]">
            <Rating
              class="text-yellow-400 gap-1 sm:gap-2"
              :cancel="false"
              :model-value="info.rating"
            />
          </div>
        </div>
        <div class="flex gap-1.5">
          <div class="photo">
            <div class="w-12 h-12 photo-container">
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
        <div v-if="info.text">
          <span class="font-medium">Отзыв:</span>
          <p class="text text-sm max-h-28 overflow-auto rounded-lg pb-2">
            {{ info.text }}
          </p>
        </div>
        <div class="flex flex-col gap-2.5 mt-auto">
          <span class="text-gray-400">Вам помог этот отзыв?</span>
          <div clas="flex">
            <div class="likes flex gap-2 items-center">
              <span>Да</span>
              <div class="relative flex items-center">
                <button
                  :disabled="disabledMinusLikes"
                  class="absolute left-0 btn btn-ghost btn-sm btn-square"
                  @click="removeLike"
                >
                  <IconCSS size="16" name="ic:round-minus" />
                </button>
                <div class="input-sm rounded-lg w-24 text-center bg-base-200">
                  {{ info.likes + addLikes }}
                </div>
                <button
                  :disabled="addLikes >= 15"
                  class="absolute right-0 btn btn-ghost btn-sm btn-square"
                  @click="addLike"
                >
                  <IconCSS size="16" name="ic:round-plus" />
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
                    <IconCSS size="16" name="ic:round-minus" />
                  </button>
                  <div class="input-sm rounded-lg w-24 text-center bg-base-200">
                    {{ info.dislikes + addDislikes }}
                  </div>
                  <button
                    :disabled="addDislikes >= 15"
                    class="absolute right-0 btn btn-ghost btn-sm btn-square"
                    @click="addDislike"
                  >
                    <IconCSS size="16" name="ic:round-plus" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <!-- Карточка комментов -->
          <!-- Карточка комментов -->
          <!-- Карточка комментов -->
          <div
            v-for="comment in info.comments"
            class="flex flex-col pl-7 gap-3 h-full w-full"
            v-if="info.comments.length"
          >
            <div class="flex gap-1 mt-5 -mb-2">
              <div class="photo">
                <div class="w-12 h-12 photo-container">
                  <Icon
                    name="mdi:account"
                    size="40"
                    class="bg-base-300 p-2 rounded-full opacity-40"
                  />
                </div>
              </div>
              <div class="userinfo my-auto">
                <div class="name font-bold mb-2">
                  {{ comment.user.name }}
                </div>
              </div>
            </div>
            <div>
              <p class="text text-md overflow-auto rounded-lg">
                {{ comment.text }}
              </p>
            </div>
            <div class="flex flex-col gap-2.5 mt-auto">
              <span class="text-gray-400">Вам помог этот комментарий?</span>
              <div clas="flex">
                <div class="likes flex gap-2 items-center">
                  <span>Да</span>
                  <div class="relative flex items-center">
                    <button
                      :disabled="
                        comment.likes + comment.addLikes <= comment.likes
                      "
                      class="absolute left-0 btn btn-ghost btn-sm btn-square"
                      @click="
                        ;[
                          comment.addLikes--,
                          changeCommentLikes('likes', false, comment.id),
                        ]
                      "
                    >
                      <IconCSS size="16" name="ic:round-minus" />
                    </button>
                    <div
                      class="input-sm rounded-lg w-24 text-center bg-base-200"
                    >
                      {{ comment.likes + comment.addLikes }}
                    </div>
                    <button
                      :disabled="comment.likes + comment.addLikes >= 15"
                      class="absolute right-0 btn btn-ghost btn-sm btn-square"
                      @click="
                        ;[
                          comment.addLikes++,
                          changeCommentLikes('likes', true, comment.id),
                        ]
                      "
                    >
                      <IconCSS size="16" name="ic:round-plus" />
                    </button>
                  </div>
                  <div class="dislikes flex gap-2 items-center">
                    <span>Нет</span>
                    <div class="relative flex items-center ml-auto">
                      <button
                        :disabled="
                          comment.dislikes + comment.addDislikes <=
                          comment.dislikes
                        "
                        class="absolute left-0 btn btn-ghost btn-sm btn-square"
                        @click="
                          ;[
                            comment.addDislikes--,
                            changeCommentLikes('dislikes', false, comment.id),
                          ]
                        "
                      >
                        <IconCSS size="16" name="ic:round-minus" />
                      </button>
                      <div
                        class="input-sm rounded-lg w-24 text-center bg-base-200"
                      >
                        {{ comment.dislikes + comment.addDislikes }}
                      </div>
                      <button
                        :disabled="comment.dislikes + comment.addDislikes >= 15"
                        class="absolute right-0 btn btn-ghost btn-sm btn-square"
                        @click="
                          ;[
                            comment.addDislikes++,
                            changeCommentLikes('dislikes', true, comment.id),
                          ]
                        "
                      >
                        <IconCSS size="16" name="ic:round-plus" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Карточка комментов -->
          <!-- Карточка комментов -->
          <!-- Карточка комментов -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
