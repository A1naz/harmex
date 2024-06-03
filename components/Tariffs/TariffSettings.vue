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

const currentTariff = computed(() => {
  return props.tariffs[props.form.mp]
})
const currentType = computed(() => {
  return props.tariffs[props.form.mp][props.form.title]
})
const currentData = computed(() => {
  return props.tariffs[props.form.mp][props.form.title].type[props.form.type]
})
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
        v-for="tariffTitle in currentTariff"
        :key="tariffTitle.value"
        class="btn border-none w-[32%] text-lg"
        @click="
         (form.title = tariffTitle.value)
        "
        :class="{
          'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
            form.title === tariffTitle.value,
          'bg-base-100 text-base-content': form.title !== tariffTitle.value,
        }"
      >
        {{ tariffTitle.title }}
      </button>
    </div> 


    <div class="flex justify-between">
      <button
        v-for="tarrifType in currentType.type"
        class="btn border-none w-[49%] text-lg"
        @click="
          (form.type = tarrifType.value)
        "
        :class="{
          'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
            form.type == tarrifType.value,
          'bg-base-100 text-base-content': form.type != tarrifType.value,
        }"
      >
        {{ tarrifType.title }}
      </button>
    </div>


    <div class="flex justify-between">
      <button
        class="btn border-none w-[32%] whitespace-nowrap pt-1 md:pt-0 md:text-lg relative"
        @click="(form.dateRange = '3months')
        "
        :class="{
          'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
            form.dateRange == '3months',
          'bg-base-100 text-base-content': form.dateRange != '3months',
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
        class="btn border-none w-[32%] whitespace-nowrap pt-1 md:pt-0 md:text-lg relative"
        @click="(form.dateRange = '6months')
        "
        :class="{
          'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
            form.dateRange == '6months',
          'bg-base-100 text-base-content': form.dateRange != '6months',
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
        class="btn border-none w-[32%] text-xs whitespace-nowrap pt-1 md:pt-0 md:text-lg relative"
        @click="(form.dateRange = '12months')
        "
        :class="{
          'bg-[#292930] dark:bg-[#5287e7] dark:hover:bg-base-100 text-base-100':
            form.dateRange == '12months',
          'bg-base-100 text-base-content': form.dateRange != '12months',
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
            :tabs="currentData.tariffs.map((tariff:any) => ({
              title: tariff.title,
              value: tariff.title 
            }))"
            :statusText="firstTariff"
            :dropdownContainer="'w-1/2'"
            :class="'w-full bg-base-100'"
            @change-value="(value) => setFirstTariff(value)"
          />
          <CustomSelect
            :tabs="currentData.tariffs.map((tariff:any) => ({
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
              <span class="mr-2">{{ currentData.tariffs.filter((tariff:any) => tariff.title == firstTariff)[0].title }}</span>
              <span
                v-if="currentData.tariffs.filter((tariff:any) => tariff.title == firstTariff)[0].title == 'PRO'"
                class="rounded-lg bg-base-content text-base-100 py-1 px-2  text-xs"
                >Популярно</span
              >
              <span
                v-if="currentData.tariffs.filter((tariff:any) => tariff.title == firstTariff)[0].title == 'VIP'"
                class="rounded-lg bg-[#2effa9] dark:text-base-100 text-base-content py-1 px-2 text-xs"
                >Рекомендуем</span
              >
            </div>
            <p class="text-lg font-bold mt-auto">{{ currentData.tariffs.find((tariff:any) => tariff.title === firstTariff).prices[parseInt(form.dateRange.replace('months', ''))] + ' ₽'}}</p>
            <button
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
              <span class="mr-2">{{ currentData.tariffs.filter((tariff:any) => tariff.title == secondTariff)[0].title }}</span>
              <span
                v-if="currentData.tariffs.filter((tariff:any) => tariff.title == secondTariff)[0].title == 'PRO'"
                class="rounded-lg bg-base-content text-base-100 py-1 px-2 text-xs"
                >Популярно</span
              >
              <span
                v-if="currentData.tariffs.filter((tariff:any) => tariff.title == secondTariff)[0].title == 'VIP'"
                class="rounded-lg bg-[#2effa9] dark:text-base-100 text-base-content py-1 px-2 text-xs"
                >Рекомендуем</span
              >
            </div>
            <p class="text-lg font-bold mt-auto">{{ currentData.tariffs.find((tariff:any) => tariff.title === secondTariff).prices[parseInt(form.dateRange.replace('months', ''))] + ' ₽'}}</p>
            <button
              class="btn dark:disabled:bg-[#999999] disabled:bg-[#999999] disabled:text-base-100Ф bg-base-content dark:bg-[#5287e7] dark:hover:bg-base-content border-none w-full text-base-100 text-lg"
            >
              Купить
            </button>
          </div>
        </div>
      </div>
      <div v-for="tariff in currentData.tariffs" 
          class="hidden md:flex flex-col px-5 pt-5 py-1 w-[20%] rounded-lg"
          :class="{
            'border-4 border-[#25ba7b] border-b-0 rounded-b-none mr-2.5': tariff.title === 'VIP'
          }"
      >
        <div class="flex flex-wrap gap-1 items-center">
          <span class="mr-2">{{ tariff.title }}</span>
          <span v-if="tariff.title === 'PRO'" class="rounded-lg bg-base-content text-base-100 py-1 px-2">Популярно</span>
          <span v-if="tariff.title === 'VIP'" class="rounded-lg bg-[#2effa9] dark:text-base-100 text-base-content py-1 px-2">Рекомендуем</span>
        </div>
        <p class="text-lg font-bold mt-auto">{{ tariff.prices[form.dateRange.replace('months', '')] + ' ₽' }}</p>
        <button :disabled="tariff.disabled"
                class="btn dark:disabled:bg-[#999999] disabled:bg-[#999999] disabled:text-base-100 bg-base-content dark:bg-[#5287e7] dark:hover:bg-base-content border-none w-full text-base-100 text-lg"
        >
          Купить
        </button>
      </div>

    </div> 
  </div> 
</template>

<style scoped>

</style>
