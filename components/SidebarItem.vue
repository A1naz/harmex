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

const mpStore = useMPStore()
const mpHref = computed(() => {
  if (
    props.href == '/productlikes' ||
    props.href == '/buyouts' ||
    props.href == '/questions' ||
    props.href == '/cart' ||
    props.href == '/reports'
  ) {
    return mpStore.selectedMP
      ? props.href + '/' + mpStore.selectedMP
      : props.href + '/wildberries'
  } else if (props.href == '/reviews') {
    return mpStore.selectedMP
      ? props.href + '/' + mpStore.selectedMP + '?status=available'
      : props.href + '/wildberries?status=available'
  } else if (props.href == '/delivery') {
    return mpStore.selectedMP
      ? props.href + '/' + mpStore.selectedMP + '?status=all'
      : props.href + '/wildberries?status=all'
  } else {
    return props.href
  }
})
</script>

<template>
  <li v-if="props.href != '/autoanswer'">
    <NuxtLink :to="mpHref" class="mx-4 rounded-lg">
      <IconCSS
        :color="active ? 'white' : 'black'"
        :name="icon"
        size="24"
      />
      <!-- <img v-if="!active" :src="`/icons/figma/navbar/${icon}.svg`" />
      <img v-else :src="`/icons/figma/navbar/${icon}Active.svg`" /> -->
      <span
        :class="{
          'opacity-100': !active,
        }"
        class=""
        >{{ title }}</span
      >
    </NuxtLink>

  </li>
</template>

<style scoped>
.router-link-active {
  @apply text-primary bg-opacity-90 active:bg-transparent active:text-primary focus:bg-transparent focus:text-primary hover:bg-primary hover:text-primary;
}
</style>
