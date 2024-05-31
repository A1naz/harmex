<script setup lang="ts">
const props = defineProps({
  mpArray: {
    type: Object as any,
    required: true,
  },
  currentMp: {
    type: Array as any,
    required: true,
  },
  form: {
    type: Object as any,
    required: true,
  },
  images: {
    type: Array as any,
    required: true,
  },
  tariffs: {
    type: Array as any,
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
})

const emit = defineEmits(['setMp', 'setFirstTariff', 'setSecondTariff'])
function setMp(value: string) {
  emit('setMp', value)
}

function setFirstTariff(value: string) {
  emit('setFirstTariff', value)
}

function setSecondTariff(value: string) {
  emit('setSecondTariff', value)
}
</script>

<template>
  <div
    class="flex flex-col gap-y-4 px-1.5 py-4 bg-gradient-to-r from-[#e9f7ff] to-[#96afff] dark:from-[#172038] dark:to-[#1b1f38] rounded-lg"
  >
    <div class="flex justify-between">
      <div class="flex w-full space-x-4">
        <CustomSelect
          :dropdownContainer="'w-full md:hidden'"
          :class="'bg-base-100 w-full md:hidden'"
          :tabs="mpArray.pages.filter((page:any) => !page.test)"
          @change-value="(value) => setMp(value.value)"
        />
        <button
          v-for="(image, index) in images"
          :key="index"
          class="hidden md:flex flex-grow rounded-lg justify-center"
          :class="{
            'hover:cursor-not-allowed': !currentMp.includes(
              image.replace('.svg', '')
            ),
          }"
          @click="setMp(image.replace('.svg', ''))"
        >
          <nuxt-img
            class="p-1.5 rounded-lg"
            :class="{ 'bg-base-100': form.mp == image.replace('.svg', '') }"
            :src="`https://ozonmpportal.hb.vkcs.cloud/tariffsImages/${image}`"
            :alt="'mp' + (index + 1)"
          />
        </button>
      </div>
    </div>

    <div class="flex justify-between">
      <button
        class="btn border-none w-[32%] text-lg"
        @click="
          form.title == 'Запуск' ? (form.title = '') : (form.title = 'Запуск')
        "
        :class="{
          'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
            form.title == 'Запуск',
          'bg-base-100 text-base-content': form.title != 'Запуск',
        }"
      >
        Запуск
      </button>
      <button
        class="btn border-none w-[32%] text-lg"
        @click="
          form.title == 'Рост' ? (form.title = '') : (form.title = 'Рост')
        "
        :class="{
          'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
            form.title == 'Рост',
          'bg-base-100 text-base-content': form.title != 'Рост',
        }"
      >
        Рост
      </button>
      <button
        class="btn border-none w-[32%] text-lg"
        @click="
          form.title == 'Поддержка'
            ? (form.title = '')
            : (form.title = 'Поддержка')
        "
        :class="{
          'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
            form.title == 'Поддержка',
          'bg-base-100 text-base-content': form.title != 'Поддержка',
        }"
      >
        Поддержка
      </button>
    </div>
    <div class="flex justify-between">
      <button
        class="btn border-none w-[49%] text-lg"
        @click="
          form.type == 'Базовый' ? (form.type = '') : (form.type = 'Базовый')
        "
        :class="{
          'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
            form.type == 'Базовый',
          'bg-base-100 text-base-content': form.type != 'Базовый',
        }"
      >
        Базовый
      </button>
      <button
        class="btn border-none w-[49%] text-lg"
        @click="
          form.type == 'Под ключ'
            ? (form.type = '')
            : (form.type = 'Под ключ')
        "
        :class="{
          'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
            form.type == 'Под ключ',
          'bg-base-100 text-base-content': form.type != 'Под ключ',
        }"
      >
        Под ключ
      </button>
    </div>
    <div class="flex justify-between">
      <button
        class="btn border-none w-[24%] whitespace-nowrap pt-1 md:pt-0 md:text-lg"
        @click="
          form.dateRange == 'everyMonth'
            ? (form.dateRange = '')
            : (form.dateRange = 'everyMonth')
        "
        :class="{
          'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
            form.dateRange == 'everyMonth',
          'bg-base-100 text-base-content': form.dateRange != 'everyMonth',
        }"
      >
        Ежемесячно
      </button>
      <button
        class="btn border-none w-[24%] whitespace-nowrap pt-1 md:pt-0 md:text-lg relative"
        @click="
          form.dateRange == '3month'
            ? (form.dateRange = '')
            : (form.dateRange = '3month')
        "
        :class="{
          'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
            form.dateRange == '3month',
          'bg-base-100 text-base-content': form.dateRange != '3month',
        }"
      >
        3 месяца
        <span
          class="absolute top-0 right-0 rounded-2xl text-xs bg-[#ffdc60] dark:bg-[#FF4500] py-0.5 px-1 text-[8px]"
        >
          Рассрочка
        </span>
      </button>

      <button
        class="btn border-none w-[24%] whitespace-nowrap pt-1 md:pt-0 md:text-lg relative"
        @click="
          form.dateRange == '6month'
            ? (form.dateRange = '')
            : (form.dateRange = '6month')
        "
        :class="{
          'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
            form.dateRange == '6month',
          'bg-base-100 text-base-content': form.dateRange != '6month',
        }"
      >
        6 месяцев
        <span
          class="absolute top-0 right-0 rounded-2xl text-xs bg-[#ffdc60] dark:bg-[#FF4500] py-0.5 px-1 text-[8px]"
        >
          Рассрочка
        </span>
      </button>
      <button
        class="btn border-none w-[24%] text-xs whitespace-nowrap pt-1 md:pt-0 md:text-lg relative"
        @click="
          form.dateRange == '12month'
            ? (form.dateRange = '')
            : (form.dateRange = '12month')
        "
        :class="{
          'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
            form.dateRange == '12month',
          'bg-base-100 text-base-content': form.dateRange != '12month',
        }"
      >
        12 месяцев
        <span
          class="absolute top-0 right-0 rounded-2xl text-xs bg-[#ffdc60] dark:bg-[#FF4500] py-0.5 px-1 text-[8px]"
        >
          Рассрочка
        </span>
      </button>
    </div>
    <div class="flex w-full justify-end mt-6">
      <div class="md:hidden w-full flex flex-col gap-5">
        <div class="flex w-full gap-5">     
          <CustomSelect
            :tabs="tariffs.map((tariff:any) => ({
              title: tariff.title,
              value: tariff.title 
            }))"
            :statusText="firstTariff"
            :dropdownContainer="'w-1/2'"
            :class="'w-full bg-base-100'"
            @change-value="(value) => setFirstTariff(value)"
          />
          <CustomSelect
            :tabs="tariffs.map((tariff:any) => ({
              title: tariff.title,
              value: tariff.title 
            }))"
            :statusText="secondTariff"
            :dropdownContainer="'w-1/2'"
            :class="'w-full bg-base-100'"
            @change-value="(value) => setSecondTariff(value)"
          />
        </div>
        <div class="flex w-full gap-4">
          <div
            class="flex flex-col px-5 pt-5 py-1  rounded-lg w-[49%]"
            :class="{
              ' border-4 border-[#25ba7b]':
                firstTariff == 'VIP',
            }"
          >
            <div class="flex flex-nowrap gap-1 items-center">
              <span class="mr-2">{{ tariffs.filter((tariff:any) => tariff.title == firstTariff)[0].title }}</span>
              <span
                v-if="tariffs.filter((tariff:any) => tariff.title == firstTariff)[0].title == 'PRO'"
                class="rounded-lg bg-base-content text-base-100 py-1 px-2  text-xs"
                >Популярно</span
              >
              <span
                v-if="tariffs.filter((tariff:any) => tariff.title == firstTariff)[0].title == 'VIP'"
                class="rounded-lg bg-[#2effa9] dark:text-base-100 text-base-content py-1 px-2 text-xs"
                >Рекомендуем</span
              >
            </div>
            <p class="text-lg font-bold mt-auto">{{ tariffs.filter((tariff:any) => tariff.title == firstTariff)[0].price + ' ₽' }}</p>
            <button
              :disabled="tariffs.filter((tariff:any) => tariff.title == firstTariff)[0].disabled"
              class="btn dark:disabled:bg-[#999999] disabled:bg-[#999999] disabled:text-base-100Ф bg-base-content dark:bg-[#5287e7] dark:hover:bg-base-content border-none w-full text-base-100 text-lg"
            >
              Купить
            </button>
          </div>
          <div
            class="flex flex-col px-5 pt-5 py-1  rounded-lg w-[49%]"
            :class="{
              ' border-4 border-[#25ba7b] mr-2.5':
                secondTariff == 'VIP',
            }"
          >
            <div class="flex flex-nowrap gap-1 items-center">
              <span class="mr-2">{{ tariffs.filter((tariff:any) => tariff.title == secondTariff)[0].title }}</span>
              <span
                v-if="tariffs.filter((tariff:any) => tariff.title == secondTariff)[0].title == 'PRO'"
                class="rounded-lg bg-base-content text-base-100 py-1 px-2 text-xs"
                >Популярно</span
              >
              <span
                v-if="tariffs.filter((tariff:any) => tariff.title == secondTariff)[0].title == 'VIP'"
                class="rounded-lg bg-[#2effa9] dark:text-base-100 text-base-content py-1 px-2 text-xs"
                >Рекомендуем</span
              >
            </div>
            <p class="text-lg font-bold mt-auto">{{ tariffs.filter((tariff:any) => tariff.title == secondTariff)[0].price + ' ₽' }}</p>
            <button
              :disabled="tariffs.filter((tariff:any) => tariff.title == secondTariff)[0].disabled"
              class="btn dark:disabled:bg-[#999999] disabled:bg-[#999999] disabled:text-base-100Ф bg-base-content dark:bg-[#5287e7] dark:hover:bg-base-content border-none w-full text-base-100 text-lg"
            >
              Купить
            </button>
          </div>
        </div>
      </div>
      <div
        v-for="tariff in tariffs"
        class="hidden md:flex flex-col px-5 pt-5 py-1 w-[20%] rounded-lg"
        :class="{
          ' border-4 border-[#25ba7b] border-b-0 rounded-b-none mr-2.5':
            tariff.title == 'VIP',
        }"
      >
        <div class="flex flex-wrap gap-1 items-center">
          <span class="mr-2">{{ tariff.title }}</span>
          <span
            v-if="tariff.title == 'PRO'"
            class="rounded-lg bg-base-content text-base-100 py-1 px-2"
            >Популярно</span
          >
          <span
            v-if="tariff.title == 'VIP'"
            class="rounded-lg bg-[#2effa9] dark:text-base-100 text-base-content py-1 px-2"
            >Рекомендуем</span
          >
        </div>
        <p class="text-lg font-bold mt-auto">{{ tariff.price + ' ₽' }}</p>
        <button
          :disabled="tariff.disabled"
          class="btn dark:disabled:bg-[#999999] disabled:bg-[#999999] disabled:text-base-100Ф bg-base-content dark:bg-[#5287e7] dark:hover:bg-base-content border-none w-full text-base-100 text-lg"
        >
          Купить
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
