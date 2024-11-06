<script lang="ts" setup>
defineProps({
  items: {
    type: Array as () => Array<any>,
    default: () => [],
  },
  favourites: {
    type: Array as () => Array<any>,
    default: () => [],
  },
  type: {
    type: String,
    default: 'Маркетплейсы',
  },
})

defineEmits(['setFavourites', 'vote'])
</script>

<template>
  <main class="flex-1 mx-3">
    <h1 class="text-2xl font-bold mb-6" />
    <div class="flex flex-wrap gap-5 w-full justify-start">
      <div
        v-for="(social, index) in items"
        :key="index"
        class="card border rounded-lg shadow-md w-[360px] p-3 relative "
      >
        <div class="flex w-full">
          <div class="flex items-center justify-center w-[170px] h-[170px] relative">
            <NuxtImg
              :src="social.mainImage"
              :alt="social.name"
              class="w-full"
            />
          </div>
          <div class="pl-4">
            <button
              v-if="!social.disabled"
              class="heart-btn absolute top-2 right-2"
              @click="$emit('setFavourites', `/catalog/${social.slug}`)"
            >
              <IconCSS
                v-if="favourites.includes(`/catalog/${social.slug}`)"
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
            <h2 class="text-[15px] font-semibold">
              {{ social.name }}
            </h2>
            <p class="text-[13px] font-medium">
              Доступные услуги:
            </p>
            <ul class="text-sm text-[#909090] underline text-[13px]">
              <li v-for="(service, i) in social.items.slice(0, 5)" :key="i">
                {{ service.title }}
              </li>
            </ul>
            <NuxtLink
              v-if="!social.disabled"
              :to="`/catalog/${social.slug}`"
              class="text-[16px] absolute font-medium cursor-pointer bottom-2 hover:text-[#F72585]"
            >
              Смотреть все
              <Icon class="text-[#F72585] -mt-0.5" name="jam:arrow-right" size="18px" />
            </NuxtLink>
          </div>
        </div>
        <button
          v-if="social.disabled"
          class="z-10 px-5 py-2 bg-[#48b752] text-xl rounded-lg text-white text-[16px] absolute font-medium cursor-pointer top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-[#3a9642] active:scale-95 active:shadow-md"
          @click="$emit('vote', social.slug)"
        >
          Запросить
        </button>

        <div v-if="social.disabled" class="absolute inset-0 bg-black opacity-70 pointer-events-none rounded-lg" />
      </div>
    </div>
  </main>
</template>

<style scoped>
.overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 36px;
  color: rgba(0, 0, 0, 0.35);
  font-weight: bold;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
}

.heart-outline {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover .heart-outline {
  opacity: 1;
}
</style>
