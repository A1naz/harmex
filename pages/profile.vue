<script lang="ts" setup>
import { notify } from '@kyvg/vue3-notification'

definePageMeta({ title: 'Профиль', layout: 'app' })
const { loggedIn, user, clear }: any = useUserSession()
const router = useRouter()
if (!loggedIn || !user)
  router.push('/auth?redirect=/profile')
async function logout() {
  await clear()
  router.push('/')
}

const form = reactive({
  login: '',
  email: '',
  phoneNumber: '',
  language: 'ru',
  wallet: 'rubles',
})

onMounted(() => {
  form.email = user.value?.email || ''
  form.phoneNumber = user.value?.phoneNumber || ''
})

const docsArray = ref([
  {
    title: 'Политика конфиденциальности',
    path: '',
  },
  {
    title: 'Политика Cookies',
    path: '',
  },
  {
    title: 'Обработка персональных данных',
    path: '',
  },
  {
    title: 'Согласие на рассылку',
    path: '',
  },
  {
    title: 'Пользовательское соглашение ',
    path: '',
  },
])

const tooltipVisible = ref(false)
const emailConfirmModal = ref(false)

const emailAlerts = reactive({
  value: false,
  arr: [
    {
      title: 'Партнерка',
      value: false,
    },
    {
      title: 'Услуги',
      value: false,
    },
    {
      title: 'Новинки/акции',
      value: false,
    },
    {
      title: 'Промокоды',
      value: false,
    },
  ],
})
const tgAlerts = reactive({
  value: false,
  arr: [
    {
      title: 'Партнерка',
      value: false,
    },
    {
      title: 'Услуги',
      value: false,
    },
    {
      title: 'Новинки/акции',
      value: false,
    },
    {
      title: 'Промокоды',
      value: false,
    },
  ],
})

const isCodeSent = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
})

const disabledChangePasswordButton = computed(() => {
  if (user.value?.hasPassword)
    return passwordForm.oldPassword === '' || passwordForm.newPassword === ''
  else return passwordForm.newPassword === ''
})

