<script setup lang="ts">
const emit = defineEmits(['close', 'back'])
const formInfo = reactive({
  firstName: '',
  lastName: '',
  middleName: '',
  inn: '',
  ks: '',
  rs: '',
  bik: '',
})
const { notify } = useNotification()

async function back() {
  formInfo.inn = ''
  emit('back')
}

async function save() {
  const { data, error } = await useFetch('/api/partnerDetails/selfEmployed', {
    method: 'POST',
    body: {
      ...formInfo,
    },
  })

  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data?.message,
      type: 'error',
      duration: 3000,
    })
  }
  if (data.value) {
    formInfo.inn = ''
    notify({
      type: 'success',
      title: 'Успешно',
      text: 'Данные сохранены',
      duration: 3000,
    })
    emit('close')
  }
}
</script>

<template>
  <div>
    <h3 class="text-lg text-center font-semibold mb-3">
      Заполнение реквизитов Самозанятый
    </h3>
    <div class="text-sm mt-3">
      Имя
    </div>
    <input v-model="formInfo.firstName" placeholder="Иван" class="input input-bordered  w-full mt-1">
    <div class="text-sm mt-3">
      Фамилия
    </div>
    <input v-model="formInfo.lastName" placeholder="Иванов" class="input input-bordered  w-full mt-1">
    <div class="text-sm mt-3">
      Отчество
    </div>
    <input v-model="formInfo.middleName" placeholder="Иванов" class="input input-bordered  w-full mt-1">

    <div class="text-sm mt-3">
      ИНН
    </div>
    <input v-model="formInfo.inn" type="number" placeholder="Введите ИНН" class="input input-bordered  w-full mt-1">
    <div class="text-sm mt-3">
      К/С
    </div>
    <input v-model="formInfo.ks" type="number" placeholder="Введите К/С" class="input input-bordered  w-full mt-1">
    <div class="text-sm mt-3">
      Р/С
    </div>
    <input v-model="formInfo.rs" type="number" placeholder="Введите Р/С" class="input input-bordered  w-full mt-1">
    <div class="text-sm mt-3">
      БИК
    </div>
    <input v-model="formInfo.bik" type="number" placeholder="Введите БИК" class="input input-bordered  w-full mt-1">

    <div class="w-full flex justify-end gap-2 mt-4 -mb-4">
      <button class="btn btn-outline btn-primary my-2 px-5" @click="back">
        Назад
      </button>
      <button class="btn btn-primary my-2 px-10" @click="save">
        Создать
      </button>
    </div>
  </div>
</template>
