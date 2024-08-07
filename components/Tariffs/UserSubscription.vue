<script setup lang="ts">
const props = defineProps({
  tariffStats: {
    type: Object as any,
    required: true,
  },
  tariffsValue: {
    type: Boolean,
    required: true,
  },
})
</script>

<template>
  <div class="my-4 bg-base-100 rounded-lg flex flex-col">
    <div
      class="px-3 py-2 bg-[#ebf0ff] dark:bg-primary dark:bg-opacity-10 mx-4 my-3 rounded-lg flex flex-col gap-3"
    >
      <div v-if="!tariffsValue" class="flex flex-col gap-3 p-2">
        Стандартный план для пользователя платформы:
        <span> Покупка товара - 150 руб. за 1 ед. </span>
        <span> Публикация отзыва - 85 руб. за 1 ед. </span>
        <span> Лайки, вопросы, добавление в корзину - 10 руб за 1 ед. </span>
        Хотите получить более выгодные условия, активируйте подходящий для вас
        тарифный план ↓
      </div>

      <div v-else class="flex flex-col gap-2 overflow-x-auto">
        <p class="text-xs font-light">У вас подключена подписка</p>
        <span class="flex gap-3 items-center">
          <p class="text-md text-[#558ff6] dark::text-primary">Basic</p>
          <span class="text-xs text-[#9a9aa0] font-thin"> 3 мес.</span>
        </span>
        <div class="lg:overflow-hidden overflow-x-auto">
          <div
            class="min-w-max grid grid-cols-6 gap-y-3.5 gap-x-3 justify-between"
          >
            <div
              v-for="tariff in tariffStats"
              class="flex flex-col px-5 py-1 bg-[#d6e0ff] dark:bg-primary dark:bg-opacity-5 rounded-lg"
            >
              <Icon
                class="w-6 h-6 text-[#6788f3] dark:text-primar"
                :name="tariff.icon"
              />
              <p class="text-xs mt-0.5 mb-2 text-[#6788f3] dark:text-primar">
                {{ tariff.title }}
              </p>
              <p class="text-xs md:text-lg font-bold mt-auto">
                {{ tariff.value }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
