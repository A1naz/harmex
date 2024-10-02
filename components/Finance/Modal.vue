<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
  show: { type: Boolean, required: true },
})

const emit = defineEmits(['close'])

function closeModal() {
  emit('close')
}
</script>

<template>
  <input type="checkbox" id="selectUser" :checked="show" class="modal-toggle" />
  <div class="modal cursor-pointer z-[9999]" @click="closeModal">
    <div
      class="modal-box rounded-[8px] w-9/12 max-w-2xl cursor-auto border py-[36px] px-[58px] border-[#dee2e6]"
      @click.stop
    >
      <form method="dialog">
        <label
          class="btn btn-sm btn-circle btn-ghost bg-[#e5e5e5] absolute right-2 top-2"
          @click="closeModal"
        >
          ✕
        </label>
      </form>

      <div class="flex flex-col w-full gap-[72]">
        <div class="flex flex-col w-full justify-center items-center gap-[15px]">
          <h1 class="text-2xl font-bold">Вывод средств</h1>
          <span class="text-lg mb-[47px]"
            >Выберите куда хотите вывести средства</span
          >
        </div>
        <div class="flex gap-[16px] self-end">
          <button class="btn disabled:border-[#595959] disabled:text-[#595959] btn-ghost px-5 border-[#1b38ca] text-[#1b38ca] hover:bg-[#1b38ca] hover:text-white">Отменить</button>
          <button class="btn btn-ghost disabled:bg-[#595959] disabled:border-[#595959] text-white px-9 bg-[#1b38ca] border-[#1b38ca] hover:bg-transparent hover:text-[#1b38ca] hover:border-[#1b38ca]">Далее</button>
        </div>
        <!-- <div class="modal-action"></div> -->
      </div>
    </div>
  </div>
</template>

<style scoped></style>
