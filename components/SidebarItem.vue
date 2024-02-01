<script lang="ts" setup>
const props = defineProps<{
  title: string
  icon: string
  href: string
}>()
const route = useRoute()

const currentPath = ref(useRoute().path)

watchEffect(() => {
  currentPath.value = route.path
})
const active = computed(() => {
  return currentPath.value.includes(props.href)
})
</script>

<template>
  <li>
    <NuxtLink
      :to="props.href" class="mx-4 rounded-lg"
    >
      <IconCSS
        :color="active ? 'white' : 'black'"
        :name="icon" size="24"
      /><span
        :class="{
          'opacity-100': !active,
        }" class=""
      >{{ title }}</span>
    </NuxtLink>
  </li>
</template>

<style scoped>
.router-link-active {
  @apply text-primary bg-opacity-90 active:bg-transparent active:text-primary focus:bg-transparent focus:text-primary hover:bg-primary hover:text-primary
}
</style>
