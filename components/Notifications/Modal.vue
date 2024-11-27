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
const notifications = ref([])

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
    <div v-if="show" class="modal-box max-w-md p-0">
      <div class="cursor-auto" @click.stop>
        <div
          class="w-full grid place-items-center"
        >
          <div>

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
