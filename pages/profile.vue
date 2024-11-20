<script lang="ts" setup>
// import { notify } from "@kyvg/vue3-notification";

definePageMeta({ title: 'Профиль', layout: 'app' })
const { loggedIn, user, fetch, clear } = useUserSession()
const { setLocale } = useI18n()
const router = useRouter()
const route = useRoute()
const params = route.query

if (!loggedIn || !user)
  router.push('/auth?redirect=/profile')
async function logout() {
  await clear()
  router.push('/')
}

// const { $switchLocale, $t } = useNuxtApp()

// const availableLocales = computed(() => {
//   return locales.value.filter((i) => i.code !== locale.value);
// });

const { notify } = useNotification()
const persistStore = usePersistedStore()
const twoFaQRModal = ref<any>(null)
const twoFaShow = ref(false)
const partnerDetailsModal = ref(false)
const isTwoFaEnabled = ref(user.value?.isTwoFaEnabled || false)
const partnerAgreement = ref(false)

async function openTwoFaQRModal() {
  if (!isTwoFaEnabled.value) {
    const { data }: any = await useFetch('/api/2fa/turnOnOff', {
      method: 'GET',
      query: { changeTo: isTwoFaEnabled.value },
      watch: false,
    })
    if (data.value) {
      notify({
        title: 'Двухфакторная аутентификация выключена',
      })
      isTwoFaEnabled.value = false
      await fetch()
    }
  }
  else {
    twoFaShow.value = true
  }
}

function closeModal() {
  twoFaShow.value = false
  isTwoFaEnabled.value = false
}

const form = reactive({
  login: '',
  email: '',
  phoneNumber: '',
  language: 'ru',
  wallet: 'rubles',
  username: '',
  orgInn: '',
})

