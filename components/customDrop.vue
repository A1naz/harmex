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

defineProps({
  statusText: { type: String, required: true },
  rangesConfig: { type: Array as PropType<RangeConfigItem[]>},
  tabs: { type: Array as PropType<tabs[]>},
  currentRange: { type: Number || String},
  changeRange: Function as PropType<(filter: RangeConfigItem) => void>,
});

const dropdownOpened = ref<boolean>(false);

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
                class="font-medium normal-case btn-primary bg-opacity-20 border-none text-base-content btn btn-sm min-w-[110px] flex items-center justify-between px-2 flex-nowrap"
              >
                <span>{{ statusText }}</span>
                <Icon v-if="dropdownOpened" name="formkit:up" size="18" />
                <Icon v-else name="formkit:down" size="18" />
            </div>
                <ul class="absolute shadow z-[1] bg-base-100 p-1 rounded-lg mt-1"
                v-if="dropdownOpened && rangesConfig"
                >
                    <li >
                        <Button             
                            v-for="filter in rangesConfig"
                            :class="[
                                'btn btn-ghost btn-sm normal-case font-medium w-full my-0.5',
                                { 'btn-active': filter.value == currentRange }
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
                <ul class="absolute shadow z-[100] bg-base-100 p-1 rounded-lg mt-1"
                v-if="dropdownOpened && tabs"
                >
                  <li>
                          <NuxtLink
                                  v-for="filter in tabs"
                                  :to="'/partner' + filter.query"
                                  :external="false"
                                  :class="{
                                  'btn-active': route.query.status === filter.query,
                                  }"
                                  class="btn btn-ghost btn-xs normal-case font-medium w-full"
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
