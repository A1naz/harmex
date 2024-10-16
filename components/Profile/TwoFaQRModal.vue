<script setup lang="ts">
const qrCode = ref('null')
const twoFaSecret = ref('')
const loading = ref(true)
const isCodeSaved = ref(false)
const code = ref('')
const isCodeConfirmed = ref(false)
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
  show: { type: Boolean, required: true, default: false },
})

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
  loading.value = true
  isCodeSaved.value = false
  code.value = ''
  isCodeConfirmed.value = false
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
    emit('closeWithTurnOn')
  }
}

async function confirm2fa() {
  await confirm2faDebounced()
}

async function findSearchQuery() {
  if (
    isCodeConfirmed.value ||
    !code.value ||
    code.value.replaceAll(' ', '').length < 6
  ) {
    return
  }

  const { data, error }: any = await useFetch('/api/2fa/confirm', {
    method: 'GET',
    params: {
      code: code.value.replaceAll(' ', ''),
    },
  })

  if (data.value) {
    isCodeConfirmed.value = data.value.status

    if (!isCodeConfirmed.value) {
      notify({
        title: 'Неверный код',
      })
    } else {
      notify({
        title: 'Код подтвержден',
      })
    }
  }
}

const confirm2faDebounced = useDebounceFn(findSearchQuery, 300)

const { show } = toRefs(props)

watch(show, (newVal) => {
  if (newVal) {
    getQr()
  }
})

const emit = defineEmits(['close', 'closeWithTurnOn'])

defineExpose({ getQr, clear })
</script>

<template>
  <input
    id="twoFaQRModal"
    type="checkbox"
    :checked="props.show"
    class="modal-toggle"
  />
  <div
    id="twoFaQRModal"
    :class="{ 'modal-open': props.show }"
    class="modal z-[10000]"
  >
    <div class="modal-box">
      <label
        class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
        @click="$emit('close')"
        >✕</label
      >

      <div class="w-ful flex flex-col items-center justify-center">
        <span class="text-xl">Двухфакторная аутентификация</span>
        <span class="mt-2"
          >Отсканируйте этот QR-код в приложении Google Authenticator</span
        >
        <NuxtImg
          v-if="!loading"
          class="mt-4 rounded-lg"
          height="300"
          width="300"
          :src="qrCode"
        />
        <div v-else class="flex h-[300px] justify-center">
          <span class="loading loading-ring loading-lg mb-10"></span>
        </div>

        <div>
          <div class="mb-1 mt-2">
            Если вы не можете отсканировать QR-код, введите код
          </div>
          <div
            @click="copyToClipboard(twoFaSecret)"
            class="cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary bg-base-100 p-2 md:flex"
          >
            <span class="link flex text-2xl lg:link-hover">
              {{ twoFaSecret }}
            </span>
          </div>
          <input
            :disabled="isCodeConfirmed"
            v-model="code"
            @keyup.enter="confirm2fa"
            @input="confirm2faDebounced"
            ref="codeInput"
            v-maska
            data-maska="### ###"
            placeholder="Подтвердите код Google Authenticator"
            class="input-confirm input input-bordered mt-3 w-full text-center text-2xl"
          />
        </div>
        <span class="text-md mt-2 flex text-center">
          Пожалуйста, сохраните этот код на бумаге. Этот ключ позволит вам
          восстановить ваш Google Authenticator в случае потери телефона. Для
          сброса Google Authenticator обратитесь в службу поддержки.
        </span>
      </div>

      <div class="flex flex-wrap justify-center">
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text mr-2">Я сохранил код</span>
            <input
              type="checkbox"
              v-model="isCodeSaved"
              class="checkbox-primary checkbox"
            />
          </label>
        </div>
        <button
          :disabled="!isCodeSaved || !isCodeConfirmed"
          class="btn btn-primary mt-3 text-[15px]"
          @click="turnOnTwoFa"
        >
          Подключить двухфакторную аутентификацию
        </button>
      </div>
    </div>

    <label class="modal-backdrop cursor-pointer" @click="$emit('close')"
      >Close</label
    >
  </div>
</template>

<style scoped>
.input-confirm::placeholder {
  font-size: 1.1rem;
  font-weight: bold;
}
</style>
