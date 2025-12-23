<!-- eslint-disable @typescript-eslint/no-use-before-define -->
<script lang="ts" setup>
import { useVuelidate } from "@vuelidate/core";
import { helpers, maxLength, minLength, required } from "@vuelidate/validators";

const { session, fetch } = useUserSession();
const route = useRoute();
const params = route.query;

definePageMeta({
  title: "Вход",
});

const { notify } = useNotification();
const loading = ref(false);
const formData = reactive({
  phoneNumber: "",
  password: "",
});


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
  if (params?.emailConfirmed) {
    notify({
      group: "success",
      title: "Email успешно подтвержден!",
      duration: 3000,
    });
  }
  if (params?.passwordChanged) {
    notify({
      group: "success",
      title: "Пароль успешно изменен!",
      duration: 3000,
    });
  }
  if (params?.confirmed) {
    notify({
      type: "info",
      title:
        "Письмо для подтверждения было отправлено на указанный email. (Проверьте папку Спам)",
      duration: 3000,
    });
  }

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
});

const passwordShow = ref(false);
const inputType = ref(passwordShow.value ? "text" : "password");
function togglePassword() {
  passwordShow.value = !passwordShow.value;
  inputType.value = passwordShow.value ? "text" : "password";
}

const rules = computed(() => {
  return {
    phoneNumber: {
      required: helpers.withMessage("Введите номер телефона", required),
      minLength: helpers.withMessage("Неверный номер телефона", minLength(18)),
      maxLength: helpers.withMessage("Неверный номер телефона", maxLength(18)),
    },
    password: {
      required: helpers.withMessage("Введите пароль", required),
      minLength: helpers.withMessage(
        "Пароль должен быть длиннее 6 символов",
        minLength(6)
      ),
    },
  };
});

const v$ = useVuelidate(rules, formData);

async function login() {
  const valid = await v$.value.$validate();
  if (!valid) return;
  loading.value = true;
  const response = await $fetch("/api/auth/login", {
    method: "POST",
    body: {
      phoneNumber: formData.phoneNumber,
      password: formData.password,
    },
  })
    .catch((err) => {
      notify({
        group: "error",
        title: "Не удалось войти",
        text: err.data.message || err.message,
      });
    })
    .finally(() => {
      loading.value = false;
    });
  if (response === "success") {
    await fetch();
    loading.value = false;
    if (session.value.user?.isTwoFaEnabled && session.value?.twoFaNeeded) {
      return navigateTo("/2fa");
    }  else if (session.value.user?.needVerification) {
      return navigateTo("/verify");
    }
    else if ((params?.redirect as string) && params.redirect !== "/") {
      return navigateTo(params.redirect as string);
    } else {
      return navigateTo("/catalog?introductionModal=true");
    }
  }
}
</script>

<template>
  <div id="auth" class="flex sm:items-center sm:justify-center h-screen">
    <section
      class="flex flex-col justify-center align-center w-full max-w-md lg:max-w-lg rounded-lg p-4 shadow-lg gap-3"
    >
      <h3 class="logo font-bold text-2xl text-center">HARMEX</h3>
      <h3 class="font-bold text-2xl text-center mb-4">{{ $t("Войдите в ваш аккаунт") }}</h3>

      <div class="box flex flex-col gap-3">
        <form class="flex flex-col gap-3" @submit.prevent="login">
          <div class="flex flex-col gap-1">
            <label>{{ $t("Номер телефона") }} </label>
            <input
              v-model="formData.phoneNumber"
              v-maska
              data-maska="+7 (###) ###-##-##"
              placeholder="+7 (___) ___-__-__"
              required="true"
              class="input input-bordered"
            />
            <div v-if="v$.phoneNumber.$error" class="text-red-500 text-xs mt-1">
              {{ v$.phoneNumber.$errors[0].$message }}
            </div>
            <div class="text-xs text-gray-500">
              {{ $t("Сохраните данные, чтобы всегда были под рукой") }}
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label>{{ $t("Введите ваш пароль") }} </label>
            <div class="flex flex-col gap-0.5">
              <label class="input input-bordered w-full flex">
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
                  class="hover:text-primary w-1/12"
                  @click="togglePassword"
                >
                  <Icon
                    v-if="passwordShow"
             
                    size="25"
                    name="mdi:hide-outline"
                  />
                  <Icon
                    v-else
             
                    size="25"
                    name="mdi:show-outline"
                  />
                </button>
              </label>
              <NuxtLink class="text-primary my-1" href="/resetPassword">
                {{ $t("Не помните пароль?") }}
              </NuxtLink>
            </div>
            <div v-if="v$.password.$error" class="text-red-500 text-xs mt-1">
              {{ v$.password.$errors[0].$message }}
            </div>
            <div class="text-xs text-gray-500">
              {{ $t("Нужна помощь? Служба заботы рядом. Напишите нам в чат.") }}
            </div>
          </div>

          <div class="flex flex-col gap-0.5">
            <button
              type="submit"
              class="btn btn-primary w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              <span v-show="loading" class="loading loading-spinner" />

              {{ $t("Войти") }}
            </button>

            <p class="mt-3 mb-1">
              {{ $t("Ещё не зарегистрированы?") }}
              <NuxtLink href="/register" class="text-primary underline">
                {{ $t("Регистрация") }}
              </NuxtLink>
            </p>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped>
.logo {
  font-family: "Kanit", semibold;
  font-size: 32px;
}
</style>
