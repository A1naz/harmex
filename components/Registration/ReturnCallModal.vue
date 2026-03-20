<script setup lang="ts">
const { notify } = useNotification();

const props = defineProps({
  show: { type: Boolean, required: true },
  phone: { type: String, required: true },
});
const emit = defineEmits(["close", "confirm"]);

const isWaiting = ref(false);

const { data, error, execute } = useFetch("/api/organization/createReturnCall", {
  method: "POST",
  immediate: false,
  watch: false,
});

async function createReturnCall() {
  isWaiting.value = true;

  try {
    await execute();

    if (error.value) throw error.value;

    const result = data.value as any;
    if (result?.status === "confirmed") {
      notify({ group: "success", title: "Номер подтвержден" });
      emit("confirm", result.callId);
      emit("close");
    } else if (result?.requiresSupport) {
      emit("close");
    } else {
      // timeout — предлагаем SMS
      emit("close");
    }
  } catch {
    notify({ group: "error", title: "Что-то пошло не так" });
    emit("close");
  } finally {
    isWaiting.value = false;
  }
}

function handleClose() {
  // Закрываем модалку, но useFetch продолжает ждать в фоне.
  // Если юзер позвонит позже — notify сработает и без открытой модалки.
  emit("close");
}

watch(
  () => props.show,
  (val) => {
    // Если запрос уже летит — просто показываем модалку, новый звонок не создаём
    if (val && !isWaiting.value) {
      createReturnCall();
    }
  }
);
</script>

<template>
  <input id="selectUser" type="checkbox" :checked="props.show" class="modal-toggle"
    :class="{ 'modal-open': props.show }" />
  <div class="modal cursor-default" style="z-index: 99999">
    <div v-if="props.show" class="modal-box rounded-[8px] cursor-auto border p-3 sm:p-5 border-[#dee2e6]" @click.stop>
      <div class="max-w-md mx-auto p-6 rounded-2xl bg-white text-center">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">
          Подтверждение номера телефона
        </h2>
        <p class="text-gray-600 mb-2">Позвоните по номеру:</p>
        <a class="text-2xl font-bold text-blue-600 mb-4" href="tel:+78005558607">+7 800 555-86-07</a>

        <div v-if="isWaiting" class="mt-4 flex flex-col items-center gap-2">
          <span class="loading loading-spinner loading-md text-orange-400" />
          <p class="text-gray-500 text-sm">Проверяем статус звонка...</p>
        </div>

        <p class="text-gray-500 text-sm mt-4">
          Пожалуйста, позвоните на указанный номер с вашего телефона, чтобы
          завершить процесс подтверждения (звонок бесплатный). После окончания звонка подождите несколько секунд, пока
          мы проверим статус звонка.
          <br />
          Если не вышло подтвердить обратным звонком, нажмите кнопку ниже и попробуйте отправить SMS-код.
        </p>

        <button class="btn btn-outline btn-sm mt-6 w-full" @click="handleClose">
          Не получилось подтвердить
        </button>
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
