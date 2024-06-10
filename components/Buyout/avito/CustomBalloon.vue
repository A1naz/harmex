<template class="h-[200px]">
  <div class="card rounded-lg">
    <div style="height: 105px">
      <div class="text-lg font-semibold">Адрес</div>
      <div class="text-sm">{{ modelValue }}</div>
    </div>
    <div class="flex justify-center w-full">
      <button
        @click=""
        class="selectPoint  flex justify-center btn btn-primary hover:bg-primary w-full"
      >
        Выбрать
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])
</script>
