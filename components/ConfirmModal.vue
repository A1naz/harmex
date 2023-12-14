<script setup lang="ts">

defineProps({
  titleModal: { type: String, required: true },
  subDescr: { type: String, required: false },
  descr: { type: String, required: false },
  index: { type: Number, required: true },
  state: { type: Boolean, required: true },
  btnSaveLoading: { type: Boolean, required: true },
  saveError: { type: String, required: false }
})

defineEmits(['click'])

</script>

<template>
  <div
    id="teamEditModal" 
    :class="{ 'modal-open': state }" 
    class="modal"
  >
    <div v-if="state" class="modal-box max-w-2xl">
      <div class="">
        <a class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="$emit('click', false)">✕</a>
        <div class="text-xl font-bold">
            {{ titleModal }}
        </div>

        <div v-if="subDescr" class="text-xs text-gray-500">
          # {{ subDescr }}
        </div>

        <div class="flex flex-col gap-2 mt-2 justify-center">
            {{ descr }}
        </div>

        <div v-if="saveError"><p class="text-red-600" > {{ saveError }}</p></div>

        <div class="flex m-4">
            <Button 
                class="btn btn-sm btn-primary m-1" 
                label="Удалить"
                :loading="btnSaveLoading"
                @click="$emit('click', true)"
                ></Button>

            <Button 
                class="btn btn-sm btn-neutral m-1" 
                label="Отменить"
                @click="$emit('click', false)"
                ></Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
