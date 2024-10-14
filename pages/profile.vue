<script lang="ts" setup>
import { notify } from "@kyvg/vue3-notification";

definePageMeta({ title: "Профиль", layout: "app" });
const { loggedIn, user, session, fetch, clear } = useUserSession();
const router = useRouter();
if (!loggedIn || !user) router.push("/auth?redirect=/profile");
async function logout() {
  await clear();
  router.push("/");
}

const { locale, locales, setLocale } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const availableLocales = computed(() => {
  return locales.value.filter((i) => i.code !== locale.value);
});

const twoFaQRModal = ref<any>(null);
const twoFaShow = ref(false);
const isTwoFaEnabled = ref(user.value?.isTwoFaEnabled || false);

async function openTwoFaQRModal() {
  if (!isTwoFaEnabled.value) {
    const { data }: any = await useFetch("/api/2fa/turnOnOff", {
      method: "GET",
      query: { changeTo: isTwoFaEnabled.value },
      watch: false,
    });
    if (data.value) {
      notify({
        title: "Двухфакторная аутентификация выключена",
      });
      isTwoFaEnabled.value = false;
      await fetch();
    }
    return;
  } else {
    twoFaShow.value = true;
  }
}

function closeModal() {
  twoFaShow.value = false;
  isTwoFaEnabled.value = false;
}

const form = reactive({
  login: "",
  email: "",
  phoneNumber: "",
  language: "ru",
  wallet: "rubles",
});

onMounted(() => {
  form.email = user.value?.email || "";
  form.phoneNumber = user.value?.phoneNumber || "";
});

const docsArray = ref([
  {
    title: "Политика конфиденциальности",
    path: "",
  },
  {
    title: "Политика Cookies",
    path: "",
  },
  {
    title: "Обработка персональных данных",
    path: "",
  },
  {
    title: "Согласие на рассылку",
    path: "",
  },
  {
    title: "Пользовательское соглашение ",
    path: "",
  },
]);

const tooltipVisible = ref(false);
const emailConfirmModal = ref(false);

const emailAlerts = reactive({
  value: false,
  arr: [
    {
      title: "Партнерка",
      value: false,
    },
    {
      title: "Услуги",
      value: false,
    },
    {
      title: "Новинки/акции",
      value: false,
    },
    {
      title: "Промокоды",
      value: false,
    },
  ],
});
const tgAlerts = reactive({
  value: false,
  arr: [
    {
      title: "Партнерка",
      value: false,
    },
    {
      title: "Услуги",
      value: false,
    },
    {
      title: "Новинки/акции",
      value: false,
    },
    {
      title: "Промокоды",
      value: false,
    },
  ],
});

const isCodeSent = ref(false);
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
});

// const disabledChangePasswordButton = computed(() => {
//   if (user.value?.hasPassword)
//     return passwordForm.oldPassword === "" || passwordForm.newPassword === "";
//   else return passwordForm.newPassword === "";
// });

async function updatePassword() {
  if (passwordForm.oldPassword === "" && passwordForm.newPassword === "")
    return;

  const { data, error }: any = await useFetch("/api/user/changePassword", {
    method: "POST",
    body: passwordForm,
    watch: false,
  });
  if (error.value)
    return notify({
      type: "error",
      title: "Не удалось поменять пароль.",
      text: error.value.message,
    });

  if (data.value === "success")
    notify({ type: "success", title: "Пароль успешно изменен." });

  passwordForm.oldPassword = "";
  passwordForm.newPassword = "";
}

function swapLanguage(e: any) {
  console.log(e.value);

  form.language = e.value;
  setLocale(e.value);
}
</script>

