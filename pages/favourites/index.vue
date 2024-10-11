<script lang="ts" setup>
import { ref } from 'vue'

definePageMeta({ auth: false, layout: 'app' })

const selectedType = ref('Маркетплейсы')
const socialNetworks = ref([])
const loading = ref(true)
const router = useRouter()

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

const dragItem = ref(null)
const editMode = ref(false)

async function changeMode() {
  editMode.value = !editMode.value
}

function dragStart(event: DragEvent, item: any) {
  if (!editMode.value) return
  dragItem.value = item
  event.dataTransfer?.setData('text', item.uuid)
}

function dragOver(event: DragEvent) {
  if (!editMode.value) return
  event.preventDefault()
}

function drop(event: DragEvent, targetItem: any) {
  if (!editMode.value) return
  event.preventDefault()
  const draggedItemUuid = event.dataTransfer?.getData('text')

  const draggedIndex = favourites.value.findIndex(
    (item: any) => item.uuid === draggedItemUuid
  )
  const targetIndex = favourites.value.findIndex(
    (item: any) => item.uuid === targetItem.uuid
  )

  const temp = favourites.value[draggedIndex]
  favourites.value[draggedIndex] = favourites.value[targetIndex]
  favourites.value[targetIndex] = temp

  dragItem.value = null
}

const modalShow = ref(false)
const currentItem = ref({}) as any
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
          <h1 class="text-[22px] font-[600]">Избранное</h1>
          <button
            @click="changeMode"
            class="flex items-center justify-start text-[12px] text-[#909090] hover:text-[#1b38ca]"
          >
            {{ editMode ? 'Сохранить' : 'Изменить' }}
          </button>
        </div>
        <div class="flex flex-wrap justify-start gap-6">
          <div
            v-for="item in favourites"
            :key="item.uuid"
            :draggable="editMode"
            @dragstart="dragStart($event, item)"
            @dragover="dragOver($event)"
            @drop="drop($event, item)"
            :class="editMode ? 'cursor-grab' : ''"
            class="flex h-[164px] w-[147px] flex-col gap-1 rounded-[5px] border border-[#EDEDED] bg-white p-3 text-[14px]"
          >
            <div class="relative mt-[5px] flex justify-center">
              <NuxtImg
                :src="item.image"
                width="105px"
                height="84px"
                class="w-full rounded-[5px]"
              />
              <div
                v-if="editMode"
                class="absolute -right-2 -top-2.5 flex gap-1.5"
              >
                <button
                  @click=";[modalShow, currentItem] = [true, item]"
                  class="flex h-6 w-6 items-center justify-center rounded-full border border-[#1b38ca] bg-white text-[#1b38ca]"
                >
                  <Icon name="ic:baseline-minus" size="14px" />
                </button>
                <button
                  class="flex h-6 w-6 items-center justify-center rounded-full border border-[#1b38ca] bg-white text-[#1b38ca]"
                >
                  <Icon name="ri:pushpin-line" size="14px" />
                </button>
              </div>
            </div>
            <div class="ml-[5px] text-sm font-medium">{{ item.title }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
  <FavouritesModal
    :show="modalShow"
    :item="currentItem"
    @close="modalShow = false"
    @delete="favourites = favourites.filter((item: any) => item.uuid !== currentItem.uuid)"
  />
</template>

<style scoped></style>
