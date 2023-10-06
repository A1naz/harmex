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
const store = useBuyoutStore()
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
  store.createProducts = props.info.buyoutsArray
  emit('closeModal')
}

async function deleteTemplate() {
  const { data, error }: any = await useFetch('/api/buyout/deleteTemplate', {
    method: 'GET',
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
    class="collapse collapse-arrow border border-base-100 bg-base-200 rounded-box z-0 overflow-hidden"
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
      <div class="flex z-10">
        <nuxt-link to="/buyouts/create">
          <label
            @click="selectTemplate"
            class="btn btn-sm btn-primary truncate mr-1"
            >Добавить</label
          >
        </nuxt-link>
        <label @click="deleteTemplate" class="btn btn-sm bg-red-400 z-10"
          >Удалить</label
        >
      </div>
    </div>
    <div
      class="collapse-content flex items-center justify-center md:justify-start gap-2 max-h-[56rem] md:max-h-full flex-wrap overflow-y-auto md:overflow-hidden"
    >
      <BuyoutTemplateCard
        v-for="product in info.buyoutsArray"
        :product="product"
      ></BuyoutTemplateCard>
    </div>
</div>
<!-- <BuyoutDeleteConfirmModal :uuid="uuid" @delete-template="deleteTemplate"></BuyoutDeleteConfirmModal> -->
</template>