<template>
  <div>
    <a
      v-for="locale in availableLocales"
      :href="switchLocalePath(locale.code)"
      :key="locale.code"
    >
    </a>
    <div class="flex flex-col gap-12 py-6 md:gap-6 md:py-4">
      <h1 class="text-xl font-semibold">{{ $t("profile") }}</h1>
      <div>
        <button @click="setLocale('en')">en</button>
        <button @click="setLocale('ru')">ru</button>
      </div>
      <div class="flex flex-col gap-6 p-4 bg-blue-50 rounded-lg">
        <h2 class="text-lg font-medium">Контактные данные</h2>
        <div class="flex flex-col gap-6 md:flex-row">
          <div class="flex flex-col gap-1">
            <p class="text-xs font-medium text-blue-800">
              {{ $t("Номер телефона") }}
            </p>
            <input
              v-model="form.phoneNumber"
              readonly
              placeholder="Номер телефона"
              class="input input-bordered border-blue-800 w-full"
            />
          </div>
          <div class="flex flex-col gap-1 relative">
            <p class="text-xs font-medium text-blue-800">Почта</p>
            <label
              class="input input-bordered border-blue-800 flex items-center justify-between relative bg-white"
              @click="emailConfirmModal = true"
            >
              <input
                v-model="form.email"
                placeholder="Введите почту"
                readonly
                class="flex-grow w-full text-ellipsis min-w-52"
              />
              <button
                class="flex items-center justify-center mx-2 text-red-600"
                :class="{
                  'text-red-600': !user?.emailConfirmed,
                  'text-green-600': user?.emailConfirmed,
                }"
                @click="emailConfirmModal = true"
                @mouseenter="tooltipVisible = true"
                @mouseleave="tooltipVisible = false"
              >
                <icon
                  v-if="!user?.emailConfirmed"
                  name="flowbite:close-outline"
                  size="24"
                />
                <icon v-else name="quill:checkmark-double" size="24" />
              </button>
              <custom-tooltip
                :text="
                  !user?.emailConfirmed
                    ? 'Email не подтвержден'
                    : 'Email подтвержден'
                "
                :visible="tooltipVisible"
              />
            </label>
            <p
              v-if="!user?.emailConfirmed"
              class="text-red-600 text-xs absolute right-0 md:hidden"
            >
              Email не подтвержден
            </p>
          </div>
          <div class="flex gap-2">
            <div class="flex flex-col gap-1">
              <p class="text-xs font-medium text-blue-800">Язык</p>
              <custom-select
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
                @change-value="(e: any) => swapLanguage(e)"
              />
            </div>
            <div class="flex flex-col gap-1">
              <p class="text-xs font-medium text-blue-800">Валюта</p>
              <custom-select
                :tabs="[
                  { title: '₽', value: 'rubles' },
                  { title: '$', value: 'dollar' },
                  { title: '€', value: 'Euro' },
                ]"
                @change-value="(e: any) => (form.wallet = e.value)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-6 p-4 bg-blue-50 rounded-lg">
        <h2 class="text-lg font-medium">Пароль</h2>
        <div class="flex flex-col gap-2.5">
          <div v-if="user" class="flex flex-col gap-2.5 xl:flex-row">
            <input
              v-model="passwordForm.oldPassword"
              :disabled="isCodeSent"
              type="password"
              placeholder="Старый пароль"
              class="input input-bordered w-full"
            />
            <input
              v-model="passwordForm.newPassword"
              :disabled="isCodeSent"
              type="password"
              placeholder="Новый пароль"
              class="input input-bordered w-full"
            />
            <button class="btn btn-primary xl:w-40" @click="updatePassword">
              "Изменить"
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

      <div class="flex flex-col gap-6 p-4 bg-blue-50 rounded-lg">
        <h2 class="text-lg font-medium">Чат-бот уведомлений</h2>
        <div class="flex flex-col gap-6">
          <div class="flex justify-between w-full">
            <div class="flex gap-3">
              <nuxt-img
                src="/icons/figma/profile/email.svg"
                class="w-10 h-10"
              />
              <div class="flex flex-col gap-1">
                <p class="text-sm font-normal">Уведомления Email</p>
                <p class="text-xs font-normal text-gray-500">
                  Функции недоступны. Подключите уведомления Email
                </p>
              </div>
            </div>
            <div class="form-control">
              <label class="label cursor-pointer flex gap-2">
                <span class="hidden sm:inline">Включить все</span>
                <input
                  type="checkbox"
                  class="toggle"
                  :checked="emailAlerts.value"
                  @click="emailAlerts.value = !emailAlerts.value"
                />
              </label>
            </div>
          </div>

          <transition name="slide-fade">
            <div v-if="emailAlerts.value" class="flex flex-col gap-3">
              <div
                v-for="(item, index) in emailAlerts.arr"
                :key="index"
                class="flex justify-between items-center w-full p-2 bg-white border border-t-0 last:mb-8 rounded-t-none rounded-b-md"
              >
                <span class="text-sm font-normal">{{ item.title }}</span>
                <label class="label cursor-pointer p-0">
                  <input
                    type="checkbox"
                    class="toggle"
                    :checked="item.value"
                    @click="item.value = !item.value"
                  />
                </label>
              </div>
            </div>
          </transition>

          <div class="flex justify-between w-full">
            <div class="flex gap-3">
              <nuxt-img src="/icons/figma/profile/tg.svg" class="w-10 h-10" />
              <div class="flex flex-col gap-1">
                <p class="text-sm font-normal">Telegram чат-бот</p>
                <p class="text-xs font-normal text-gray-500">
                  Функции недоступны. Подключите Telegram-бот.
                </p>
              </div>
            </div>
            <div>
              <div class="flex gap-4 items-center text-gray-500 text-xs">
                <a href="#" class="flex items-center hover:text-blue-800">
                  <span>Перейти в чат бот</span>
                  <icon
                    name="solar:arrow-right-linear"
                    class="ml-1 w-4 h-4 transition-colors duration-200"
                  />
                </a>
                <div class="form-control">
                  <label class="label cursor-pointer gap-2">
                    <span class="hidden sm:inline">Включить все</span>
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
          </div>

          <transition name="slide-fade">
            <div v-if="tgAlerts.value" class="flex flex-col gap-3">
              <div
                v-for="(item, index) in tgAlerts.arr"
                :key="index"
                class="flex justify-between items-center w-full p-2 bg-white border border-t-0 rounded-t-none rounded-b-md"
              >
                <span class="text-sm font-normal">{{ item.title }}</span>
                <label class="label cursor-pointer p-0">
                  <input
                    type="checkbox"
                    class="toggle"
                    :checked="item.value"
                    @click="item.value = !item.value"
                  />
                </label>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div class="flex flex-col gap-6 p-4 bg-blue-50 rounded-lg">
        <h2 class="text-lg font-medium">Документы</h2>
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-2 text-sm text-gray-600">
            <a
              v-for="(item, index) in docsArray"
              :key="index"
              :href="item.path"
              class="underline hover:text-blue-800"
              >{{ item.title }}</a
            >
          </div>
        </div>
      </div>

      <button class="btn btn-primary" @click="logout">Выйти</button>
    </div>

    <profile-email-confirm-modal
      :show="emailConfirmModal"
      @close="emailConfirmModal = false"
    />
  </div>

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
