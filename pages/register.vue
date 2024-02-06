<script lang="ts" setup>
import { useVuelidate } from '@vuelidate/core'
import {
  email,
  helpers,
  minLength,
  required,
  sameAs,
} from '@vuelidate/validators'

onMounted(() => {
  const isPageReloaded = localStorage.getItem('isPageReloadedRegister')

  if (!isPageReloaded) {
    localStorage.setItem('isPageReloadedRegister', 'true')
    window.location.reload(true)
  }
})

definePageMeta({
  colorMode: 'dark',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/buyouts',
  },
  title: 'Регистрация',
})
const alert = ref(false)
const alertText = ref('')
const route = useRoute()
const alertType = ref('success')
const referral = ref(route.query?.ref || null)
const formData = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  referral,
})

const referralFromLocal: any = ref('')
onMounted(() => {
  if (route.query?.ref && typeof route.query?.ref === 'string') {
    localStorage.setItem('referralCode', route.query?.ref)
    navigateTo('https://topvtop.pro', { external: true })
  }

  referralFromLocal.value = localStorage.getItem('referralCode')
  formData.referral = referralFromLocal.value
})

const result = ref()
const loading = ref(false)
const rules = computed(() => {
  return {
    email: {
      required: helpers.withMessage('Введите email', required),
      email: helpers.withMessage('Введите корректный email', email),
    },
    password: {
      required: helpers.withMessage('Введите пароль', required),
      minLength: helpers.withMessage(
        'Пароль должен быть длиннее 6 символов',
        minLength(6)
      ),
      containsNumber: helpers.withMessage(
        'Пароль должен содержать цифру',
        (value: string) => /[0-9]/.test(value)
      ),
      englishLetters: helpers.withMessage(
        'Пароль должен состоять из английских букв',
        (value: string) => /(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)
      ),
    },
    confirmPassword: {
      required: helpers.withMessage('Подтвердите пароль', required),
      sameAs: helpers.withMessage(
        'Пароли не совпадают',
        sameAs(formData.password)
      ),
    },
  }
})

const v$ = useVuelidate(rules, formData)

async function submitForm() {
  v$.value.$validate()

  if (!v$.value.$error) {
    loading.value = true
    if (referralFromLocal.value && referralFromLocal.value.length > 0) {
      formData.referral = referralFromLocal.value
    }
    const { data } = await useFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
    result.value = data
    loading.value = false
    if (data.value!.status === 'error') {
      alert.value = true
      alertType.value = 'error'
      alertText.value = data.value!.error as string
      useTimeoutFn(() => {
        alert.value = false
      }, 3000)
    } else {
      localStorage.removeItem('referralCode')
      alert.value = true
      alertType.value = 'success'
      alertText.value =
        'Пользователь зарегистрирован. Проверьте почту для подтверждения'
      useTimeoutFn(() => {
        alert.value = false
      }, 3000)
    }
    loading.value = false
  }
}
</script>

<template>
  <Toast :type="alertType" style="z-index: 1000" :active="alert">
    {{ alertText }}
  </Toast>
  <div id="auth">
    <section class="left">
      <h3>Создать аккаунт</h3>

      <div class="box">
        <form class="relative">
          <div>
            <label for="email" class="block mb-1 text-sm font-medium"
              >Email <span>*</span></label
            >
            <input
              id="email"
              v-model="formData.email"
              type="email"
              name="email"
              class="input input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              :class="{
                'input-error': v$.email.$error,
              }"
              placeholder="name@company.com"
              required="true"
              @change="v$.email.$touch"
            />
            <div
              v-for="error of v$.email.$errors"
              :key="error.$uid"
              class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
            >
              <div class="error-msg">
                {{ error.$message }}
              </div>
            </div>
          </div>
          <div>
            <label for="password" class="block mb-1 text-sm font-medium"
              >Пароль <span>*</span></label
            >
            <input
              id="password"
              v-model="formData.password"
              type="password"
              name="password"
              placeholder="••••••••"
              class="input input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              :class="{
                'input-error': v$.password.$error,
              }"
              required="true"
              @change="v$.password.$touch"
            />
            <div
              class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
            >
              {{ v$.password?.$errors[0]?.$message }}
            </div>
          </div>
          <div class="pb-0">
            <label for="confirm-password" class="block mb-1 text-sm font-medium"
              >Пароль еще раз <span>*</span></label
            >
            <input
              id="confirm-password"
              v-model="formData.confirmPassword"
              type="password"
              name="confirm-password"
              placeholder="••••••••"
              class="input input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              :class="{
                'input-error': v$.confirmPassword.$error,
              }"
              required="true"
              @change="v$.confirmPassword.$touch"
            />
            <div
              v-if="v$.confirmPassword.$errors"
              class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
            >
              <div class="error-msg">
                {{ v$.confirmPassword?.$errors[0]?.$message }}
              </div>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-block btn-primary bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-6"
            @click.prevent="submitForm"
          >
            <span v-show="loading" class="loading loading-spinner" />
            Зарегистрироваться
          </button>
        </form>

        <div class="line -my-2">
          <div />
          <p>Или</p>
          <div />
        </div>

        <TelegramLoginButton mode="callback" class="-my-1" />

        <p class="login">
          Уже есть аккаунт? <NuxtLink href="/auth"> Вход </NuxtLink>
        </p>

        <p class="text">
          *Регистрируясь вы принимаете
          <a href="/user_agreement.pdf" target="_blank">Пользовательское соглашение</a>, <br />
          и подтверждаете, что ознакомлены с
          <a href="/conf_policy.pdf" target="_blank">Политикой конфиденциальности</a>.
        </p>
      </div>
      <div class="mb-28"></div>
    </section>

    <section class="right">
      <div class="box">
        <div class="logo">ozon</div>

        <h1>
          Самовыкупы на <br />
          Ozon
        </h1>
        <h2>
          <span>[</span> комплексное продвижение <br />
          - попробовать бесплатно <span>]</span>
        </h2>
      </div>

      <img class="phone" src="~/assets/phone.png" alt="" />

      <img class="figure1" src="~/assets/figure1.svg" alt="" />
      <img class="figure2" src="~/assets/figure2.svg" alt="" />
      <img class="figure3" src="~/assets/figure3.svg" alt="" />
      <img class="line" src="~/assets/line.svg" alt="" />
    </section>
  </div>
</template>

<style scoped>
@import url('~/assets/style/preview.css');
</style>
