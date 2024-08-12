<script setup lang="ts">
const route = useRoute()

defineProps({
  state: { type: Boolean, required: false, default: false },
})

defineEmits(['click', 'update:state'])
</script>

<template>
  <div
    :class="{ 'modal-open': true }"
    class="modal cursor-pointer"
    @click="$emit('update:state', false)"
  >
    <div class="modal-box max-w-lg px-3 py-5 cursor-auto" @click.stop>
      <div class="text-xl font-semibold text-center mb-2">
        Приветствуем в Marketmonstr!
      </div>
      <div class="text-lg mb-2 text-center">
        3-х секундный гайд по работе с платформы:
      </div>
      <ol class="ml-4 list-disc text-md">
        <li class="mb-1">
          Заполните реквизиты организации для полноценного начала работы с
          платформой - Реквизиты органиации - Контактные данные
        </li>
        <li class="mb-1">
          Бегло изучите руководство по работе с платформой - С чего начать -
          Обзор кабинета - Безответные вопросы
        </li>
        <li class="mb-1">
          Пополните баланс и закажите первую услугу По всем уточнениям
          обращайтесь в службу заботы (справа снизу) С уважением, команда
          Marketmonstr
        </li>
      </ol>
      <div class="form-control">
        <label class="label cursor-pointer flex justify-start gap-5 ml-3">
          <span class="label-text">Больше не показывать</span>
          <input
            type="checkbox"
            checked="true"
            class="checkbox checkbox-primary"
          />
        </label>
      </div>
      <div class="w-full flex justify-center">
        <button class="btn btn-primary mt-2 w-[95%]">Продолжить</button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
