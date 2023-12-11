<script setup lang="ts">
import { InfoType } from '#imports';

interface InfoContent {
    [key: string]: {
        title: string,
        text: string,
        ytSrc: string
    }
}

const storeMain = useMainStore()
const route = useRoute()

defineProps({
  state: { type: Boolean, required: true }
})

const emit = defineEmits(['close'])
function closeModal(){ emit('close') }

const infoContent: InfoContent = {
    buyouts: {
        title: 'Выкупы',
        text: 'Создавайте выкупы легче, проще, быстрее и эффективнее используя простые рекомендации. Просмотрите видео-инструкцию для изучения деталей по созданию выкупов',
        ytSrc: 'https://www.youtube.com/embed/nVlXwCjq5WQ?si=m30sT9rqrj7Uvzhr',
    },
    delivery: {
        title: 'Доставки',
        text: 'Отслеживайте ваши товары и забирайте до 5 дней с момента прибытия на ПВЗ. Просмотрите видео-инструкцию для изучения деталей по заборам товаров',
        ytSrc: 'https://www.youtube.com/embed/nVlXwCjq5WQ?si=m30sT9rqrj7Uvzhr',
    },
    reviews: {
        title: 'Отзывы',
        text: 'Публикуйте отзывы на ваши товары, используя планировщик. Просмотрите видео-инструкцию для изучения деталей по публикации отзывов',
        ytSrc: 'https://www.youtube.com/embed/nVlXwCjq5WQ?si=m30sT9rqrj7Uvzhr',
    },
    paymenthistory: {
        title: 'История платежей',
        text: 'Отслеживайте всю финансовую отчетность вашего кабинета в одном месте. Просмотрите видео-инструкцию для изучения деталей по финансовым операциям',
        ytSrc: 'https://www.youtube.com/embed/nVlXwCjq5WQ?si=m30sT9rqrj7Uvzhr',
    },
}

const content = computed(()=>{
    const key = Object.keys(infoContent).includes(route.name) ? route.name : undefined
    if(key) return infoContent[key as InfoType]
    return { title: '.', text: '.', ytSrc: '.' }
})

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
        {{ content.title }}
      </h1>
      <p>{{ content.text }}</p>

      <iframe  
        :src="content.ytSrc" 
        class="w-full h-[30rem] rounded-lg my-4"  
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
