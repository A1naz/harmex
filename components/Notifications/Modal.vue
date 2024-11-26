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

const config = useRuntimeConfig();

const { status, data, send, open, close } = useWebSocket(
  "ws://localhost:3080/api/websocket"
);

const history = ref<string[]>([]);
watch(data, (newValue) => {
  history.value.push(`server: ${newValue}`);
});

const message = ref("");
function sendData() {
  history.value.push(`client: ${message.value}`);
  send(message.value);
  message.value = "";
}

onKeyStroke("Escape", (e) => {
  e.preventDefault();
  emit("update:show", false);
});

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
          <h1>WebSocket - let's go!</h1>
          <form @submit.prevent="sendData">
            <input v-model="message" />
            <button type="submit">Send</button>
          </form>
          <div>
            <p v-for="entry in history">{{ entry }}</p>
          </div>
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
