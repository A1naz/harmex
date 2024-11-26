<script setup lang="ts">
import { useEventSource } from "@vueuse/core";
const { user }: any = useUserSession();

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits(["update:show"]);

onKeyStroke("Escape", (e) => {
  e.preventDefault();
  emit("update:show", false);
});

const notifications = ref<any>([]);
import { v4 as uuid } from "uuid";
const message = ref<string>("");

const { $socket }: any = useNuxtApp();

onMounted(() => {
  $socket.onopen = () => {
    $socket.send(user.value.uuid);
  };

  $socket.onmessage = ({ data }: any) => {
    console.log("data", data);
    message.value = data;
  };
  $socket.onclose = function () {
    console.log("disconnected");
  };
});

const sendMessage = () => {
  fetch("/api/notifications/stream", {
    method: "POST",
    body: JSON.stringify({
      message: Math.random(),
      sender: user.value.uuid,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("sent");
    });
};
</script>

<template class="overflow-hidden">
  <div
    id="notificationsModal"
    :class="{ 'modal-open': show }"
    class="modal cursor-pointer"
    @click="$emit('update:show', false)"
  >
    <div v-if="show" class="modal-box max-w-md max-h-[90%] p-0">
      <div class="cursor-auto" @click.stop>
        <div
          class="h-screen w-full grid place-items-center bg-gray-200 dark:bg-black"
        >
          <span class="flex flex-col items-centers space-y-4">
            <span>{{ message }} 1</span>
            <button
              @click="sendMessage"
              class="bg-purple-500 text-gray-50 font-semibold px-5 py-2 rounded-lg"
            >
              Click me to send random number
            </button>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#buyoutInfoModal {
  overflow: hidden;
}
</style>
