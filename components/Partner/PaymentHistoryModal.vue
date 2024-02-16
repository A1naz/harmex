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
       
       <h3 class="text-xl ">
         История баланса
       </h3>
       <label
       for="review-modal" class="btn btn-sm btn-circle self-end btn-ghost"
       @click="$emit('close')"
     ><Icon name="mingcute:close-fill" size="17" /></label>
     </div>

      <div class="overflow-x-auto">
        <table class="table table-sm">
          <!-- head -->
          <thead>
            <tr class="bg-primary bg-opacity-5">
              <th class="text-center">№</th>
              <th class="text-center">Дата</th>
              <th class="text-center">Сумма</th>
              <th class="text-center">Тип</th>
              <th class="text-center">Описание</th>
            </tr>
          </thead>
          <tbody>
            <!-- row 1 -->
           
            <tr class="bg-base-200" v-for="(item, index) in history" :key="index">
              <td class="text-center border-x border-primary border-opacity-5">{{ index+1 }}</td>
              <td class="text-center border-r border-primary border-opacity-5">{{ $dayjs(item.date).format('D MMMM HH:mm') }}</td>
              <td class="text-center border-r border-primary border-opacity-5">{{ item.amount }} руб.</td>
              <td class="text-center border-r border-primary border-opacity-5">{{ item.type }}</td>
              <td class="text-center whitespace-pre-wrap max-w-[300px] overflow-x-auto border-r border-primary border-opacity-5">{{ item.description }}</td>
            </tr>
            <div ref="target" class="flex justify-center items-center h-4" />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>

tr.bg-base-100 {
    border-bottom: none;
}
</style>
