<script setup lang="ts">

const storeMain = useMainStore()

const props = defineProps({
  state: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String,
    requited: true,
  },
})

const infoContent = {
    buyouts: {
        title: 'Выкупы',
        text: 'Создавайте выкупы легче, проще, быстрее и эффективнее используя простые рекомендации. Просмотрите видео-инструкцию для изучения деталей по созданию выкупов',
    },
    deliveries: {
        title: 'Доставки',
        text: 'Отслеживайте ваши товары и забирайте до 5 дней с момента прибытия на ПВЗ. Просмотрите видео-инструкцию для изучения деталей по заборам товаров',
    },
    reviews: {
        title: 'Отзывы',
        text: 'Публикуйте отзывы на ваши товары, используя планировщик. Просмотрите видео-инструкцию для изучения деталей по публикации отзывов',
    },
    paymenthistory: {
        title: 'История платежей',
        text: 'Отслеживайте всю финансовую отчетность вашего кабинета в одном месте. Просмотрите видео-инструкцию для изучения деталей по финансовым операциям',
    },
}

function closeModal(){
    storeMain.infoModal = false
}

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  closeModal()
})
</script>

<template>
  <input id="infoModal" type="checkbox" class="modal-toggle">
  <div
    :class="{
      'modal-open': state,
    }"
    class="modal"
  >
    <div class="modal-box w-11/12 max-w-4xl">
      <label
        for="review-modal" class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
        @click="closeModal"
      >✕</label>
      <h1 class="text-xl font-bold">
        {{ infoContent[storeMain.infoType].title }}
      </h1>
      <p>{{ infoContent[storeMain.infoType].text }}</p>

      <iframe  
        class="w-full h-[30rem] rounded-lg my-4"  
        src="https://www.youtube.com/embed/nVlXwCjq5WQ?si=m30sT9rqrj7Uvzhr" 
        title="YouTube video player" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        allowfullscreen 
        />
    </div>
    <label class="modal-backdrop" for="infoModal" @click="closeModal">Close</label>
  </div>
</template>

<style scoped>

</style>
