<script lang="ts" setup>
import { useVuelidate } from "@vuelidate/core";
import {
  email,
  helpers,
  minLength,
  required,
  sameAs,
} from "@vuelidate/validators";

const { notify } = useNotification();

definePageMeta({
  title: "Регистрация",
});

const timer = ref(60);
const timerRunning = ref(false);
const timerVisible = ref(false);
const timerFinished = ref(false);
const faceType = ref("fizFace");
const confirmationCodeInput = ref<any>(null);
const isInnConfirmed = ref(false);
const isInnLoading = ref(false);
const isCodeSent = ref(false);
const isNumberConfirmed = ref(false);
const alert = ref(false);
const alertText = ref("");
const route = useRoute();
const alertType = ref("success");
const referral = ref(route.query?.ref || null);
const formData = reactive({
  email: "",
  password: "",
  confirmPassword: "",
  orgKey: "",
  orgName: "",
  orgOgrn: "",
  orgInn: "",
  lastname: "",
  name: "",
  middleName: "",
  phoneNumber: "",
  verificationCode: "",
  checked: false,
  referral,
  landing: "",
  bik: "",
  rs: "",
});
const passwordInputType = ref("password");
const passwordConfirmInputType = ref("password");

const referralFromLocal: any = ref("");
async function linkFollow() {
  await useFetch("/api/user/linkFollow", {
    method: "GET",
    query: {
      referral: formData.referral,
    },
    watch: false,
  });
}

onMounted(async () => {
  if (route.query?.ref && typeof route.query?.ref === "string") {
    if (route.query?.ref !== localStorage.getItem("referralCode")) {
      setTimeout(() => {
        linkFollow();
      });
    }
    localStorage.setItem("referralCode", route.query?.ref);
  }
  referralFromLocal.value = localStorage.getItem("referralCode");
  const landingValue = localStorage.getItem("landing");

  if (landingValue) formData.landing = landingValue;

  formData.referral = referralFromLocal.value;
});

const result = ref();
const loading = ref(false);
const rules = computed(() => {
  return {
    email: {
      required: helpers.withMessage("Введите email", required),
      email: helpers.withMessage("Введите корректный email", email),
    },
    bik: {
      required: helpers.withMessage("Введите БИК", required),
    },
    rs: {
      required: helpers.withMessage("Введите Р/С", required),
      minLength: helpers.withMessage(
        "Р/С должен содержать 20 цифр",
        minLength(20)
      ),
    },
    name: {
      required: helpers.withMessage("Введите имя", required),
    },
    lastname: {
      required: helpers.withMessage("Введите фамилию", required),
    },
    password: {
      required: helpers.withMessage("Введите пароль", required),
      minLength: helpers.withMessage(
        "Пароль должен быть длиннее 6 символов",
        minLength(6)
      ),
      containsNumber: helpers.withMessage(
        "Пароль должен содержать цифру",
        (value: string) => /\d/.test(value)
      ),
      englishLetters: helpers.withMessage(
        "Пароль должен состоять из английских букв",
        (value: string) => /(?=.*[a-z])(?=.*\d)/i.test(value)
      ),
    },
    confirmPassword: {
      required: helpers.withMessage("Подтвердите пароль", required),
      sameAs: helpers.withMessage(
        "Пароли не совпадают",
        sameAs(formData.password)
      ),
    },
  };
});

const v$ = useVuelidate(rules, formData);

