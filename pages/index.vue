<script lang="ts" setup>
definePageMeta({ layout: 'app' })

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
const channels = ref<any>([
  {
    uuid: '1',
    title: 'Выкупы',
    image: '/img/favourites/3.png',
  },
  {
    uuid: '2',
    title: 'Доставки',
    image: '/img/favourites/3.png',
  },
  {
    uuid: '3',
    title: 'Отзывы',
    image: '/img/favourites/3.png',
  },
  {
    uuid: '4',
    title: 'Лайки на товар',
    image: '/img/favourites/3.png',
  },
  {
    uuid: '5',
    title: 'Лайки на бренд',
    image: '/img/favourites/3.png',
  },
  {
    uuid: '6',
    title: 'Лайки на отзывы',
    image: '/img/favourites/3.png',
  },
  {
    uuid: '7',
    title: 'Лайки на комментарии',
    image: '/img/favourites/3.png',
  },
  {
    uuid: '8',
    title: 'Корзина',
    image: '/img/favourites/3.png',
  },
])

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
      <MenuButtonsLine />
    </section>
    <div class="-ml-40 mt-3 h-[1px] w-[200%] bg-[#0c8ce9]"></div>
    <section class="mx-5 mt-10">
      <MenuBigCarousel />
    </section>
    <section class="mx-5 mt-10">
      <MenuPopularCarousel />
    </section>
    <div class="-ml-40 mt-7 h-[1px] w-[200%] bg-[#0c8ce9]"></div>
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
    <div class="mt-20 flex-col gap-5 text-center text-lg">&nbsp;</div>
  </div>
</template>

<style scoped></style>
