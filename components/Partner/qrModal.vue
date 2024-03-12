<script setup lang="ts">
import { useNotification } from '@kyvg/vue3-notification'
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
  show: { type: Boolean, required: true },
  src: { type: String, required: true}
})

// console.log('src', props.src)
const emit = defineEmits(['closeModal'])

async function copyImageToClipboard(base64Image: any) {
  try {

    const binaryData = atob(base64Image.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }
    
    const blob = new Blob([uint8Array], { type: 'image/png' });

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);
    await useFetch('/api/partner/isShared', { method: 'GET' })
    notify({
      title: 'Изображение скопировано в буфер обмена',
    });
    
  } catch (error) {
    // console.error('Ошибка при копировании изображения в буфер обмена:', error);
    notify({
      title: 'Ошибка при копировании изображения',
    });
  }
}

const closeButton = ref<HTMLElement>()
onKeyStroke('Escape', (e) => {
  e.preventDefault()
  closeButton.value?.click()
})
</script>

<template>
  <div
      v-if="props.show === true"
      @click="$emit('closeModal')"
      class="modalCustom fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm"
    >
      <div class="flex flex-col bg-base-100 rounded-lg w-full max-w-[650px] lg:max-w-xs gap-1 p-4" @click.stop>
        <div class="flex">
          <div class="font-medium text-lg mx-auto">QR-код</div>
          <button class="text-gray-500 hover:text-gray-700 self-end mb-2" @click="$emit('closeModal')">
            <Icon name="material-symbols:close-rounded" size="24" />
          </button>
        </div>
      <div class="bg-base-100 rounded-lg">
          <div class="w-full flex flex-col justify-center items-center">
            <NuxtImg
              class="rounded-lg"
              height="300"
              width="300"
              :src="src"
            />
          </div>
          <button id="btnid" class="btn btn-primary w-full border-none bg-opacity-20 text-base-content" @click="copyImageToClipboard(src)">Копировать</button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
