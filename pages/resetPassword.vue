<script lang="ts" setup>
import { useVuelidate } from '@vuelidate/core'
import { email, helpers, minLength, required, sameAs } from '@vuelidate/validators'
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  colorMode: 'dark',
  auth: false,
  title: 'Смена пароля',
})
const name = useRuntimeConfig().NAME

const isCodeSent = ref(false)
const confirmationCodeInput = ref<any>(null)
const isNumberConfirmed = ref(false)
const router = useRouter()

const formData = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  verificationCode: '',
})
const alert = reactive({
  show: false,
  message: '',
  type: 'success',
})
const rules = computed(() => {
  return {
    email: {
     
    },
    password: {
      required: helpers.withMessage('Введите пароль', required),
      minLength: helpers.withMessage('Пароль должен быть длиннее 6 символов', minLength(6)),
    },
    confirmPassword: {
      required: helpers.withMessage('Подтвердите пароль', required),
      sameAs: helpers.withMessage('Пароли не совпадают', sameAs(formData.password)),
    },
  }
})

const v$ = useVuelidate(rules, formData)

async function submitForm() {
  v$.value.$validate()
  const { error } = await useFetch('/api/user/changePassword/send', {
    method: 'POST',
    body: formData,
  })
  if (error.value) {
    alert.show = true
    alert.type = 'error'
    alert.message = error.value.message
    useTimeoutFn(() => {
      alert.show = false
    }, 3000)
  }
  else {
    // alert.show = true
    // alert.type = 'success'
    // alert.message = 'Пароль успешно изменен'
    // useTimeoutFn(() => {
    //   alert.show = false
    // }, 3000)
   router.push('/auth?passwordChanged=true')
  }
}

async function sendConfirmCode() {
  if (formData.email.replace(/[\(\)\-\s]/g, '').length < 11) {
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
        phoneNumber: formData.email.replace(/[\(\)\-\s]/g, ''),
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
        phoneNumber: formData.email.replace(/[\(\)\-\s]/g, ''),
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

const passwordInputType = ref('password')
const passwordConfirmInputType = ref('password')

const togglePassword = () => {
  passwordInputType.value = (passwordInputType.value === 'password') ? 'text' : 'password';
}
const toggleConfirmPassword = () => {
  passwordConfirmInputType.value = (passwordConfirmInputType.value === 'password') ? 'text' : 'password';
}
</script>

<template>
  <section>
    <Toast :type="alert.type" :active="alert.show">
      {{ alert.message }}
    </Toast>
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
      <div class="card w-full p-6 rounded-lg shadow-lg  md:mt-0 sm:max-w-md sm:p-8">
        <h2 class="mb-1 text-xl font-bold leading-tight tracking-tight  md:text-2xl ">
          Смена пароля
        </h2>
        <form class="mt-4 space-y-4 lg:mt-5 md:space-y-5 relative" action="#">
          <div >
            <label for="email" class="block mb-2 text-sm font-medium  ">Номер телефона</label>
            <div class="join w-full">
              
              <input
                id="email" v-model="formData.email" name="email"
                class="input join-item input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                :class="{
                  'input-error': v$.email.$error,
                }" 
                v-maska
                data-maska="+7 (###) ###-##-##"
                placeholder="+7 (___) ___-__-__"
              >
              <button
                v-if="!isCodeSent"
                class="btn btn-sm xl:btn-md join-item rounded-r-full"
                @click.prevent="sendConfirmCode"
              >
                Код
              </button>
            </div>
            <div
              v-for="error of v$.email.$errors"
              :key="error.$uid" class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
            >
              <div class="error-msg">
                {{ error.$message }}
              </div>
            </div>
            <label for="email" class="block mb-2 ml-1 my-1 text-sm font-medium mt-5">
              Код верификации с звонка
            </label>
            <div class="join w-full">
              <input
                ref="confirmationCodeInput"
                :disabled="isNumberConfirmed || !isCodeSent"
                id="verificationCode"
                v-model="formData.verificationCode"
                type="number"
                name="verificationCode"
                class="input join-item input-sm xl:input-md input-bordered sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder=""
                required="true"
                @keydown.enter="confirmCode"
              />
              <button
                :disabled="!isCodeSent || isNumberConfirmed"
                class="btn btn-sm xl:btn-md join-item rounded-r-full"
                @click.prevent="confirmCode"
              >
                <IconCSS  size="27" name="mdi:check" />
              </button>
            </div>
          </div>
          <div>
            <label for="password" class="block mb-2 text-sm font-medium  ">Новый пароль</label>
            
            <div class="flex join">
              <input
              id="password" v-model="formData.password" :type="passwordInputType" name="password"
              class="input join-item input-sm xl:input-md sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              :class="{
                'input-error': v$.password.$error,
              }" placeholder="••••••••"
              :disabled="!isNumberConfirmed"
            >
              <button
              :disabled="!isNumberConfirmed"
                type="button" 
                class="hover:text-primary w-1/12 disabled:text-black join-item disabled:bg-[#181920] rounded-r-lg" 
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
            </div>
            <div
              v-for="error of v$.password.$errors"
              :key="error.$uid" class="input-errors text-sm text-error mt-1 flex justify-end absolute r-0 w-full"
            >
              <div class="error-msg">
                {{ error.$message }}
              </div>
            </div>
          </div>
          <div class="pb-4">
            <label for="confirm-password" class="block mb-2 text-sm font-medium  ">Подтвердите пароль</label>
            
            <div class="flex join">
              <input
              id="confirm-password" v-model="formData.confirmPassword"
              :type="passwordConfirmInputType"
              class="input join-item input-sm xl:input-md sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 border-r-none" :class="{
                'input-error': v$.confirmPassword.$error,
              }" name="confirm-password" placeholder="••••••••"
              :disabled="!isNumberConfirmed"
            >
              <button 
                :disabled="!isNumberConfirmed"
                type="button" 
                class="hover:text-primary w-1/12 disabled:text-black join-item disabled:bg-[#181920] rounded-r-lg" 
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
          <button type="submit" class="btn btn-primary block w-full" @click.prevent="submitForm" :disabled="!isNumberConfirmed">
            Сменить пароль
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
