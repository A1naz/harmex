<script lang="ts" setup>
import { useVuelidate } from '@vuelidate/core'
import { notify } from '@kyvg/vue3-notification'
import {
  email,
  helpers,
  minLength,
  required,
  sameAs,
} from '@vuelidate/validators'

definePageMeta({
  colorMode: 'dark',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/buyouts',
  },
  title: 'Регистрация',
})

const confirmationCodeInput = ref<any>(null)
const isInnConfirmed = ref(false)
const isInnLoading = ref(false)
const isCodeSent = ref(false)
const isNumberConfirmed = ref(false)
const alert = ref(false)
const alertText = ref('')
const route = useRoute()
const alertType = ref('success')
const referral = ref(route.query?.ref || null)
const { width, height } = useWindowSize()
const linkRef = ref(false)
const formData = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  orgKey: '',
  orgName: '',
  orgOgrn: '',
  orgInn: '',
  lastname: '',
  name: '',
  middleName: '',
  phoneNumber: '',
  verificationCode: '',
  checked: false,
  referral,
})

const referralFromLocal: any = ref('')

onMounted(async () => {
  if (route.query?.ref && typeof route.query?.ref === 'string') { 
    localStorage.setItem('referralCode', route.query?.ref)
  }
  referralFromLocal.value = localStorage.getItem('referralCode')
  formData.referral = referralFromLocal.value
})

async function linkFollow() {
  const { data, error }: any = await useFetch('/api/user/linkFollow', {
      method: 'GET',
      query: {
        referral: formData.referral,
      },
  })
}
await linkFollow()



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

  if (!v$.value.$errors.length) {
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
      alertText.value = 'Пользователь зарегистрирован.'
      useTimeoutFn(() => {
        alert.value = false
        navigateTo('/auth')
      }, 3000)
    }
    loading.value = false
  }
}

async function checkInn() {
  if (formData.orgInn.length < 10) {
    notify({
      title: 'ИНН должен содержать 10 цифр',
    })
    return
  }

  isInnLoading.value = true

  const { data, error }: any = await useFetch('/api/organization/checkInn', {
    method: 'GET',
    query: {
      inn: formData.orgInn,
    },
  })

  if (error.value) {
    console.log(error.value.statusMessage)

    notify({
      title: 'Что-то пошло не так',
      text: 'Данные не получены',
    })
  }

  if (data.value) {
    isInnConfirmed.value = true
    formData.orgKey = data.value.orgKey
    formData.orgName = data.value.orgName
    formData.orgOgrn = data.value.orgOgrn
    formData.orgInn = data.value.orgInn
    formData.name = data.value.name
    formData.lastname = data.value.lastname
    formData.middleName = data.value.middleName
  }

  isInnLoading.value = false
}

function clearFormData() {
  isInnConfirmed.value = false
  formData.orgInn = ''
  formData.orgKey = ''
  formData.orgName = ''
  formData.orgOgrn = ''
}

async function sendConfirmCode() {
  if (formData.phoneNumber.replace(/[\(\)\-\s]/g, '').length < 11) {
    notify({
      title: 'Введите корректный номер',
    })
    return
  }

  const { data, error }: any = await useFetch(
    '/api/organization/confirmPhone',
    {
      method: 'POST',
      body: {
        phoneNumber: formData.phoneNumber.replace(/[\(\)\-\s]/g, ''),
      },
    }
  )

  if (data.value.status == 'ok') {
    isCodeSent.value = true
    confirmationCodeInput.value.focus()
    notify({
      type: 'success',
      title: 'Код отправлен',
    })
  } else {
    notify({
      type: 'error',
      title: data.value.message,
    })
  }
}

