<script setup lang="ts">

const props = defineProps({
  modelValue: {
    required: true,
    type: Date,
  },
  size: {
    type: String,
    default: 'small',
  },
})
const { $dayjs } = useNuxtApp()
const emit = defineEmits(['update:modelValue'])
const colorMode = useColorMode()
const { width } = useWindowSize()
const startDate = ref(new Date(Date.now() - 1000 * 60 * 60 * 24))
const date = ref(props.modelValue)


type UpdateMonthYear = (month: number, year: number) => void

function updateMonth(
  event: InputEvent,
  updateMonthYear: UpdateMonthYear,
  year: number
) {
  updateMonthYear(+(event.target as HTMLSelectElement).value, year)
}
function handleDate(modelData: any) {
  date.value = modelData
  console.log(modelData)
  console.log(timeDelivery.value)
}
type updateTime = (time: number[], hours: boolean) => void
const hoursArray = computed(() => {
  const arr = []
  for (let i = 0; i < 24; i++) {
    const hour = i < 10 ? `0${i}` : i
    arr.push({ text: `${hour}:00-${hour}:30`, value: `${hour}:00-${hour}:30` })
    arr.push({ text: `${hour}:30-${i + 1 < 10 ? `0${i + 1}` : i + 1}:00`, value: `${hour}:30-${i + 1 < 10 ? `0${i + 1}` : i + 1}:00` })
  }
  return arr
})

const getInitialTimeValue = (timeHours:any , timeMinutes:any) => {
  const hours = timeHours < 10 ? `0${timeHours}` : timeHours;
  const minutes = timeMinutes < 30 ? "00" : "30";

  let nextHours = timeHours;
  let nextMinutes = timeMinutes < 30 ? 30 : 0;

  if (timeMinutes >= 30) {
    nextHours = timeHours + 1;
    if (nextHours === 24) nextHours = 0; 
  }

  const nextHoursStr = nextHours < 10 ? `0${nextHours}` : nextHours;
  const nextMinutesStr = nextMinutes === 0 ? "00" : "30";

  return `${hours}:${minutes} - ${nextHoursStr}:${nextMinutesStr}`;
};
const timeDelivery = ref('')
timeDelivery.value = getInitialTimeValue(`${$dayjs(date.value).format('HH')}`, `${$dayjs(date.value).format('mm')}`);


</script>

<template>
  <ClientOnly>
    <VueDatePicker
      v-model="date"
      :teleport-center="width < 1280"
      :teleport="true"
      :min-date="startDate"
      :prevent-min-max-navigation="true"
      :dark="colorMode.value === 'dark'"
      cancel-text=""
      select-text="Сохранить"
      @update:model-value="handleDate"
    >
      <template #trigger>
        <div class="flex w-full justify-end">
          <button
            :class="{
              'btn-sm': size === 'small',
              'btn-md': size === 'medium',
            }"
            class="btn btn-primary normal-case w-30 bg-[#b2baff] dark:bg-primary dark:bg-opacity-20 border-none text-base-content"
          >
            {{ date ? 'Изменить' : 'Выбрать' }}
          </button>
        </div>
      </template>
      <template #action-row="{ internalModelValue, selectDate }">
        <div class="action-row flex flex-col justify-center gap-2 w-full">
          {{ timeDelivery }}
          <button
            class="btn btn-primary btn-sm block normal-case"
            @click="selectDate"
          >
            Применить
          </button>
        </div>
      </template>
      <template #time-picker="{ time, updateTime }">
        <div class="custom-time-picker-component">
          <span class="text-center px-2">Укажите время</span>

          <div class="flex items-center gap-2 px-2 pt-1">
            <select
              class="select select-sm w-full"
              value="00:00"
              v-model="timeDelivery"
            >
              <option v-for="h in hoursArray" :key="h.value" :value="h.value">
                {{ h.text }}
              </option>
            </select>
          </div>
        </div>
      </template>
      <template
        #month-year="{
          month,
          year,
          months,
          // eslint-disable-next-line vue/no-unused-vars
          years,
          updateMonthYear,
          handleMonthYearChange,
        }"
      >
        <div class="icons flex justify-between w-full items-center">
          <span
            class="custom-icon btn btn-ghost btn-sm btn-square"
            @click="handleMonthYearChange(false)"
          >
            <Icon name="material-symbols:chevron-left-rounded" size="16" />
          </span>
          <div class="custom-month-year-component">
            <select
              class="select select-ghost select-sm"
              :value="month"
              @change="updateMonth($event as any, updateMonthYear, year)"
            >
              <option v-for="m in months" :key="m.value" :value="m.value">
                {{ m.text }}
              </option>
            </select>
          </div>
          <span
            class="custom-icon btn btn-ghost btn-sm btn-square"
            @click="handleMonthYearChange(true)"
          >
            <Icon name="material-symbols:chevron-right-rounded" size="16" />
          </span>
        </div>
      </template>
    </VueDatePicker>
  </ClientOnly>
</template>

<style scoped></style>
