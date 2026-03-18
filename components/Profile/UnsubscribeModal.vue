<script lang="ts" setup>
const props = defineProps<{
  show: boolean;
  uuid?: string;
}>();

const emit = defineEmits<{
  close: [];
  unsubscribed: [];
}>();

const { notify } = useNotification();

const selectedReason = ref<string>("");
const customText = ref<string>("");
const loading = ref(false);

const reasons = [
  { value: "not_interested", label: "Не интересует" },
  { value: "too_frequent", label: "Слишком часто приходят письма" },
  { value: "other", label: "Другое" },
];

async function unsubscribe() {
  if (!selectedReason.value) {
    notify({ title: "Выберите причину отписки" });
    return;
  }
  if (selectedReason.value === "other" && !customText.value.trim()) {
    notify({ title: "Опишите причину отписки" });
    return;
  }

  loading.value = true;
  try {
    const { error } = await useFetch("/api/unsubscribeEmail", {
      method: "POST",
      body: {
        uuid: props.uuid,
        reason: selectedReason.value,
        customText: selectedReason.value === "other" ? customText.value.trim() : undefined,
      },
      watch: false,
    });

    if (error.value) {
      notify({ group: "error", title: error.value?.data?.message || "Ошибка при отписке" });
      return;
    }

    notify({
      group: "success",
      title: "Вы отписались от рассылки",
      text: "Вы больше не будете получать письма от Harmex",
      duration: 5000,
    });
    emit("unsubscribed");
    emit("close");
  } finally {
    loading.value = false;
  }
}

function close() {
  selectedReason.value = "";
  customText.value = "";
  emit("close");
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="close"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close" />
        <div
          class="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5"
        >
          <button
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            @click="close"
          >
            <Icon name="material-symbols:close-rounded" size="22" />
          </button>

          <div class="flex flex-col items-center gap-2 text-center">
            <div class="w-14 h-14 rounded-full bg-[#eef0fd] flex items-center justify-center mb-1">
              <Icon name="material-symbols:mail-off-outline-rounded" size="28" class="text-[#4960d3]" />
            </div>
            <h2 class="text-xl font-semibold text-gray-900">Отписаться от рассылки</h2>
            <p class="text-sm text-gray-500">
              Вы уверены, что хотите отписаться от писем <span class="font-medium text-gray-700">Harmex</span>?
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <p class="text-sm font-medium text-gray-700">Пожалуйста, укажите причину отписки:</p>
            <div class="flex flex-col gap-2 mt-1">
              <label
                v-for="reason in reasons"
                :key="reason.value"
                class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                :class="
                  selectedReason === reason.value
                    ? 'border-[#4960d3] bg-[#eef0fd]'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                "
              >
                <input
                  v-model="selectedReason"
                  type="radio"
                  :value="reason.value"
                  class="radio radio-sm radio-primary"
                />
                <span class="text-sm text-gray-700">{{ reason.label }}</span>
              </label>
            </div>
          </div>

          <Transition name="slide-down">
            <div v-if="selectedReason === 'other'" class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700">Опишите причину:</label>
              <textarea
                v-model="customText"
                class="textarea textarea-bordered w-full text-sm resize-none"
                rows="3"
                placeholder="Расскажите подробнее..."
                maxlength="500"
              />
              <span class="text-xs text-gray-400 text-right">{{ customText.length }}/500</span>
            </div>
          </Transition>

          <div class="flex flex-col gap-2 mt-1">
            <button
              class="btn btn-error w-full"
              :disabled="!selectedReason || loading"
              @click="unsubscribe"
            >
              <span v-if="loading" class="loading loading-spinner loading-sm" />
              <span v-else>Отписаться</span>
            </button>
            <button class="btn btn-ghost w-full text-gray-600" @click="close">
              Остаться в рассылке
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 120px;
}
</style>
