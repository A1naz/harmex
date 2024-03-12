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
       
        <h3 class="text-lg ">
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
        <!-- <table class="table table-sm">
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
            <tr v-for="(item, index) in withdraws" :key="index" class="bg-base-100">
              <td class="text-center border-x border-primary border-opacity-5">{{ $dayjs(item.date).format('D MMMM HH:mm') }}</td>
              <td class="text-center border-r border-primary border-opacity-5">{{ item.status }}</td>
              <td class="text-center border-r border-primary border-opacity-5">{{ currency.format(item.amount) }}</td>
              <td class="text-center border-r border-primary border-opacity-5">{{ item.type }}</td>
              <td class="text-center whitespace-pre-wrap max-w-[300px] overflow-x-auto border-r border-primary border-opacity-5">{{ item.details.card }} {{ item.details.fio }}</td>
            </tr>
          </tbody>
        </table> -->
        <DataTable sort-field="dataoperation" :sort-order="-1" class="hidden lg:block" :value="withdraws" removable-sort 
      :pt="{
                    headerRow:  { class: [
                        'bg-primary bg-opacity-10 border-none text-base-content text-center '
                    ] },
                    table: { class: [
                      'bg-base-100'
                    ]}

                }"
      >
        <Column field="date" sortable header="Дата" class="border-r border-base-200"   
                :pt="{
                    bodyCell:  { class: [
                        'bg-base-100 '
                    ] },
                    headerCell:  { class: [
                        'border-none text-center mx-auto'
                    ] },
                }">
          <template #body="{ data }">
            <span class="text-primary">{{ $dayjs(data.date).format('D MMMM HH:mm') }}</span>
          </template>
        </Column>

        <Column field="amount" sortable header="Сумма" class="border-r border-base-200"  :pt="{
                    bodyCell:  { class: [
                        'bg-base-100'
                    ] },
                    headerCell:  { class: [
                        'border-none'
                    ] },
                }">
          <template #body="{ data }">
            <span class="">{{ currency.format(data.amount)+' ₽' }}</span>
          </template>
        </Column>
        
        
        <Column field="type" sortable header="Тип" class="border-r border-base-200"  :pt="{
                    bodyCell:  { class: [
                        'bg-base-100'
                    ] },
                    headerCell:  { class: [
                        'border-none'
                    ] },
                }"/>
        <Column field="status" sortable header="Статус" class="border-r border-base-200"  :pt="{
            bodyCell:  { class: [
                'bg-base-100'
            ] },
            headerCell:  { class: [
                'border-none'
            ] },
        }"/>
        
        <Column field="details" sortable header="Детали" :pt="{
                    headerCell:  { class: [
                        ' border-none'
                    ] },
                    bodyCell:  { class: [
                        'bg-base-100'
                    ] },
                }">
        <template #body="{ data }">
            <span class="">{{ data.details.card }} {{ data.details.fio }}</span>
          </template>
        </Column>
</DataTable>
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
