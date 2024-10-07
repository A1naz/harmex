<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { email, helpers, minLength, required, sameAs, maxLength, and } from '@vuelidate/validators'
const { loggedIn, user, session, fetch, clear } = useUserSession()

const store = useMainStore()

definePageMeta({
  auth: {
    unauthenticatedOnly: false,
    navigateAuthenticatedTo: '/buyouts',
  },
  title: 'Вход',
})
const { notify } = useNotification()

const router = useRouter()

const codeSended = ref(false)
const resendCodeDisabled = ref(false)
const resendCodeText = ref('Подтвердить')
const resendCodeTimer = ref(60)
const { counter, reset, pause, resume } = useInterval(1000, {
  controls: true,
  immediate: false,
})

watch(counter, (newValue) => {
  if (newValue < 60) {
    resendCodeTimer.value = 60 - newValue
    resendCodeText.value = `Подтвердить (${resendCodeTimer.value})`
  } else {
    pause()
    resendCodeText.value = 'Подтвердить'
    resendCodeDisabled.value = false
  }
})


const loading = ref(false)

const formData = reactive({
  phoneNumber: '',
  newPassword: '',
  repeatPassword: '',
  code: '',
})

const rules = computed(() => {
  return {
    phoneNumber: {
      required: helpers.withMessage('Введите номер телефона', required),
      minLength: helpers.withMessage('Неверный номер телефона', minLength(18)),
      maxLength: helpers.withMessage('Неверный номер телефона', maxLength(18)),
    },
    newPassword: {
      required: helpers.withMessage('Введите пароль', required),
      minLength: helpers.withMessage(
        'Пароль должен быть длиннее 6 символов',
        minLength(6)
      ),
    },
    repeatPassword: {
      required: helpers.withMessage('Введите пароль еще раз', required),
      sameAs: helpers.withMessage('Пароли не совпадают', sameAs(formData.newPassword)),
    },
    code: {
      required: helpers.withMessage('Введите код', required),
    },
  }
})

const v$ = useVuelidate(rules, formData)
function startCodeTimer() {
  codeSended.value = true
  resendCodeDisabled.value = true
  resendCodeText.value = 'Подтвердить (60)'
  resendCodeTimer.value = 60
  reset()
  resume()
}
async function sendCode() {
  const valid = await v$.value.phoneNumber.$validate()
  if (!valid) return
  loading.value = true

  const response = await $fetch('/api/auth/sendCode', {
    method: 'POST',
    body: {
      type: 'resetPassword',
      phoneNumber: formData.phoneNumber
    }
  }).catch(err => {
    notify({
      type: 'error',
      title: 'Ошибка отправки кода',
      text: err.data.message || err.message
    })
    if (err.status === 400) {
      startCodeTimer()
    }
  }).finally(() => {
    loading.value = false
  })
  if (response) {
    startCodeTimer()
    notify({
      type: 'success',
      title: 'Код отправлен',
      text: 'На ваш номер отправлен код подтверждения'
    })
    formData.code = response
  }
}

async function resetPassword() {
  if (!formData.code || !codeSended.value) {
    notify({
      type: 'error',
      title: 'Потвердите номер телефона',
    })
    return
  }
  const valid = await v$.value.$validate()
  if (!valid) return
  loading.value = true
  const response = await $fetch('/api/auth/resetPassword', {
    method: 'POST',
    body: {
      phoneNumber: formData.phoneNumber,
      newPassword: formData.newPassword,
      repeatPassword: formData.repeatPassword,
      code: formData.code,
    }
  }).catch(err => {
    notify({
      type: 'error',
      title: 'Ошибка',
      text: err.data.message || err.message
    })
  }).finally(() => {
    loading.value = false
  })
  if (response === 'success') {
    await clear()
    notify({
      type: 'success',
      title: 'Пароль успешно изменен.',
    })
    router.push('/auth')
  }
}

const passwordShow = ref(false)
const inputType = ref(passwordShow.value ? 'text' : 'password')
const togglePassword = () => {
  passwordShow.value = !passwordShow.value
  inputType.value = passwordShow.value ? 'text' : 'password'
}


</script>

<template>
  <div id="resetPassword" class="flex sm:items-center sm:justify-center h-screen">

    <section
      class="flex flex-col justify-center align-center w-full max-w-md lg:max-w-lg rounded-lg p-4 shadow-lg gap-3">
      <h3 class="font-bold text-xl">Восстановление пароля</h3>

      <div class="box flex flex-col gap-3">
        <form class="flex flex-col gap-3" @submit.prevent="resetPassword">
          <div class="flex flex-col gap-1">
            <label>Номер телефона</label>
            <label class="input input-bordered flex items-center justify-between p-0 pl-4">
              <input :disabled="codeSended" v-maska data-maska="+7 (###) ###-##-##" v-model="formData.phoneNumber"
                placeholder="+7 (___) ___-__-__" required="true" />
              <button :disabled="codeSended && resendCodeDisabled" @click.prevent="sendCode"
                class="btn btn-ghost shadow-none hover:shadow-none"> {{ resendCodeText }}
              </button>
            </label>
            <div v-if="v$.phoneNumber.$error" class="text-red-500 text-xs mt-1">
              {{ v$.phoneNumber.$errors[0].$message }}
            </div>
          </div>
          <div v-if="codeSended" class="flex flex-col gap-1">
            <label>Код потверждения</label>
            <label class="input input-bordered flex items-center justify-between p-0 pl-4">
              <input v-model="formData.code" placeholder="1234" required="true" />
            </label>
            <div v-if="v$.code.$error" class="text-red-500 text-xs mt-1">
              {{ v$.code.$errors[0].$message }}
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label>Новый пароль </label>
            <div class="flex flex-col gap-0.5">
              <label class="input input-bordered w-full flex">
                <input id="password" v-model="formData.newPassword" :type="inputType" name="password"
                  placeholder="••••••••" required="true" class="w-full" />
                <button type="button" class="hover:text-primary w-1/12" @click="togglePassword">
                  <IconCSS v-if="passwordShow" class="w-20 h-20" size="25" name="mdi:hide-outline" />
                  <IconCSS v-else class="w-20 h-20" size="25" name="mdi:show-outline" />
                </button>
              </label>
            </div>
            <div v-if="v$.newPassword.$error" class="text-red-500 text-xs mt-1">
              {{ v$.newPassword.$errors[0].$message }}
            </div>
            <label>Новый пароль еще раз</label>
            <div class="flex flex-col gap-0.5">
              <label class="input input-bordered w-full flex">
                <input id="repeatPassword" v-model="formData.repeatPassword" :type="inputType" name="repeatPassword"
                  placeholder="••••••••" required="true" class="w-full" />
                <button type="button" class="hover:text-primary w-1/12" @click="togglePassword">
                  <IconCSS v-if="passwordShow" class="w-20 h-20" size="25" name="mdi:hide-outline" />
                  <IconCSS v-else class="w-20 h-20" size="25" name="mdi:show-outline" />
                </button>
              </label>
            </div>
            <div v-if="v$.repeatPassword.$error" class="text-red-500 text-xs mt-1">
              {{ v$.repeatPassword.$errors[0].$message }}
            </div>
          </div>
          <div class="flex flex-col gap-0.5">
            <button type="submit"
              class="btn btn-primary w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
              <span v-show="loading" class="loading loading-spinner" />

              Сменить пароль
            </button>

            <p class="mt-3 mb-1">
              Вспомнили пароль?
              <NuxtLink href="/auth" class="text-primary underline">
                Войти
              </NuxtLink>
            </p>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
