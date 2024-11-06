<script setup lang="ts">
defineProps({
  show: { type: Boolean, required: true },
  item: { type: Object, required: true },
})

const emit = defineEmits(['close', 'delete'])

function closeModal() {
  emit('close')
}
function deleteItem(deleteItem:any){
  emit('delete', deleteItem)
  closeModal()
}
</script>

<template>
  <input type="checkbox" id="selectUser" :checked="show" class="modal-toggle" />
  <div class="modal z-[9999] cursor-pointer w-full" @click="closeModal">
    <div
      class="modal-box w-full cursor-auto rounded-[8px] border border-[#dee2e6] px-[10px] py-[36px] sm:w-9/12 sm:max-w-2xl sm:px-[58px]"
      @click.stop
    >
      <form method="dialog">
        <label
          class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2 bg-[#e5e5e5]"
          @click="closeModal"
        >
          ✕
        </label>
      </form>
      <div class="flex flex-col items-center justify-center gap-6">
        <h1 class="text-xl font-bold text-center w-2/3">
          Вы действительно хотите удалить “{{ item.title }}” ?
        </h1>
        <div class="flex justify-center gap-5 w-full">
          <button
            @click="closeModal"
            class="rounded-lg border border-[#1b38ca] px-5 py-2 text-[#1b38ca] hover:bg-[#1b38ca] hover:text-white disabled:border-[#595959] disabled:text-[#595959] disabled:hover:bg-transparent"
          >
            Отменить
          </button>
          <button
            @click="deleteItem(item)"
            class="rounded-lg border border-[#1b38ca] bg-[#1b38ca] px-9 py-2 text-white hover:border-[#1b38ca] hover:bg-transparent hover:text-[#1b38ca] disabled:border-[#595959] disabled:bg-[#595959] disabled:hover:text-white"
          >
            Далее
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
