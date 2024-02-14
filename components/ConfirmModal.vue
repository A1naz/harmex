<script setup lang="ts">

const route = useRoute()

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
    <div v-if="state" class="modal-box max-w-[300px] px-3 py-5">
      <div class="">
        <a v-if="!route.path.startsWith('/team')" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="$emit('click', false)">✕</a>
        <div class="text-xl font-semibold">
            {{ titleModal }}
        </div>

        <div v-if="subDescr" class="text-xs text-gray-500"
        >
          # {{ subDescr }}
        </div>

        <div class="flex flex-col gap-2 my-2 justify-center">
            {{ descr }}
        </div>

        <div v-if="saveError"><p class="text-red-600" > {{ saveError }}</p></div>

        <div class="flex w-full gap-6">

            <Button 
                  class="btn btn-sm btn-ghost w-[45%]" 
                  label="Отмена"
                  @click="$emit('click', false)"
                  ></Button>
            <Button 
                class="btn btn-sm btn-primary bg-opacity-10 text-base-content border-none w-[45%]" 
                label="Удалить"
                :loading="btnSaveLoading"
                @click="$emit('click', true)"
                ></Button>

            
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
