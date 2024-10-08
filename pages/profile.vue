<script lang="ts" setup>
definePageMeta({ middleware: ['auth'], title: 'Профиль', layout: 'app' })
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
  form.login = user.value?.login || ''
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
</script>

<template>
  <div class="flex flex-col gap-[50px] sm:px-[92px] px-[30px] py-[25px]">
    <h1 class="title text-[26px] font-[600]">Профиль</h1>

    <div class="flex flex-col gap-[25px] rounded-lg bg-[#f5f7ff] p-[18px]">
      <h2 class="text-[20px] font-[500]">Контактные данные</h2>
      <div class="flex gap-[30px] sm:px-[22px] px-[0px] flex-wrap">
        <div class="flex flex-col gap-[6px] flex-nowrap">
          <p class="text-[12px] font-[400] text-[#1B38CA]">Логин</p>
          <input
            v-model="form.login"
            placeholder="Логин"
            class="input input-bordered w-full border-[#1b38ca]"
          />
        </div>
        <div class="flex flex-col gap-[6px] flex-nowrap">
          <p class="text-[12px] font-[400] text-[#1B38CA]">Номер телефона</p>
          <input
            v-model="form.phoneNumber"
            placeholder="Номер телефона"
            class="input input-bordered w-full border-[#1b38ca]"
          />
        </div>
        <div class="flex flex-col gap-[6px] flex-nowrap">
          <p class="text-[12px] font-[400] text-[#1B38CA]">Почта</p>
          <div class="join flex border border-[#1b38ca] bg-white">
            <input
              v-model="form.email"
              placeholder="Почта"
              class="input join-item w-full"
              readonly
            />
            <button
              class="join-item mx-[10px] flex items-center justify-center text-[#CC5F5F]"
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
        <div class="flex flex-col gap-[6px] flex-nowrap">
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
        <div class="flex flex-col gap-[6px] flex-nowrap">
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

    <div class="flex flex-col gap-[25px] rounded-lg bg-[#f5f7ff] p-[18px]">
      <h2 class="text-[20px] font-[500]">Чат-бот уведомлений</h2>
      <div class="flex flex-col justify-between gap-[20px] sm:px-[22px]">
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
            <label class="label flex cursor-pointer gap-[9px]">
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
              class="mt-[8px] flex w-full items-center justify-between rounded-[10px] border border-x-0 border-t-0 border-b-[#A1B0F8] bg-white px-[15px] py-[7px]"
              :class="{
                'mb-[33px]': index == emailAlerts.arr.length - 1,
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
          <div class="flex justify-start gap-[12px]">
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
          <div class="flex items-center gap-[22px]">
            <div class="flex gap-[10px] text-[12px] font-[400] text-[#909090]">
              <a href="#" class="flex items-center hover:text-[#1B38CA]">
                <span>Перейти в чат бот</span>
                <Icon
                  name="solar:arrow-right-linear"
                  class="ml-1 h-[15px] w-[15px] transition-colors duration-200"
                />
              </a>
            </div>

            <div class="form-control">
              <label class="label flex cursor-pointer gap-[9px]">
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
            class="mt-[8px] flex w-full items-center justify-between rounded-[10px] border border-x-0 border-t-0 border-b-[#A1B0F8] bg-white px-[15px] py-[7px]"
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
        </div></Transition>
      </div>
    </div>

    <Transition name="slide-fade">
      <div class="flex flex-col gap-[25px] rounded-lg bg-[#f5f7ff] p-[18px]">
        <h2 class="text-[20px] font-[500]">Документы</h2>
        <div class="flex gap-[30px] px-[22px]">
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

    <!-- <button @click="logout" class="btn btn-primary">Выйти</button> -->
  </div>
  <ProfileEmailConfirmModal
    :show="emailConfirmModal"
    @close="emailConfirmModal = false"
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
