<script lang="ts" setup>
definePageMeta({ layout: 'app', middleware: 'auth' })

const { user } = useUserSession()

const items: Array<{
  title: string
  icon: string
  path: string
  value?: boolean
}> = [
  {
    title: 'Финансы',
    icon: 'solar:wallet-money-outline',
    path: '/paymenthistory',
    value: true,
  },
  {
    title: 'Партнерка',
    icon: 'solar:users-group-rounded-outline',
    path: '/partner',
    value: false,
  },
  {
    title: 'Пополнение ',
    icon: 'solar:alarm-outline',
    path: '/balance',
    value: false,
  },
  {
    title: 'Заказы',
    icon: 'solar:bag-4-outline',
    path: '/orders',
    value: false,
  },
  {
    title: 'Вывод',
    icon: 'solar:plain-outline',
    path: '/withdraw',
    value: false,
  },
  {
    title: 'Команда',
    icon: 'solar:heart-outline',
    path: '/team',
    value: false,
  },
]

const userFavourites = ref([]) as any

const quickAccessModal = ref(false)
const accesses = ref([]) as any
const quickAccesses = ref({}) as any
const accessesLoading = ref(true)
const { notify } = useNotification()

async function getAccesses() {
  accessesLoading.value = true
  const response = await useFetch('/api/user/accesses', {
    method: 'GET',
    watch: false,
  })
    .catch((err) => {
      notify({
        type: 'error',
        title: 'Не получить доступы',
        text: err.data.message || err.message,
      })
      accessesLoading.value = false
    })
    .finally(() => {
      accessesLoading.value = false
    })
  if (response) {
    accesses.value = response.data.value?.acesses
    quickAccesses.value = response.data.value?.quickAccesses
      .map((path: string) => items.find(item => item.path === path))
      .filter(Boolean)
  }
}

if (user.value) {
  getAccesses()
}
else {
  quickAccesses.value = items
  accessesLoading.value = false
}

async function getFavourites() {
  // loading.value = true
  const response: any = await useFetch('/api/user/favourites', {
    method: 'GET',
    watch: false,
  }).catch((err) => {
    notify({
      type: 'error',
      title: 'Не получить доступы',
      text: err.data.message || err.message,
    })
    // loading.value = false
  })

  if (response) {
    userFavourites.value = response.data.value.favourites

    if (userFavourites && userFavourites.value && userFavourites.value.length === 0) {
      userFavourites.value = response.data.value.services
        .map((item: any) => ({ path: `/catalog/${item.slug}`, title: item.name, image: item.mainImage, disabled: item.disabled }))
        .filter((item: any) => !item.disabled)
    }
  }

  // loading.value = false
}
getFavourites()

</script>

<template>
  <div class="mx-0 sm:mx-20 px-4 sm:px-16">
    <section class="mx-5 mt-10 block gap-8 sm:flex">
        <MenuFavourites
          title="Избранное"
          to-all="/favourites"
          :items="userFavourites"
        />
    </section>

  </div>
</template>

<style scoped></style>
