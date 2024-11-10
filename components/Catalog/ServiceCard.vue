<script setup>
defineProps({
  item: { type: Object, required: true },
  favourites: { type: Array, default: () => [] },
  index: { default: 0 },
})

defineEmits(['setFavourites'])
</script>

<template>
  <div class="card border p-2.5 rounded-lg shadow-md text-center w-[201px]">
    <div>
      <NuxtImg :src="item.mainImage || 'null'" class="mx-auto rounded-xl" width="170px" height="105px" />
      <button
        class="heart-btn absolute top-3 right-5"
        @click="$emit('setFavourites', `/${item.slug}${item.items[index].path}`)"
      >
        <IconCSS
          v-if="favourites.includes(`/${item.slug}${item.items[index].path}`)"
          name="solar:heart-bold"
          class="text-[#1b38ca]"
          size="21"
        />
        <IconCSS
          v-else
          name="solar:heart-outline"
          class="text-[#c8c8c8] heart-outline"
          size="20"
        />
      </button>
      
    </div>
    <div class="w-full text-start mt-3">
      <div class="badge bg-[#FCD1A1] text-[#653600] whitespace-nowrap relative text-[11.5px] text-start -ml-1">
        {{ item.items[index].title }}
      </div>
      <p class="text-[16px] font-bold text-gray-800 mb-2">
        от {{ item.price }} ₽
      </p>
    </div>
    <a v-if="item.items[index].path.includes('https')" :href="`${item.items[index].path}`" target="_blank"  class="btn bg-[#F5F7FF] w-full rounded-xl">
      {{ item.unavailable ? 'Предзаказ' : 'Перейти' }}
    </a>
    <NuxtLink v-else :to="`/${item.slug}${item.items[index].path}`"  class="btn bg-[#F5F7FF] w-full rounded-xl">
      {{ item.unavailable ? 'Предзаказ' : 'Перейти'  }}
    </NuxtLink>
  </div>
</template>

<style scoped>
.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.heart-outline {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover .heart-outline {
  opacity: 1;
}
</style>
