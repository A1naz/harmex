<script lang="ts" setup>
import { notify } from '@kyvg/vue3-notification'

definePageMeta({ layout: 'app', middleware: 'auth'  })

const loading = ref(true)
const router = useRouter()
const editMode = ref(false)
const modalShow = ref(false)
const currentItem = ref({}) as any
const userServices = ref([]) as any

const services = ref<any>([
  {
    uuid: "1",
    title: "Выкупы",
    image: "/img/favourites/3.png",
  },
  {
    uuid: "2",
    title: "Доставки",
    image: "/img/favourites/3.png",
  },
  {
    uuid: "3",
    title: "Отзывы",
    image: "/img/favourites/3.png",
  },
  {
    uuid: "4",
    title: "Лайки на товар",
    image: "/img/favourites/3.png",
  },
  {
    uuid: "5",
    title: "Лайки на бренд",
    image: "/img/favourites/3.png",
  },
  {
    uuid: "6",
    title: "Лайки на отзывы",
    image: "/img/favourites/3.png",
  },
  {
    uuid: "7",
    title: "Лайки на комментарии",
    image: "/img/favourites/3.png",
  },
  {
    uuid: "8",
    title: "Корзина",
    image: "/img/favourites/3.png",
  },
]);

function changeMode() {
  editMode.value = !editMode.value
}

async function getServices() {
  loading.value = true
  const response:any = await useFetch('/api/user/favourites', {
    method: 'GET',
    watch: false,
  })
    .catch((err) => {
      notify({
        type: 'error',
        title: 'Не получить доступы',
        text: err.data.message || err.message,
      })
    })
    .finally(() => {
      loading.value = false
    })
  if (response) {
    userServices.value = response.data.value.services
  }
}

getServices()

async function setServices(uuid: string) {
  loading.value = true
  if (userServices.value.includes(uuid)) {
    userServices.value = userServices.value.filter(
      (item: string) => item !== uuid
    )
  } else {
    userServices.value.push(uuid)
  }
  const response = await useFetch('/api/user/setServices', {
    method: 'POST',
    body: {
      services: userServices,
    },
    watch: false,
  })
    .catch((err) => {
      notify({
        type: 'error',
        title: 'Не удалось получить избранное',
        text: err.data.message || err.message,
      })
    })
    .finally(() => {
      loading.value = false
    })
  if (response) {
   await getServices()
  }
}
</script>

<template>
  <div class="mx-0 sm:mx-20">
    <section class="mt-4 flex sm:block">
      <MenuButtonsLine />
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
          <h1 class="text-[22px] font-[600]">Услуги</h1>
          <button
            @click="changeMode"
            class="flex items-center justify-start text-[12px] text-[#909090] hover:text-[#1b38ca]"
          >
            {{ editMode ? 'Сохранить' : 'Изменить' }}
          </button>
        </div>
        <ServicesDraggedCards
          :services="services"
          :userServices="userServices"
          :editMode="editMode"
          :loading="loading"
          @delete=";[currentItem, modalShow] = [$event, true]"
          @update:services="services = $event"
          @set="setServices($event.uuid)"
        />
      </div>
    </section>
  </div>
  <ServicesModal
    :show="modalShow"
    :item="currentItem"
    @close="modalShow = false"
    @delete="
      services = services.filter(
        (item: any) => item.uuid !== currentItem.uuid
      )
    "
  />
</template>

<style scoped></style>
