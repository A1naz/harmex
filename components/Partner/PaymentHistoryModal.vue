<script setup lang="ts">
const props = defineProps({
  state: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['close', 'publish'])

const closeButton = ref<HTMLElement>()

const history = ref([]) as any
const { $dayjs } = useNuxtApp()

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  closeButton.value?.click()
  emit('close')
})


const limit = ref(20)
const skip = ref(0)

const end = ref(false)
const target = ref(null)
const targetIsVisible = ref(false)
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }], observerElement) => {
    targetIsVisible.value = isIntersecting
  },
)

async function getHistory(){
      const { data, error } = await useFetch('/api/partner/paymenthistory', {
      method: 'GET',
      query: {
        limit: limit.value,
        skip: skip.value,
      },
      headers: useRequestHeaders(['cookie']) as HeadersInit,
    })
    if ((data.value as any)?.length === 0) {
      end.value = true
      return
    }
    history.value = [...history.value, ...data.value! as any]
    skip.value += limit.value
}

await getHistory()

watch(targetIsVisible, async (isVisible) => {
  if (!end.value && isVisible && history.value.length >= limit.value) await getHistory()
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
      <div class="flex w-full justify-between mb-3">
       
       <h3 class="text-lg ">
         История баланса
       </h3>
       <label
       for="review-modal" class="btn btn-sm btn-circle self-end btn-ghost"
       @click="$emit('close')"
     ><Icon name="mingcute:close-fill" size="17" /></label>
     </div>

      <div class="overflow-x-auto">
  <!-- <table class="table table-sm">

  <thead>
    <tr class="bg-primary bg-opacity-5">
      <th class="text-center rounded-tl-lg">№</th>
      <th class="text-center">Дата</th>
      <th class="text-center">Сумма</th>
      <th class="text-center">Тип</th>
      <th class="text-center border-r border-primary border-opacity-5 rounded-tr-lg">Описание</th>
    </tr>
  </thead>
  <tbody>
    <tr class="bg-base-100" v-for="(item, index) in history" :key="index">
      <td class="text-center border-r border-primary border-opacity-5">{{ index+1 }}</td>
      <td class="text-center border-r border-primary border-opacity-5">{{ $dayjs(item.date).format('D MMMM HH:mm') }}</td>
      <td class="text-center border-r border-primary border-opacity-5">{{ item.amount }} руб.</td>
      <td class="text-center border-r border-primary border-opacity-5">{{ item.type }}</td>
      <td class="text-center whitespace-pre-wrap max-w-[300px] overflow-x-auto border-r border-primary border-opacity-5">{{ item.description }}</td>
    </tr>
    <div ref="target" class="flex justify-center items-center h-4" />
  </tbody>
</table> -->
<DataTable sort-field="dataoperation" :sort-order="-1" class="hidden lg:block" :value="history" removable-sort 
      :pt="{
                    headerRow:  { class: [
                        'bg-primary bg-opacity-10 border-none text-base-content rounded-t-3xl text-center '
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
                        'rounded-tl-3xl border-none text-center mx-auto'
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
            <span class="">{{ data.amount+' ₽' }}</span>
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
        
        <Column field="description" sortable header="Комментарий" :pt="{
                    headerCell:  { class: [
                        'rounded-tr-3xl border-none'
                    ] },
                    bodyCell:  { class: [
                        'bg-base-100'
                    ] },
                }"/>
</DataTable>
<div ref="target" class="flex justify-center items-center h-4" />
      </div>
    </div>
  </div>
</template>

<style scoped>

tr.bg-base-100 {
    border-bottom: none;
}
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

/* Фон полосы прокрутки */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Стиль ползунка (полосы) прокрутки */
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

/* При наведении курсора на полосу прокрутки */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
