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

const favourites = ref<any>([])

async function getServices() {
  loading.value = true
  const { data }: any = await useFetch('/api/catalog/get', {
    method: 'GET',
    params: {
      type: 'Маркетплейсы',
    },
  })

  if (data.value) {
    favourites.value = data.value.services.map((favItem: any) => {
      return {
        path: `/catalog/${favItem.slug}`,
        title: favItem.name,
        image: favItem.mainImage,
        items: favItem.items.map((item: any) => {
          return {
            path: `/${favItem.slug}${item.path}`,
            title: item.title,
            image: favItem.mainImage,
          }
        }),
        disabled: favItem.disabled,
      }
    })
  }
  console.log('favourites', favourites.value)

  loading.value = false
}

// getServices()

function changeMode() {
  editMode.value = !editMode.value
  // if (!editMode.value) {
  //   userFavourites.value = favourites.value.filter((fav: any) =>
  //     userFavourites.value.some((userFav: any) => userFav.uuid === fav.uuid),
  //   )
  // }
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
    console.log('userFavsUUIDs', response.data.value.favourites)
    userFavourites.value = response.data.value.favourites
  }
  loading.value = false
}

async function fetchData() {
  await getServices()
  await getFavourites()
}

fetchData()

async function setFavourite(path: string) {
  loading.value = true

  if (!favourites.value.length) {
    console.warn('No items in favourites.')
    loading.value = false
    return
  }

  const foundItem = favourites.value.find((item: any) => item.path === path)

  if (userFavourites.value.some((fav: any) => fav.path === path)) {
    userFavourites.value = userFavourites.value.filter(
      (item: any) => item.path !== path,
    )
  }
  else {
    if (foundItem) {
      userFavourites.value.push(foundItem)
    }
    else {
      console.warn(`Item with path ${path} not found in favourites.`)
    }
  }

  const response = await useFetch('/api/user/setFavourite', {
    method: 'POST',
    body: {
      favourites: userFavourites.value.map((item: any) => item.path),
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
    quickAccesses.value = items.filter(item =>
      response.data.value?.quickAccesses.includes(item.path),
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
}
else {
  quickAccesses.value = items
  accessesLoading.value = false
}

function updateFavourites(uuid: string, items: any) {
  const index = favourites.value.findIndex((item: any) => item.uuid === uuid)
  if (index === -1) {
    return
  }

  const updatedFavourite = { ...favourites.value[index], items }

  favourites.value.splice(index, 1, updatedFavourite)
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

    <div class="-ml-40 mt-3 h-[1px] w-[200%] bg-[#BDC8FC]" />
    <section class="my-5 flex flex-col gap-6">
      <button
        class="flex items-center justify-start text-[14px] hover:text-[#1b38ca]"
        @click="router.back()"
      >
        <Icon name="solar:alt-arrow-left-outline" size="22px" />
        <span>Назад</span>
      </button>
      <div class="flex flex-col gap-6">
        <div class="flex gap-5">
          <h1 class="text-[22px] font-[600]">
            Избранное
          </h1>
          <button
            class="flex items-center justify-start text-[12px] text-[#909090] hover:text-[#1b38ca]"
            @click="changeMode"
          >
            {{ editMode ? 'Сохранить' : 'Изменить' }}
          </button>
        </div>

        <div
          v-for="item in favourites.filter((fav: any) =>
            editMode ? !fav.disabled : userFavourites.some((userFav: any) =>
              fav.items && fav.items.some((favItem: any) => favItem.path === userFav),
            ),
          )"
          v-if="!loading || editMode" :key="item.path"
        >
          {{ item.items }}
          <FavouritesDraggedCards
            :favourites="item.items"
            :user-favourites="userFavourites"
            :edit-mode="editMode"
            :loading="loading"
            @delete=";[currentItem, modalShow] = [$event, true]"
            @update:favourites="updateFavourites(item.uuid, $event)"
            @set="setFavourite($event.path)"
          />
        </div>
        <div v-else-if="loading && !editMode" class="hero">
          <span class="loading loading-spinner loading-lg bg-[#1b38ca]" />
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
        (item: any) => item.uuid !== currentItem.uuid,
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
