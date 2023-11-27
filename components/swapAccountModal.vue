<script setup lang="ts">
const store = useMainStore()
const { status } = useAuth()

const accounts = ref<any[]>([])
onKeyStroke('Escape', (e) => {
  e.preventDefault()
  store.swapAccountModal = false
})
function close() {
  store.swapAccountModal = false
}

async function getToken() {
  const tokenCookie = useCookie('accountsSessionToken', {
    httpOnly: true,
  })

  const { data }: any = await useFetch('/api/token/getAccountsToken', {
    method: 'GET',
  })

  if (data.value) {
    // console.log(data.value)

    tokenCookie.value = data.value.token
    accounts.value = data.value.accounts
  }
}
if (status.value === 'authenticated') {
  getToken()
}

async function check() {
  const { data }: any = await useFetch('/api/token/get', {
    method: 'GET',
  })

  if (data.value) {
    await useFetch('/api/token/checkToken', {
      method: 'GET',
      headers: {
        Authorization: `${data.value.token}`,
      },
    })
  }
}
</script>

<template>
  <input id="swapAccountModal" type="checkbox" class="modal-toggle" />
  <div
    :class="{
      'modal-open': store.swapAccountModal,
    }"
    class="modal"
  >
    <div class="modal-box w-11/12 max-w-4xl">
      <label
        for="swapAccountModal"
        class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
        @click="close"
        >✕</label
      >
        <div class="collapse bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title text-xl font-medium text-center">
            Добавить аккаунт
          </div>
          <div class="collapse-content">
            <p>hello</p>
          </div>
        </div>
        <div v-if="accounts.length > 0" v-for="account in accounts">
          {{ account }}
        </div>
      <div class="modal-action">
      </div>
    </div>

    <label
      class="modal-backdrop cursor-pointer"
      for="swapAccountModal"
      @click="close"
      >Close</label
    >
  </div>
</template>

<style scoped></style>
