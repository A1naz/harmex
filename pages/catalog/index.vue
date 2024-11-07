<script lang="ts" setup>
definePageMeta({  middleware: 'auth', layout: 'app' })

const { user } = useUserSession()

const { notify } = useNotification()
const menuItems = ref(['Маркетплейсы', 'Отели'])
const selectedType = ref('Маркетплейсы')
const socialNetworks = ref([])
const loading = ref(true)

async function getServices() {
  loading.value = true
  const { data }: any = await useFetch('/api/catalog/get', {
    method: 'GET',
    params: {
      type: selectedType.value,
    },
  })

  if (data.value) {
    socialNetworks.value = data.value.services
  }
  loading.value = false
}

getServices()
const bouncedGet = useDebounceFn(getServices, 250)
watch(selectedType, () => {
  bouncedGet()
})

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
  catch (err: any) {
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
  catch (err: any) {
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

const voteLoading = ref(false)
async function voteForMp(slug: string) {
  if (!user.value) {
    notify({
      type: 'error',
      title: 'Необходима авторизация',
    })
    return
  }
  voteLoading.value = true
  const response: any = await $fetch('/api/catalog/vote', {
    method: 'POST',
    query: {
      slug,
    },
  })
  if (response.status === 'ok') {
    notify({
      type: 'success',
      title: 'Успешно',
      text: 'Вы успешно проголосовали за добавление маркетплейса',
    })
  }
  else {
    notify({
      type: 'error',
      title: 'Ошибка',
      text: response.message,
    })
  }
  voteLoading.value = false
}
</script>

<template>
  <div class="flex mt-4">
    <div class="left-menu">
      <CatalogLeftMenu v-model:selected-type="selectedType" :items="menuItems" />
    </div>
    <div v-if="loading" class="hero -mt-80 text-[#bdc8fc]">
      <span class="loading loading-dots loading-lg text-primary" />
    </div>
    <div class="px-10">
      <div class="breadcrumbs text-sm ml-3">
        <ul class="font-medium text-[18px] text-[#909090]">
          <li v-if="!loading" class="cursor-pointer">
            Каталог
          </li>
        </ul>
      </div>
      <CatalogContent v-if="!loading" :items="socialNetworks" :favourites="favourites" @vote="voteForMp" @set-favourites="setFavourites" />
    </div>
  </div>
</template>

<style scoped>
.left-menu {
  width: 240px;
}
</style>
