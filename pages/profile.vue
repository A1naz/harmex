<script lang="ts" setup>
definePageMeta({ middleware: ['auth'], title: 'Профиль', layout: 'app' })
const { loggedIn, user, session, fetch, clear } = useUserSession()
const router = useRouter()

async function logout() {
  await clear()
  router.push('/')
}
</script>

<template>
  <div class="py-6">
    <h1 class="title mb-2">Профиль</h1>
    <div>
      {{ user }}
    </div>
    <button @click="logout" class="btn btn-primary">Выйти</button>
  </div>
</template>
