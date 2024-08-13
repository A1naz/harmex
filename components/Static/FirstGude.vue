<script setup lang="ts">
const isChecked = ref(false)

defineProps({
  state: { type: Boolean, required: false, default: false },
  faceType: { type: String, required: false, default: 'fizFace' },
})

const emit = defineEmits(['click', 'update:state'])

const close = () => {
  if (isChecked.value) {
    localStorage.setItem('firstGuideModal', 'true')
  }

  emit('update:state', false)
}
</script>

<template>
  <div
    :class="{ 'modal-open': state }"
    class="modal cursor-pointer"
    @click="$emit('update:state', false)"
  >
    <div class="modal-box max-w-lg px-5 py-5 cursor-auto" @click.stop>
      <div v-if="faceType == 'yurFace'">
        <div class="text-xl font-semibold text-center mb-2">
          Приветствуем в Marketmonstr!
        </div>
        <div class="text-lg mb-2 text-center">
          3-х секундный гайд по работе с платформой:
        </div>
        <ol class="ml-4 list-decimal text-md">
          <li class="mb-2">
            Заполните личный профиль
            <p>- Реквизиты органиации</p>
            <p>- Данные пользователя</p>
            <p>- Контактные данные</p>
          </li>
          <li class="mb-2">
            Бегло изучите руководство по работе с платформой
            <p>- С чего начать</p>
            <p>- Обзор кабинета</p>
            <p>- Безответные вопросы</p>
          </li>
          <li class="mb-2">Пополните баланс и закажите первую услугу</li>
        </ol>
        <p class="mb-2">
          По всем уточнениям обращайтесь в службу заботы (справа снизу)
        </p>
        <p>С уважением, команда Marketmonstr</p>
      </div>
      <div v-if="faceType == 'fizFace'">
        <div class="text-xl font-semibold text-center mb-2">
          Приветствуем в Marketmonstr!
        </div>
        <div class="text-lg mb-2 text-center">
          3-х секундный гайд по работе с платформой:
        </div>
        <ol class="ml-4 list-decimal text-md">
          <li class="mb-2">
            Заполните личный профиль
            <p>- Данные пользователя</p>
            <p>- Контактные данные</p>
          </li>
          <li class="mb-2">
            Бегло изучите руководство по работе с платформой
            <p>- С чего начать</p>
            <p>- Обзор кабинета</p>
            <p>- Безответные вопросы</p>
          </li>
          <li class="mb-2">Пополните баланс и закажите первую услугу</li>
        </ol>
        <p class="mb-2">
          По всем уточнениям обращайтесь в службу заботы (справа снизу)
        </p>
        <p>С уважением, команда Marketmonstr</p>
      </div>
      <div v-if="faceType == 'staff'">
        <div class="text-xl font-semibold text-center mb-2">
          Приветствуем в Marketmonstr!
        </div>
        <div class="text-lg mb-2 text-center">
          3-х секундный гайд по работе с платформой:
        </div>
        <ol class="ml-4 list-decimal text-md">
          <li class="mb-2">
            Бегло изучите руководство по работе с платформой
            <p>- С чего начать</p>
            <p>- Обзор кабинета</p>
            <p>- Безответные вопросы</p>
          </li>
          <li class="mb-2">Пополните баланс и закажите первую услугу</li>
        </ol>
        <p class="mb-2">
          По всем уточнениям обращайтесь в службу заботы (справа снизу)
        </p>
        <p>С уважением, команда Marketmonstr</p>
      </div>
      <div class="form-control w-[50%] mt-3">
        <label class="label cursor-pointer flex justify-start gap-5 ml-3">
          <span class="label-text">Больше не показывать</span>
          <input
            v-model="isChecked"
            type="checkbox"
            class="checkbox checkbox-primary"
          />
        </label>
      </div>
      <div class="w-full flex justify-center">
        <button class="btn btn-primary mt-2 w-[95%]" @click="close">
          Продолжить
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