async function confirmCode() {
  const { data, error }: any = await useFetch(
    '/api/organization/confirmPhone',
    {
      method: 'GET',
      params: {
        phoneNumber: formData.phoneNumber.replace(/[\(\)\-\s]/g, ''),
        code: formData.verificationCode,
      },
    }
  )
  if (data.value) {
    notify({
      type: 'success',
      title: 'Код подтвержден',
    })

    isCodeSent.value = false
    isNumberConfirmed.value = true
  } else {
    notify({
      type: 'error',
      title: 'Неверный код',
    })
  }
}
</script>

<template>
  <Toast :type="alertType" style="z-index: 1000" :active="alert">
    {{ alertText }}
  </Toast>
  <div
    id="auth"
    class="flex sm:items-center sm:justify-center overflow-y-auto max-h-[calc(100vh-10px)]"
  >
    <section
      class="flex flex-col justify-center align-center w-full max-w-lg rounded-lg p-2 shadow-lg gap-3 mt-auto mx-auto"
    >
      <h3 class="font-bold text-xl mt-5">Создать аккаунт</h3>
      <div class="px-5 pb-2">
        <div class="relative">
          <div>
            <label class="block ml-1 my-1 text-sm font-medium">
              ИНН организации
            </label>
            <div class="join w-full">
              <input
                id="orgInn"
                :disabled="isInnConfirmed"
                v-model="formData.orgInn"
                v-maska
                data-maska="#######################"
                name="orgInn"
                class="input join-item input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="ИНН"
                required="true"
              />
              <button
                :disabled="isInnLoading"
                v-if="!isInnConfirmed"
                class="btn btn-sm xl:btn-md join-item rounded-r-full"
                @click="checkInn"
              >
                Найти
              </button>
              <button
                v-if="isInnConfirmed"
                class="btn join-item rounded-r-full"
                @click="clearFormData"
              >
                <IconCSS
                  size="24"
                  name="fluent:backspace-24-regular"
                />
              </button>
            </div>

            <label class="block ml-1 mb-2 my-1 text-sm font-medium"
              >Форма организации
            </label>
            <input
              id="orgKey"
              v-model="formData.orgKey"
              type="text"
              name="org"
              class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 border-base-200"
              placeholder="ИП/ООО"
              required="true"
              readonly
            />
            <label class="block ml-1 mb-2 my-1 text-sm font-medium">
              Наименование организации
            </label>
            <input
              id="orgName"
              v-model="formData.orgName"
              type="text"
              name="orgName"
              class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 border-base-200"
              placeholder=""
              required="true"
              readonly
            />
            <label class="block ml-1 mb-2 my-1 text-sm font-medium">
              ОГРН(ОГРНИП)
            </label>
            <input
              id="orgOgrn"
              v-model="formData.orgOgrn"
              type="number"
              name="orgOgr"
              class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 border-base-200"
              placeholder=""
              required="true"
              readonly
            />
          </div>
          <div>
            <label for="email" class="block ml-1 mb-2 my-1 text-sm font-medium">
              Фамилия
            </label>
            <input
              :disabled="!isInnConfirmed"
              id="lastname"
              v-model="formData.lastname"
              type="text"
              name="lastname"
              class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              placeholder="Петров"
              required="true"
            />
            <label for="email" class="block ml-1 mb-2 my-1 text-sm font-medium">
              Имя
            </label>
            <input
              :disabled="!isInnConfirmed"
              id="name"
              v-model="formData.name"
              type="text"
              name="name"
              class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              placeholder="Петр"
              required="true"
            />
            <label for="email" class="block mb-2 ml-1 my-1 text-sm font-medium">
              Отчество
            </label>
            <input
              :disabled="!isInnConfirmed"
              id="middleName"
              v-model="formData.middleName"
              type="text"
              name="middleName"
              class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              placeholder="Петрович"
              required="true"
            />
            <label for="email" class="block mb-2 ml-1 my-1 text-sm font-medium">
              Номер телефона
            </label>
            <div class="join w-full">
              <input
                :disabled="!isInnConfirmed || isCodeSent || isNumberConfirmed"
                id="tnumber"
                v-model="formData.phoneNumber"
                name="tnumber"
                class="input join-item input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                v-maska
                data-maska="+7 (###) ###-##-##"
                placeholder="+7 (___) ___-__-__"
                required="true"
                @keydown.enter="sendConfirmCode"
              />
              <button
                v-if="!isCodeSent"
                :disabled="isNumberConfirmed"
                class="btn btn-sm xl:btn-md join-item rounded-r-full"
                @click="sendConfirmCode"
              >
                Подтвердить
              </button>
              <button
                v-else
                :disabled="isNumberConfirmed"
                class="btn btn-sm xl:btn-md join-item rounded-r-full"
                @click=";(isCodeSent = false), (isNumberConfirmed = false)"
              >
                <IconCSS
                  class="w-12 h-12"
                  size="20"
                  name="fluent:backspace-24-regular"
                />
              </button>
            </div>
            <label for="email" class="block mb-2 ml-1 my-1 text-sm font-medium">
              Код верификации с звонка
            </label>
            <div class="join w-full">
              <input
                ref="confirmationCodeInput"
                :disabled="isNumberConfirmed || !isInnConfirmed"
                id="verificationCode"
                v-model="formData.verificationCode"
                type="number"
                name="verificationCode"
                class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder=""
                required="true"
                @keydown.enter="confirmCode"
              />
              <button
                :disabled="!isCodeSent || isNumberConfirmed"
                class="btn btn-sm xl:btn-md join-item rounded-r-full"
                @click="confirmCode"
              >
                <IconCSS size="20" name="mdi:check" />
              </button>
            </div>

            <label for="email" class="block mb-2 ml-1 my-1 text-sm font-medium">
              Email
            </label>
            <input
              :disabled="!isInnConfirmed"
              id="email"
              v-model="formData.email"
              type="email"
              name="email"
              class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              :class="{
                'input-error': v$.email.$error,
              }"
              @input="v$.email.$touch"
              placeholder="name@company.com"
              required="true"
            />

            <div
              v-for="error of v$.email.$errors"
              :key="error.$uid"
              class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
            >
              <!-- <div class="error-msg">
                {{ error.$message }}
              </div> -->
            </div>
          </div>
          <div>
            <label
              for="password"
              class="block ml-1 mb-2 my-1text-sm font-medium"
              >Пароль
            </label>
            <input
              :disabled="!isInnConfirmed"
              id="password"
              v-model="formData.password"
              type="password"
              name="password"
              placeholder="••••••••"
              class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
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
            <label
              for="confirm-password"
              class="block ml-1 mb-2 my-1 text-sm font-medium"
              >Пароль еще раз
            </label>
            <input
              :disabled="!isInnConfirmed"
              id="confirm-password"
              v-model="formData.confirmPassword"
              type="password"
              name="confirm-password"
              placeholder="••••••••"
              class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
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

          <div class="flex gap-2 mt-5 mb-2">
            <input
              type="checkbox"
              class="checkbox checkbox-sm mt-1"
              v-model="formData.checked"
            />
            <p
              class="text-xs cursor-pointer"
              @click="formData.checked = !formData.checked"
            >
              Регистрируясь вы принимаете
              <a href="/user_agreement.pdf" target="_blank" class="text-primary"
                >Пользовательское соглашение</a
              >, и подтверждаете, что ознакомлены с
              <a href="/conf_policy.pdf" target="_blank" class="text-primary"
                >Политикой конфиденциальности</a
              >.
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-0.5">
          <button
            :disabled="
              !formData.checked || !isInnConfirmed || !isNumberConfirmed
            "
            class="btn btn-block btn-primary bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-2"
            @click="submitForm"
          >
            <span v-show="loading" class="loading loading-spinner" />
            Зарегистрироваться
          </button>
          <p class="login mt-2">
            Уже есть аккаунт?
            <NuxtLink href="/auth" class="text-primary">
              <span class="underline">Войти</span>
            </NuxtLink>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
