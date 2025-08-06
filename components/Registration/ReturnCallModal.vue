<script setup lang="ts">
const { notify } = useNotification();

const props = defineProps({
  show: { type: Boolean, required: true },
  phone: { type: String, required: true },
});
const emit = defineEmits(["close", "confirm"]);
const isCodeSent = ref(false);
const callId = ref("");

const stopPolling = ref(false);

function closeModal() {
  emit("close");
}

async function getCallStatus() {
  //@ts-ignore
  const { data, error } = await useFetch("/api/organization/getCallIdStatus", {
    method: "GET",
    query: {
      callId: callId.value,
    },
    watch: false,
  });

  if (data.value?.status === "confirmed") {
    stopPolling.value = true;
    notify({
      group: "success",
      title: "Номер подтвержден",
    });
    emit("confirm");
    emit("close");
  }
}

let timeoutId: ReturnType<typeof setTimeout> | null = null;

const poll = async () => {
  await getCallStatus();

  if (!stopPolling.value) {
    timeoutId = setTimeout(() => {
      poll();
    }, 5000);
  }
};

async function createReturnCall() {
  //@ts-ignore
  const { data, error }: any = await useFetch(
    "/api/organization/createReturnCall",
    {
      method: "POST",
      body: {
        phone: props.phone.replace(/[()\-\s]/g, ""),
      },
      watch: false,
    }
  );

  if (data.value) {
    isCodeSent.value = true;
    callId.value = data.value.callId;
    notify({
      group: "success",
      title: "Запрос создан",
    });
    poll();
  } else {
    notify({
      group: "error",
      title: "Что-то пошло не так, не удалось создать запрос",
    });
  }
}

watch(
  () => props.show,
  () => {
    if (props.show && !isCodeSent.value) {
      createReturnCall();
    }
  }
);
</script>

<template>
  <input
    id="selectUser"
    type="checkbox"
    :checked="props.show"
    class="modal-toggle"
    :class="{ 'modal-open': props.show }"
  />
  <div
    class="modal cursor-pointer"
    @click="$emit('close')"
    style="z-index: 99999"
  >
    <div
      v-if="props.show"
      class="modal-box rounded-[8px] cursor-auto border p-3 sm:p-5 border-[#dee2e6]"
      @click.stop
    >
      <form method="dialog">
        <label
          class="btn btn-sm btn-circle btn-ghost bg-transparent absolute right-2 top-2 text-[#9ca3af] text-xl"
          @click="closeModal"
        >
          ✕
        </label>
      </form>
      <div class="max-w-md mx-auto p-6 rounded-2xl bg-white text-center">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">
          Подтверждение номера телефона
        </h2>
        <p class="text-gray-600 mb-2">Позвоните по номеру:</p>
        <a
          class="text-2xl font-bold text-blue-600 mb-4"
          href="tel:+7 800 555-86-07"
          >+7 800 555-86-07</a
        >

        <p class="text-gray-500 text-sm">
          Пожалуйста, позвоните на указанный номер с вашего телефона, чтобы
          завершить процесс подтверждения(Звонок бесплатный).
        </p>
        {{ phone }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
