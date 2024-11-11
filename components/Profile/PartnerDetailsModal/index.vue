<script setup lang="ts">
const props = defineProps({
  show: { type: Boolean, required: true },
})
const emit = defineEmits(['close'])
const modalType = ref('choice')

function closeModal() {
  modalType.value = 'choice'
  emit('close')
}
</script>

<template>
  <input id="selectUser" type="checkbox" :checked="props.show" class="modal-toggle">
  <div class="modal z-[9999] cursor-pointer" @click="closeModal">
    <div
      class="modal-box w-full cursor-auto rounded-[8px] border border-[#dee2e6] max-w-sm px-[10px] py-[30px] sm:w-9/12 sm:max-w-2xl sm:px-[58px]"
      @click.stop
    >
      <form method="dialog">
        <label class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2 bg-[#e5e5e5]" @click="closeModal">
          ✕
        </label>
      </form>

      <div v-if="modalType === 'choice'" class="flex flex-col gap-4 w-full">
        <div>
          <h3 class="text-lg font-semibold text-center">
            Заполнение реквизитов
          </h3>
          <h1 class="my-2">
            Выберите организацию
          </h1>
        </div>
        <button
          class="btn btn-ghost bg-base-200 w-full hover:text-blue-500 hover:bg-blue-50 shadow-none drop-shadow-none"
          @click="modalType = 'selfEmployed'"
        >
          <span class="text-base-content">Самозанятый</span>
          <Icon class="ml-auto" name="tabler:arrow-right" size="24" />
        </button>
        <button class="btn btn-ghost bg-base-200 w-full hover:text-blue-500 hover:bg-blue-50" @click="modalType = 'IP'">
          <span class="text-base-content">ИП</span>
          <Icon class="ml-auto " name="tabler:arrow-right" size="24" />
        </button>
      </div>

      <ProfilePartnerDetailsModalSelfEmployed
        v-if="modalType === 'selfEmployed'" @back="modalType = 'choice'"
        @close="emit('close')"
      />
      <ProfilePartnerDetailsModalIP v-if="modalType === 'IP'" @back="modalType = 'choice'" @close="emit('close')" />
    </div>
  </div>
</template>

<style scoped></style>
