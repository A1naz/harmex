<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const route = useRoute()

interface tabs {
  title: string;
  value: string | number;
}

const props = defineProps({
  rangesConfig: {
    type: Array as PropType<Array<string>>,
    default: () => []
  },
  tabs: {
    type: Array as PropType<Array<tabs>>,
    default: () => []
  },
  category: { 
    type: Boolean as PropType<boolean>,
    default: false
  },
  class: { type: String },
});

const customClass = props.class || ''

const emit = defineEmits(['changeText','changeValue'])

const dropdownOpened = ref<boolean>(false);

const handleBodyClick = (event: MouseEvent) => {

  const dropdown = document.querySelector('.dropdown');
  if (dropdown && !dropdown.contains(event.target as Node)) {
    dropdownOpened.value = false;
  }
};

const statusText = ref<String>(props.category ? 'Выберите категорию' : props.rangesConfig[0] || props.tabs[0]?.title);

function updateText(filter: string){
    statusText.value = filter;
    emit('changeText', filter)
}

function updateValue(filter: any){
    statusText.value = filter.title;
    emit('changeValue', filter)
}

onMounted(() => {
  document.body.addEventListener('click', handleBodyClick);
});

onUnmounted(() => {
  document.body.removeEventListener('click', handleBodyClick);
});


</script>

<template>
    <div class="dropdown group relative" @click="dropdownOpened = !dropdownOpened" @click.stop>
            <div
                class="font-normal text-xs normal-case btn-primary bg-opacity-20 border-none text-base-content btn btn-sm flex items-center justify-between px-2 flex-nowrap"
                :class="customClass"
                >
                <span :class="{ 'text-base': rangesConfig.length > 0}">{{ statusText }}</span>
                <Icon v-if="dropdownOpened" name="formkit:up" size="18" />
                <Icon v-else name="formkit:down" size="18" />
            </div>
            <ul v-if="rangesConfig.length > 0 && dropdownOpened" class="absolute shadow-md z-[1] bg-base-100 p-1 rounded-lg mt-2" >
              <li v-for="filter in rangesConfig" :key="filter">
                <button class="btn btn-ghost btn-sm normal-case font-normal w-full my-0.5 py-0 text-base whitespace-normal leading-none hover:bg-primary hover:bg-opacity-20" @click="updateText(filter)" >
                  {{ filter }}
                </button>
              </li>
            </ul>
            <ul v-if="tabs.length > 0 && dropdownOpened" class="absolute shadow-md z-[1] bg-base-100 p-1 rounded-lg max-w-[200px] mt-2 w-full" >
              <li v-for="filter in tabs" :key="filter.title">
                <button class="btn btn-ghost btn-xs text-xs normal-case font-normal w-full my-0.5 leading-none hover:bg-primary hover:bg-opacity-20" @click="updateValue(filter)" >
                  {{ filter.title }}
                </button>
              </li>
            </ul>
        </div>
</template>

<style scoped></style>
