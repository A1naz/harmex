<script setup lang="ts">
import { useNotification } from '@kyvg/vue3-notification'
const props = defineProps({
  modelValue: {
    required: true,
    type: Date,
  },
  timeDelivery: {
    required: true,
    type: String,
  },
  size: {
    type: String,
    default: 'small',
  },
})
const { notify } = useNotification()
const { $dayjs } = useNuxtApp()
const emit = defineEmits(['saveDate'])
const colorMode = useColorMode()
const { width } = useWindowSize()
const startDate = ref(new Date(Date.now() - 1000 * 60 * 60 * 24))
const date = ref($dayjs().toDate())

const currentDate = $dayjs().toDate()
const endOfWeek = $dayjs().add(7, 'day').toDate()

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
  // const formattedCurrentDate = $dayjs(currentDate).format('YYYY-MM-DD');
  // const formattedModelDate = $dayjs(modelData).format('YYYY-MM-DD');

  // if (formattedCurrentDate === formattedModelDate) {
  //   const [startTime, endTime] = timeDelivery.value.split('-');
  //   const currentTime = currentDate.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5);

  //   const currentTimeParts = currentTime.split(':').map(Number);
  //   const startTimeParts = startTime.split(':').map(Number);

  //   const currentDateTime = new Date();
  //   currentDateTime.setHours(currentTimeParts[0], currentTimeParts[1], 0, 0);

  //   const startDateTime = new Date();
  //   startDateTime.setHours(startTimeParts[0], startTimeParts[1], 0, 0);

  //   if (currentDateTime > startDateTime) {
  //     const nextTimeInterval = getNextTimeInterval(
  //     getInitialTimeValue(
  //         `${$dayjs(currentDate).format('HH')}`,
  //         `${$dayjs(currentDate).format('mm')}`
  //       )
  //     )
  //     customSelect.value.updateValue({
  //       title: nextTimeInterval,
  //       value: nextTimeInterval,
  //     })
  //     notify({
  //       text: 'Время доставки не может быть в прошедшем времени',
  //       type: 'error',
  //     })
  //     return
  //   }
  // }

  emit(
    'saveDate',
    `${$dayjs(date.value).format('DD.MM.YYYY')}`,
    timeDelivery.value
  )
}
type updateTime = (time: number[], hours: boolean) => void
const hoursArray = computed(() => {
  const arr = []
  for (let i = 0; i < 24; i++) {
    const hour = i < 10 ? `0${i}` : i
    arr.push({ title: `${hour}:00-${hour}:30`, value: `${hour}:00-${hour}:30` })
    arr.push({
      title: `${hour}:30-${i + 1 < 10 ? `0${i + 1}` : i + 1}:00`,
      value: `${hour}:30-${i + 1 < 10 ? `0${i + 1}` : i + 1}:00`,
    })
  }
  return arr
})

const getInitialTimeValue = (timeHours: any, timeMinutes: any) => {
  const hours = timeHours < 10 ? `0${timeHours}` : timeHours
  const minutes = timeMinutes < 30 ? '00' : '30'

  let nextHours = timeHours
  let nextMinutes = timeMinutes < 30 ? 30 : 0

  if (timeMinutes >= 30) {
    nextHours = parseInt(timeHours) + 1
    if (nextHours === 24) nextHours = 0
  }

  const nextHoursStr = nextHours < 10 ? `0${nextHours}` : nextHours
  const nextMinutesStr = nextMinutes === 0 ? '00' : '30'

  return `${hours}:${minutes}-${nextHoursStr}:${nextMinutesStr}`
}

const getNextTimeInterval = (timeString: string) => {
  const [start, end] = timeString.split('-')
  const [startHours, startMinutes] = start.split(':').map(Number)
  const [endHours, endMinutes] = end.split(':').map(Number)

  const nextStartMinutes = (startMinutes + 30) % 60
  const nextStartHours = (startHours + Math.floor((startMinutes + 30) / 60)) % 24

  return getInitialTimeValue(nextStartHours, nextStartMinutes)
}

const timeDelivery = ref(
  props.timeDelivery && props.timeDelivery !== ''
    ? props.timeDelivery
    : getInitialTimeValue(
        `${$dayjs(date.value).format('HH')}`,
        `${$dayjs(date.value).format('mm')}`
      )
)

const customSelect = ref()

function setTimeDelivery(data: any) {
  // const selectedTimeRange = data.value.split('-')
  // const [selectedStartHour, selectedStartMinute] = selectedTimeRange[0]
  //   .split(':')
  //   .map(Number)

  // const selectedStartDateTime = new Date(date.value)
  // selectedStartDateTime.setHours(selectedStartHour, selectedStartMinute, 0, 0)

  // if (selectedStartDateTime < currentDate) {
  //   notify({
  //     text: 'Выбрано прошедшее время',
  //     type: 'error',
  //   })
  //   const nextTimeInterval = getNextTimeInterval(
  //     getInitialTimeValue(
  //       `${$dayjs(currentDate).format('HH')}`,
  //       `${$dayjs(currentDate).format('mm')}`
  //     )
  //   )
  //   customSelect.value.updateValue({
  //     title: nextTimeInterval,
  //     value: nextTimeInterval,
  //   })
  //   return
  // }

  timeDelivery.value = data.value
  // emit(
  //   'saveDate',
  //   `${$dayjs(date.value).format('DD.MM.YYYY')}`,
  //   timeDelivery.value
  // )
}
</script>

<template>
  <ClientOnly>
    <VueDatePicker
      v-model="date"
      :teleport-center="width < 1280"
      :teleport="true"
      :min-date="currentDate"
      :prevent-min-max-navigation="true"
      :dark="colorMode.value === 'dark'"
      cancel-text=""
      select-text="Сохранить"
      @update:model-value="handleDate"
    >
      <template #trigger>
        <div class="flex flex-col w-full justify-end">
          <div
            v-if="
              props.timeDelivery &&
              props.timeDelivery !== '' &&
              timeDelivery !== ''
            "
            class="flex justify-center items-center text-center"
          >
            {{ `${$dayjs(date).format('DD.MM.YYYY')}` }}
            <br />
            {{ timeDelivery }}
          </div>
          <button
            v-else
            :class="{
              'btn-sm': size === 'small',
              'btn-md': size === 'medium',
            }"
            class="btn btn-primary normal-case w-30 bg-[#b2baff] dark:bg-primary dark:bg-opacity-20 border-none text-base-content"
          >
            {{ date ? 'Добавить' : 'Выбрать' }}
          </button>
        </div>
      </template>
      <template #action-row="{ internalModelValue, selectDate }">
        <div class="action-row flex flex-col justify-center gap-2 w-full">
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
            <CustomSelect
              ref="customSelect"
              @change-value="setTimeDelivery"
              :dropdownContainer="'w-full'"
              :class="'w-full'"
              :tabs="hoursArray"
              :status-text="timeDelivery"
            />
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
