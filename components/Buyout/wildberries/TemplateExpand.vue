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

const uuid = toRef(props, 'uuid')
const emit = defineEmits(['getTemplates', 'closeModal'])
const store = useWildberriesBuyoutStore()
const opened = ref()

onMounted(async () => {
  opened.value = props.opened
})
watch(
  () => props.opened,
  (newState) => {
    opened.value = newState
  }
)

async function selectTemplate() {
  if (props.info.buyoutsArray.length <= 10) {
    store.createProducts = props.info.buyoutsArray
  } else {
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
  const { data, error }: any = await useFetch('/api/wildberries/buyout/deleteTemplate', {
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
    <input type="checkbox" v-model="opened" />
    <div
      class="collapse-title relative text-md font-medium flex flex-col md:justify-between md:flex-row"
    >
      <div>
        <div>
          {{ info.title }}
        </div>
      </div>
      <div class="flex z-10 gap-3">
        
        <label @click="deleteTemplate" class="btn btn-ghost btn-sm text-red-500 z-10"
          >Удалить</label
        >
        <nuxt-link to="/buyouts/create/wildberries">
          <label
            @click="selectTemplate"
            class="btn btn-sm btn-primary truncate mr-1 bg-opacity-20 border-none text-base-content"
            >Добавить</label
          >
        </nuxt-link>
      </div>
    </div>
    <div
      class="collapse-content flex items-center justify-center md:justify-start gap-2 max-h-[56rem] md:max-h-full flex-row space-x-2 overflow-x-auto"
    >
      <BuyoutWildberriesTemplateCard
        v-for="product in info.buyoutsArray"
        :product="product"
      ></BuyoutWildberriesTemplateCard>
    </div>
  </div>
  <!-- <BuyoutDeleteConfirmModal :uuid="uuid" @delete-template="deleteTemplate"></BuyoutDeleteConfirmModal> -->
</template>
