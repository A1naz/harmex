<!-- eslint-disable @typescript-eslint/no-use-before-define -->
<script lang="ts" setup>
import { useVuelidate } from '@vuelidate/core'
import { helpers, minLength, required, maxLength } from '@vuelidate/validators'
const { loggedIn, user, session, fetch, clear } = useUserSession()

const store = useMainStore()
const route = useRoute()
const params = route.query

definePageMeta({
  title: 'Вход',
})

const { notify } = useNotification()
const loading = ref(false)
const formData = reactive({
  phoneNumber: '',
  password: '',
})

onMounted(async () => {
  if (params?.emailConfirmed) {
    notify({
      type: 'success',
      title: 'Email успешно подтвержден!',
      duration: 3000,
    })
  }
  if (params?.passwordChanged) {
    notify({
      type: 'success',
      title: 'Пароль успешно изменен!',
      duration: 3000,
    })
  }
  if (params?.confirmed) {
    notify({
      type: 'info',
      title:
        'Письмо для подтверждения было отправлено на указанный email. (Проверьте папку Спам)',
      duration: 3000,
    })
  }
})

const passwordShow = ref(false)
const inputType = ref(passwordShow.value ? 'text' : 'password')
const togglePassword = () => {
  passwordShow.value = !passwordShow.value
  inputType.value = passwordShow.value ? 'text' : 'password'
}

const rules = computed(() => {
  return {
    phoneNumber: {
      required: helpers.withMessage('Введите номер телефона', required),
      minLength: helpers.withMessage('Неверный номер телефона', minLength(18)),
      maxLength: helpers.withMessage('Неверный номер телефона', maxLength(18)),
    },
    password: {
      required: helpers.withMessage('Введите пароль', required),
      minLength: helpers.withMessage(
        'Пароль должен быть длиннее 6 символов',
        minLength(6)
      ),
    },
  }
})

const v$ = useVuelidate(rules, formData)

async function login() {
  const valid = await v$.value.$validate()
  if (!valid) return
  loading.value = true
  const response = await $fetch('/api/auth/login', {
    method: 'POST',
    body: {
      phoneNumber: formData.phoneNumber,
      password: formData.password,
    },
  })
    .catch((err) => {
      notify({
        type: 'error',
        title: 'Не удалось войти',
        text: err.data.message || err.message,
      })
    })
    .finally(() => {
      loading.value = false
    })
  if (response === 'success') {
    await fetch()
    loading.value = false
    if (user.value?.isTwoFaEnabled && session.value?.twoFaNeeded) {
      navigateTo('/2fa')
    } else if (params?.redirect as string) {
      navigateTo(params.redirect as string)
    } else {
      navigateTo('/profile')
    }
  }
}
</script>

<template>
  <div id="auth" class="flex h-screen sm:items-center sm:justify-center">
    <section
      class="align-center flex w-full max-w-md flex-col justify-center gap-3 rounded-lg p-4 shadow-lg lg:max-w-lg"
    >
      <h3 class="text-xl font-bold">Войдите в аккаунт</h3>

      <div class="box flex flex-col gap-3">
        <form @submit.prevent="login" class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <label>Номер телефона </label>
            <input
              v-maska
              data-maska="+7 (###) ###-##-##"
              v-model="formData.phoneNumber"
              placeholder="+7 (___) ___-__-__"
              required="true"
              class="input input-bordered"
            />
            <div v-if="v$.phoneNumber.$error" class="mt-1 text-xs text-red-500">
              {{ v$.phoneNumber.$errors[0].$message }}
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label>Пароль </label>
            <div class="flex flex-col gap-0.5">
              <label class="input input-bordered flex w-full">
                <input
                  id="password"
                  v-model="formData.password"
                  :type="inputType"
                  name="password"
                  placeholder="••••••••"
                  required="true"
                  class="w-full"
                />
                <button
                  type="button"
                  class="w-1/12 hover:text-primary"
                  @click="togglePassword"
                >
                  <IconCSS
                    v-if="passwordShow"
                    class="h-20 w-20"
                    size="25"
                    name="mdi:hide-outline"
                  />
                  <IconCSS
                    v-else
                    class="h-20 w-20"
                    size="25"
                    name="mdi:show-outline"
                  />
                </button>
              </label>
              <NuxtLink class="my-1 text-primary" href="/resetPassword">
                Забыли пароль?
              </NuxtLink>
            </div>
            <div v-if="v$.password.$error" class="mt-1 text-xs text-red-500">
              {{ v$.password.$errors[0].$message }}
            </div>
          </div>

          <div class="flex flex-col gap-0.5">
            <button
              type="submit"
              class="bg-primary-600 hover:bg-primary-700 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 btn btn-primary w-full rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4"
            >
              <span v-show="loading" class="loading loading-spinner" />

              Войти
            </button>

            <p class="mb-1 mt-3">
              Ещё не зарегистрированы?
              <NuxtLink href="/register" class="text-primary underline">
                Регистрация
              </NuxtLink>
            </p>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
