<script setup lang="ts">
import { LazyReviewWildberriesAIAddition } from '#build/components';

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
const AIGenerateAdditionModal = ref(false);
const confirmAIModal = ref(false);

const supplementText = ref("");

async function submitSupplement() {
  emit("submit", {
    reviewId: props.info.id,
    text: supplementText.value,
  });
}

function handleAIGenerateClick() {
  confirmAIModal.value = true;
}

function confirmAIGenerate() {
  confirmAIModal.value = false;
  AIGenerateAdditionModal.value = true;
}

function acceptAITextAddition(variant: any) {
  supplementText.value = variant.text;
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
      <div class="w-full text-center">
        <h3 class="font-bold text-lg mb-3">Дополнить отзыв</h3>
          <button
            class="btn btn-primary max-w-80"
            @click="handleAIGenerateClick"
          >
            Сгенерировать тексты ИИ - 30₽
          </button>
        </div>
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
    <ReviewWildberriesAIAddition
      v-model:state="AIGenerateAdditionModal"
      :buyoutUuid="info.buyoutuuid || ''"
      @accept="acceptAITextAddition"
    />
    <div
    :class="{
      'modal-open': confirmAIModal,
    }"
    class="modal"
  >
    <div class="modal-box">
      <h3 class="text-lg font-bold">Подтверждение</h3>
      <p class="py-4">
        Вы уверены, что хотите сгенерировать тексты с помощью ИИ? 
        С вашего баланса будет списано 30₽.
      </p>
      <div class="modal-action">
        <button
          class="btn btn-ghost"
          @click="confirmAIModal = false"
        >
          Отмена
        </button>
        <button
          class="btn btn-primary"
          @click="confirmAIGenerate"
        >
          Подтвердить
        </button>
      </div>
    </div>
  </div>
  </div>
</template>
