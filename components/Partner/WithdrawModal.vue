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
    class="modal backdrop-filter backdrop-blur-sm"
  >
    <div class="modal-box w-10/12 max-w-2xl py-3 px-5">
      <div class="flex w-full justify-between">
       
        <h3 class="text-xl ">
          Вывод средств
        </h3>
        <label
        for="review-modal" class="btn btn-sm btn-circle self-end btn-ghost"
        @click="$emit('close')"
      ><Icon name="mingcute:close-fill" size="17" /></label>
      </div>
      
      <div class="flex justify-end gap-2 items-center">
        <button class="btn btn-sm btn-ghost text-primary p-0.5 pb-0" @click="createWithdrawModal = true">
          Создать вывод
          <Icon name="ep:right" size="10" />
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="table table-sm">
          <!-- head -->
          <thead>
            <tr class="bg-primary bg-opacity-5">
              <th class="text-center">Дата</th>
              <th class="text-center">Статус</th>
              <th class="text-center">Сумма</th>
              <th class="text-center">Тип</th>
              <th class="text-center">Детали</th>
            </tr>
          </thead>
          <tbody>
            <!-- row 1 -->
            <tr v-for="(item, index) in withdraws" :key="index" class="bg-base-100">
              <td class="text-center border-x border-primary border-opacity-5">{{ $dayjs(item.date).format('D MMMM HH:mm') }}</td>
              <td class="text-center border-r border-primary border-opacity-5">{{ item.status }}</td>
              <td class="text-center border-r border-primary border-opacity-5">{{ currency.format(item.amount) }}</td>
              <td class="text-center border-r border-primary border-opacity-5">{{ item.type }}</td>
              <td class="text-center whitespace-pre-wrap max-w-[300px] overflow-x-auto border-r border-primary border-opacity-5">{{ item.details.card }} {{ item.details.fio }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <PartnerCreateWithdrawModal :state="createWithdrawModal" @create="withdrawCreated" @close="createWithdrawModal = false" />
</template>

<style scoped>
tr.bg-base-100 {
    border-bottom: none;
}
</style>
