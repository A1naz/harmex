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
    default: "Маркетплейсы",
  },
});

defineEmits(["setFavourites", "vote"]);
</script>

<template>
  <main class="flex-1 mx-3">
    <div class="flex flex-wrap gap-5 w-full justify-start">
      <div
        v-for="(social, index) in items"
        :key="index"
        class="card border rounded-lg shadow-md w-[250px] p-3 relative"
      >
        <div class="flex flex-col gap-2 w-full">
          <div
            class="flex items-start justify-center w-full relative h-24 overflow-hidden rounded-lg cursor-pointer"
          >
            <NuxtImg
              :src="social.mainImage"
              :alt="social.name"
              class="w-full h-full object-cover cursor-pointer"
              @click="
                social.disabled ? '' : navigateTo(`/catalog/${social.slug}`)
              "
            />
          </div>

          <button
            v-if="!social.disabled"
            class="heart-btn absolute top-3 right-4"
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
          <h2
            class="text-[20px] font-semibold cursor-pointer"
            @click="
              social.disabled ? '' : navigateTo(`/catalog/${social.slug}`)
            "
          >
            {{ social.name }}
          </h2>
          <div>
            <p class="text-[15px] font-normal">Доступные услуги:</p>
            <div class="flex flex-wrap gap-x-5 text-[#fe6601c2] text-[15px]">
              <NuxtLink
                :to="social.disabled ? '' : `/${social.slug}${service.path}`"
                v-for="(service, i) in social.items.slice(0, 5)"
                :key="i"
              >
                <Icon
                  name="clarity:paperclip-line"
                  size="16"
                  class="text-[#c2c2c2]"
                />

                {{ service.title }}
              </NuxtLink>
            </div>
          </div>
          <div
            v-if="!social.disabled"
            class="flex w-full justify-center self-end mt-7"
          >
            <NuxtLink
              :to="`/catalog/${social.slug}`"
              class="text-[16px] w-[calc(100%-24px)] py-0.5 flex justify-center font-medium cursor-pointe absolute bottom-3 border border-1 border-gray-200 hover:text-[#F72585]"
            >
              Смотреть все
            </NuxtLink>
          </div>
        </div>
        <button
          v-if="social.disabled"
          class="px-5 py-2 bg-[#48b752] text-xl rounded-lg text-white text-[16px] absolute font-medium cursor-pointer top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-[#3a9642] active:scale-95 active:shadow-md"
          style="z-index: 10"
          @click="$emit('vote', social.slug)"
        >
          Запросить
        </button>

        <div
          v-if="social.disabled"
          class="absolute inset-0 bg-black opacity-70 pointer-events-none rounded-lg"
        />
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
