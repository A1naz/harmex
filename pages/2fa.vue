<script lang="ts" setup>
import { notify } from '@kyvg/vue3-notification'
const { loggedIn, user, session, fetch, clear } = useUserSession()
// console.log('2fa', user)

// if (!user || !user.value.uuid) {
//   await clear()
// }

definePageMeta({
  title: 'Двухфакторная аутентификация',
  auth: true,
})

const codeInput = ref()
const code = ref('')
const colorMode = useColorMode()

onMounted(() => {
  codeInput.value?.focus()
})

async function confirm2fa() {
  if (!code.value) {
    return;
  }

  if (code.value.length < 6) {
    notify({
      title: 'Код должен содержать 6 цифр',
    });
    return;
  }
  await fetch(); 

  try {
    const { data, error } = await useFetch('/api/2fa/login', {
      method: 'POST',
      query: { 
        code: code.value.replaceAll(' ', '') 
      },
    });

    if (error.value) {
      notify({
        title: 'Неверный код двухфакторной аутентификации',
      });
      return; 
    }

    await fetch(); 
    return navigateTo('/', { external: true }); 

  } catch (err) {
    notify({
      title: 'Ошибка при проверке кода 2FA',
    });
  }
}



async function logout() {
  await clear()
  navigateTo('/auth')
}
</script>

<template>
  <div class="title hidden w-full justify-center p-2 xl:flex"></div>
  <div
    class="absolute mt-[12%] flex w-full flex-col justify-center overflow-hidden py-10"
  >
    <div class="flex w-full justify-center">
      <div
        class="card flex w-[400px] flex-col justify-center bg-base-100 shadow-2xl p-2"
      >
      
        <div class="-mb-2 mt-1 text-center text-xl ">
          Двухфакторная аутентификация
        </div>
        <div class="divider mx-2" />
        <div class="-mt-5 text-center text-lg mb-3">
          Введите код с приложения Аутентификатор
        </div>
        <div class="flex flex-wrap justify-center gap-3">
          <input
            @keyup.enter="confirm2fa"
            ref="codeInput"
            placeholder="Введите 6-ти значный код"
            v-maska
            data-maska="### ###"
            class="input input-bordered w-full max-w-xs text-xl"
            v-model="code"
          />
          <div class="mb-5 mt-4 flex justify-between gap-28">
            <button class="btn w-32" @click="logout">Выйти</button>
            <button class="btn btn-primary" @click="confirm2fa">
              Подтвердить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
