<script lang="ts" setup>
import { YandexMap, YandexMarker } from 'vue-yandex-maps'
import { notify } from '@kyvg/vue3-notification'

const { height } = useWindowSize()
const config = useRuntimeConfig()

const props = defineProps({
  pickpoints: {
    type: Array,
    required: true,
  },
  state: {
    type: Boolean,
    required: true,
  },
})

const loading = ref(false)
const addressText = ref('')
const emit = defineEmits(['callback', 'close'])
const error = ref('')
const store = useMainStore()

function closeModal() {
  emit('close')
}

const coordinates = ref([55, 33])
const onClick = (e: any) => {
  console.log(e)
  coordinates.value = e.get('coords')
  getAddressText(e.get('coords')[0], e.get('coords')[1], '1')
}

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  emit('close')
})

async function getAddressText(lt: number, lg: number, id: string) {
  addressText.value = 'Загрузка...'

  // @ts-ignore
  const { data, error }: any = await useFetch(`/api/ozon/buyout/addressText`, {
    method: 'GET',
    params: {
      lt,
      lg,
    },
  })
  if (data.value) {
    addressText.value = data.value
  }
}
</script>

<template>
  <div
    id="selectPointModal"
    class="modal"
    :class="{
      'modal-open': props.state,
    }"
  >
    <div v-if="state" class="modal-box w-11/12 max-w-4xl">
      <div class="">
        <a
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="closeModal"
          >✕</a
        >
        <div class="title mb-2">Выберите ПВЗ</div>
        Координаты: {{ coordinates }} , Адрес: {{ addressText }}
        <div
          v-if="loading"
          class="loading flex justify-center items-center h-full"
        >
          <Icon class="animate-spin" size="60" name="mdi:loading" />
        </div>
        <div
          v-if="error"
          class="text-lg text-center text-error flex items-center justify-center h-full"
        >
          {{ error }}
        </div>
        <YandexMap
          :coordinates="coordinates"
          @click="onClick"
          :noPlacemark="true"
        >
          <YandexMarker :coordinates="coordinates" :marker-id="123" />
        </YandexMap>
      </div>
    </div>
    <div class="modal-backdrop cursor-pointer" @click="closeModal"></div>
  </div>
</template>

<style>
.yandex-container {
  height: 75vh;
  width: 100%;
  border-radius: 20px; /* Установите желаемый радиус скругления углов */
  overflow: hidden;
}

.yandex-balloon {
  height: 200px;
  width: 300px;
}

::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 0px;
  border-radius: 4px;
}
</style>
