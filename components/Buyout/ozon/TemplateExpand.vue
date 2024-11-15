<script lang="ts" setup>
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
  uuid: {
    type: String,
  },
  info: {
    type: Object as any,
    required: true,
  },
  opened: {
    type: Boolean,
  },
})

const emit = defineEmits(['getTemplates', 'closeModal'])
const uuid = toRef(props, 'uuid')
const store = useOzonBuyoutStore()
const opened = ref()

onMounted(async () => {
  opened.value = props.opened
})
watch(
  () => props.opened,
  (newState) => {
    opened.value = newState
  },
)

async function selectTemplate() {
  if (props.info.buyoutsArray.length <= 10) {
    const buyoutsArray = props.info.buyoutsArray
    const startDate = new Date();
    const endDate = new Date(startDate);
    startDate.setHours(startDate.getHours() + 2)
    endDate.setHours(endDate.getHours() + 2); 
  
    const updatedBuyoutsArray = buyoutsArray.map((item:any) => {
      return {
        ...item,
        dateRange: [
          startDate.toISOString(),
          endDate.toISOString()
        ]
      };
    });

    store.createProducts = updatedBuyoutsArray;
  }
  else {
    notify({
      title: 'За раз можно создать максимум 10 выкупов',
      text: 'Добавлены первые 10 выкупов',
      type: 'error',
    })
    store.createProducts = props.info.buyoutsArray.slice(0, 10)
  }
  emit('closeModal')
}

async function deleteTemplate() {
  const { data, error }: any = await useFetch('/api/ozon/buyout/deleteTemplate', {
    method: 'DELETE',
    params: { uuid: props.uuid },
  })

  if (data.value) {
    notify({
      title: 'Шаблон удален',
      type: 'success',
      duration: 3000,
    })

    emit('getTemplates', uuid.value)
  }
}
</script>

<template>
  <div
    class="collapse collapse-arrow bg-primary bg-opacity-5 rounded-box z-0 overflow-hidden"
  >
    <input v-model="opened" type="checkbox">
    <div
      class="collapse-title relative text-md font-medium flex flex-col md:justify-between md:flex-row"
    >
      <div>
        <div>
          {{ info.title }}
        </div>
      </div>
      <div class="flex z-10 gap-3">
        <label class="btn btn-ghost btn-sm text-red-500 z-10" @click="deleteTemplate">Удалить</label>
        <nuxt-link to="/ozon/buyouts/create">
          <label
            class="btn btn-sm btn-ghost truncate mr-1 hover:bg-[#b2baff] hover:dark:bg-primary hover:dark:bg-opacity-20 border-none text-base-content"
            @click="selectTemplate"
          >Добавить</label>
        </nuxt-link>
      </div>
    </div>
    <div
      class="collapse-content flex items-center justify-center md:justify-start gap-2 max-h-[56rem] md:max-h-full flex-row space-x-2 overflow-x-auto"
    >
      <BuyoutOzonTemplateCard
        v-for="product in info.buyoutsArray"
        :product="product"
      />
    </div>
  </div>
  <!-- <BuyoutDeleteConfirmModal :uuid="uuid" @delete-template="deleteTemplate"></BuyoutDeleteConfirmModal> -->
</template>
