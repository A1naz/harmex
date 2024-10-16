<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'

const props = defineProps({
  placeholder: {
    type: String,
    required: true,
  },
  listData: {
    type: Array,
    required: true,
  },
  currentData: {
    type: Array,
    required: true,
  },

  fieldToDisplay: {
    type: String,
    required: true,
  },
  fieldToCheck: {
    type: String,
    required: true,
  },
  listDataLoading: {
    type: Boolean,
  },
  currentDataLoading: {
    type: Boolean,
  },
  search: {
    type: Boolean,
    default: true,
  },
})
const emit = defineEmits(['closeModal', 'setFormData', 'search'])

const searchInput = useDebounceFn(search, 1000)
const store = usePersistedStore()
const listData = toRef(props, 'listData')
const searchQuery = ref('')
const uniqueClass = ref<string>('')
const activeDropdown = ref(store.activeDropdown)
const isDropdownOpen = ref<boolean>(false)
const loading = ref(false)

const dataToDisplay = computed(() => {
  return props.currentData.map((item: any) => item[props.fieldToDisplay])
})

const dataToCheck = computed(() => {
  return props.currentData.map((item: any) => item[props.fieldToCheck])
})

const dropdownOpened = computed(() => {
  return store.activeDropdown === uniqueClass.value
})

function toggleDropdown() {
  if (store.activeDropdown !== uniqueClass.value) {
    store.activeDropdown = uniqueClass.value
  }

  if (isDropdownOpen.value) {
    isDropdownOpen.value = false
  }
  else {
    isDropdownOpen.value = true
  }
}

function closeDropdown() {
  isDropdownOpen.value = false
}

function setFormData(fieldData: any) {
  closeDropdown()
  emit('setFormData', fieldData)
}

function handleBodyClick(event: MouseEvent) {
  const dropdown = document.querySelector(`.${uniqueClass.value}`)

  if (dropdown && !dropdown.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  uniqueClass.value = `dropdown-${uuidv4()}`
  document.body.addEventListener('click', handleBodyClick)
})

onUnmounted(() => {
  document.body.removeEventListener('click', handleBodyClick)
})

function search() {
  emit('search', searchQuery)
}

watch(dropdownOpened, (newValue) => {
  if (newValue) {
    isDropdownOpen.value = true
  }
  else {
    isDropdownOpen.value = false
  }
})
</script>

<template>
  <div class="flex flex-col custom-multi-select w-full">
    <div class="join w-full">
      <input
        v-model="dataToDisplay" :placeholder="props.placeholder" type="text"
        class="join-item input input-bordered border-r-0 rounded-lg w-full cursor-pointer" readonly
        @click.stop="toggleDropdown"
      >
      <button
        v-if="currentDataLoading"
        class="join-item btn bg-[#F4F4F4] dark:bg-[#181920] border-none hover:bg-[#F4F4F4] hover:dark:bg-[#181920] hover:text-primary"
        :style="{ 'pointer-events': 'none' }"
      >
        <span class="join-item loading loading-spinner loading-sm text-primary flex items-center" />
      </button>

      <button
        v-else class="join-item btn border border-[#c3c3c3] border-l-0 hover:bg-transparent bg-transparent hover:text-primary"
        @click.stop="toggleDropdown"
      >
        <Icon v-if="!isDropdownOpen" name="ep:arrow-down" size="24" />
        <Icon v-else name="ep:arrow-up" size="24" />
      </button>
    </div>
    <div
      v-if="isDropdownOpen" class="join drop-shadow-sm z-10 " :class="[uniqueClass]" style="position: relative"
      @click.stop
    >
      <div
        class="join-item flex flex-col justify-end bg-base-100 rounded-md drop-shadow-sm w-full mt-[3px]"
        style="position: absolute; z-index: 9999; top: 100%; right: 0"
      >
        <div v-if="props.search" class="relative z-10">
          <span class="absolute inset-y-0 right-3 flex items-center pl-2 text-[#909090] cursor-pointer">
            <Icon name="gg:search" size="22" />
          </span>
          <input
            v-model="searchQuery" class="input border border-[#1b38ca] w-full bg-transparent text-gray-500 text-xs"
            placeholder="Поиск" @input="searchInput()"
          >
        </div>
        <div v-if="listData && !listDataLoading" class="flex flex-col max-h-[150px] overflow-y-auto scrollbar-custom">
          <div v-for="(item, index) in listData" class="flex flex-col">
            <button
              class="btn btn-sm btn-ghost flex h-12 justify-start text-left font-normal text-sm btn-primary w-full mt-1"
              :class="{
                'btn-ghost-hover': item[props.fieldToCheck] === dataToCheck[0],
              }" @click="setFormData(item)"
            >
              <div class="text-left">
                {{ item[props.fieldToDisplay] }}
              </div>
            </button>
          </div>
          <div v-if="listData.length !== 0" ref="target" class="flex justify-center items-center h-4" />
        </div>
        {{}}
        <div v-if="listDataLoading" class="flex justify-center gap-1 py-3">
          <span>Загрузка</span>
          <span class="loading loading-spinner loading-xs p-2" />
        </div>
        <div v-else-if="listData && listData.length === 0" class="flex flex-col justify-center items-center py-3">
          Ничего нет
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-ghost-hover {
  --tw-border-opacity: 0;
  background-color: hsl(var(--bc) / var(--tw-bg-opacity));
  --tw-bg-opacity: 0.2;
}

.scrollbar-custom {
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.scrollbar-custom::-webkit-scrollbar {
  width: 5px;
  border-radius: 10px;
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 10px;
}
</style>
