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
  },
  {
    id: 2,
    name: "Grok",
    text: "",
  },
  {
    id: 3,
    name: "Gemini",
    text: "",
  },
]);

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  notify({
    title: "Текст скопирован в буфер обмена",
    group: "success",
  });
};

interface ReviewData {
  text: string;
  positive: string;
  negative: string;
}

const onModalOpen = async () => {
  // @ts-ignore
  const { data, error } = await useFetch<ReviewData[]>(
    "/api/AI/getReviewText",
    {}
  );

  if (data.value) {
    variants.value = data.value;
  }
};

// Следим за изменением props.state
watch(
  () => props.state,
  (newVal) => {
    if (newVal) {
      onModalOpen();
    }
  }
);
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
        <div class="mb-4">
          <button
            @click="[emit('accept', variant), emit('update:state', false)]"
            class="btn btn-primary"
          >
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
