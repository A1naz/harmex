<script setup lang="ts">
const props = defineProps({
  show: { type: Boolean, required: true },
})

const emit = defineEmits(['close'])

function closeModal() {
  if(!isEmailSent.value){
    emit('close')
  }else{
    isEmailSent.value = false
    message.value = ''
    email.value = ''
    emit('close')
  }
}

const email = ref('')
const message = ref('')

const isEmailSending = ref(false)
const isEmailSent = ref(false)

async function updateEmail() {
  isEmailSending.value = true
  const { data, error } = await useFetch('/api/user/updateEmail', {
    method: 'POST',
    body: {
      email: email.value,
    },
    watch: false,
  })

  if (error.value) {
    message.value = error.value.data.message
  } else {
    if (data.value) {
      message.value = 'Почта успешно изменена'
      isEmailSent.value = true
    }
  }

  isEmailSending.value = false
}
</script>

<template>
  <input type="checkbox" id="selectUser" :checked="show" class="modal-toggle" />
  <div class="modal z-[9999] cursor-pointer" @click="closeModal">
    <div
      class="modal-box w-full cursor-auto rounded-[8px] border border-[#dee2e6] px-[10px] py-[30px] sm:w-9/12 sm:max-w-2xl sm:px-[58px]"
      @click.stop
    >
      <form method="dialog">
        <label
          class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2 bg-[#e5e5e5]"
          @click="closeModal"
        >
          ✕
        </label>
      </form>

      <div class="flex w-full flex-col gap-[72]">
        <div class="flex flex-col gap-[15px]">
          <h2 class="text-center text-[20px] font-[600]">
            Для подтверждения почты на платформе вам будет отправлено письмо со
            ссылкой. Перейдите по ней, чтобы подтвердить и привязать почту к
            аккаунту.
          </h2>
          <div class="mx-3 flex flex-col gap-[4px]">
            <p class="text-[12px] font-[500]">Проверьте ваш Email</p>
            <input
              v-model="email"
              placeholder="exp@email.com"
              type="text"
              class="input input-bordered w-full"
            />
          </div>
          <p class=" mx-3" :class="{ 'text-[#5ba270]': message == 'Почта успешно изменена', 'text-[#CC5F5F]' : message != 'Почта успешно изменена' }">{{ message }}</p>
        </div>
        <div class="mt-[20px] flex gap-[16px] self-end">
          <button
            @click="closeModal"
            class="rounded-lg border border-[#595959] px-5 py-2 text-[#595959] hover:border-[#1b38ca] hover:bg-[#1b38ca] hover:bg-transparent hover:text-[#1b38ca]"
          >
            Отменить
          </button>
          <button
            :disabled="!email || isEmailSending"
            @click="updateEmail"
            class="rounded-lg border border-[#1b38ca] bg-[#1b38ca] px-9 py-2 text-white hover:border-[#1b38ca] hover:bg-transparent hover:text-[#1b38ca] disabled:border-[#595959] disabled:bg-[#595959] disabled:hover:text-white"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
