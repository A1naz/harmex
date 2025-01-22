<script lang="ts" setup>
const { notify } = useNotification();
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  code: {
    type: Number,
    required: true,
  },
  info: {
    type: Object as any,
    required: true,
  },
});
const closeButton = ref<HTMLElement>();
const src = toRef(props, "src");
const code = toRef(props, "code");
const newSrc = ref("");
const btnDisabled = ref(false);
const deliveryClosedUuid = ref("");
async function createRequest() {
  btnDisabled.value = true;
  notify({
    type: "success",
    title: "Запрос отправлен",
  });
  const { data, error }: any = await useFetch(
    "/api/yandexMarket/delivery/screenshotRequest",
    {
      method: "POST",
      body: {
        mp: "ym",
        article: props.info.article,
        deliveryUuid: props.info.uuid,
      },
      watch: false,
    }
  );
  if (data.value) {
    if (
      deliveryClosedUuid.value !== "" &&
      deliveryClosedUuid.value !== props.info.uuid
    ) {
      btnDisabled.value = false;
      return;
    }
    notify({
      type: "success",
      title: "Скриншот получен",
    });
    newSrc.value = data.value;
  }
  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: error.value?.data?.message,
      type: "error",
      duration: 3000,
    });
  }
  btnDisabled.value = false;
}
onKeyStroke("Escape", (e) => {
  e.preventDefault();
  closeButton.value?.click();
});

const modalCheckbox = ref(false);
watch(modalCheckbox, (newVal) => {
  if (!newVal) {
    newSrc.value = "";
    deliveryClosedUuid.value = props.info.uuid;
  }
  if (newVal && deliveryClosedUuid.value !== props.info.uuid) {
    btnDisabled.value = false;
  }
});
</script>

<template>
  <input
    id="qr-modal"
    type="checkbox"
    class="modal-toggle"
    v-model="modalCheckbox"
  />
  <div v-if="src" class="modal">
    <div class="modal-box relative w-sm sm:w-80">
      <label
        ref="closeButton"
        for="qr-modal"
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        @click.stop
        >✕</label
      >
      <h3 class="text-lg font-bold mb-2">QR-Код для получения</h3>

      <div
        class="w-full flex flex-col justify-center items-center border-[18px] rounded-xl border-white"
      >
        <NuxtImg
          class="bg-white"
          :alt="code.toString()"
          :src="`${newSrc !== '' ? newSrc : src}`"
          @click.stop
        />
      </div>
      <button
        :disabled="btnDisabled"
        class="btn btn-sm btn-primary mt-2 bg-[#d8dcff] dark:bg-primary dark:bg-opacity-20 border-none text-base-content w-full h-[2.5rem]"
        @click="createRequest"
      >
        <span v-if="!btnDisabled">Запросить QR</span>
        <span v-else class="loading loading-spinner"></span>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
