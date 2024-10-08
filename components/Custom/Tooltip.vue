<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { ref, watch } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  visible: {
    type: Boolean,
    required: true
  },
  textClasses: {
    type: String,
    required: false
  }
})

const tooltipId = uuidv4()

const isVisible = ref(props.visible)

watch(() => props.visible, (newValue) => {
  isVisible.value = newValue
})
</script>

<template>
  <div class="relative">
    <div 
      v-if="isVisible" 
      :id="tooltipId" 
      class="absolute bottom-full right-0 transform -translate-y-[15px] bg-white text-black text-sm px-[15px] py-[12.5px] rounded-lg transition-opacity duration-200 whitespace-nowrap"
    >
      <div class="absolute bottom-[-9px] right-2 w-[20px] h-[30px] bg-white rounded-[3px] rotate-45"></div>
      <p class="relative z-10" :class="textClasses">{{ props.text }}</p>
    </div>
  </div>
</template>
