<script lang="ts" setup>
const slides = ref([
  {
    uuid: '1',
    title: 'Услуги',
    type: 'Необходимое',
    text: 'Эти инструменты помогут продвигать свои услуги',
    image: '/img/carousel/1.png',
  },
  {
    uuid: '2',
    title: 'Youtube',
    type: 'Для блогеров',
    text: 'Эти инструменты помогут продвигать свои соц сети',
    image: '/img/carousel/2.png',
  },
  {
    uuid: '3',
    title: 'Youtube',
    type: 'Для блогеров',
    text: 'Эти инструменты помогут продвигать свои соц сети',
    image: '/img/carousel/3.png',
  },
  {
    uuid: '4',
    title: 'Telegram',
    type: 'Для блогеров',
    text: 'Эти инструменты помогут продвигать свои соц сети',
    image: '/img/carousel/4.png',
  },
  {
    uuid: '5',
    title: 'Услуги',
    type: 'Необходимое',
    text: 'Эти инструменты помогут продвигать свои услуги',
    image: '/img/carousel/1.png',
  },
  {
    uuid: '6',
    title: 'Youtube',
    type: 'Для блогеров',
    text: 'Эти инструменты помогут продвигать свои соц сети',
    image: '/img/carousel/2.png',
  },
  {
    uuid: '7',
    title: 'Youtube',
    type: 'Для блогеров',
    text: 'Эти инструменты помогут продвигать свои соц сети',
    image: '/img/carousel/3.png',
  },
  {
    uuid: '8',
    title: 'Telegram',
    type: 'Для блогеров',
    text: 'Эти инструменты помогут продвигать свои соц сети',
    image: '/img/carousel/4.png',
  },
])
const carousel: any = ref(null)

function handleCarouselMove(isNext: any) {
  const slideWidth = carousel.value.firstElementChild.clientWidth * 1.3

  if (isNext) {
    carousel.value.scrollLeft += slideWidth
  }
  else {
    carousel.value.scrollLeft -= slideWidth
  }
}
</script>

<template>
  <div class="font-semibold text-[26px] mb-3 flex justify-between">
    <span> Популярное </span>
    <NuxtLink
      to="/catalog"
      class="btn btn-outline border-[#f95ca4] text-[#f95ca4] rounded-xl btn-sm text-[16px] pr-6 hover:bg-white font-medium hover:text-[#f95ca4] hover:border-[#f95ca4] hover:shadow-xl active:bg-[#f95ca4] active:text-white"
    >
      <Icon name="majesticons:menu-line" width="25px" height="25px" />Все
    </NuxtLink>
  </div>
  <div>
    <div class="relative top-[80px]">
      <button
        class="carousel-arrow carousel-arrow--prev"
        @click="handleCarouselMove(false)"
      >
        <Icon name="iconamoon:arrow-left-2-light" color="#8c8c8c" />
      </button>

      <button
        class="carousel-arrow carousel-arrow--next"
        @click="handleCarouselMove(true)"
      >
        <Icon name="iconamoon:arrow-right-2-light" color="#8c8c8c" />
      </button>
    </div>

    <div
      ref="carousel"
      class="carousel-container rounded-2xl relative"
      dir="ltr"
    >
      <div
        v-for="slide in slides"
        :key="slide.uuid"
        class="carousel-slide bg-[#f5f7ff] rounded-2xl"
      >
        <div
          class="max-w-sm w-full rounded-lg overflow-hidden flex items-center justify-center"
        >
          <div class="p-4 flex items-center">
            <div>
              <h2 class="text-[14px] text-[#6B6B6B] font-medium">
                {{ slide.type }}
              </h2>
              <h3 class="text-[17px] text-black font-semibold">
                {{ slide.title }}
              </h3>
              <p class="text-[#6B6B6B] mt-2 text-[12px]">
                {{ slide.text }}
              </p>
            </div>
            <NuxtImg
              class="w-[95px] h-[95px] rounded-full object-cover"
              :src="slide.image"
              alt="Image"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  margin: 0;
  position: relative;
}

.carousel-container {
  overflow-x: scroll; /* Оставляем прокрутку активной */
  -ms-overflow-style: none; /* Для IE и Edge */
  scrollbar-width: none; /* Для Firefox */
  height: 160px;
}

.carousel-container::-webkit-scrollbar {
  display: none; /* Скрываем скроллбар в Chrome и Safari */
}

main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding-bottom: 64px;
}

.carousel-arrow {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  z-index: 2;
  font-size: 4rem;
}

.carousel-arrow:hover,
.carousel-arrow:focus {
  opacity: 1;
}

.carousel-arrow--prev {
  left: -55px;
}

.carousel-arrow--next {
  right: -55px;
}

.carousel-container {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  width: 100%;
}

/* .carousel-container:active {
  cursor: grabbing;
} */

.carousel-slide {
  flex: 0 0 257px;
  margin: 0 40px 0 0;
  aspect-ratio: auto;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  scroll-snap-align: center;
}

@media (min-width: 601px) and (max-width: 1200px) {
  .carousel-slide {
    flex: 1 0 50%;
  }
}

@media (max-width: 600px) {
  .carousel-slide {
    flex: 1 0 90%;
  }
}
</style>
