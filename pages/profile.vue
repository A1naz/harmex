<script lang="ts" setup>
definePageMeta({ middleware: ['auth'], title: 'Профиль', layout: 'app' })
import { notify } from '@kyvg/vue3-notification'

const { loggedIn, user, session, fetch, clear } = useUserSession()
const router = useRouter()

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
  form.login = user.value?.phoneNumber.replace(/[\(\)\-\s]/g, '') || ''
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

const sessionUpdate = async () => {
  await fetch()
}

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

const twoFaQRModal = ref<any>(null)
const twoFaShow = ref(false)

const isTwoFaEnabled = ref(user.value?.isTwoFaEnabled || false)

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
    return
  } else {
    twoFaShow.value = true
  }
}

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
})

const disabledChangePasswordButton = computed(() => {
  return passwordForm.oldPassword == '' && passwordForm.newPassword == ''
})

const headers = useRequestHeaders(['cookie']) as HeadersInit

async function updatePassword() {
  if (passwordForm.oldPassword == '' && passwordForm.newPassword == '') return

  //@ts-ignore
  const { data, error }: any = await useFetch('/api/user/updatePassword', {
    method: 'POST',
    body: passwordForm,
    headers,
    watch: false,
  })
  if (error.value) {
    notify({
      title: 'Ошибка',
      text: `${error.value.data.message || ''}`,
      type: 'error',
    })

    return
  } else {
    notify({
      title: 'Пароль успешно изменен',
    })
    await fetch()
  }
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
}

function closeModal() {
  twoFaShow.value = false
  isTwoFaEnabled.value = false
}
</script>

