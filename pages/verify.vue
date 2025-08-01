<script lang="ts" setup>
const { notify } = useNotification();

const { loggedIn, user, session, fetch, clear } = useUserSession();
// console.log('2fa', user)

// if (!user || !user.value.uuid) {
//   await clear()
// }

definePageMeta({
  title: "Верификация",
  middleware: "auth",
});

const codeInput = ref();
const code = ref("");
const colorMode = useColorMode();

onMounted(() => {
  codeInput.value?.focus();
});

async function logout() {
  await clear();
  navigateTo("/auth");
}
</script>

<template>
  <div class="title hidden w-full justify-center p-2 xl:flex" />
  <div
    class="absolute mt-[12%] flex w-full flex-col justify-center overflow-hidden py-10"
  >
    <div class="flex w-full justify-center">
      <div
        class="card flex w-[450px] flex-col justify-center bg-base-100 shadow-2xl p-2"
      >
        <div class="-mb-2 mt-1 text-center text-xl">Верификация</div>
        <div class="divider mx-2" />
        <div class="-mt-5 text-center text-lg mb-3">
          Для продолжения авторизации пожалуйста верифицируйте ваш профиль в
          телеграм боте
          <a class="link text-primary" href="https://t.me/harmex">Harmex</a>
        </div>
        <div class="flex flex-wrap justify-center gap-3">
          <div class="mb-5 mt-4 flex justify-between gap-28">
            <button class="btn w-32 btn-primary" @click="logout">Выйти</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
