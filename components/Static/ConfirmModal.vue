<script setup lang="ts">
const route = useRoute();

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: false },
  state: { type: Boolean, required: true },
  confirmFunction: { type: Function, required: true },
});

const emit = defineEmits(["update:state"]);

function confirm() {
  props.confirmFunction();
  emit("update:state", false);
}
</script>

<template>
  <div
    id="teamEditModal"
    :class="{ 'modal-open': state }"
    class="modal cursor-pointer"
    @click="$emit('update:state', false)"
  >
    <div v-if="state" class="modal-box max-w-[450px] px-3 py-5" @click.stop>
      <div class="">
        <a
          v-if="!route.path.startsWith('/team')"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="$emit('update:state', false)"
          >✕</a
        >
        <div class="text-xl font-semibold text-center">
          {{ title }}
        </div>

        <div class="my-3 text-center">
          {{ description }}
        </div>

        <div class="flex w-full justify-center gap-3">
          <button
            class="btn btn-primary text-white border-none w-[45%]"
            @click="$emit('update:state', false)"
          >
            Отмена
          </button>
          <button class="btn btn-ghost w-[45%]" @click="confirm">
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
