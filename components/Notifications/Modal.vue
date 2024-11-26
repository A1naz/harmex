<script setup lang="ts">
import { useEventSource } from '@vueuse/core'

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
const eventSource = ref<EventSource>();

const init = () => {
  eventSource.value = new EventSource("/api/sse");

  eventSource.value.addEventListener("connected", (data) => {
    console.log("sse: connected", data);
  });
};

onMounted(init);

onBeforeUnmount(() => {
  eventSource.value?.close();
})
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
        <div v-if="notifications && notifications.length">
          <ul>
            <li v-for="notification in notifications" :key="notification.id">
              {{ notification.message }}
            </li>
          </ul>
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