async function submitForm() {
  v$.value.$validate();

  if (!v$.value.$errors.length || faceType.value === "fizFace") {
    loading.value = true;
    if (referralFromLocal.value && referralFromLocal.value.length > 0) {
      formData.referral = referralFromLocal.value;
    }

    if (faceType.value === "yurFace") {
      const { data }: any = await useFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
        watch: false,
      });
      result.value = data;
      loading.value = false;
      if (data.value!.status === "error") {
        notify({
          type: "error",
          title: data.value!.error as string,
          duration: 3000,
        });
        useTimeoutFn(() => {
          alert.value = false;
        }, 3000);
      } else {
        localStorage.removeItem("referralCode");
        localStorage.removeItem("landing");
        notify({
          type: "success",
          title: "Пользователь зарегистрирован.",
          duration: 3000,
        });
        useTimeoutFn(() => {
          alert.value = false;
          navigateTo("/auth?confirmed=false");
        }, 3000);
      }
      loading.value = false;
    } else if (faceType.value === "fizFace") {
      const { data }: any = await useFetch("/api/auth/registerFiz", {
        method: "POST",
        body: JSON.stringify(formData),
        watch: false,
      });
      result.value = data;
      loading.value = false;
      if (data.value!.status === "error") {
        notify({
          type: "error",
          title: data.value!.error as string,
          duration: 3000,
        });
        useTimeoutFn(() => {
          alert.value = false;
        }, 3000);
      } else {
        localStorage.removeItem("referralCode");
        localStorage.removeItem("landing");
        notify({
          type: "success",
          title: "Пользователь зарегистрирован.",
          duration: 3000,
        });
        useTimeoutFn(() => {
          alert.value = false;
          navigateTo("/auth?confirmed=false");
        }, 3000);
      }
      loading.value = false;
    }

    loading.value = false;
  }
}

async function checkInn() {
  if (formData.orgInn.length < 10) {
    notify({
      title: "ИНН должен содержать 10 цифр",
    });
    return;
  }

  isInnLoading.value = true;

  const { data, error }: any = await useFetch("/api/organization/checkInn", {
    method: "GET",
    query: {
      inn: formData.orgInn,
      phoneNumber: formData.phoneNumber.replace(/[()\-\s]/g, ""),
    },
    watch: false,
  });

  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: "Данные не получены",
    });
  }

  if (data.value) {
    if (data.value.status === "error") {
      notify({
        title: "Что-то пошло не так",
        text: data.value.error,
      });
      isInnLoading.value = false;
      return;
    }

    isInnConfirmed.value = true;
    formData.orgKey = data.value.orgKey;
    formData.orgName = data.value.orgName;
    formData.orgOgrn = data.value.orgOgrn;
    formData.orgInn = data.value.orgInn;
    formData.name = data.value.name;
    formData.lastname = data.value.lastname;
    formData.middleName = data.value.middleName;
  }

  isInnLoading.value = false;
}

function clearFormData() {
  isInnConfirmed.value = false;
  formData.orgInn = "";
  formData.orgKey = "";
  formData.orgName = "";
  formData.orgOgrn = "";
}

async function sendConfirmCode() {
  if (formData.phoneNumber.replace(/[()\-\s]/g, "").length < 11) {
    notify({
      title: "Введите корректный номер",
    });
    return;
  }

  if (timerRunning.value) {
    notify({
      title: `Следующая попытка будет доступна через ${timer.value} сек.`,
    });
    return;
  }
  timer.value = 60;
  timerFinished.value = false;
  startTimer();

  const { data }: any = await useFetch("/api/organization/confirmPhone", {
    method: "POST",
    body: {
      phoneNumber: formData.phoneNumber.replace(/[()\-\s]/g, ""),
    },
    watch: false,
  });

  if (data.value.status === "ok") {
    isCodeSent.value = true;
    confirmationCodeInput.value.focus();
    notify({
      type: "success",
      title: "Код отправлен",
    });
  } else {
    notify({
      type: "error",
      title: data.value.message,
    });
  }
}

async function confirmCode() {
  const { data }: any = await useFetch("/api/organization/confirmPhone", {
    method: "GET",
    params: {
      phoneNumber: formData.phoneNumber.replace(/[()\-\s]/g, ""),
      code: formData.verificationCode,
    },
    watch: false,
  });
  if (data.value) {
    notify({
      type: "success",
      title: "Код подтвержден",
    });

    isCodeSent.value = false;
    isNumberConfirmed.value = true;
  } else {
    notify({
      type: "error",
      title: "Неверный код",
    });
  }
}

let interval: any;

