<script lang="ts" setup>
definePageMeta({ layout: 'app' })

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
const favourites = ref<any>([])
const userFavourites = ref([]) as any
const channels = ref<any>([

])

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

async function saveAccesses(availableAccesses: any, quick: any) {
  if (!user.value) {
    notify({
      type: 'error',
      title: 'Необходима авторизация',
    })
    return
  }

  const response = await useFetch('/api/user/saveAccesses', {
    method: 'POST',
    body: {
      accesses: availableAccesses.map((i: any) => i.path),
      quickAccesses: quick.map((i: any) => i.path),
    },
    watch: false,
  }).catch((err) => {
    notify({
      type: 'error',
      title: 'Не получить доступы',
      text: err.data.message || err.message,
    })
  })
  if (response) {
    notify({
      type: 'success',
      title: 'Доступы сохранены',
    })
    quickAccesses.value = quick
    quickAccessModal.value = false
  }
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

    if (userFavourites.value.length === 0) {
      userFavourites.value = response.data.value.services
        .map((item: any) => ({ path: `/catalog/${item.slug}`, title: item.name, image: item.mainImage, disabled: item.disabled }))
        .filter((item: any) => !item.disabled)
    }
  }

  // loading.value = false
}
getFavourites()

function quickAccessShow() {
  if (!user.value) {
    notify({
      type: 'error',
      title: 'Необходима авторизация',
    })
    return
  }
  quickAccessModal.value = true
}
</script>

<template>
  <div class="mx-0 sm:mx-20">
    <section class="mt-4 flex sm:block">
      <div v-if="accessesLoading" class="hero">
        <span class="loading loading-dots loading-lg text-primary" />
      </div>
      <MenuButtonsLine
        v-else
        :items="items"
        :quick-accesses="quickAccesses"
        @edit-click="quickAccessShow"
      />
    </section>
    <div class="-ml-40 mt-3 h-[1px] w-[200%] bg-[#0c8ce9]" />
    <section class="mx-5 mt-10">
      <MenuBigCarousel />
    </section>
    <section class="mx-5 mt-10">
      <MenuPopularCarousel />
    </section>
    <div class="w-[200%] h-[1px] -ml-40 mt-7 bg-[#0c8ce9]" />
    <section class="mx-5 mt-10 block gap-8 sm:flex">
      <div class="w-full sm:w-1/2">
        <MenuFavourites
          title="Избранное"
          to-all="/favourites"
          :items="userFavourites"
        />
      </div>
      <div class="w-full sm:w-1/2">
        <MenuFavourites title="Топ поставщиков" to-all="/services" :items="channels" />
      </div>
    </section>
    <div class="mt-20 flex-col gap-5 text-center text-lg">
&nbsp;
    </div>
    <MenuQuickAccessModal
      :accesses="accesses"
      :quick-accesses="quickAccesses"
      :show="quickAccessModal"
      @save="saveAccesses"
      @close="quickAccessModal = false"
    />
  </div>
</template>

<style scoped></style>
