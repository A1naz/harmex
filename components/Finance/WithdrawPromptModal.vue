<script setup lang="ts">
defineProps({
  show: { type: Boolean, required: true },
})

const emit = defineEmits(['close'])

function closeModal() {
  emit('close')
}
</script>

<template>
  <input id="selectUser" type="checkbox" :checked="show" class="modal-toggle">
  <div class="modal cursor-pointer z-[9999]" @click="closeModal">
    <div
      class="modal-box rounded-[8px] w-full sm:w-9/12 sm:max-w-2xl cursor-auto border py-[36px] px-[10px] sm:px-[58px] border-[#dee2e6]"
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
        <div
          class="flex flex-col w-full justify-center items-center gap-[15px] mb-[47px]"
        >
          <h1 class="text-xl font-bold">
            График выводов
          </h1>
          <div
            class="flex flex-col gap-[5px] w-full justify-start leading-4 text-[0.925rem]"
          >
            <span>Заявка на вывод средств обрабатывается в ближайший операционный
              день: понедельник, среду или пятницу. Обработка заявки в день
              может занять до 48 часов.</span>
          </div>
          <div
            class="flex gap-[5px] w-full justify-start leading-4 text-[0.925rem]"
          >
            <p class="font-normal italic">
              <span class="font-bold not-italic">Пример:</span> Если вы создали
              заявку на вывод средств в день выплат (понедельник, среду или
              пятницу), мы обработаем ваш запрос только на следующий
              операционный день. Например, запросили вывод в понедельник-заявка
              будет обработана в среду .
              <span class="font-bold not-italic">(до 48 часов)</span>).
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
