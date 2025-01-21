<script setup>
defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  coordinates: {
    type: Array,
    default: () => {
      return [55.761438764655615, 37.617691166568456];
    },
  },
});

defineEmits(["update:modelValue", "callback"]);
</script>

<template class="h-[200px]">
  <div class="card rounded-lg">
    <div style="height: 105px">
      <div class="text-lg font-semibold">Адрес</div>
      <div class="text-sm">{{ modelValue }}</div>
    </div>
    <div class="flex justify-center w-full">
      <!-- <button
        @click="$emit('callback', modelValue, coordinates[0], coordinates[1])"
        class="selectPoint flex justify-center btn btn-primary hover:bg-primary w-full absolute top-28"
        :disabled="!modelValue || modelValue == 'Загрузка...'"
      >
        Выбрать
      </button> -->
    </div>
  </div>
</template>
