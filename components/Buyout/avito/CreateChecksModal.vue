
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
const store = useAvitoBuyoutStore()
const message = ref('')
const loading = ref(false)
const success = ref(false)
async function checkBuyouts() {
  loading.value = true
  const userOffsetMinutes = new Date().getTimezoneOffset()
  const userTimezoneOffsetHours = -userOffsetMinutes / 60
  const { data, error } = await useFetch('/api/avito/buyout/checkRules', {
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
    <div class="modal-box max-w-lg" :class="{'max-w-sm' : success} ">
      <h3 class="font-semibold text-lg mb-2">Проверяем выкупы по правилам</h3>
      <a
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        @click="$emit('close')"
        >✕</a
      >
      <div class="flex mt-1 gap-2">
        <span
        v-if="!loading"
        :class="{
          'text-base-100 bg-red-500 bg-opacity-90': !success,
          'text-base-content bg-success': success,
        }"
        class="text-md my-auto rounded-2xl py-0.5 text-xs px-2"
        >{{ success ? 'Успешно' : 'Ошибка' }}
        </span
      >
        <span v-if="loading" class="loading loading-spinner loading-lg" />
        <span v-else class="text-xs my-auto">{{ message }}</span>
      </div>
      <div class="flex justify-around items-center mt-2">
        <button v-if="!loading" class="btn btn-ghost btn-sm h-[2.5rem] w-[49%] font-normal" @click="emit('close')">
          Закрыть
        </button>
        <button
          :disabled="isCreateButtonDisabled"
          v-if="success"
          class="btn btn-sm h-[2.5rem] btn-primary bg-opacity-20 text-base-content border-none w-[49%] font-normal"
          @click="emit('create')"
        >
          Создать
        </button>
        <button
          :disabled="isCreateButtonDisabled"
          v-if="!success && !loading"
          class="btn btn-sm h-[2.5rem] btn-primary bg-opacity-20 text-base-content border-none w-[49%] font-normal"
          @click="emit('create')"
        >
          Игнорировать ошибку и создать
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
