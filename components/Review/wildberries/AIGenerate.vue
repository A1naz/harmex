<script setup lang="ts">
const props = defineProps({
  state: { type: Boolean, required: true },
});
const emit = defineEmits(["close", "accept", "update:state"]);
const { notify } = useNotification();

const variants = ref([
  {
    id: 1,
    name: "ИИ",
    text: "",
    positive: "",
    negative: "",
  },
  {
    id: 2,
    name: "Grok",
    text: "",
    positive: "",
    negative: "",
  },
  {
    id: 3,
    name: "Gemini",
    text: "",
    positive: "",
    negative: "",
  },
]);

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  notify({
    title: "Текст скопирован в буфер обмена",
    group: "success",
  });
};
</script>

<template>
  <input id="review-modal" type="checkbox" class="modal-toggle" />
  <div
    ref="closeButton"
    :class="{
      'modal-open': state,
    }"
    class="modal overflow-x-hidden cursor-pointer"
    @click="emit('update:state', false)"
  >
    <div class="modal-box z-50 max-w-xl sm:w-xs w-xl cursor-auto" @click.stop>
      <div v-for="variant in variants" :key="variant.id">
        <div>Вариант от {{ variant.name }}</div>
        <textarea
          v-model="variant.text"
          class="textarea w-full textarea-md bg-base-200"
          placeholder="Текст отзыва"
        />
        <textarea
          v-model="variant.positive"
          class="textarea w-full textarea-md bg-base-200"
          placeholder="Плюсы"
        />
        <textarea
          v-model="variant.negative"
          class="textarea w-full textarea-md bg-base-200"
          placeholder="Минусы"
        />
        <div class="mb-4">
          <button @click="emit('accept', variant)" class="btn btn-primary">
            Применить
          </button>
          <button
            @click="
              copyToClipboard(
                variant.text + '\n' + variant.positive + '\n' + variant.negative
              )
            "
            class="btn"
          >
            Скопировать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
