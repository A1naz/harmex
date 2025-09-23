<script setup lang="ts">
const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  state: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close", "submit"]);

const supplementText = ref("");

async function submitSupplement() {
  emit("submit", {
    reviewId: props.info.id,
    text: supplementText.value,
  });
}
</script>

<template>
  <div class="modal" :class="{ 'modal-open': state }">
    <div class="modal-box relative">
      <label
        class="btn btn-sm btn-circle absolute right-2 top-2"
        @click="emit('close')"
        >✕</label
      >
      <h3 class="font-bold text-lg">Дополнить отзыв</h3>
      <textarea
        v-model="supplementText"
        class="textarea textarea-bordered w-full mt-4"
        rows="5"
        placeholder="Введите текст для дополнения отзыва"
      ></textarea>
      <div class="modal-action">
        <button class="btn btn-ghost" @click="emit('close')">Отмена</button>
        <button
          class="btn btn-primary"
          @click="submitSupplement"
          :disabled="!supplementText.trim()"
        >
          Отправить
        </button>
      </div>
    </div>
  </div>
</template>
