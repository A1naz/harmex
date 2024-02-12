import { onMounted } from 'vue';
<script setup lang="ts">
const props = defineProps({
  state: {
    type: Boolean,
    required: true,
  },
  isCreateButtonDisabled: {
    type: Boolean,
  },
})

const isCreateButtonDisabled = toRef(props, 'isCreateButtonDisabled')

const emit = defineEmits(['close', 'create'])
const store = useBuyoutStore()
const message = ref('')
const loading = ref(false)
const success = ref(false)
async function checkBuyouts() {
  loading.value = true
  const userOffsetMinutes = new Date().getTimezoneOffset()
  const userTimezoneOffsetHours = -userOffsetMinutes / 60
  const { data, error } = await useFetch('/api/buyout/checkRules', {
    method: 'POST',
    body: JSON.stringify(store.createProducts),
    query: {
      userTimezoneOffsetHours: userTimezoneOffsetHours - 3,
    },
  })
  if (error.value) {
    success.value = false
    message.value = 'Произошла ошибка при проверке'
  }
  if (data.value) {
    if (data.value.success) success.value = true

    message.value = data.value.message
  }
  loading.value = false
}
onMounted(async () => {
  checkBuyouts()
})
</script>

<template>
  <div
    id="buyoutChecksModal"
    :class="{
      'modal-open': state,
    }"
    class="modal"
  >
    <div class="modal-box max-w-[400px]">
      <h3 class="font-bold text-lg mb-2">Проверяем выкупы по правилам</h3>
      <span
        v-if="!loading"
        :class="{
          'text-error bg-error bg-opacity-20': !success,
          'text-green-600 bg-green-200': success,
        }"
        class="text-md mt-3 rounded-2xl py-1 px-2"
        >{{ success ? 'Успешно' : 'Ошибка' }}</span
      >
      <div class="flex justify-center mt-6">
        <span v-if="loading" class="loading loading-spinner loading-lg" />
        <span v-else class="text-xs mb-2">{{ message }}</span>
      </div>
      <div class="flex justify-around items-center">
        <button v-if="!loading" class="btn btn-md" @click="emit('close')">
          Закрыть
        </button>
        <button
          :disabled="isCreateButtonDisabled"
          v-if="success"
          class="btn btn-md btn-primary"
          @click="emit('create')"
        >
          Создать
        </button>
        <button
          :disabled="isCreateButtonDisabled"
          v-if="!success && !loading"
          class="btn btn-md btn-primary"
          @click="emit('create')"
        >
          Игнорировать ошибку и создать
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
