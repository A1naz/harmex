<script setup lang="ts">
const props = defineProps({
  value: {
    type: Object as any,
    required: true,
  },
  firstTariff: {
    type: String,
    required: true,
  },
  secondTariff: {
    type: String,
    required: true,
  },
  form: {
    type: Object as any,
    required: true,
  },
})

const ratingList = ref(true)
const factorsList = ref(true)

const ratingValue = computed(() => {
  const titles = [
    'Покупка товаров, шт.',
    'Публикация отзывов, шт.',
    'Лайки на бренд, шт.',
    'Вопросы бренду / товару, шт.',
    'Добавление в корзину, шт.',
  ]

  const ratings = titles.map((title) => ({
    title: title,
    demo: findRating('DEMO', title),
    start: findRating('START', title),
    pro: findRating('PRO', title),
    vip: findRating('VIP', title),
  }))

  function findRating(tariff: any, title: any) {
    const tariffData = props.value.tariffs.find(
      (data: any) => data.title === tariff
    )
    if (tariffData) {
      const item = tariffData.ratingIncrease.find(
        (item: any) => item.title === title
      )
      if (item) {
        return item[props.form.dateRange.replace('months', '')]
      }
    }
    return 0
  }

  return ratings
})

const factorsValue = computed(() => {
  const titles = [
    'Клики по карточке, шт.',
    'Выкуп в ближайшее время, шт.',
    'Добавление конкурентов в корзину, шт.',
    'Изучение карточки 60 секунд, шт.',
    'Выкупить с рекламы, шт.',
    'Выкупить с сортировки, шт.',
  ]
  if(props.form.type == 'key'){
    titles.push('Логистика (доп оплата)', 'Базовая стратегия, SKU')
  }

  const ratings = titles.map((title) => ({
    title: title,
    demo: findRating('DEMO', title),
    start: findRating('START', title),
    pro: findRating('PRO', title),
    vip: findRating('VIP', title),
  }))

  function findRating(tariff: any, title: any) {
    const tariffData = props.value.tariffs.find(
      (data: any) => data.title === tariff
    )
    if (tariffData) {
      const item = tariffData.factors.find(
        (item: any) => item.title === title
      )
      if (item) {
        return item[props.form.dateRange.replace('months', '')]
      }
    }
    return 0
  }

  return ratings
})
</script>

