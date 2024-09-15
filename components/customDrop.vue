<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const route = useRoute()

interface filters {
  [key: string]: string | number;
}
interface RangeConfigItem {
  header: string;
  value: number;
}
interface tabs {
  title: string;
  slot: string;
  query: string;
}
interface Props {
  changeRange: (filter: RangeConfigItem) => void;
}

const props = defineProps({
  statusText: { type: String, required: true },
  rangesConfig: { type: Array as PropType<RangeConfigItem[]>},
  tabs: { type: Array as PropType<tabs[]>},
  currentRange: { type: Number || String},
  changeRange: Function as PropType<(filter: RangeConfigItem) => void>,
  route: {type: String},
  class: { type: String },
});

const dropdownOpened = ref<boolean>(false);
const customClass = props.class || ''

const handleBodyClick = (event: MouseEvent) => {
  // Проверяем, был ли клик вне элемента dropdown
  const dropdown = document.querySelector('.dropdown');
  if (dropdown && !dropdown.contains(event.target as Node)) {
    dropdownOpened.value = false;
  }
};

// Добавляем обработчик события клика при монтировании компонента
onMounted(() => {
  document.body.addEventListener('click', handleBodyClick);
});

// Удаляем обработчик события клика при демонтаже компонента
onUnmounted(() => {
  document.body.removeEventListener('click', handleBodyClick);
});


</script>

<template>
    <div class="dropdown group relative" @click="dropdownOpened = !dropdownOpened" @click.stop>
            <div
                class="font-normal normal-case btn-primary bg-opacity-20 border-none text-base-content btn btn-sm min-w-[110px] flex items-center justify-between px-2 flex-nowrap"
                :class="customClass"
            >
                <span>{{ statusText }}</span>
                <Icon v-if="dropdownOpened" name="formkit:up" size="18" />
                <Icon v-else name="formkit:down" size="18" />
            </div>
                <ul class="absolute shadow-md z-[1] bg-base-100 p-1 rounded-lg mt-1"
                v-if="dropdownOpened && rangesConfig"
                >
                    <li >
                        <Button             
                            v-for="filter in rangesConfig"
                            :class="[
                                'btn btn-ghost btn-sm normal-case font-normal w-full my-0.5 hover:bg-primary hover:bg-opacity-20',
                            { 'bg-primary bg-opacity-20': filter.value == currentRange }
                            ]"
                            @click="{
                                if (changeRange) {
                                    changeRange(filter);
                                }
                            }"
                            >
                            {{ filter.header }}
                        </Button>
                    </li>
                    
                </ul>
                <ul class="absolute shadow-md z-[100] bg-base-100 p-1 rounded-lg mt-1 w-full"
                v-if="dropdownOpened && tabs"
                >
                  <li>
                          <NuxtLink
                                  v-for="filter in tabs"
                                  :to="props.route + filter.query"
                                  :external="false"
                                  :class="{
                                  'bg-primary bg-opacity-20': route.query.status === filter.query,
                                  }"
                                  class="btn btn-ghost btn-xs normal-case font-normal w-full hover:bg-primary hover:bg-opacity-20"
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
