<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { email, helpers, required } from '@vuelidate/validators'

const props = defineProps({
  show: { type: Boolean, required: true },
})
const emit = defineEmits(['close'])
const { fetch } = useUserSession()
const formData = reactive({
  email: '',
})
const message = ref('')

const isEmailSending = ref(false)
const isEmailSent = ref(false)

function closeModal() {
  if (!isEmailSent.value) {
    emit('close')
  }
  else {
    isEmailSent.value = false
    message.value = ''
    formData.email = ''
    emit('close')
  }
}

const rules = computed(() => {
  return {
    email: {
      required: helpers.withMessage('Введите email', required),
      email: helpers.withMessage('Неверный email', email),
    },
  }
})

const v$ = useVuelidate(rules, formData)
async function updateEmail() {
  isEmailSending.value = true
  const { data, error } = await useFetch('/api/user/updateEmail', {
    method: 'POST',
    body: {
      email: formData.email,
    },
    watch: false,
  })

  if (error.value) {
    message.value = error.value.data.message
  }
  else {
    if (data.value) {
      message.value = 'Письмо было отправлено.'
      isEmailSent.value = true
      await fetch()
    }
  }

  isEmailSending.value = false
}
</script>

<template>
  <input id="selectUser" type="checkbox" :checked="props.show" class="modal-toggle">
  <div class="modal z-[9999] cursor-pointer" @click="closeModal">
    <div
      class="modal-box w-full cursor-auto rounded-[8px] border border-[#dee2e6] max-w-sm px-[10px] py-[30px] sm:w-9/12 sm:max-w-2xl sm:px-[58px]"
      @click.stop
    >
      <form method="dialog">
        <label class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2 bg-[#e5e5e5]" @click="closeModal">
          ✕
        </label>
      </form>

      <div class="flex w-full flex-col gap-[72]">
        <div class="flex flex-col gap-[15px]">
          <h2 class="lg:text-center text-[16px] lg:text-[20px] font-[600]">
            Для подтверждения почты на платформе вам будет отправлено письмо со
            ссылкой. Перейдите по ней, чтобы подтвердить и привязать почту к
            аккаунту.
          </h2>
          <div class="lg:mx-3 flex flex-col gap-[4px]">
            <p class="text-[12px] font-[500]">
              Введите ваш email
            </p>
            <input
              v-model="formData.email" placeholder="exp@email.com" type="text" class="input input-bordered w-full"
              @blur="v$.email.$touch"
            >
            <div v-if="v$.email.$error" class="text-red-500 text-xs mt-1">
              {{ v$.email.$errors[0].$message }}
            </div>
          </div>
          <p
            class=" lg:mx-3"
            :class="{ 'text-[#5ba270]': isEmailSent, 'text-[#CC5F5F]': !isEmailSent }"
          >
            {{ message }}
          </p>
        </div>
        <div class="mt-[20px] flex gap-[16px] lg:self-end justify-between lg:justify-end">
          <button
            class="rounded-lg border border-[#595959] px-5 py-2 text-[#595959] hover:border-[#1b38ca] hover:bg-[#1b38ca] hover:bg-transparent hover:text-[#1b38ca] w-[45%] lg:w-auto"
            @click="closeModal"
          >
            Отменить
          </button>
          <button
            :disabled="!formData.email || isEmailSending || v$.email.$invalid"
            class="rounded-lg border border-[#1b38ca] bg-[#1b38ca] px-9 py-2 text-white hover:border-[#1b38ca] hover:bg-transparent hover:text-[#1b38ca] disabled:border-[#595959] disabled:bg-[#595959] disabled:hover:text-white w-[45%] lg:w-auto"
            @click="updateEmail"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
