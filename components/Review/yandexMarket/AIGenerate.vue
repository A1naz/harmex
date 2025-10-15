<script setup lang="ts">
const props = defineProps({
  state: { type: Boolean, required: true },
  buyoutUuid: { type: String, required: true },
});
const emit = defineEmits(["close", "accept", "update:state"]);
const { notify } = useNotification();
const loading = ref(false);
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

interface ReviewData {
  text: string;
  positive: string;
  negative: string;
}

const onModalOpen = async () => {
  loading.value = true;
  // @ts-ignore
  const { data, error } = await useFetch<ReviewData[]>(
    "/api/AI/getReviewText",
    {
      params: {
        buyoutUuid: props.buyoutUuid,
        mp: "ym",
      },
    }
  );

  if (data.value) {
    variants.value = data.value;
  }
  loading.value = false;
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
          rows="3"
          placeholder="Текст отзыва"
        />
        <textarea
          v-model="variant.positive"
          rows="3"
          class="textarea w-full textarea-md bg-base-200"
          placeholder="Плюсы"
        />
        <textarea
          v-model="variant.negative"
          rows="3"
          class="textarea w-full textarea-md bg-base-200"
          placeholder="Минусы"
        />
        <div class="my-4 w-full flex justify-end">
          <button
            @click="[emit('accept', variant), emit('update:state', false)]"
            class="btn btn-primary btn-sm"
          >
            Применить
          </button>
          <button
            @click="
              copyToClipboard(
                variant.text + '\n' + variant.positive + '\n' + variant.negative
              )
            "
            class="btn btn-sm ml-2"
          >
            <Icon
              name="material-symbols:content-copy-outline-rounded"
              size="18"
            />
          </button>
        </div>
      </div>
    </div>
    <div
      @click.stop
      v-if="loading"
      style="background-color: rgb(37, 37, 42); opacity: 80%; z-index: 9999"
      class="fixed z-[50] top-0 left-0 right-0 bottom-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center"
    >
      <span class="text-white text-2xl text-center"> </span>
      <div class="ease-linear rounded-full mb-4">
        <Icon name="mdi:loading" class="h-20 w-20 animate-spin text-white" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