<template>
  <div class="flex flex-col gap-[40px] px-[24px] py-[20px] sm:px-[73px]">
    <h1 class="title text-[26px] font-[600]">Профиль</h1>
    <div class="flex flex-col gap-[20px] rounded-lg bg-[#f5f7ff] p-[14px]">
      <h2 class="text-[20px] font-[500]">Контактные данные</h2>
      <div class="flex flex-wrap gap-[24px] px-[0px] sm:px-[18px]">
        <div class="flex flex-col flex-nowrap gap-[6px]">
          <p class="text-[12px] font-[400] text-[#1B38CA]">Логин</p>
          <input
            v-model="form.login"
            placeholder="Логин"
            class="input input-bordered w-full border-[#1b38ca]"
            readonly
          />
        </div>
        <div class="flex flex-col flex-nowrap gap-[6px]">
          <p class="text-[12px] font-[400] text-[#1B38CA]">Номер телефона</p>
          <input
            v-model="form.phoneNumber"
            placeholder="Номер телефона"
            class="input input-bordered w-full border-[#1b38ca]"
            readonly
          />
        </div>
        <div class="flex flex-col flex-nowrap gap-[6px]">
          <p class="text-[12px] font-[400] text-[#1B38CA]">Почта</p>
          <div class="join flex border border-[#1b38ca] bg-white">
            <input
              v-model="form.email"
              placeholder="Почта"
              class="input join-item w-full"
              readonly
              @dblclick="emailConfirmModal = true"
            />
            <button
              class="join-item mx-[10px] flex items-center justify-center"
              :class="{
                'text-[#CC5F5F]': !user?.emailConfirmed,
                'text-[#5ba270]': user?.emailConfirmed,
              }"
              @click="emailConfirmModal = true"
              @mouseenter="tooltipVisible = true"
              @mouseleave="tooltipVisible = false"
            >
              <Icon
                v-if="!user?.emailConfirmed"
                name="flowbite:close-outline"
                size="24"
              />
              <Icon v-else name="quill:checkmark-double" size="24" />
            </button>
            <CustomTooltip
              :text="
                !user?.emailConfirmed
                  ? 'Email не подтвержден'
                  : 'Email подтвержден'
              "
              :visible="tooltipVisible"
            />
          </div>
        </div>
        <div class="flex flex-col flex-nowrap gap-[6px]">
          <p class="text-[12px] font-[400] text-[#1B38CA]">Язык</p>
          <CustomSelect
            :tabs="[
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
            ]"
            @change-value="(e) => (form.language = e.value)"
          />
        </div>
        <div class="flex flex-col flex-nowrap gap-[6px]">
          <p class="text-[12px] font-[400] text-[#1B38CA]">Валюта</p>
          <CustomSelect
            :tabs="[
              { title: '₽', value: 'rubles' },
              { title: '$', value: 'dollar' },
              { title: '€', value: 'Euro' },
            ]"
            :dropdown-container-class="'min-w-[83px]'"
            @change-value="(e) => (form.wallet = e.value)"
          />
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-[20px] rounded-lg bg-[#f5f7ff] p-[14px]">
      <h2 class="text-[20px] font-[500]">Пароль</h2>

      <div class="mt-1 flex w-full flex-col gap-2.5">
        <div class="flex w-full flex-col gap-2.5 xl:flex-row">
          <!-- v-show="user.hasPassword"
          v-model="passwordForm.oldPassword" -->
          <input
            type="password"
            placeholder="Старый пароль"
            v-model="passwordForm.oldPassword"
            class="input input-bordered w-full"
          />
          <input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="Новый пароль"
            class="input input-bordered w-full"
          />
          <button
            :disabled="disabledChangePasswordButton"
            class="btn btn-primary mr-0 self-start border-none bg-opacity-20 text-base-content xl:w-40"
            @click="updatePassword"
          >
            {{ 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-[20px] rounded-lg bg-[#f5f7ff] p-[14px]">
      <h2 class="text-[20px] font-[500]">Двухфакторная аутентификация</h2>

      <div class="form-control">
        <label class="label cursor-pointer px-[18px]">
          <span class="label-text mr-4"
            >Включить двухфакторную аутентификацию</span
          >

          <input
            @change="openTwoFaQRModal"
            type="checkbox"
            class="toggle toggle-primary"
            v-model="isTwoFaEnabled"
          />
        </label>
      </div>
    </div>

    <div class="flex flex-col gap-[20px] rounded-lg bg-[#f5f7ff] p-[14px]">
      <h2 class="text-[20px] font-[500]">Чат-бот уведомлений</h2>
      <div class="flex flex-col justify-between gap-[20px] sm:px-[18px]">
        <div class="flex w-full justify-between">
          <div class="flex justify-start gap-[12px]">
            <nuxt-img
              src="/icons/figma/profile/email.svg"
              class="h-[40px] w-[40px]"
            />
            <div class="flex flex-col gap-[4px]">
              <p class="text-[16px] font-[400]">Уведомления Email</p>
              <p class="text-[14px] font-[400] text-[#909090]">
                Функции недоступны. Подключите уведомления Email
              </p>
            </div>
          </div>
          <div class="form-control">
            <label class="label flex cursor-pointer gap-[7px]">
              <span class="label-text hidden sm:flex">Включить все</span>
              <input
                type="checkbox"
                class="toggle"
                :checked="emailAlerts.value"
                @click="emailAlerts.value = !emailAlerts.value"
              />
            </label>
          </div>
        </div>

        <Transition name="slide-fade">
          <div v-if="emailAlerts.value" class="flex w-full flex-col">
            <div
              v-for="(item, index) in emailAlerts.arr"
              class="mt-[6px] flex w-full items-center justify-between rounded-[10px] border border-x-0 border-t-0 border-b-[#A1B0F8] bg-white px-[12px] py-[5px]"
              :class="{
                'mb-[25px]': index == emailAlerts.arr.length - 1,
              }"
            >
              <span class="text-[14px] font-[400]">{{ item.title }}</span>
              <label class="label flex cursor-pointer p-0">
                <input
                  type="checkbox"
                  class="toggle"
                  :checked="item.value"
                  @click="item.value = !item.value"
                />
              </label>
            </div>
          </div>
        </Transition>

        <div class="flex w-full justify-between">
          <div class="flex justify-start gap-[10px]">
            <nuxt-img
              src="/icons/figma/profile/tg.svg"
              class="h-[40px] w-[40px]"
            />
            <div class="flex flex-col gap-[4px]">
              <p class="text-[16px] font-[400]">Telegram чат-бот</p>
              <p class="text-[14px] font-[400] text-[#909090]">
                Функции недоступны. Подключите Telegram-бот.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-[18px]">
            <div class="flex gap-[10px] text-[12px] font-[400] text-[#909090]">
              <a href="#" class="flex items-center hover:text-[#1B38CA]">
                <span>Перейти в чат бот</span>
                <Icon
                  name="solar:arrow-right-linear"
                  class="ml-1 h-[12px] w-[12px] transition-colors duration-200"
                />
              </a>
            </div>

            <div class="form-control">
              <label class="label flex cursor-pointer gap-[7px]">
                <span class="label-text hidden sm:flex">Включить все</span>
                <input
                  type="checkbox"
                  class="toggle"
                  :checked="tgAlerts.value"
                  @click="tgAlerts.value = !tgAlerts.value"
                />
              </label>
            </div>
          </div>
        </div>

        <Transition name="slide-fade">
          <div v-if="tgAlerts.value" class="flex w-full flex-col">
            <div
              v-for="(item, index) in tgAlerts.arr"
              class="mt-[6px] flex w-full items-center justify-between rounded-[10px] border border-x-0 border-t-0 border-b-[#A1B0F8] bg-white px-[12px] py-[5px]"
            >
              <span class="text-[14px] font-[400]">{{ item.title }}</span>
              <label class="label flex cursor-pointer p-0">
                <input
                  type="checkbox"
                  class="toggle"
                  :checked="item.value"
                  @click="item.value = !item.value"
                />
              </label>
            </div></div
        ></Transition>
      </div>
    </div>

    <Transition name="slide-fade">
      <div class="flex flex-col gap-[20px] rounded-lg bg-[#f5f7ff] p-[14px]">
        <h2 class="text-[20px] font-[500]">Документы</h2>
        <div class="flex gap-[24px] px-[18px]">
          <div
            class="flex flex-col gap-[6px] text-[14px] font-[400] text-[#6B6B6B]"
          >
            <a
              v-for="item in docsArray"
              :href="item.path"
              class="underline hover:text-[#1B38CA]"
              >{{ item.title }}</a
            >
          </div>
        </div>
      </div></Transition
    >

    <button @click="logout" class="btn btn-primary">Выйти</button>
  </div>
  <ProfileEmailConfirmModal
    :show="emailConfirmModal"
    @close="emailConfirmModal = false"
  />
  <ProfileTwoFaQRModal
    :show="twoFaShow"
    @closeWithTurnOn="twoFaShow = false"
    @close="closeModal"
    ref="twoFaQRModal"
  />
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
