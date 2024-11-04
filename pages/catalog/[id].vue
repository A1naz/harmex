<script lang="ts" setup>
import { notify } from '@kyvg/vue3-notification'

definePageMeta({ auth: false, layout: 'app' })

const { user } = useUserSession()
const route: any = useRoute()
const id = route.params.id
const loading = ref(true)
const item = ref({} as any)
const userInfo = ref([]) as any

function getUser() {
  const { data }: any = useFetch('/api/user/getCurrentUser', {
    method: 'GET',
    watch: false,
  })

  if (data.value) {
    userInfo.value = data.value
  }
}

if (user.value && user.value.fizFace === false) {
  getUser()
}
getUser()

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

const isVisible = ref(false)
const tooltipPosition = ref({ top: 0, left: 0 })
const tooltipButton = ref<HTMLElement | null>(null)
const hideTooltipTimeout = ref<NodeJS.Timer | null>(null)

function showTooltip() {
  isVisible.value = true
  if (tooltipButton.value) {
    const buttonRect = tooltipButton.value.getBoundingClientRect()

    nextTick(() => {
      const tooltipElement = document.querySelector('.tooltip-class')
      const tooltipWidth = tooltipElement ? tooltipElement.offsetWidth : 0

      tooltipPosition.value = {
        top: buttonRect.bottom + 10,
        left: buttonRect.left + (buttonRect.width / 2) - (tooltipWidth / 2) - 2,
      }
    })
  }
}

function hideTooltip() {
  if (hideTooltipTimeout.value) {
    clearTimeout(hideTooltipTimeout.value)
  }

  hideTooltipTimeout.value = setTimeout(() => {
    isVisible.value = false
  }, 500)
}

function onMouseEnterTooltip() {
  if (hideTooltipTimeout.value) {
    clearTimeout(hideTooltipTimeout.value)
  }
}

function onMouseLeaveTooltip() {
  hideTooltip()
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
  notify({
    title: 'Успешно',
    text: 'Скопировано в буфер обмена',
  })
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
      <div v-if="user && !user.fizFace" class="flex gap-3">
        <div class="p-3 bg-white rounded-lg shadow-xs flex gap-2 items-center text-center ">
          <div class="org-name font-semibold text-gray-800">
            {{ 'Максимус'.toUpperCase() }}
          </div>

          <button
            ref="tooltipButton"
            class="p-1 flex flex-col justify-center items-center text-center bg-gray-10 hover:bg-gray-200 rounded-lg text-[#909090]"
            @mouseenter="showTooltip"
            @mouseleave="hideTooltip"
          >
            <Icon name="si:info-fill" size="24" />
          </button>

          <Transition>
            <div
              v-if="isVisible"
              :style="{ top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px` }"
              class="tooltip-class fixed bg-white shadow-lg text-black text-sm px-[15px] py-[12.5px] rounded-lg z-50 whitespace-nowrap flex flex-col justify-start text-left"
              @mouseenter="onMouseEnterTooltip"

              @mouseleave="onMouseLeaveTooltip"
            >
              <div
                class="absolute top-[-9px] left-1/2 w-[20px] h-[30px] rounded-[3px] rotate-45 bg-white transform -translate-x-1/2"
              />
              <p class="relative z-10 ">
                {{ 'ИП Пупкин Андрей Иванович' }}
              </p>
              <p>ИНН: 12341232 </p>
              <p>На Harmex с 29.11.2024</p>
            </div>
          </Transition>

          <button class="p-1 flex flex-col justify-center items-center text-center bg-gray-10 hover:bg-gray-200 rounded-lg text-[#909090]" @click="copyToClipboard(`https://app.harmex.ru/register?uuid=${user.uuid}`)">
            <Icon name="ph:share-fat-fill" size="24" />
          </button>
        </div>
      </div>
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
