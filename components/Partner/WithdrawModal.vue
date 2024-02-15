<script setup lang="ts">
const props = defineProps({
  state: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['close', 'publish'])

const currency = useCurrency()
const createWithdrawModal = ref(false)
const closeButton = ref<HTMLElement>()
const withdraws = ref<any[]>([])

async function getWithdraws() {
  const { data, error } = await useFetch('api/partner/withdraws')
  withdraws.value = data.value as any[]
}
await getWithdraws()
async function withdrawCreated() {
  createWithdrawModal.value = false
  getWithdraws()
}
const { $dayjs } = useNuxtApp()

const now = useNow()
onKeyStroke('Escape', (e) => {
  e.preventDefault()
  closeButton.value?.click()
  emit('close')
})
</script>

<template>
  <input id="review-modal" type="checkbox" class="modal-toggle">
  <div
    ref="closeButton" :class="{
      'modal-open': state,
    }"
    class="modal"
  >
    <div class="modal-box w-10/12 max-w-4xl">
      <label
        for="review-modal" class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
        @click="$emit('close')"
      >✕</label>
      <div class="flex justify-between gap-2 items-center py-2 mt-2">
        <h3 class="text-lg font-bold mb-2">
          Вывод средств
        </h3>
        <button class="btn btn-sm btn-primary border-none bg-opacity-20 text-base-content" @click="createWithdrawModal = true">
          Создать вывод
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="table table-sm">
          <!-- head -->
          <thead>
            <tr class="bg-primary bg-opacity-40">
              <th class="rounded-tl-xl text-center">Дата</th>
              <th class="text-center">Статус</th>
              <th class="text-center">Сумма</th>
              <th class="text-center">Тип</th>
              <th class="rounded-tr-xl text-center">Детали</th>
            </tr>
          </thead>
          <tbody>
            <tr class="bg-base-200" >
              <td class="text-center">111</td>
              <td class="text-center">14.04.2024</td>
              <td class="text-center">1112 Р.</td>
              <td class="text-center">Пополнение</td>
              <td class="text-center whitespace-pre-wrap max-w-[300px] overflow-x-auto"> fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff</td>
            </tr>
            <!-- row 1 -->
            <tr v-for="(item, index) in withdraws" :key="index">
              <td>{{ $dayjs(item.date).format('D MMMM HH:mm') }}</td>
              <td>{{ item.status }}</td>
              <td>{{ currency.format(item.amount) }}</td>
              <td>{{ item.type }}</td>
              <td>{{ item.details.card }} {{ item.details.fio }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <PartnerCreateWithdrawModal :state="createWithdrawModal" @create="withdrawCreated" @close="createWithdrawModal = false" />
</template>

<style scoped>

</style>