async function updatePassword() {
  if (passwordForm.oldPassword === '' && passwordForm.newPassword === '')
    return

  const { data, error }: any = await useFetch('/api/user/changePassword', {
    method: 'POST',
    body: passwordForm,
    watch: false,
  })
  if (error.value)
    return notify({ type: 'error', title: 'Не удалось поменять пароль.', text: error.value.message })

  if (data.value === 'success')
    notify({ type: 'success', title: 'Пароль успешно изменен.' })

  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-12 py-6 md:gap-6 md:py-4">
      <h1 class="text-xl font-semibold">
        Профиль
      </h1>
      <div class="flex flex-col gap-6 p-4 bg-blue-50 rounded-lg">
        <h2 class="text-lg font-medium">
          Контактные данные
        </h2>
        <div class="flex flex-col gap-6 md:flex-row">
          <div class="flex flex-col gap-1">
            <p class="text-xs font-medium text-blue-800">
              Номер телефона
            </p>
            <input
              v-model="form.phoneNumber" readonly placeholder="Номер телефона"
              class="input input-bordered border-blue-800 w-full"
            >
          </div>
          <div class="flex flex-col gap-1 relative">
            <p class="text-xs font-medium text-blue-800">
              Почта
            </p>
            <label
              class="input input-bordered border-blue-800 flex items-center justify-between relative bg-white"
              @click="emailConfirmModal = true"
            >
              <input v-model="form.email" placeholder="Введите почту" readonly class="flex-grow w-full text-ellipsis min-w-52">
              <button
                class="flex items-center justify-center mx-2 text-red-600"
                :class="{ 'text-red-600': !user?.emailConfirmed, 'text-green-600': user?.emailConfirmed }"
                @click="emailConfirmModal = true" @mouseenter="tooltipVisible = true"
                @mouseleave="tooltipVisible = false"
              >
                <icon v-if="!user?.emailConfirmed" name="flowbite:close-outline" size="24" />
                <icon v-else name="quill:checkmark-double" size="24" />
              </button>
              <custom-tooltip
                :text="!user?.emailConfirmed ? 'Email не подтвержден' : 'Email подтвержден'"
                :visible="tooltipVisible"
              />
            </label>
            <p v-if="!user?.emailConfirmed" class="text-red-600 text-xs absolute right-0 md:hidden">
              Email не подтвержден
            </p>
          </div>
          <div class="flex gap-2">
            <div class="flex flex-col gap-1">
              <p class="text-xs font-medium text-blue-800">
                Язык
              </p>
              <custom-select
                :tabs="[
                  { title: 'Русский', value: 'ru', images: '/icons/figma/profile/rsFlag.svg' },
                  { title: 'English', value: 'en', images: '/icons/figma/profile/usaFlag.svg' }]
                " @change-value="(e: any) => (form.language = e.value)"
              />
            </div>
            <div class="flex flex-col gap-1">
              <p class="text-xs font-medium text-blue-800">
                Валюта
              </p>
              <custom-select
                :tabs="[
                  { title: '₽', value: 'rubles' },
                  { title: '$', value: 'dollar' },
                  { title: '€', value: 'Euro' }]
                " @change-value="(e: any) => (form.wallet = e.value)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-6 p-4 bg-blue-50 rounded-lg">
        <h2 class="text-lg font-medium">
          Пароль
        </h2>
        <div class="flex flex-col gap-2.5">
          <div v-if="user" class="flex flex-col gap-2.5 xl:flex-row">
            <input
              v-show="user.hasPassword" v-model="passwordForm.oldPassword" :disabled="isCodeSent" type="password"
              placeholder="Старый пароль" class="input input-bordered w-full"
            >
            <input
              v-model="passwordForm.newPassword" :disabled="isCodeSent" type="password" placeholder="Новый пароль"
              class="input input-bordered w-full"
            >
            <button :disabled="disabledChangePasswordButton" class="btn btn-primary xl:w-40" @click="updatePassword">
              {{ user.hasPassword ? 'Изменить' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-6 p-4 bg-blue-50 rounded-lg">
        <h2 class="text-lg font-medium">
          Чат-бот уведомлений
        </h2>
        <div class="flex flex-col gap-6">
          <div class="flex justify-between w-full">
            <div class="flex gap-3">
              <nuxt-img src="/icons/figma/profile/email.svg" class="w-10 h-10" />
              <div class="flex flex-col gap-1">
                <p class="text-sm font-normal">
                  Уведомления Email
                </p>
                <p class="text-xs font-normal text-gray-500">
                  Функции недоступны. Подключите уведомления Email
                </p>
              </div>
            </div>
            <div class="form-control">
              <label class="label cursor-pointer flex gap-2">
                <span class="hidden sm:inline">Включить все</span>
                <input
                  type="checkbox" class="toggle" :checked="emailAlerts.value"
                  @click="emailAlerts.value = !emailAlerts.value"
                >
              </label>
            </div>
          </div>

          <transition name="slide-fade">
            <div v-if="emailAlerts.value" class="flex flex-col gap-3">
              <div
                v-for="(item, index) in emailAlerts.arr" :key="index"
                class="flex justify-between items-center w-full p-2 bg-white border border-t-0 last:mb-8 rounded-t-none rounded-b-md"
              >
                <span class="text-sm font-normal">{{ item.title }}</span>
                <label class="label cursor-pointer p-0">
                  <input type="checkbox" class="toggle" :checked="item.value" @click="item.value = !item.value">
                </label>
              </div>
            </div>
          </transition>

          <div class="flex justify-between w-full">
            <div class="flex gap-3">
              <nuxt-img src="/icons/figma/profile/tg.svg" class="w-10 h-10" />
              <div class="flex flex-col gap-1">
                <p class="text-sm font-normal">
                  Telegram чат-бот
                </p>
                <p class="text-xs font-normal text-gray-500">
                  Функции недоступны. Подключите Telegram-бот.
                </p>
              </div>
            </div>
            <div>
              <div class="flex gap-4 items-center text-gray-500 text-xs">
                <a href="#" class="flex items-center hover:text-blue-800">
                  <span>Перейти в чат бот</span>
                  <icon name="solar:arrow-right-linear" class="ml-1 w-4 h-4 transition-colors duration-200" />
                </a>
                <div class="form-control">
                  <label class="label cursor-pointer gap-2">
                    <span class="hidden sm:inline">Включить все</span>
                    <input
                      type="checkbox" class="toggle" :checked="tgAlerts.value"
                      @click="tgAlerts.value = !tgAlerts.value"
                    >
                  </label>
                </div>
              </div>
            </div>
          </div>

          <transition name="slide-fade">
            <div v-if="tgAlerts.value" class="flex flex-col gap-3">
              <div
                v-for="(item, index) in tgAlerts.arr" :key="index"
                class="flex justify-between items-center w-full p-2 bg-white border border-t-0 rounded-t-none rounded-b-md"
              >
                <span class="text-sm font-normal">{{ item.title }}</span>
                <label class="label cursor-pointer p-0">
                  <input type="checkbox" class="toggle" :checked="item.value" @click="item.value = !item.value">
                </label>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div class="flex flex-col gap-6 p-4 bg-blue-50 rounded-lg">
        <h2 class="text-lg font-medium">
          Документы
        </h2>
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-2 text-sm text-gray-600">
            <a v-for="(item, index) in docsArray" :key="index" :href="item.path" class="underline hover:text-blue-800">{{
              item.title }}</a>
          </div>
        </div>
      </div>

      <button class="btn btn-primary" @click="logout">
        Выйти
      </button>
    </div>

    <profile-email-confirm-modal :show="emailConfirmModal" @close="emailConfirmModal = false" />
  </div>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
