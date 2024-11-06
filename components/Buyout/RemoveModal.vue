<script setup lang="ts">
const props = defineProps({
  info: {
    type: Object as any,
  },
  index: {
    type: Number,
    required: true,
  },
  state: {
    type: Boolean,
    required: true,
  },
})

const info = toRef(props, 'info')

const emit = defineEmits(['remove', 'close'])
</script>
<template>
  <div id="removeModal" :class="{ 'modal-open': state }" class="modal">
    <div class="modal-box max-w-xs">
      <h3 class="font-bold text-md">
        Вы уверенны что хотите удалить выкуп № {{ info.place }} ?
      </h3>
      <div class="modal-action flex justify-around">
        <label
          @click="emit('close')"
          class="btn btn-sm btn-ghost w-[45%] h-[2.5rem] px-6"
          >Отмена</label
        >
        <label
          class="btn btn-sm btn-primary bg-opacity-20 w-[45%] h-[2.5rem] border-none text-base-content px-6"
          @click="emit('remove', info.uuid)"
          >Удалить</label
        >
      </div>
    </div>
  </div>
</template>
