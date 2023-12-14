<script setup lang="ts">

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Черновики отзывов',
})



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

        'drafts'

    </div>
</template>
