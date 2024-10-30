<script lang="ts" setup>
import { notify } from '@kyvg/vue3-notification'

definePageMeta({ layout: 'app' })

const { user } = useUserSession()

const loading = ref(true)
const router = useRouter()
const editMode = ref(false)
const modalShow = ref(false)
const currentItem = ref({}) as any
const userFavourites = ref([]) as any

const favourites = ref<any>([])
const favouritesPaths = ref([])

const accessesLoading = ref(true)
const quickAccessModal = ref(false)
const accesses = ref([]) as any
const quickAccesses = ref({}) as any
const loadingSetFavourite = ref(false)
const currentMp = ref('')

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
  }).catch((err) => {
    notify({
      type: 'error',
      title: 'Не получить доступы',
      text: err.data.message || err.message,
    })
    loading.value = false
  })

  if (response) {
    const userFavsUUIDs = response.data.value.favourites
    favouritesPaths.value = userFavsUUIDs

    userFavourites.value = favourites.value
      .map((fav: any) => {
        const filteredItems = fav.items.filter((favItem: any) =>
          userFavsUUIDs.includes(favItem.path),
        )

        if (filteredItems.length > 0) {
          filteredItems.sort((a: any, b: any) => {
            const indexA = userFavsUUIDs.indexOf(a.path)
            const indexB = userFavsUUIDs.indexOf(b.path)
            return indexA - indexB
          })

          return { ...fav, items: filteredItems }
        }
      })
      .filter(Boolean)
  }

  loading.value = false
}

async function fetchData() {
  await Promise.all([getServices(), getFavourites()])
}

async function setFavourite(fav: any) {
  if (fav.path.includes('catalog'))
    currentMp.value = fav.path.replace('/catalog/', '')

  loadingSetFavourite.value = true

  const allPaths = favouritesPaths.value
  if (allPaths.includes(fav.path)) {
    allPaths.splice(allPaths.indexOf(fav.path), 1)
  }
  else {
    allPaths.push(fav.path)
  }
  const response = await useFetch('/api/user/setFavourite', {
    method: 'POST',
    body: {
      favourites: allPaths,
    },
    watch: false,
  }).catch((err) => {
    notify({
      type: 'error',
      title: 'Не удалось обновить избранное',
      text: err.data.message || err.message,
    })
    loadingSetFavourite.value = false
    currentMp.value = ''
  })

  if (response) {
    await getFavourites()
  }
  loadingSetFavourite.value = false
  currentMp.value = ''
}

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

if (user.value) {
  getAccesses()
}
else {
  quickAccesses.value = items
  accessesLoading.value = false
}

function updateFavourites(path: string, items: any) {
  const index = favourites.value.findIndex((item: any) => item.path === path)
  if (index === -1) {
    return
  }

  const updatedFavourite = { ...favourites.value[index], items }

  favourites.value.splice(index, 1, updatedFavourite)
}

fetchData()
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
          v-for="item in editMode ? favourites.filter((fav: any) => !fav.disabled) : userFavourites"
          v-if="!loading || editMode" :key="item.path"
          class="flex gap-[1.5rem]"
        >
          <div
            v-if="editMode || !editMode && favouritesPaths.includes(item.path)"
            class="relative flex h-[164px] w-[147px] flex-col gap-1 rounded-[5px] border border-[#EDEDED] bg-white p-3 text-[14px]"
            :class="{ 'cursor-grab': editMode }"
          >
            <div class="relative mt-[5px] flex justify-center">
              <NuxtImg
                :src="item.image"
                width="105px"
                height="84px"
                class="w-full rounded-[5px]"
              />
              <div v-if="editMode" class="absolute -right-2 -top-2.5 flex gap-1.5">
                <button
                  class="flex h-6 w-6 items-center justify-center rounded-full border"
                  :class="{
                    'border-white bg-[#1b38ca] text-white': favouritesPaths.includes(item.path),
                    'border-[#1b38ca] bg-white text-[#1b38ca]': !favouritesPaths.includes(item.path),
                    'loading loading-spinner w-full bg-[#1b38ca] text-[#1b38ca] ': loadingSetFavourite && item.path === `/catalog/${currentMp}`,
                  }"
                  @click="setFavourite(item)"
                >
                  <Icon name="ri:pushpin-line" size="16px" />
                </button>
              </div>
            </div>
            <div class="ml-[5px] text-sm font-medium">
              {{ item.title }}
            </div>
          </div>
          <FavouritesDraggedCards
            :favourites="item.items"
            :user-favourites="editMode ? userFavourites : userFavourites.find((fav: any) => fav.path === item.path).items || []"
            :edit-mode="editMode"
            :loading="loadingSetFavourite"
            @delete=";[currentItem, modalShow] = [$event, true]"
            @update:favourites="updateFavourites(item.path, $event)"
            @set="setFavourite($event)"
          />
        </div>
        <div v-else-if="loading && !editMode" class="hero">
          <span class="loading loading-spinner loading-lg bg-[#1b38ca]" />
        </div>
        <div v-if="userFavourites.length === 0 && !editMode" class="hero">
          <span class="">Сохраните услуги для их отображения</span>
        </div>
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
    </section>
  </div>
</template>

<style scoped>

</style>
