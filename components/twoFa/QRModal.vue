<script setup lang="ts">
const store = useMainStore()
const qrCode = ref('null')
const twoFaSecret = ref('')
const loading = ref(true)
const isCodeSaved = ref(false)
import { notify } from '@kyvg/vue3-notification'
import turnOnOffGet from '~/server/api/2fa/turnOnOff.get'

async function getQr() {
  if (twoFaSecret.value == '') {
    const { data }: any = await useFetch('/api/2fa/getCode')
    qrCode.value = data.value.qrCode
    twoFaSecret.value = data.value.secret

    loading.value = false
  }
}

function clear() {
  qrCode.value = 'null'
  twoFaSecret.value = ''
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
  notify({
    title: 'Код скопирован в буфер обмена',
  })
}

async function turnOnTwoFa() {
  const { data }: any = await useFetch('/api/2fa/turnOnOff', {
    method: 'GET',
    query: {
      changeTo: true,
    },
  })
  if (data.value) {
    notify({
      title: 'Двухфакторная аутентификация включена',
    })
    store.twoFaQRModal = false
  }
}

defineExpose({ getQr, clear })
</script>

<template>
  <input id="twoFaQRModal" type="checkbox" class="modal-toggle" />
  <div
    id="twoFaQRModal"
    :class="{ 'modal-open': store.twoFaQRModal }"
    class="modal"
  >
    <div class="modal-box">
      <label
        class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
        @click="store.twoFaQRModal = false"
        >✕</label
      >

      <div class="w-ful flex flex-col justify-center items-center">
        <span class="text-xl">Двухфакторная аутентификация</span>
        <span class="mt-2"
          >Отсканируйте этот QR-код в приложении Google Authenticator</span
        >
        <NuxtImg
          v-if="!loading"
          class="rounded-lg mt-4"
          height="300"
          width="300"
          :src="qrCode"
        />
        <div v-else class="h-[300px] flex justify-center">
          <span class="loading loading-ring loading-lg mb-10"></span>
        </div>

        <div>
          <div class="mt-2 mb-1">
            Если вы не можете отсканировать QR-код, введите код
          </div>
          <div
            @click="copyToClipboard(twoFaSecret)"
            class="bg-base-100 cursor-pointer rounded-lg p-2 border border-primary md:flex justify-center gap-2 items-center"
          >
            <span class="link flex text-2xl lg:link-hover">
              {{ twoFaSecret }}
            </span>
          </div>
        </div>
        <span class="mt-2 flex text-center text-warning text-md">
          Пожалуйста, сохраните этот код на бумаге. Этот ключ позволит вам
          восстановить ваш Google Authenticator в случае потери телефона. Для
          сброса Google Authenticator обратитесь в службу поддержки.
        </span>
      </div>

      <div class="flex justify-center flex-wrap">
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text mr-2">Я сохранил код</span>
            <input
              type="checkbox"
              v-model="isCodeSaved"
              class="checkbox checkbox-primary"
            />
          </label>
        </div>
        <button
          :disabled="!isCodeSaved"
          class="btn text-[15px] btn-primary mt-3"
          @click="turnOnTwoFa"
        >
          Подключить двухфакторную аутентификацию
        </button>
      </div>
    </div>

    <label
      class="modal-backdrop cursor-pointer"
      @click="store.twoFaQRModal = false"
      >Close</label
    >
  </div>
</template>

<style scoped></style>