function startTimer() {
  timerRunning.value = true;
  timerVisible.value = true;
  interval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
    } else {
      clearInterval(interval);
      timerRunning.value = false;
      timerFinished.value = true;
      timer.value = 60;
    }
  }, 1000);
}

function togglePassword() {
  passwordInputType.value =
    passwordInputType.value === "password" ? "text" : "password";
}
function toggleConfirmPassword() {
  passwordConfirmInputType.value =
    passwordConfirmInputType.value === "password" ? "text" : "password";
}

async function generatePassword() {
  const { data, error }: any = await useFetch("/api/auth/getPassword", {
    method: "GET",
    watch: false,
  });
  if (data.value) {
    formData.password = data.value;
    formData.confirmPassword = data.value;
    passwordInputType.value = "text";
    passwordConfirmInputType.value = "text";
  }
}
</script>

<template>
  <div>
    <!-- <Toast :type="alertType" style="z-index: 1000" :active="alert">
      {{ alertText }}
    </Toast> -->
    <div
      id="auth"
      class="flex sm:items-center sm:justify-center overflow-y-auto max-h-[calc(100vh-10px)]"
    >
      <section
        class="flex flex-col justify-center align-center w-full max-w-lg rounded-lg p-2 shadow-lg gap-3 mt-auto mx-auto"
      >
        <h3 class="text-xl mt-5 font-bold text-center">
          Создайте ваш аккаунт на Harmex
        </h3>
        <h1 class="text-center text-gray-500 text-xs">
          Выберите удобный способ регистрации и оплаты перед началом действий...
        </h1>
        <div class="w-full">
          <div class="top-nav btm-nav-xs w-full flex justify-between">
            <button
              class="w-full"
              :class="{
                active: faceType === 'fizFace',
              }"
              @click="faceType = 'fizFace'"
            >
              Физическое лицо
            </button>
            <button
              class="w-full"
              :class="{
                active: faceType === 'yurFace',
              }"
              @click="faceType = 'yurFace'"
            >
              Юридическое лицо
            </button>
          </div>
        </div>
        <div class="px-5 pb-2">
          <div class="relative">
            <label for="email" class="block mb-2 ml-1 my-1 text-sm font-medium">
              Ваш номер телефона
            </label>
            <div class="join w-full">
              <input
                id="tnumber"
                v-model="formData.phoneNumber"
                v-maska
                :disabled="isCodeSent || isNumberConfirmed"
                name="tnumber"
                class="input join-item input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
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
                @click="(isCodeSent = false), (isNumberConfirmed = false)"
              >
                <IconCSS
                  class="w-12 h-12"
                  size="20"
                  name="fluent:backspace-24-regular"
                />
              </button>
            </div>
            <div class="flex">
              <div class="hidden">
                {{ timer }}
              </div>
              <span
                v-if="isCodeSent && !isNumberConfirmed"
                class="text-md font-medium underline cursor-pointer ml-1 mt-1"
                @click="sendConfirmCode"
                >Отправить код повторно</span
              >
            </div>
            <div class="text-xs text-gray-500 mb-2 ml-1">
              Нажмите подтвердить для получения звонка
            </div>
            <label for="email" class="block mb-2 ml-1 my-1 text-sm font-medium">
              Введите код верификации
            </label>
            <div class="join w-full">
              <input
                id="verificationCode"
                ref="confirmationCodeInput"
                v-model="formData.verificationCode"
                v-maska
                :disabled="isNumberConfirmed || !isCodeSent"
                type="text"
                data-maska="####"
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
                Подтвердить
              </button>
            </div>
            <div class="text-xs text-gray-500 mb-2 ml-1">
              Примите звонок и введите озвученные цифры. Не поступил звонок?
              Повторите запрос на звонок.
            </div>
            <div v-if="faceType === 'yurFace'">
              <div>
                <label class="block ml-1 my-1 text-sm font-medium">
                  Ваш ИНН организации
                </label>
                <div class="join w-full">
                  <input
                    id="orgInn"
                    v-model="formData.orgInn"
                    v-maska
                    :disabled="isInnConfirmed || !isNumberConfirmed"
                    data-maska="#######################"
                    name="orgInn"
                    class="input join-item input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="Введите ИНН"
                    required="true"
                  />
                  <button
                    v-if="!isInnConfirmed"
                    :disabled="isInnLoading || !isNumberConfirmed"
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
                    <IconCSS size="24" name="fluent:backspace-24-regular" />
                  </button>
                </div>
                <div class="text-xs text-gray-500 ml-1">
                  Ваши реквизиты подтянуться для формирования договора
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

                <label
                  for="email"
                  class="block mb-2 ml-1 my-1 text-sm font-medium"
                >
                  БИК
                </label>
                <input
                  id="name"
                  v-model="formData.bik"
                  :disabled="!isInnConfirmed && faceType === 'yurFace'"
                  type="text"
                  name="bik"
                  class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  :class="{
                    'input-error': v$.bik.$error,
                  }"
                  placeholder="БИК"
                  required="true"
                  @input="v$.bik.$touch"
                />

                <div
                  class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
                >
                  {{ v$.bik?.$errors[0]?.$message }}
                </div>
                <label
                  for="email"
                  class="block mb-2 ml-1 my-1 text-sm font-medium"
                >
                  Расчетный счёт
                </label>
                <input
                  id="rs"
                  v-model="formData.rs"
                  v-maska
                  :disabled="!isInnConfirmed && faceType === 'yurFace'"
                  type="text"
                  name="rs"
                  data-maska="####################"
                  class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  :class="{
                    'input-error': v$.rs.$error,
                  }"
                  placeholder="Р/С"
                  required="true"
                  @input="v$.rs.$touch"
                />

                <div
                  class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
                >
                  {{ v$.rs?.$errors[0]?.$message }}
                </div>
                <label
                  for="email"
                  class="block mb-2 ml-1 my-1 text-sm font-medium"
                >
                  Ваше Имя
                </label>
                <input
                  id="name"
                  v-model="formData.name"
                  :disabled="!isInnConfirmed && faceType === 'yurFace'"
                  type="text"
                  name="name"
                  class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  :class="{
                    'input-error': v$.name.$error,
                  }"
                  placeholder="Иван"
                  required="true"
                  @input="v$.name.$touch"
                />

                <div
                  class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
                >
                  {{ v$.name?.$errors[0]?.$message }}
                </div>
                <div class="text-xs text-gray-500 ml-1 mb-1">
                  Введите Имя владельца ИП или Ген.дира ООО
                </div>
                <label
                  for="email"
                  class="block mb-2 ml-1 my-1 text-sm font-medium"
                >
                  Ваша Фамилия
                </label>
                <input
                  id="lastname"
                  v-model="formData.lastname"
                  :disabled="!isInnConfirmed && faceType === 'yurFace'"
                  type="text"
                  name="lastname"
                  class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  :class="{
                    'input-error': v$.lastname.$error,
                  }"
                  placeholder="Иванов"
                  required="true"
                  @input="v$.lastname.$touch"
                />

                <div
                  class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
                >
                  {{ v$.lastname?.$errors[0]?.$message }}
                </div>
                <div class="text-xs text-gray-500 ml-1 mb-1">
                  Введите Фамилию владельца ИП или Ген.дира ООО
                </div>
                <label
                  for="email"
                  class="block mb-2 ml-1 my-1 text-sm font-medium"
                >
                  Ваше Отчество
                </label>
                <input
                  id="name"
                  v-model="formData.middleName"
                  :disabled="!isInnConfirmed && faceType === 'yurFace'"
                  type="text"
                  name="middleName"
                  class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="Иванович"
                />
              </div>
              <div class="text-xs text-gray-500 ml-1 mb-1">
                Введите Отчество владельца ИП или Ген.дира ООО
              </div>
            </div>

            <div>
              <label
                for="email"
                class="block mb-2 ml-1 my-1 text-sm font-medium"
              >
                Ваш адрес электронной почты
              </label>
              <input
                id="email"
                v-model="formData.email"
                :disabled="!isInnConfirmed && faceType === 'yurFace'"
                type="email"
                name="email"
                class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                :class="{
                  'input-error': v$.email.$error,
                }"
                placeholder="name@company.com"
                required="true"
                @input="v$.email.$touch"
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
            <div class="text-xs text-gray-500 mb-2 ml-1">
              На Email будут приходить чеки, уведомления и напоминания
            </div>
            <div>
              <label
                for="password"
                class="block ml-1 mt-1 mb-2 my-1 text-sm font-medium"
                >Установите безопасный пароль
              </label>
              <div class="flex relative">
                <input
                  id="password"
                  v-model="formData.password"
                  :disabled="!isInnConfirmed && faceType === 'yurFace'"
                  :type="passwordInputType"
                  name="password"
                  placeholder="••••••••"
                  class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  :class="{
                    'input-error': v$.password.$error,
                  }"
                  required="true"
                  @change="v$.password.$touch"
                />
                <button
                  type="button"
                  class="absolute right-0 -top-1 xl:top-1 mt-2 mr-2 hover:text-primary disabled:text-black"
                  @click="togglePassword"
                >
                  <IconCSS
                    v-if="passwordInputType !== 'password'"
                    class="w-20 h-20"
                    size="25"
                    name="mdi:hide-outline"
                  />
                  <IconCSS
                    v-else
                    class="w-20 h-20"
                    size="25"
                    name="mdi:show-outline"
                  />
                </button>
                <button
                  :disabled="!isNumberConfirmed"
                  type="button"
                  class="absolute right-8 -top-1 xl:top-1 mt-2 mr-2 hover:text-primary disabled:text-black"
                  @click="generatePassword"
                >
                  <IconCSS class="w-20 h-20" size="25" name="fe:random" />
                </button>
              </div>

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
                >Повторите безопасный пароль
              </label>
              <div class="flex relative">
                <input
                  id="confirm-password"
                  v-model="formData.confirmPassword"
                  :disabled="!isInnConfirmed && faceType === 'yurFace'"
                  :type="passwordConfirmInputType"
                  name="confirm-password"
                  placeholder="••••••••"
                  class="input input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  :class="{
                    'input-error': v$.confirmPassword.$error,
                  }"
                  required="true"
                  @change="v$.confirmPassword.$touch"
                />
                <button
                  type="button"
                  class="absolute right-0 -top-1 xl:top-1 mt-2 mr-2 hover:text-primary disabled:text-black"
                  @click="toggleConfirmPassword"
                >
                  <IconCSS
                    v-if="passwordConfirmInputType !== 'password'"
                    class="w-20 h-20"
                    size="25"
                    name="mdi:hide-outline"
                  />
                  <IconCSS
                    v-else
                    class="w-20 h-20"
                    size="25"
                    name="mdi:show-outline"
                  />
                </button>
              </div>
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
                v-model="formData.checked"
                type="checkbox"
                class="checkbox checkbox-sm mt-1 checkbox-primary"
              />
              <p
                class="text-xs cursor-pointer"
                @click="formData.checked = !formData.checked"
              >
                Регистрируясь вы принимаете
                <a target="_blank" href="/docs/oferta.pdf" class="text-primary"
                  >Пользовательское соглашение</a
                >, и подтверждаете, что ознакомлены с
                <a
                  target="_blank"
                  href="/docs/conf_policy.pdf"
                  class="text-primary"
                  >Политикой конфиденциальности</a
                >.
              </p>
            </div>
            <div class="text-xs mt-2 text-gray-500">
              Нужна помощь? Служба заботы рядом. Напишите нам в чат.
            </div>
          </div>
          <div v-if="faceType === 'yurFace'" class="flex flex-col gap-0.5">
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
          <div v-if="faceType === 'fizFace'" class="flex flex-col gap-0.5">
            <button
              :disabled="!formData.checked || !isNumberConfirmed"
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
  </div>
</template>

<style scoped></style>
