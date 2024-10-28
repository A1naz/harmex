<script lang="ts" setup>
defineProps({
  items: {
    type: Array as () => Array<any>,
    default: () => [],
  },
  type: {
    type: String,
    default: 'Маркетплейсы',
  },
})
</script>

<template>
  <main class="flex-1 mx-3">
    <h1 class="text-2xl font-bold mb-6" />
    <div class="flex flex-wrap gap-5 w-full justify-start">
      <div v-for="(social, index) in items" :key="index" class="border rounded-lg shadow-md w-[360px] p-3 relative">
        <div class="flex">
          <!-- Контейнер для изображения и текста "Ожидается" -->
          <div class="flex items-center justify-center relative w-[170px] h-[170px]">
            <NuxtImg :src="social.mainImage" :alt="social.name" class="w-full" />
            <!-- Отображаем надпись, если social.disabled -->
            <div v-if="social.disabled" class="overlay">
              Ожидается
            </div>
          </div>

          <div class="pl-4">
            <h2 class="text-[15px] font-semibold">
              {{ social.name }}
            </h2>
            <p class="text-[13px] font-medium">
              Доступные услуги:
            </p>
            <ul class="text-sm text-[#909090] underline text-[13px]">
              <li v-for="(service, i) in social.items.slice(0, 4)" :key="i">
                {{ service.title }}
              </li>
            </ul>
            <NuxtLink
              v-if="!social.disabled" :to="`/catalog/${social.slug}`"
              class="text-[16px] absolute font-medium cursor-pointer bottom-3"
            >
              Смотреть все
              <Icon class="text-[#F72585] -mt-0.5" name="jam:arrow-right" size="18px" />
            </NuxtLink>
          </div>
        </div>
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
  /* Полупрозрачный цвет */
  font-weight: bold;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
  /* Чтобы текст не блокировал клики */
}
</style>
