<script lang="ts" setup>
const slides = ref([1, 2, 3, 4, 5, 6, 7, 8])
const carousel: any = ref(null)

function handleCarouselMove(isNext: any) {
  const slideWidth = carousel.value.firstElementChild.clientWidth
  const maxScrollLeft = carousel.value.scrollWidth - carousel.value.clientWidth

  if (isNext) {
    if (carousel.value.scrollLeft + slideWidth >= maxScrollLeft) {
      carousel.value.scrollLeft = 0
    }
    else {
      carousel.value.scrollLeft += slideWidth
    }
  }
  else {
    if (carousel.value.scrollLeft === 0) {
      carousel.value.scrollLeft = maxScrollLeft
    }
    else {
      carousel.value.scrollLeft -= slideWidth
    }
  }
}
</script>

<template>
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
      class="carousel-container rounded-lg relative"
      dir="ltr"
    >
      <div
        v-for="slide in slides"
        :key="slide"
        class="carousel-slide overflow-y-hidden"
      >
        <nuxt-img
          src="/img/AIUpdate.png"
          class="responsive-image"
          height="178px"
        />
      </div>
    </div>
    <!-- <div class="absolute inset-0 bg-black opacity-80 rounded-lg"></div> -->
    <span
      class="absolute left-[180px] top-[300px] transform -translate-y-1/2 text-white font-medium text-[16px]"
    >Обновление</span>
    <span
      class="absolute left-[180px] top-[325px] transform -translate-y-1/2 text-white font-semibold text-[26px]"
    >Посмотрите обновление по работе с ИИ продвижения</span>
  </div>
</template>

<style scoped>
.responsive-image {
  height: 168px;
  object-fit: cover;
  width: 100%;
}

body {
  margin: 0;
  position: relative;
}

.carousel-container {
  overflow-x: scroll; /* Оставляем прокрутку активной */
  -ms-overflow-style: none; /* Для IE и Edge */
  scrollbar-width: none; /* Для Firefox */
  height: 148px;
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
  width: 64px;
  height: 64px;
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
  flex: 0 0 100%;
  aspect-ratio: auto;
  height: 148px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  scroll-snap-align: center;
  overflow-y: hidden;
}

@media (max-width: 600px) {
  .carousel-slide {
    flex: 1 0 90%;
  }
}
</style>
