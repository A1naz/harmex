<script setup lang="ts">
const props = defineProps({
  data: { type: Array<any>, required: true, default: () => [] },
  loading: { type: Boolean, required: true },
})

const emit = defineEmits(['closeModal', 'search'])
const show = ref(false)
const loadingData = toRef(props, 'loading')
const searchCompleted = ref(false)

const isVisible = computed(() => {
  return (
    props.data.length > 0
    && !props.loading
    && show.value
    && searchQuery.value.trim() !== ''
    && searchCompleted.value
  )
})

const searchInput = useDebounceFn(search, 500)
const searchQuery = ref('')

function onInput() {
  searchCompleted.value = false
  searchInput()
}

function search() {
  if (searchQuery.value == '' || searchQuery.value.trim() == '') {
    return
  }
  searchCompleted.value = false
  emit('search', searchQuery.value)
}

watch(loadingData, (newVal) => {
  if (!newVal) {
    searchCompleted.value = true
  }
})

function close() {
  show.value = false
}
</script>

<template>
  <Transition name="slide-fade">
    <div
      v-if="isVisible || (show && searchCompleted && searchQuery.trim() !== '')"
      class="fixed inset-0 z-[9998]"
      :class="isVisible || (show && searchCompleted && searchQuery.trim() !== '')
        ? 'bg-black bg-opacity-10 backdrop-blur-[1px]'
        : ''"
      @click="close"
    />
  </Transition>

  <div
    class="flex flex-col items-center gap-2 w-full ml-4 relative"
    :class="isVisible || (show && searchCompleted && searchQuery.trim() !== '')
      ? 'z-[9998]'
      : ''"
  >
    <label class="flex items-center gap-2 w-full ml-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск по услуге, категории, функционалу и справочнику"
        class="input input-bordered w-full border-[#1B38CA] bg-white outline-none"
        @input="onInput()"
        @focus="show = true"
      >
      <Icon name="mynaui:search" size="25" class="-ml-12 bg-white rounded-lg" />
    </label>

    <Transition name="slide-fade">
      <div
        v-if="isVisible || (show && searchCompleted && searchQuery.trim() !== '')"
        class="flex flex-col absolute w-[98%] ml-4"
        style="top: calc(100% + 0.5rem)"
      >
        <div
          v-if="isVisible"
          class="flex flex-col gap-1 w-full text-center z-[99999] p-3 pb-1 rounded-lg bg-white max-h-[600px] overflow-y-auto"
          @click.stop
        >
          <div v-for="item in data" :key="item.slug" class="flex flex-col">
            <NuxtLink
              :to="`/catalog/${item.slug}`"
              class="bg-transparent text-[#909090] hover:text-black rounded-lg hover:bg-[#f5f7ff] py-2 px-4 border border-white transition w-full"
            >
              {{ item?.name }}
            </NuxtLink>
          </div>

          <div v-for="item in data" :key="item.slug" class="flex flex-col">
            <div v-for="service in item.items" :key="service.path" class="flex flex-col">
              <NuxtLink
                :to="`/${item.slug}${service.path}`"
                class="bg-transparent flex hover:text-black rounded-lg hover:bg-[#f5f7ff] py-2 px-4 border border-white transition w-full"
              >
                <div class="rounded-lg flex items-center justify-center max-w-[150px]">
                  <nuxt-img
                    :src="item.mainImage"
                    class="responsive-image"
                    height="178px"
                  />
                </div>
                <div class="ml-4 flex flex-col gap-1">
                  <span class="text-start font-bold"> {{ service?.price || 0 }} </span>
                  <span class="text-start"> {{ service?.title }} </span>
                  <div class="flex gap-5 justify-between text-sm">
                    <span>Продвинуто: {{ service?.advanced ? service?.advanced : 0 }}</span>
                    <div class="flex gap-0.5">
                      <Icon
                        name="pepicons-pop:star-filled"
                        size="18"
                        class="text-[#ff9966] rounded-lg w-full flex my-auto"
                      />
                      <span> {{ service?.rating ? service?.rating : 0 }} </span>
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>

          <button
            class="text-secondary bg-white hover:text-black rounded-lg hover:bg-[#f5f7ff] py-1 px-4 border border-white transition w-full"
            @click=";[(show = false), navigateTo('/catalog')]"
          >
            Смотреть все
          </button>
        </div>

        <div
          v-else-if="show && searchCompleted && searchQuery.trim() !== ''"
          class="flex flex-col gap-1 w-full text-center z-[99999] p-3 rounded-lg bg-white"
          @click.stop
        >
          Ничего не найдено {{ searchQuery }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}
</style>
