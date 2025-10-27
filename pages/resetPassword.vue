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
  colorMode: "dark",
  auth: false,
  title: "Восстановление пароля",
});
const name = useRuntimeConfig().NAME;

const isCodeSent = ref(false);
const confirmationCodeInput = ref<any>(null);
const isNumberConfirmed = ref(false);
const router = useRouter();

const formData = reactive({
  email: "",
  password: "",
  confirmPassword: "",
  verificationCode: "",
});
const alert = reactive({
  show: false,
  message: "",
  group: "success",
});
const rules = computed(() => {
  return {
    email: {},
    password: {
      required: helpers.withMessage("Введите пароль", required),
      minLength: helpers.withMessage(
        "Пароль должен быть длиннее 6 символов",
        minLength(6)
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
  const { error } = await useFetch("/api/user/changePasswordSend", {
    method: "POST",
    body: formData,
  });
  if (error.value) {
    notify({
      group: "error",
      title: error.value.data.message,
    });
  } else {
    router.push("/auth?passwordChanged=true");
  }
}

async function sendConfirmCode() {
  if (formData.email.replace(/[\(\)\-\s]/g, "").length < 11) {
    notify({
      title: "Введите корректный номер",
    });
    return;
  }
  //@ts-ignore
  const { data, error }: any = await useFetch(
    "/api/organization/confirmPhoneForReset",
    {
      method: "POST",
      body: {
        phoneNumber: formData.email.replace(/[\(\)\-\s]/g, ""),
      },
    }
  );

  if (data && data.value && data.value.status == "ok") {
    isCodeSent.value = true;
    confirmationCodeInput.value.focus();
    notify({
      group: "success",
      title: "Код отправлен",
    });
  } else if (error.value) {
    console.log(error.value);

    notify({
      group: "error",
      title: error.value.data.message,
    });
  }
}

async function confirmCode() {
  const { data, error }: any = await useFetch(
    "/api/organization/confirmPhone",
    {
      method: "GET",
      params: {
        phoneNumber: formData.email.replace(/[\(\)\-\s]/g, ""),
        code: formData.verificationCode,
      },
    }
  );
  if (data.value) {
    notify({
      group: "success",
      title: "Код подтвержден",
    });

    isCodeSent.value = false;
    isNumberConfirmed.value = true;
  } else {
    notify({
      group: "error",
      title: "Неверный код",
    });
  }
}

const passwordInputType = ref("password");
const passwordConfirmInputType = ref("password");

const togglePassword = () => {
  passwordInputType.value =
    passwordInputType.value === "password" ? "text" : "password";
};
const toggleConfirmPassword = () => {
  passwordConfirmInputType.value =
    passwordConfirmInputType.value === "password" ? "text" : "password";
};

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
  <section>
    <div
      class="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0"
    >
      <div class="card w-full p-6 rounded-lg shadow-lg max-w-md lg:max-w-lg">
        <h3 class="logo font-bold text-2xl text-center">HARMEX</h3>
        <h3 class="font-bold text-2xl text-center mb-4">
          Восстановление пароля
        </h3>
        <form class="mt-4 space-y-4 lg:mt-5 md:space-y-5 relative" action="#">
          <div>
            <label for="email" class="block mb-2 text-sm font-medium"
              >Ваш номер телефона</label
            >
            <label
              class="input input-bordered flex items-center justify-between p-0 pl-4"
            >
              <input
                id="email"
                v-model="formData.email"
                name="email"
                :class="{
                  'input-error': v$.email.$error,
                }"
                class="min-w-10"
                v-maska
                data-maska="+7 (###) ###-##-##"
                placeholder="+7 (___) ___-__-__"
              />
              <button
                v-if="!isCodeSent"
                class="btn btn-ghost shadow-none hover:shadow-none"
                @click.prevent="sendConfirmCode"
              >
                Подтвердить
              </button>
            </label>
            <div
              v-for="error of v$.email.$errors"
              :key="error.$uid"
              class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
            >
              <div class="error-msg">
                {{ error.$message }}
              </div>
            </div>
            <div class="text-xs text-gray-500">
              Нажмите подтвердить для получения звонка
            </div>
            <label
              for="email"
              class="block mb-2 ml-1 my-1 text-sm font-medium mt-5"
            >
              Введите код верификации
            </label>
            <label class="input input-bordered w-full flex justify-end">
              <input
                ref="confirmationCodeInput"
                :disabled="isNumberConfirmed || !isCodeSent"
                id="verificationCode"
                v-model="formData.verificationCode"
                type="text"
                class="w-full"
                name="verificationCode"
                required="true"
                @keydown.enter="confirmCode"
              />
              <button
                :disabled="!isCodeSent || isNumberConfirmed "
                class="flex items-center"
                @click.prevent="confirmCode"
              >
                Подтвердить
              </button>
              
            </label>
            <div class="text-xs text-gray-500">
              Примите звонок и введите озвученные цифры. Не поступил звонок?
              Повторите запрос на звонок.
            </div>
          </div>
          <div>
            <label for="password" class="block mb-2 text-sm font-medium"
              >Установите безопасный пароль
            </label>

            <label class="input input-bordered w-full flex justify-end">
              <input
                id="password"
                v-model="formData.password"
                :type="passwordInputType"
                name="password"
                class="w-full"
                :class="{
                  'input-error': v$.password.$error,
                }"
                placeholder="••••••••"
                :disabled="!isNumberConfirmed"
              />
              <button
                :disabled="!isNumberConfirmed"
                type="button"
                class="hover:text-primary w-1/12 join-item rounded-r-lg"
                @click="togglePassword"
              >
                <Icon
                  v-if="passwordInputType !== 'password'"
                  size="25"
                  name="mdi:hide-outline"
                />
                <Icon v-else size="25" name="mdi:show-outline" />
              </button>
              <button
                :disabled="!isNumberConfirmed"
                type="button"
                class="hover:text-primary w-1/12 join-item rounded-r-lg"
                @click="generatePassword"
              >
                <Icon size="25" name="fe:random" />
              </button>
            </label>
            <div
              v-for="error of v$.password.$errors"
              :key="error.$uid"
              class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
            >
              <div class="error-msg">
                {{ error.$message }}
              </div>
            </div>
          </div>
          <div class="pb-4">
            <label for="confirm-password" class="block mb-2 text-sm font-medium"
              >Подтвердите пароль</label
            >

            <label class="input input-bordered w-full flex justify-end">
              <input
                id="confirm-password"
                v-model="formData.confirmPassword"
                :type="passwordConfirmInputType"
                class="w-full"
                :class="{
                  'input-error': v$.confirmPassword.$error,
                }"
                name="confirm-password"
                placeholder="••••••••"
                :disabled="!isNumberConfirmed"
              />
              <button
                :disabled="!isNumberConfirmed"
                type="button"
                class="hover:text-primary w-1/12 join-item rounded-r-lg"
                @click="toggleConfirmPassword"
              >
                <Icon
                  v-if="passwordConfirmInputType !== 'password'"
                  size="25"
                  name="mdi:hide-outline"
                />
                <Icon v-else size="25" name="mdi:show-outline" />
              </button>
            </label>
            <div
              v-if="v$.confirmPassword.$errors"
              class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
            >
              <div class="error-msg">
                {{ v$.confirmPassword?.$errors[0]?.$message }}
              </div>
            </div>
          </div>
          <div class="text-xs -mt-2 text-gray-500">
            Нужна помощь? Служба заботы рядом. Напишите нам в чат.
          </div>
          <button
            type="submit"
            class="btn btn-primary block w-full"
            @click.prevent="submitForm"
            :disabled="!isNumberConfirmed"
          >
            Сменить пароль
          </button>
          <p class="mt-3 mb-1">
            Вспомнили пароль?
            <NuxtLinkLocale to="/auth" class="text-primary underline">
              Войти
            </NuxtLinkLocale>
          </p>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
