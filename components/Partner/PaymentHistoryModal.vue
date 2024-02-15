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
    class="modal"
  >
    <div class="modal-box w-10/12 max-w-4xl">
        <label
            for="review-modal" class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
            @click="$emit('close')"
        >✕</label>
        <div class="flex justify-between gap-2 items-center py-2">
            <h3 class="text-lg font-bold mb-2">
            История баланса
            </h3>
        </div>

      <div class="overflow-x-auto">
        <table class="table table-sm">
          <!-- head -->
          <thead>
            <tr class="bg-primary bg-opacity-40">
              <th class=" rounded-tl-xl text-center">№</th>
              <th class="text-center">Дата</th>
              <th class="text-center">Сумма</th>
              <th class="text-center">Тип</th>
              <th class="rounded-tr-xl text-center">Описание</th>
            </tr>
          </thead>
          <tbody>
            <!-- row 1 -->
           
            <tr class="bg-base-200" v-for="(item, index) in history" :key="index">
              <td class="text-center">{{ index+1 }}</td>
              <td class="text-center">{{ $dayjs(item.date).format('D MMMM HH:mm') }}</td>
              <td class="text-center">{{ item.amount }} руб.</td>
              <td class="text-center">{{ item.type }}</td>
              <td class="text-center whitespace-pre-wrap max-w-[300px] overflow-x-auto">{{ item.description }}</td>
            </tr>
            <div ref="target" class="flex justify-center items-center h-4" />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
