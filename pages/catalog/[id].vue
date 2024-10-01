<script lang="ts" setup>
const route: any = useRoute()
const id = route.params.id
const name = id[0].toUpperCase() + id.slice(1)

definePageMeta({ auth: false, layout: 'app' })
</script>

<template>
  <div class="mx-12 mt-7">
    <div class="breadcrumbs text-sm">
      <ul class="font-medium text-[20px] text-[#909090]">
        <li @click="navigateTo('/catalog')" class="cursor-pointer">Социальные сети</li>
        <li class="text-[#212121]">{{ name }}</li>
      </ul>
    </div>
  </div>
</template>
