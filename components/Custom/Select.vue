<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'

interface tabs {
  title: string
  value: string | number
  images?: string
}
interface links {
  title: string
  value?: string | undefined
  slot?: string | undefined
  query?: string | undefined
}

const props = defineProps({
  tabs: {
    type: Array as PropType<Array<tabs>>,
    default: () => [],
  },
  links: { type: Array as PropType<links[]>, default: () => [] },
  class: { type: String },
  dropdownContainerClass: { type: String },
  statusText: { type: String },
})

const emit = defineEmits(['changeText', 'changeValue'])

const reactiveStatusText = toRef(props, 'statusText')

const customClass = props.class || ''

const dropdownOpened = ref<boolean>(false)
const store = usePersistedStore()
const isDropdownOpened = computed(() => {
  return store.activeDropdown === uniqueClass.value
})

function handleBodyClick(event: MouseEvent) {
  const dropdown = document.querySelector(`.${uniqueClass.value}`)

  if (dropdown && !dropdown.contains(event.target as Node))
    dropdownOpened.value = false
}

const statusText = ref<string>(
  props.statusText
    ? props.statusText
    : reactiveStatusText.value
      ? reactiveStatusText.value
      : props.tabs[0]?.title || props.links[0]?.title,
)
watch(
  () => reactiveStatusText.value,
  (newVal) => {
    statusText.value = newVal ?? ''
  },
)

function updateText(filter: string) {
  statusText.value = filter

  emit('changeText', filter)
}

function updateValue(filter: any) {
  statusText.value = filter.title
  emit('changeValue', filter)
}

const tabFound = computed(() => {
  return (
    props.tabs.find(
      tab => tab.title === (reactiveStatusText.value || statusText.value),
    ) || props.tabs[0]
  )
})

function toggleDropdown() {
  if (store.activeDropdown !== uniqueClass.value)
    store.activeDropdown = uniqueClass.value

  if (dropdownOpened.value)
    dropdownOpened.value = false
  else
    dropdownOpened.value = true
}

onMounted(() => {
  uniqueClass.value = `dropdown-${uuidv4()}`
  document.body.addEventListener('click', handleBodyClick)
})

onUnmounted(() => {
  document.body.removeEventListener('click', handleBodyClick)
})

const uniqueClass = ref<string>('')

watch(isDropdownOpened, (newValue) => {
  if (newValue)
    dropdownOpened.value = true
  else
    dropdownOpened.value = false
})

defineExpose({
  updateText,
  updateValue,
})
</script>

<template>
  <div class="group dropdown relative" :class="dropdownContainerClass" @click="toggleDropdown" @click.stop>
    <div
      class="btn btn-md flex flex-nowrap items-center justify-center border border-[#1b38ca] bg-white px-2 text-xs font-normal normal-case text-base-content hover:border-[#1b38ca] hover:bg-white hover:shadow-none"
      :class="customClass"
    >
      <nuxt-img
        v-if="tabs.length > 0 && tabFound && tabFound.images" :src="tabFound ? tabFound.images : ''"
        class="h-6 w-6"
      />
      <span v-else>{{
        reactiveStatusText ? reactiveStatusText : statusText
      }}</span>

      <Icon v-if="dropdownOpened" name="formkit:up" size="12" class="text-[#1b38ca]" />
      <Icon v-else name="formkit:down" size="12" class="text-[#909090]" />
    </div>
    <ul
      v-if="dropdownOpened" :class="uniqueClass"
      class="absolute z-[1] mt-0.5 flex max-h-[300px] w-full flex-col gap-y-0.5 overflow-y-auto overflow-x-hidden rounded-lg bg-base-100 shadow-md"
    >
      <li v-for="filter in tabs" v-if="tabs.length > 0" :key="filter.title">
        <button
          v-if="
            filter.title
              !== (reactiveStatusText ? reactiveStatusText : statusText)
          "
          class="btn btn-ghost btn-xs h-[2rem] w-full items-center justify-center text-left text-xs font-normal normal-case leading-none hover:border hover:border-[#1b38ca] hover:bg-white"
          @click="updateValue(filter)"
        >
          <nuxt-img v-if="filter && filter.images" :src="filter ? filter.images : ''" class="h-6 w-6" />
          <p v-else>
            {{ filter.title }}
          </p>
        </button>
      </li>
      <li v-for="filter in links" @click="updateText(filter.title)">
        <NuxtLink
          :to="(filter.slot ? filter.slot : `/${filter.value}`)
            + (filter.query ? filter.query : '')
          " :external="false"
          class="btn btn-ghost btn-xs h-[2rem] w-full items-center justify-start text-left text-xs font-normal normal-case leading-none hover:bg-primary hover:bg-opacity-20"
        >
          <span>
            {{ filter.title }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped></style>
