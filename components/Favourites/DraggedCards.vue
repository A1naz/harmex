<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'

interface Favourites {
  uuid: string
  image: string
  title: string
}

const props = defineProps({
  favourites: { type: Array<Favourites>, required: true },
  userFavourites: { type: Array, required: true },
  editMode: { type: Boolean, required: true },
  loading: { type: Boolean, required: true },
})

const emit = defineEmits(['close', 'delete', 'update:favourites', 'set'])
const currentIndex = ref(0)
const favourites = ref(props.favourites)

const setFavourites = (item: any, index: number) => {
  currentIndex.value = index
  emit('set', item)
}

const handleUpdate = (newFavourites: Favourites[]) => {
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
        v-for="(item, index) in !editMode
          ? props.favourites.filter((item) =>
              props.userFavourites.includes(item.uuid)
            )
          : props.favourites"
        :key="item.uuid"
        class="relative flex h-[164px] w-[147px] flex-col gap-1 rounded-[5px] border border-[#EDEDED] bg-white p-3 text-[14px]"
        :class="{ 'cursor-grab': editMode}"
      >
        <div class="relative mt-[5px] flex justify-center">
          <NuxtImg
            :src="item.image"
            width="105px"
            height="84px"
            class="w-full rounded-[5px]"
          />
          <div v-if="editMode" class="absolute -right-2 -top-2.5 flex gap-1.5">
            <button
              @click="$emit('delete', item)"
              class="flex h-6 w-6 items-center justify-center rounded-full border border-[#1b38ca] bg-white text-[#1b38ca]"
            >
              <Icon name="ic:baseline-minus" size="14px" />
            </button>
            <button
              @click="setFavourites(item, index)"
              class="flex h-6 w-6 items-center justify-center rounded-full border"
              :class="`${
                props.userFavourites.includes(item.uuid)
                  ? 'border-white bg-[#1b38ca] text-white'
                  : ' border-[#1b38ca] bg-white text-[#1b38ca]'
              }`"
            >
              <Icon name="ri:pushpin-line" size="16px" />
            </button>
          </div>
        </div>
        <div class="ml-[5px] text-sm font-medium">{{ item.title }}</div>
        <!-- <div v-if="loading && currentIndex === index" class="absolute flex justify-center top-10 right-8 bg-[#1b38ca] loading loading-spinner w-1/2 mx-auto"></div> -->
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
  transform: scaleY(0.01) translate(30px, 0);
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
