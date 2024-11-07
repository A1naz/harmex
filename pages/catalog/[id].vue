<script lang="ts" setup>
import { notify } from '@kyvg/vue3-notification'

definePageMeta({  middleware: 'auth', layout: 'app' })

const { user } = useUserSession()
const route: any = useRoute()
const id = route.params.id
const loading = ref(true)
const item = ref({} as any)
// const userInfo = ref([]) as any

// function getUser() {
//   const { data }: any = useFetch('/api/user/getCurrentUser', {
//     method: 'GET',
//     watch: false,
//   })

//   if (data.value) {
//     userInfo.value = data.value
//   }
// }

// if (user.value && user.value.fizFace === false) {
//   getUser()
// }
// getUser()

// const sellLeaders = ref([] as any)

async function getService() {
  loading.value = true
  const { data }: any = await useFetch('/api/catalog/info', {
    params: {
      slug: id,
    },
  })

  if (data.value) {
    item.value = data.value.service
    loading.value = false
  }
}
// async function getLeaders() {
//   loading.value = true
//   const { data }: any = await useFetch('/api/catalog/sellLeaders', {
//     params: {
//       slug: id,
//     },
//   })

//   if (data.value) {
//     sellLeaders.value = data.value
//     loading.value = false
//   }
// }

getService()

function navigateToCatalog() {
  navigateTo('/catalog')
}

const favourites = ref([]) as any
const loadingFavourites = ref(true)
async function getFavourites() {
  try {
    const response: any = await $fetch('/api/user/favourites', {
      method: 'GET',
    })
    if (response?.favouritesPaths) {
      favourites.value = response.favouritesPaths
    }
  }
  catch (err) {
    notify({
      type: 'error',
      title: 'Ошибка загрузки избранного',
      text: err.message,
    })
  }
  finally {
    loadingFavourites.value = false
  }
}
getFavourites()

async function setFavourites(path: string) {
  if (!user.value) {
    notify({
      type: 'error',
      title: 'Необходима авторизация',
    })
    return
  }
  try {
    loadingFavourites.value = true

    if (favourites.value.includes(path)) {
      favourites.value = favourites.value.filter((item: string) => item !== path)
    }
    else {
      if (favourites.value.length >= 10) {
        favourites.value.shift()
      }
      favourites.value.push(path)
    }

    await $fetch('/api/user/setFavourite', {
      method: 'POST',
      body: {
        favourites: favourites.value,
      },
    })

    notify({
      type: 'success',
      title: 'Избранное обновлено',
    })
  }
  catch (err) {
    notify({
      type: 'error',
      title: 'Ошибка при обновлении избранного',
      text: err.message,
    })
  }
  finally {
    loadingFavourites.value = false
  }
}
</script>

<template>
  <div class="mx-12 mt-7">
    <div class="breadcrumbs text-sm flex justify-between w-full overflow-y-hidden">
      <ul class="font-medium text-[18px] text-[#909090]">
        <li class="cursor-pointer" @click="navigateToCatalog">
          Маркетплейсы
        </li>
        <li class="text-[#212121]">
          {{ id[0].toUpperCase() + id.slice(1) }}
        </li>
      </ul>
    </div>
    <div class="flex flex-wrap overflow-x-auto">
      <div v-if="loading" class="hero mt-20">
        <span class="loading loading-dots loading-lg text-primary" />
      </div>
      <div v-else class="flex flex-wrap gap-x-4">
        <div v-for="(service, index) in item.items" :key="index" class="mt-8">
          <CatalogServiceCard :favourites="favourites" :item="item" :index="index" @set-favourites="setFavourites" />
        </div>
      </div>
    </div>
    <!-- <div class="mt-8 text-[18px] font-semibold">
      Лидеры продаж
    </div> -->
    <!-- <div class="flex flex-wrap overflow-x-auto">
      <div v-if="loading" class="hero mt-20">
        <span class="loading loading-dots loading-lg text-primary" />
      </div>
      <div v-for="(service, index) in item.items" v-else class="flex mt-8">
        <CatalogServiceCard :item="item" :index="index" class="mr-5" />
      </div>
    </div> -->
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
