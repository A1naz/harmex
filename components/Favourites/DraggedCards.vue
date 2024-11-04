<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'

const props = defineProps({
  favourites: { type: Array<Favourites>, required: true },
  userFavourites: { type: Array<Favourites>, required: true },
  editMode: { type: Boolean, required: true },
  loading: { type: Boolean, required: true },
})

const emit = defineEmits(['close', 'delete', 'update:favourites', 'set'])

definePageMeta({
  middleware: 'auth',
  layout: 'app',
  title: 'Избранное',
})

interface Favourites {
  path: string
  image: string
  title: string
}

const currentPath = ref('')
const favourites = ref(props.favourites) as any

watch(
  () => props.favourites,
  (newFavourites) => {
    favourites.value = [...newFavourites]
  },
  { immediate: true },
)

function setFavourites(item: any, index: number) {
  currentPath.value = item.path
  emit('set', item)
}

function handleUpdate(newFavourites: Favourites[]) {
  emit('update:favourites', newFavourites)
}
</script>

<template>
  <VueDraggable
    v-model="favourites"
    class="flex w-full flex-wrap justify-center gap-2 sm:justify-start sm:gap-6"
    target=".sort-target"
    :disabled="!editMode"
    :scroll="true"
    @end="handleUpdate(favourites)"
  >
    <TransitionGroup type="transition" tag="ul" name="fade" class="sort-target">
      <li
        v-for="(item, index) in editMode ? favourites : props.userFavourites"
        :key="item.path"
        class="relative flex h-[164px] w-[147px] flex-col gap-1 rounded-[5px] border border-[#EDEDED] bg-white p-3 text-[14px]"
        :class="{ 'cursor-grab': editMode }"
      >
        <div class="relative mt-[5px] flex justify-center">
          <NuxtImg
            :src="item.image"
            width="105px"
            height="84px"
            class="w-full rounded-[5px]"
          />

          <div v-if="editMode" class="absolute -right-2 -top-2.5 flex gap-1.5">
            <!-- <button
              class="flex h-6 w-6 items-center justify-center rounded-full border border-[#1b38ca] bg-white text-[#1b38ca]"
              @click="$emit('delete', item)"
            >
              <Icon name="ic:baseline-minus" size="14px" />
            </button> -->
            <button
              class="flex h-6 w-6 items-center justify-center rounded-full border"
              :disabled="currentPath === index && loading"
              :class="{
                'border-white bg-[#1b38ca] text-white': props.userFavourites.some(fav =>
                  fav.items && fav.items.some(favItem => favItem.path === item.path),
                ),
                'border-[#1b38ca] bg-white text-[#1b38ca]': !props.userFavourites.some(fav =>
                  fav.items && fav.items.some(favItem => favItem.path === item.path),
                ),
                'loading loading-spinner w-full bg-[#1b38ca] text-[#1b38ca] ': currentPath === item.path && loading,
              }"
              @click="setFavourites(item, index)"
            >
              <Icon name="ri:pushpin-line" size="16px" />
            </button>
          </div>
          {{}}
        </div>
        <div class="ml-[5px] text-sm font-medium">
          {{ item.title }}
        </div>
        <!-- <div v-if="loading && currentPath === index" class="absolute flex justify-center top-10 right-8 bg-[#1b38ca] loading loading-spinner w-1/2 mx-auto"></div> -->
      </li>
    </TransitionGroup>
  </VueDraggable>
</template>

<style scoped>
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0) translate(30px, 0);
}

.fade-leave-active {
  position: absolute;
}

.sort-target {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .sort-target {
    justify-content: flex-start;
    gap: 1.5rem;
  }
}
</style>