<template>

  <div class="md:w-[95%] w-full ml-[auto] mr-[auto] flex flex-col mt-5">
    <div class="collapse collapse-arrow bg-base-100 rounded-box z-0">
      <input v-model="ratingList" type="checkbox" />
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-lg font-bold">Повышение рейтинга</div>
      </div>
      <div class="collapse-content pb-0">
        <div
          v-for="tariff in ratingValue"
          class="flex flex-col md:hidden px-5 pt-5 py-1 rounded-lg w-full"
        >
          <span class="text-sm font-bold mb-1">{{ tariff.title }}</span>
          <div class="flex w-full">
            <div
              class="flex w-1/2 border-b border-[#e5e7e8] dark:border-[#1a1817]"
            >
              <Icon
                v-if="tariff[firstTariff.toLowerCase()] === 0"
                name="mingcute:close-line"
                size="25"
                class="text-[#f9654b]"
              />
              <span v-else>{{ tariff[firstTariff.toLowerCase()] }}</span>
            </div>
            <div
              class="flex w-1/2 border-b border-[#e5e7e8] dark:border-[#1a1817]"
            >
              <Icon
                v-if="tariff[secondTariff.toLowerCase()] === 0"
                name="mingcute:close-line"
                size="25"
                class="text-[#f9654b]"
              />
              <span v-else>{{ tariff[secondTariff.toLowerCase()] }}</span>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto hidden md:flex">
          <table
            class="table table-zebra border-b border-[#e5e7e8] dark:border-[#1a1817]"
          >
            <tbody>
              <tr></tr>
              <tr v-for="(value, index) in ratingValue" :key="index">
                <th
                  class="w-1/5 border-r border-[#e5e7e8] dark:border-[#1a1817]"
                >
                  {{ value.title }}
                </th>
                <td
                  class="w-1/5 text-center border-r border-[#e5e7e8] dark:border-[#1a1817]"
                >
                  <Icon
                    v-if="value.demo === 0"
                    name="mingcute:close-line"
                    size="25"
                    class="w-10 text-[#f9654b]"
                  />
                  <span v-else>
                    {{ value.demo }}
                  </span>
                </td>
                <td
                  class="w-1/5 text-center border-r border-[#e5e7e8] dark:border-[#1a1817]"
                >
                  <div class="flex w-full justify-center">
                    <Icon
                      v-if="value.start === 0"
                      name="mingcute:close-line"
                      size="25"
                      class="w-10 text-[#f9654b]"
                    />
                    <span v-else>
                      {{ value.start }}
                    </span>
                  </div>
                </td>
                <td class="w-1/5 text-center border-r-4 border-[#25ba7b]">
                  <div class="flex w-full justify-center">
                    <Icon
                      v-if="value.pro === 0"
                      name="mingcute:close-line"
                      size="25"
                      class="w-8 text-[#f9654b]"
                    />
                    <span v-else>
                      {{ value.pro }}
                    </span>
                  </div>
                </td>
                <td class="w-1/5 text-center border-r-4 border-[#25ba7b]">
                  <div class="flex w-full justify-center">
                    <Icon
                      v-if="value.vip === 0"
                      name="mingcute:close-line"
                      size="25"
                      class="text-[#f9654b]"
                    />
                    <span v-else>
                      {{ value.vip }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="collapse collapse-arrow bg-base-100 rounded-box z-0">
      <input v-model="factorsList" type="checkbox" />
      <div class="collapse-title relative text-xl font-medium">
        <div class="flex gap-4 text-lg font-bold">Поведенческие факторы</div>
      </div>
      <div class="collapse-content pb-0">
        <div
          v-for="tariff in factorsValue"
          class="flex flex-col md:hidden px-5 pt-5 py-1 rounded-lg w-full"
        >
          <span class="text-sm font-bold mb-1">{{ tariff.title }}</span>
          <div class="flex w-full">
            <div
              class="flex w-1/2 border-b border-[#e5e7e8] dark:border-[#1a1817]"
            >
              <Icon
                v-if="tariff[firstTariff.toLowerCase()] === 0"
                name="mingcute:close-line"
                size="25"
                class="text-[#f9654b]"
              />
              <span v-else>{{ tariff[firstTariff.toLowerCase()] }}</span>
            </div>
            <div
              class="flex w-1/2 border-b border-[#e5e7e8] dark:border-[#1a1817]"
            >
              <Icon
                v-if="tariff[secondTariff.toLowerCase()] === 0"
                name="mingcute:close-line"
                size="25"
                class="text-[#f9654b]"
              />
              <span v-else>{{ tariff[secondTariff.toLowerCase()] }}</span>
            </div>
          </div>
        </div>
        <div class="overflow-x-auto hidden md:flex">
          <table
            class="table table-zebra border-b border-[#e5e7e8] dark:border-[#1a1817]"
          >
            <tbody>
              <tr></tr>
              <tr v-for="(value, index) in factorsValue" :key="index">
                <th
                  class="w-1/5 border-r border-[#e5e7e8] dark:border-[#1a1817]"
                >
                  {{ value.title }}
                </th>
                <td
                  class="w-1/5 text-center border-r border-[#e5e7e8] dark:border-[#1a1817]"
                >
                  <Icon
                    v-if="value.demo === 0"
                    name="mingcute:close-line"
                    size="25"
                    class="w-10 text-[#f9654b]"
                  />
                  <span v-else>
                    {{ value.demo }}
                  </span>
                </td>
                <td
                  class="w-1/5 text-center border-r border-[#e5e7e8] dark:border-[#1a1817]"
                >
                  <div class="flex w-full justify-center">
                    <Icon
                      v-if="value.start === 0"
                      name="mingcute:close-line"
                      size="25"
                      class="text-[#f9654b]"
                    />
                    <span v-else>
                      {{ value.start }}
                    </span>
                  </div>
                </td>
                <td class="w-1/5 text-center border-r-4 border-[#25ba7b]">
                  <div class="flex w-full justify-center">
                    <Icon
                      v-if="value.pro === 0"
                      name="mingcute:close-line"
                      size="25"
                      class="text-[#f9654b]"
                    />
                    <span v-else>
                      {{ value.pro }}
                    </span>
                  </div>
                </td>
                <td class="w-1/5 text-center border-r-4 border-[#25ba7b]">
                  <div class="flex w-full justify-center">
                    <Icon
                      v-if="value.vip === 0"
                      name="mingcute:close-line"
                      size="25"
                      class="text-[#f9654b]"
                    />
                    <span v-else>
                      {{ value.vip }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
