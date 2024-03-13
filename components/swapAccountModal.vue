﻿<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { email, helpers, minLength, required } from '@vuelidate/validators'
const store = useMainStore()
import { notify } from '@kyvg/vue3-notification'
const { status, signIn, signOut } = useAuth()
const isCollapseOpened = ref(false)
const telegramLoginButtonRef = ref<any>(null)
function telegramLoginButtonOpen() {
  telegramLoginButtonRef.value?.clickToLogin()
}

const loading = ref(false)
const alert = ref(false)
const alertText = ref('')
const alertType = ref('success')

const tokenCookie = useCookie('accountsSessionToken', {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 35,
})

const accounts = ref<any[]>([])
onKeyStroke('Escape', (e) => {
  e.preventDefault()
  store.swapAccountModal = false
})
function close() {
  store.swapAccountModal = false
}

const formData = reactive({
  email: '',
  password: '',
})

async function login() {
  v$.value.$validate()
  // if (v$.value.$error)
  //   return

  loading.value = true
  const { error, url } = await signIn('credentials', {
    redirect: false,
    callbackUrl: '/buyouts',
    ...formData,
  })
  if (error) {
    alertType.value = 'error'
    if (error === 'Email is not confirmed') {
      alertText.value = 'Подтвердите email для входа'
      alertType.value = 'warning'
    } else if (error == 'Account is banned') {
      alertText.value = 'Аккаунт заблокирован'
      alertType.value = 'warning'
    } else {
      alertText.value = 'Неверный номер телефона или пароль'
    }
    notify({
      title: 'Ошибка',
      text: alertText.value,
    })
    alert.value = true
    setTimeout(() => {
      alert.value = false
    }, 3000)
  } else {
    localStorage.removeItem('referralCode')
    store.getClient()
    return location.reload()
  }
  loading.value = false
}

async function getToken() {
  const { data }: any = await useFetch('/api/token/getAccountsToken', {
    method: 'GET',
  })

  if (data.value) {
    tokenCookie.value = data.value.token
    accounts.value = data.value.accounts
  }
}
if (status.value === 'authenticated') {
  getToken()
}

async function check() {
  const { data }: any = await useFetch('/api/token/get', {
    method: 'GET',
  })

  if (data.value) {
    await useFetch('/api/token/checkToken', {
      method: 'GET',
      headers: {
        Authorization: `${data.value.token}`,
      },
    })
  }
}

const rules = computed(() => {
  return {
    email: {
      required: helpers.withMessage('Введите email или логин', required),
      email: helpers.withMessage('Введите корректный email', email),
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

async function deleteToken(uuid: string) {
  const { data, error }: any = await useFetch('/api/token/deleteToken', {
    method: 'GET',
    params: {
      uuid,
    },
  })

  if (data.value) {
    tokenCookie.value = data.value.token
    accounts.value = data.value.accounts
  }
}

async function loginViaAccount(uuid: string) {
  const { data, error }: any = await useFetch('/api/token/checkToken', {
    method: 'GET',
    params: {
      uuid,
    },
  })

  if (error.value) {
    notify({
      title: 'Что-то пошло не так',
      text: error.value?.data?.message,
      type: 'error',
      duration: 3000,
    })
  } else if (data.value) {
    if (
      data.value.status === 'error' &&
      data.value.message == 'Сессия истекла, пожалуйста переавторизуйтесь'
    ) {
      await deleteToken(uuid)
      notify({
        title: 'Что-то пошло не так',
        text: data.value.message,
      })
      formData.email = data.value.email
      isOpen.value = true
    } else if (data.value.status == 'ok') {
      location.reload()
    }
  }
}

const v$ = useVuelidate(rules, formData)
const isOpen = ref(false)

const toggleCollapse = () => {
  if (isOpen.value && accounts.value && accounts.value.length >= 5) {
    notify({
      type: 'warning',
      title: 'Максимум можно добавить 5 аккаунтов',
    })
    isOpen.value = false
    return
  }
  // isOpen.value = !isOpen.value
}
</script>

<template>
  <input id="swapAccountModal" type="checkbox" class="modal-toggle" />
  <div
    :class="{
      'modal-open': store.swapAccountModal,
    }"
    class="modal"
  >
    <div class="modal-box max-w-xl">
      <label
        for="swapAccountModal"
        class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
        @click="close"
        >✕</label
      >
      <div class="collapse collapse-plus bg-base-200 mt-3 mb-1">
        <input type="checkbox" v-model="isOpen" @change="toggleCollapse" />
        <div class="collapse-title text-xl font-medium text-center">
          Добавить аккаунт
        </div>
        <div class="collapse-content">
          <div class="flex justify-center mx-2 flex-wrap">
            <form>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                name="email"
                placeholder="Введите свой email"
                :class="{
                  'input-error': v$.email.$error,
                }"
                class="input input-bordered w-full mb-3"
                required="true"
              />

              <input
                id="password"
                v-model="formData.password"
                type="password"
                name="password"
                placeholder="Введите пароль"
                :class="{
                  'input-error': v$.password.$error,
                }"
                class="input input-bordered w-full"
                required="true"
              />
            </form>
          </div>
          <div class="flex flex-col mt-3">
            <div class="flex justify-center">
              <button
                type="submit"
                class="btn btn-primary text-white w-1/2 bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                @click.prevent="login"
              >
                <span v-show="loading" class="loading loading-spinner" />
                Вход по почте
              </button>
            </div>
            <div class="line text-center my-0.5">
              <p>или</p>
            </div>

            <div class="flex justify-center">
              <label
                class="btn btn-outline w-1/2 text-sm whitespace-nowrap border-blue-500 text-blue-500"
                @click="telegramLoginButtonOpen"
              >
                <Icon size="18" name="logos:telegram" />
                Telegram
              </label>
            </div>
            <TelegramLoginButton
              ref="telegramLoginButtonRef"
              class="hidden"
              mode="callback"
            />
          </div>
        </div>
      </div>
      <div
        class="text-xl font-bold text-center mb-2"
        v-if="accounts && accounts.length > 0"
      >
        Аккаунты
      </div>

      <div
        v-if="accounts && accounts.length > 0"
        v-for="account in accounts"
        class="mb-0.5"
      >
        <div role="alert" class="alert">
          <svg fill="none" class="stroke w-0 h-6"></svg>
          <span class="text-start"> {{ account.username }}</span>
          <div>
            <!-- <button
              class="btn btn-sm"
              :disabled="account.username == store.client.username"
            >
              Выйти
            </button> -->
            <button
              class="btn btn-sm btn-primary"
              :disabled="account.username == store.client.username"
              @click="loginViaAccount(account.uuid)"
            >
              Войти
            </button>
          </div>
        </div>
      </div>
      <div class="modal-action"></div>
    </div>

    <label
      class="modal-backdrop cursor-pointer"
      for="swapAccountModal"
      @click="close"
      >Close</label
    >
  </div>
</template>

<style scoped>
@import url('~/assets/style/preview.css');
</style>
