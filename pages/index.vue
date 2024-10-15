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
const favourites = ref<any>([
  {
    uuid: '1',
    title: 'Продвижение аккаунтов',
    image: '/img/favourites/1.png',
    uuid: '1',
    title: 'Продвижение аккаунтов',
    image: '/img/favourites/1.png',
  },
  {
    uuid: '2',
    title: 'Продвижение аккаунтов',
    image: '/img/favourites/2.png',
    uuid: '2',
    title: 'Продвижение аккаунтов',
    image: '/img/favourites/2.png',
  },
  {
    uuid: '3',
    title: 'Продвижение Телеграм',
    image: '/img/favourites/3.png',
    uuid: '3',
    title: 'Продвижение Телеграм',
    image: '/img/favourites/3.png',
  },
  {
    uuid: '4',
    title: 'Продвижение аккаунтов',
    image: '/img/favourites/4.png',
    uuid: '4',
    title: 'Продвижение аккаунтов',
    image: '/img/favourites/4.png',
  },
  {
    uuid: '5',
    title: 'Аудитория',
    image: '/img/favourites/5.png',
    uuid: '5',
    title: 'Аудитория',
    image: '/img/favourites/5.png',
  },
  {
    uuid: '6',
    title: 'Продвижение аккаунтов',
    image: '/img/favourites/6.png',
    uuid: '6',
    title: 'Продвижение аккаунтов',
    image: '/img/favourites/6.png',
  },
  {
    uuid: '7',
    title: 'Услуги',
    image: '/img/favourites/7.png',
    uuid: '7',
    title: 'Услуги',
    image: '/img/favourites/7.png',
  },
  {
    uuid: '8',
    title: 'Продвижение аккаунтов',
    image: '/img/favourites/8.png',
    uuid: '8',
    title: 'Продвижение аккаунтов',
    image: '/img/favourites/8.png',
  },
  {
    uuid: '9',
    title: 'Продвижение бизнеса',
    image: '/img/favourites/9.png',
    uuid: '9',
    title: 'Продвижение бизнеса',
    image: '/img/favourites/9.png',
  },
  {
    uuid: '10',
    title: 'Продвижение блогеров',
    image: '/img/favourites/10.png',
    uuid: '10',
    title: 'Продвижение блогеров',
    image: '/img/favourites/10.png',
  },
])
])
const channels = ref<any>([
  {
    uuid: '1',
    title: 'Выкупы',
    image: '/img/favourites/3.png',
    uuid: '1',
    title: 'Выкупы',
    image: '/img/favourites/3.png',
  },
  {
    uuid: '2',
    title: 'Доставки',
    image: '/img/favourites/3.png',
    uuid: '2',
    title: 'Доставки',
    image: '/img/favourites/3.png',
  },
  {
    uuid: '3',
    title: 'Отзывы',
    image: '/img/favourites/3.png',
    uuid: '3',
    title: 'Отзывы',
    image: '/img/favourites/3.png',
  },
  {
    uuid: '4',
    title: 'Лайки на товар',
    image: '/img/favourites/3.png',
    uuid: '4',
    title: 'Лайки на товар',
    image: '/img/favourites/3.png',
  },
  {
    uuid: '5',
    title: 'Лайки на бренд',
    image: '/img/favourites/3.png',
    uuid: '5',
    title: 'Лайки на бренд',
    image: '/img/favourites/3.png',
  },
  {
    uuid: '6',
    title: 'Лайки на отзывы',
    image: '/img/favourites/3.png',
    uuid: '6',
    title: 'Лайки на отзывы',
    image: '/img/favourites/3.png',
  },
  {
    uuid: '7',
    title: 'Лайки на комментарии',
    image: '/img/favourites/3.png',
    uuid: '7',
    title: 'Лайки на комментарии',
    image: '/img/favourites/3.png',
  },
  {
    uuid: '8',
    title: 'Корзина',
    image: '/img/favourites/3.png',
    uuid: '8',
    title: 'Корзина',
    image: '/img/favourites/3.png',
  },
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
    quickAccesses.value = items.filter(item =>
      response.data.value?.quickAccesses.includes(item.path),
    )
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
  const response: any = await useFetch('/api/user/favourites', {
    method: 'GET',
    watch: false,
  })
  if (response) {
    if (
      response.data.value.favourites &&
      response.data.value.favourites.length > 0
    ) {
      favourites.value = favourites.value.filter((item: any) =>
        response.data.value.favourites.includes(item.uuid)
      )
    }

    if (
      response.data.value.services &&
      response.data.value.services.length > 0
    ) {
      channels.value = channels.value.filter((item: any) =>
        response.data.value.services.includes(item.uuid)
      )
    }
  }
}
getFavourites()
</script>

<template>
  <div class="mx-0 sm:mx-20">
    <section class="mt-4 flex sm:block">
      <div v-if="accessesLoading" class="hero">
        <span class="loading loading-dots loading-lg text-primary" />
      </div>
      <MenuButtonsLine v-else :quick-accesses="quickAccesses" @edit-click="quickAccessModal = true" />
    </section>
    <div class="w-[200%] h-[1px] -ml-40 mt-3 bg-[#0c8ce9]" />
    <section class="mt-10 mx-5">
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
          :toAll="'/favourites'"
          :items="favourites"
        />
      </div>
      <div class="w-full sm:w-1/2">
        <MenuFavourites title="Услуги" :toAll="'/services'" :items="channels" />
      </div>
    </section>
    <div class="flex-col gap-5 text-center mt-20 text-lg">
      &nbsp;
    </div>
    <MenuQuickAccessModal
      :accesses="accesses" :quick-accesses="quickAccesses" :show="quickAccessModal"
      @save="saveAccesses" @close="quickAccessModal = false"
    />
  </div>
</template>

<style scoped></style>
