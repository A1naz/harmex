<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  info: {
    type: Object as any,
    required: true,
  },
})

const isVisible = ref(props.visible)
const { $dayjs } = useNuxtApp()
watch(() => props.visible, (newValue) => {
  isVisible.value = newValue
})

const tooltipPosition = ref({ top: 0, left: 0 })
const tooltipButton = ref<HTMLElement | null>(null)
const hideTooltipTimeout = ref<NodeJS.Timer | null>(null)

function showTooltip() {
  isVisible.value = true
  if (tooltipButton.value) {
    const buttonRect = tooltipButton.value.getBoundingClientRect()

    nextTick(() => {
      const tooltipElement = document.querySelector('.tooltip-class')
      const tooltipWidth = tooltipElement ? tooltipElement.offsetWidth : 0

      tooltipPosition.value = {
        top: buttonRect.bottom + 10,
        left: buttonRect.left + (buttonRect.width / 2) - (tooltipWidth / 2) - 2,
      }
    })
  }
}

function hideTooltip() {
  if (hideTooltipTimeout.value) {
    clearTimeout(hideTooltipTimeout.value)
  }

  hideTooltipTimeout.value = setTimeout(() => {
    isVisible.value = false
  }, 500)
}

function onMouseEnterTooltip() {
  if (hideTooltipTimeout.value) {
    clearTimeout(hideTooltipTimeout.value)
  }
}

function onMouseLeaveTooltip() {
  hideTooltip()
}
</script>

<template>
  <div>
    <button
      ref="tooltipButton"
      class="p-1 flex flex-col justify-center items-center text-center bg-gray-10 hover:bg-gray-200 rounded-lg text-[#909090]"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
    >
      <Icon name="si:info-fill" size="20" />
    </button>

    <Transition>
      <div
        v-if="isVisible"
        :style="{ top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px` }"
        class="tooltip-class fixed bg-white shadow-lg text-black text-sm px-[15px] py-[12.5px] rounded-lg z-50 whitespace-nowrap flex flex-col justify-start text-left"
        @mouseenter="onMouseEnterTooltip"

        @mouseleave="onMouseLeaveTooltip"
      >
        <div
          class="absolute top-[-9px] left-1/2 w-[20px] h-[30px] rounded-[3px] rotate-45 bg-white transform -translate-x-1/2"
        />
        <p class="relative z-10 ">
          {{ info.orgName }}
        </p>
        <p>ИНН: {{ info.orgInn }} </p>
        <p>На Harmex с {{ $dayjs(info.registerDate).locale('ru').format('D MMMM YYYY') }}  </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