onMounted(() => {
  form.orgInn = user.value?.orgInn || ''
  form.email = user.value?.email || ''
  form.phoneNumber = user.value?.phoneNumber || ''
  form.username = user.value?.username || ''
  if (params.partnerDetailsModal) {
    partnerDetailsModal.value = true
  }
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

// const disabledChangePasswordButton = computed(() => {
//   if (user.value?.hasPassword)
//     return passwordForm.oldPassword === "" || passwordForm.newPassword === "";
//   else return passwordForm.newPassword === "";
// });

async function updatePassword() {
  if (passwordForm.oldPassword === '' && passwordForm.newPassword === '')
    return

  const { data, error }: any = await useFetch('/api/user/changePassword', {
    method: 'POST',
    body: passwordForm,
    watch: false,
  })
  if (error.value) {
    return notify({
      type: 'error',
      title: 'Не удалось поменять пароль.',
      text: error.value.message,
    })
  }

  if (data.value === 'success')
    notify({ type: 'success', title: 'Пароль успешно изменен.' })

  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
}

const languageArr = ref([
  {
    title: 'Русский',
    value: 'ru',
    images: '/icons/figma/profile/rsFlag.svg',
  },
  {
    title: 'English',
    value: 'en',
    images: '/icons/figma/profile/usaFlag.svg',
  },
]) as any
const selectedLanguageCode = ref(persistStore.language ?? 'ru')

function updateLanguage(code: string) {
  console.log('updateLanguage', code)
  persistStore.language = code
  selectedLanguageCode.value = code
}

watch(() => persistStore.language, (newLanguage) => {
  setLocale(newLanguage)
})

async function getPartnerAgreement() {
  const { data }: any = await useFetch('/api/finance/partnerAgreement')
  partnerAgreement.value = data.value
}

await getPartnerAgreement()
</script>

<template>
  <div class="px-4 sm:px-16">
    <div>
      <div class="flex flex-col gap-8 py-6 md:gap-6 md:py-4">
        <div class="flex flex-col gap-4 p-4 bg-white rounded-lg">
          <h2 class="text-lg font-medium">
            {{ $t("Контактные данные") }}
          </h2>
          <div class="flex flex-col gap-6 md:flex-row flex-wrap">
            <div class="flex flex-col gap-1 flex-1">
              <p class="text-xs font-medium text-base-content">
                {{ $t("Логин") }}
              </p>
              <input v-model="form.username" readonly placeholder="Логин" class="input input-sm h-[2.5rem] bg-base-100 w-full">
            </div>
            <div class="flex flex-col gap-1 flex-1">
              <p class="text-xs font-medium text-base-content">
                {{ $t("Номер телефона") }}
              </p>
              <input v-model="form.phoneNumber" readonly placeholder="Номер телефона" class="input input-sm h-[2.5rem] bg-base-100 w-full">
            </div>
            <div class="flex flex-col gap-1 flex-1 relative">
              <p class="text-xs font-medium text-base-content">
                {{ $t("Почта") }}
              </p>
              <label class="input input-sm h-[2.5rem] bg-base-100 flex items-center justify-between relative"
                @click="emailConfirmModal = true">
                <input v-model="form.email" placeholder="Введите почту" readonly
                  class="flex-grow w-full text-ellipsis min-w-52">
                <button class="flex items-center justify-center mx-2 text-red-600" :class="{
                  'text-red-600': !user?.emailConfirmed,
                  'text-green-600': user?.emailConfirmed,
                }" @click="emailConfirmModal = true" @mouseenter="tooltipVisible = true"
                  @mouseleave="tooltipVisible = false">
                  <icon v-if="!user?.emailConfirmed" name="flowbite:close-outline" size="24" />
                  <icon v-else name="quill:checkmark-double" size="24" />
                </button>
                <custom-tooltip :text="!user?.emailConfirmed
                  ? 'Email не подтвержден'
                  : 'Email подтвержден'
                  " :visible="tooltipVisible" />
              </label>
              <p v-if="!user?.emailConfirmed" class="text-red-600 text-xs absolute right-0 md:hidden">
                Email не подтвержден
              </p>
            </div>
            <div class="flex flex-col gap-1 flex-1">
              <p class="text-xs font-medium text-base-content">
                {{ $t("Язык") }}
              </p>
              <custom-select 
                :tabs="languageArr"
                :status-text="languageArr.find((item: any) => item.value === selectedLanguageCode)?.title"
                @change-value="(e: any) => updateLanguage(e.value)"
                :class="'h-[2.5rem]'"
              />
              <!-- <ProfileLanguageSelect /> -->
            </div>

            <div class="flex gap-2 flex-1">
              <div class="flex flex-col gap-1 flex-1">
                <p class="text-xs font-medium text-base-content">
                  {{ $t("Валюта") }}
                </p>
                <custom-select 
                  :tabs="[
                    { title: 'RUB', value: 'rubles', images: '/icons/figma/profile/rsFlag.svg', },
                    { title: 'USD', value: 'dollar', images: '/icons/figma/profile/usaFlag.svg', },
                    { title: 'EUR', value: 'Euro', images: '/icons/figma/profile/euro.svg', },
                  ]" 
                  @change-value="(e: any) => (form.wallet = e.value)" 
                  :class="'h-[2.5rem]'"
                />
              </div>
              <div>
                <button class="btn btn-sm h-[2.5rem] btn-primary mt-5" @click="logout">
                  <Icon name="material-symbols:logout" size="24" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4 p-4 bg-white rounded-lg">
          <div class="flex gap-3">
            <h2 class="text-lg font-medium">
              Реквизиты
            </h2>
            <span v-if="!partnerAgreement" class="mt-1 underline text-[#1B38CA] text-sm cursor-pointer"
              @click="partnerDetailsModal = true">Заполнить реквизиты</span>
          </div>
          <div class="flex flex-col gap-1 flex-1 w-full">
            <p class="text-xs font-medium text-base-content">
              {{ $t("ИНН") }}
            </p>
            <input v-model="form.orgInn" readonly placeholder="-" class="input input-sm h-[2.5rem] bg-base-100 w-full">
          </div>
        </div>

        <div class="flex flex-col gap-4 p-4 bg-white rounded-lg">
          <div class="flex gap-3">
            <h2 class="text-lg font-medium">
              Документооборот
            </h2>
          </div>
          <div class="flex gap-2 p-2 justify-between text-primary w-full bg-secondary rounded-lg">
            <div class="flex gap-2 items-center">
              <Icon name="gg:file-document" size="24" />
              <p class="font-medium">
                Пользовательское соглашение
              </p>
            </div>
            <div class="flex items-center">
              {{ user?.orgName }}
            </div>
            <button class=" btn btn-primary btn-sm rounded-full p-1 flex justify-center items-center">
              <Icon name="material-symbols:download-sharp" size="24" />
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-4 p-4 bg-white rounded-lg">
          <h2 class="text-lg font-medium">
            Пароль
          </h2>
          <div class="flex flex-col gap-2.5">
            <div v-if="user" class="flex flex-col gap-2.5 xl:flex-row">
              <input v-model="passwordForm.oldPassword" :disabled="isCodeSent" type="password"
                placeholder="Старый пароль" class="input input-sm h-[2.5rem] w-full">
              <input v-model="passwordForm.newPassword" :disabled="isCodeSent" type="password"
                placeholder="Новый пароль" class="input input-sm h-[2.5rem] w-full">
              <button class="btn btn-sm h-[2.5rem] btn-primary xl:w-40" @click="updatePassword">
                Изменить
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4 rounded-lg bg-white p-4 ">
          <h2 class="text-lg font-[500]">
            Двухфакторная аутентификация
          </h2>

          <div class="form-control bg-secondary rounded-lg p-3">
            <label class="label cursor-pointer flex flex-col lg:flex-row">
              <div class="flex flex-col lg:flex-row gap-3 w-full">
                <nuxt-img src="/icons/figma/profile/2fa.svg" class="w-10 h-10" />
                <div class="flex-col gap-1">
                  <p class="text-sm font-medium">
                    Усиленная защита аккаунта
                  </p>
                  <p class="text-xs font-normal text-gray-500">
                    Укрепите безопасность своего аккаунта
                  </p>
                </div>
              </div>

              <div class="flex mt-10 lg:mt-0 justify-start w-full lg:w-fit items-center gap-2">
                <input v-model="isTwoFaEnabled" type="checkbox" class="toggle toggle-sm toggle-primary"
                  @change="openTwoFaQRModal" />
                <span class="text-xs">Включить</span>
              </div>
            </label>
          </div>
        </div>

        <div class="flex flex-col gap-4 p-4 bg-white rounded-lg">
          <h2 class="text-lg font-medium">
            Чат-бот уведомлений
          </h2>
          <div class="flex flex-col gap-3 bg-secondary p-4 rounded-lg">
            <div class="flex flex-col justify-between w-full">
              <div class="flex justify-between w-full flex-col lg:flex-row">
                <div class="flex flex-col lg:flex-row gap-3">
                  <nuxt-img src="/icons/figma/profile/email.svg" class="w-10 h-10" />
                  <div class="flex flex-col gap-1 flex-1">
                    <p class="text-sm font-normal">
                      Уведомления Email
                    </p>
                    <p class="text-xs font-normal text-gray-500">
                      Функции недоступны. Подключите уведомления Email
                    </p>
                  </div>
                </div>
                <div class="form-control">
                  <div
                    class="flex items-center w-full pt-10 lg:pt-0 bg-transparent gap-5 rounded-t-none rounded-b-md">
                    <label class="label cursor-pointer gap-2 p-0 pb-2 lg:py-2 lg:px-2 items-center">
                      <input type="checkbox"
                        class="toggle toggle-sm checked:border-primary checked:bg-white checked:[--tglbg:#FF5E34]"
                        :checked="emailAlerts.value" @click="emailAlerts.value = !emailAlerts.value">
                      <span class="text-xs font-normal">Включить все</span>
                    </label>
                  </div>
                  <transition name="slide-fade">
                    <div v-if="emailAlerts.value" class="flex flex-col gap-0 self-start lg:self-end">
                      <div v-for="(item, index) in emailAlerts.arr" :key="index"
                        class="flex items-center w-full p-2 pl-0 lg:pl-2  bg-transparent  gap-2 rounded-t-none rounded-b-md">
                        <label class="label cursor-pointer p-0">
                          <input type="checkbox"
                            class="toggle toggle-sm checked:border-primary checked:bg-white checked:[--tglbg:#FF5E34]"
                            :checked="item.value" @click="item.value = !item.value">
                        </label>
                        <span class="text-xs font-normal">{{ item.title }}</span>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </div>

            <div class="divider my-0" />

            <div class="flex flex-col justify-start w-full gap-3 border border-none border-t border-[#e5e7eb]">
              <div
                class="flex flex-col lg:flex-row justify-start w-full gap-3 border border-none border-t border-[#e5e7eb]">
                <nuxt-img src="/icons/figma/profile/tg.svg" class="w-10 h-10 mb-3 lg:mb-0" />
                <div class="flex gap-3 flex-col lg:flex-row lg:w-full">
                  <div class="flex gap-3">
                    <div class="flex flex-col gap-1 flex-1">
                      <p class="text-sm font-normal">
                        Telegram чат-бот
                      </p>
                      <p class="text-xs font-normal text-gray-500">
                        Функции недоступны. Подключите Telegram-бот.
                      </p>
                    </div>
                  </div>
                  <a href="#"
                    class="flex items-start py-3 text-primary hover:text-base-content lg:ml-auto text-xs pt-10 lg:pt-3">
                    <span>Перейти в чат бот</span>
                    <icon name="solar:arrow-right-linear" class="ml-1 w-4 h-4 transition-colors duration-200" />
                  </a>
                </div>

                <div class="lg:ml-auto flex flex-col lg:items-center text-gray-500 text-xs flex-1">
                  <div class="form-control">
                    <label class="label flex justify-start cursor-pointer gap-2 p-0 pb-2  lg:py-2 lg:px-2 items-center">
                      <input type="checkbox"
                        class="toggle toggle-sm checked:border-primary checked:bg-white checked:[--tglbg:#FF5E34]"
                        :checked="tgAlerts.value" @click="tgAlerts.value = !tgAlerts.value">
                      <span class="whitespace-nowrap text-black">Включить все</span>
                    </label>
                  </div>
                  <transition name="slide-fade">
                    <div v-if="tgAlerts.value" class="flex flex-col gap-0 flex-end self-start lg:self-end">
                      <div v-for="(item, index) in tgAlerts.arr" :key="index"
                        class="flex gap-2 items-center w-full pl-0 lg:pl-2 p-2 bg-transparent rounded-t-none rounded-b-md">
                        <label class="label cursor-pointer p-0">
                          <input type="checkbox"
                            class="toggle toggle-sm checked:border-primary checked:bg-white checked:[--tglbg:#FF5E34]"
                            :checked="item.value" @click="item.value = !item.value">
                        </label>
                        <span class="text-xs font-normal">{{ item.title }}</span>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>

            </div>



          </div>
        </div>

        <!-- <div class="flex flex-col gap-6 p-4 bg-white rounded-lg">
          <h2 class="text-lg font-medium">
            Документы
          </h2>
          <div class="flex flex-col gap-6 bg-secondary p-3 rounded-lg">
            <div class="flex flex-col gap-2 text-sm">
              <a v-for="(item, index) in docsArray" :key="index" :href="item.path"
                class="hover:text-base-content text-primary">{{ item.title }}</a>
            </div>
          </div>
        </div> -->
      </div>

      <profile-email-confirm-modal :show="emailConfirmModal" @close="emailConfirmModal = false" />
    </div>
    <ProfileTwoFaQRModal ref="twoFaQRModal" :show="twoFaShow" @close-with-turn-on="twoFaShow = false"
      @close="closeModal" />
    <ProfilePartnerDetailsModal v-if="!partnerAgreement" :show="partnerDetailsModal"
      @close="partnerDetailsModal = false" />
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
