<script lang="ts" setup>
import { notify } from '@kyvg/vue3-notification'

definePageMeta({ layout: 'app', middleware: 'auth' })

const { user } = useUserSession()

const loading = ref(true)
const router = useRouter()
const editMode = ref(false)
const modalShow = ref(false)
const currentItem = ref({}) as any
const userFavourites = ref([]) as any

const favourites = ref<any>([
  {
    uuid: '1',
    title: 'Продвижение аккаунтов',
    image: '/img/favourites/1.png',
  },
  {
    uuid: '2',
    title: 'Продвижение аккаунтов',
    image: '/img/favourites/2.png',
  },
  {
    uuid: '3',
    title: 'Продвижение Телеграм',
    image: '/img/favourites/3.png',
  },
  {
    uuid: '4',
    title: 'Продвижение аккаунтов',
    image: '/img/favourites/4.png',
  },
  {
    uuid: '5',
    title: 'Аудитория',
    image: '/img/favourites/5.png',
  },
  {
    uuid: '6',
    title: 'Продвижение аккаунтов',
    image: '/img/favourites/6.png',
  },
  {
    uuid: '7',
    title: 'Услуги',
    image: '/img/favourites/7.png',
  },
  {
    uuid: '8',
    title: 'Продвижение аккаунтов',
    image: '/img/favourites/8.png',
  },
  {
    uuid: '9',
    title: 'Продвижение бизнеса',
    image: '/img/favourites/9.png',
  },
  {
    uuid: '10',
    title: 'Продвижение блогеров',
    image: '/img/favourites/10.png',
  },
])

function changeMode() {
  editMode.value = !editMode.value
  if (!editMode.value) {
    userFavourites.value = favourites.value.filter((fav: any) =>
      userFavourites.value.some((userFav: any) => userFav.uuid === fav.uuid)
    )
  }
}

async function getFavourites() {
  loading.value = true
  const response: any = await useFetch('/api/user/favourites', {
    method: 'GET',
    watch: false,
  })
    .catch((err) => {
      notify({
        type: 'error',
        title: 'Не получить доступы',
        text: err.data.message || err.message,
      })
      loading.value = false
    })
  if (response) {
    const userFavsUUIDs = response.data.value.favourites
    userFavourites.value = favourites.value.filter((item: any) =>
      userFavsUUIDs.includes(item.uuid)
    )
  }
  loading.value = false
}

getFavourites()

async function setFavourite(uuid: string) {
  loading.value = true
  if (userFavourites.value.some((fav: any) => fav.uuid === uuid)) {
    userFavourites.value = userFavourites.value.filter(
      (item: any) => item.uuid !== uuid
    )
  } else {
    userFavourites.value.push(
      favourites.value.find((item: any) => item.uuid === uuid)
    )
  }
  const response = await useFetch('/api/user/setFavourite', {
    method: 'POST',
    body: {
      favourites: userFavourites.value.map((item: any) => item.uuid),
    },
    watch: false,
  })
    .catch((err) => {
      notify({
        type: 'error',
        title: 'Не удалось получить избранное',
        text: err.data.message || err.message,
      })
      loading.value = false
    })

  if (response) {
    await getFavourites()
  }
  loading.value = false
}

const accessesLoading = ref(true)
const quickAccessModal = ref(false)
const accesses = ref([]) as any
const quickAccesses = ref({}) as any

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
    quickAccesses.value = items.filter((item) =>
      response.data.value?.quickAccesses.includes(item.path)
    )
  }
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

if (user.value) {
  getAccesses()
} else {
  quickAccesses.value = items
  accessesLoading.value = false
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
        :quick-accesses="quickAccesses"
        @edit-click="quickAccessModal = true"
      />
    </section>

    <div class="-ml-40 mt-3 h-[1px] w-[200%] bg-[#BDC8FC]"></div>
    <section class="my-5 flex flex-col gap-6">
      <button
        @click="router.back()"
        class="flex items-center justify-start text-[14px] hover:text-[#1b38ca]"
      >
        <Icon name="solar:alt-arrow-left-outline" size="22px" />
        <span>Назад</span>
      </button>
      <div class="flex flex-col gap-6">
        <div class="flex gap-5">
          <h1 class="text-[22px] font-[600]">Избранное</h1>
          <button
            @click="changeMode"
            class="flex items-center justify-start text-[12px] text-[#909090] hover:text-[#1b38ca]"
          >
            {{ editMode ? 'Сохранить' : 'Изменить' }}
          </button>
        </div>
        <FavouritesDraggedCards
          v-if="!loading || editMode"
          :favourites="favourites"
          :userFavourites="userFavourites"
          :editMode="editMode"
          :loading="loading"
          @delete=";[currentItem, modalShow] = [$event, true]"
          @update:favourites="favourites = $event"
          @set="setFavourite($event.uuid)"
        />
        <div v-else-if="loading && !editMode" class="hero">
          <span class="loading loading-spinner loading-lg bg-[#1b38ca]"></span>
        </div>
        <div v-if="userFavourites.length === 0 && !editMode" class="hero">
          <span class="">Сохраните услуги для их отображения</span>
        </div>
      </div>
    </section>
  </div>
  <FavouritesModal
    :show="modalShow"
    :item="currentItem"
    @close="modalShow = false"
    @delete="
      favourites = favourites.filter(
        (item: any) => item.uuid !== currentItem.uuid
      )
    "
  />
  <MenuQuickAccessModal
    :accesses="accesses"
    :quick-accesses="quickAccesses"
    :show="quickAccessModal"
    @save="saveAccesses"
    @close="quickAccessModal = false"
  />
</template>

<style scoped></style>
