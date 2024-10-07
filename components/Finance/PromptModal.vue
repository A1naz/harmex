<script setup lang="ts">

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
            Вывод средств Юридическое лицо или ИП
          </h1>
          <div class="flex flex-col gap-[5px] w-full justify-start">
            <h2 class="font-bold">
              Как вывести деньги на Юридическое лицо или ИП?
            </h2>
            <span
              >Оставьте заявку на вывод средств в данном разделе, заполнив все
              поля с реквизитами.</span
            >
          </div>
          <div class="flex gap-[5px] w-full justify-start">
            <p class="font-normal">
              <span class="font-bold">В ближайший день вывода</span> для вас
              будет подготовлен комплект документов необходимых в соответсвии с
              процедурой оформления, предусмотренной на платформе (такими
              документами в зависимости от типа налогообложения и основания
              выплаты могут являться-
              <span class="font-bold"
                >Договор, Соглашение, Отчет, Акт, Счет</span
              >). Передача документов происходит посредством нашего<span
                class="font-bold"
              >
                специального бота</span
              >, в который вы предварительно получите приглашение.
            </p>
          </div>
          <div class="flex gap-[5px] w-full justify-start">
            <p class="font-normal">
              <span class="font-bold">Выплата средств</span> осуществляется
              после <span class="font-bold">получения от вас</span> комплекта
              подписанных документов, оригиналы которых необходимо отправить в
              срок <span class="font-bold">не позднее 30 дней</span> после
              каждой выплаты средств.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
