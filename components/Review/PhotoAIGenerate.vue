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
    name: "test",
    photoUrl: "",
  }
]);

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  notify({
    title: "Текст скопирован в буфер обмена",
    group: "success",
  });
};

interface ReviewData {
photoUrl: string;
}

const onModalOpen = async () => {
  loading.value = true;
  // @ts-ignore
  const { data, error } = await useFetch<ReviewData[]>(
    "/api/AI/getReviewPhoto",
    {
      params: {
        buyoutUuid: props.buyoutUuid
      },
    }
  );

  if (data.value) {
    variants.value[0].photoUrl = data.value;
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

        <NuxtImg :src="variant.photoUrl" class="w-full h-full object-cover" />
        <div class="my-4 w-full flex justify-end">
          <button
            @click="[emit('accept', variant.photoUrl), emit('update:state', false)]"
            class="btn btn-primary btn-sm"
          >
            Применить
          </button>
          <button
            @click="copyToClipboard(variant.photoUrl)"
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
