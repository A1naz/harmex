<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Лайки на товар/бренд',
})

const product_likes = ref([]) as any
</script>

<template>
  <div>
    <ProductLikesAvitoCreateLike
      :show="true"
      @close-modal="navigateTo('/productlikes/avito')"
    />
  </div>
</template>
