<script lang="ts" setup>
definePageMeta({ auth: false, layout: "app" });

const favourites = ref<any>([
  {
    uuid: "1",
    title: "Продвижение аккаунтов",
    image: "/img/favourites/1.png",
  },
  {
    uuid: "2",
    title: "Продвижение аккаунтов",
    image: "/img/favourites/2.png",
  },
  {
    uuid: "3",
    title: "Продвижение Телеграм",
    image: "/img/favourites/3.png",
  },
  {
    uuid: "4",
    title: "Продвижение аккаунтов",
    image: "/img/favourites/4.png",
  },
  {
    uuid: "5",
    title: "Аудитория",
    image: "/img/favourites/5.png",
  },
  {
    uuid: "6",
    title: "Продвижение аккаунтов",
    image: "/img/favourites/6.png",
  },
  {
    uuid: "7",
    title: "Услуги",
    image: "/img/favourites/7.png",
  },
  {
    uuid: "8",
    title: "Продвижение аккаунтов",
    image: "/img/favourites/8.png",
  },
  {
    uuid: "9",
    title: "Продвижение бизнеса",
    image: "/img/favourites/9.png",
  },
  {
    uuid: "10",
    title: "Продвижение блогеров",
    image: "/img/favourites/10.png",
  },
]);
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
    title: "Лайки на товар",
    image: "/img/favourites/3.png",
  },
  {
    uuid: "4",
    title: "Лайки на отзыв",
    image: "/img/favourites/3.png",
  },
  {
    uuid: "5",
    title: "Лайки на комментарии",
    image: "/img/favourites/3.png",
  },
  {
    uuid: "6",
    title: "Просмотры",
    image: "/img/favourites/3.png",
  },
  {
    uuid: "7",
    title: "Корзина",
    image: "/img/favourites/3.png",
  }
]);
</script>

<template>
  <div class="sm:mx-20 mx-0">
    <section class="mt-4 flex sm:block">
      <MenuButtonsLine />
    </section>
    <div class="w-[200%] h-[1px] -ml-40 mt-3 bg-[#0c8ce9]"></div>
    <section class="mt-10 mx-5">
      <MenuBigCarousel />
    </section>
    <section class="mt-10 mx-5">
      <MenuPopularCarousel />
    </section>
    <div class="w-[200%] h-[1px] -ml-40 mt-7 bg-[#0c8ce9]"></div>
    <section class="mt-10 mx-5 sm:flex block gap-8">
      <div class="sm:w-1/2 w-full">
        <MenuFavourites title="Избранное" :items="favourites" />
      </div>
      <div class="sm:w-1/2 w-full">
        <MenuFavourites title="Мои каналы" :items="services" />
      </div>
    </section>
    <div class="flex-col gap-5 text-center mt-20 text-lg">&nbsp;</div>
  </div>
</template>

<style scoped></style>
