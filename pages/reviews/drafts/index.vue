<script setup lang="ts">

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Черновики отзывов',
})

const params = ref({})
const drafts = ref<IReviewDraft>([])

const getData = async () => { 
    const res = await $fetch('/api/review/drafts', {
        method: 'GET',
        params: params
    })
    if(res && res.length > 0){
        drafts.value = res
    }
}
onMounted( ()=> getData() )


</script>

<template>
    <div class="page-header">
      <div class="flex flex-col items-start gap-2 mt-4">
        <NuxtLink to="/reviews" class="btn btn-ghost btn-sm "> 
            {{ `< назад в отзывы` }} 
        </NuxtLink>
        <h1 class="text-2xl font-bold">Черновики отзывов</h1>
      </div>
    </div>

    <div>
        <div>+ Новый черновик</div>

        <div v-for="draft in drafts"> {{ draft }}</div>

    </div>
</template>
