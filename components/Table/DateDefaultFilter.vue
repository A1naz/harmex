<script setup lang="ts">
import { DateFilterRanges } from '~/data/types';

interface Props {
    rangesConfig?: DateFilterRanges[]
}
const initRange = -1
const currentRange = ref(initRange)

const props = withDefaults(defineProps<Props>(), {
    rangesConfig: ()=> [
        { header: 'Все время', value: initRange },
        { header: 'Сегодня', value: 1 },
        { header: '3 дня', value: 3 },
        { header: '7 дней', value: 7 },
        { header: 'Месяц', value: 30 },
    ]
})

const emit = defineEmits(['rangeUpd'])

function datePrepare(daysAgo: number) {
    if(daysAgo == -1) return {}

    const to = new Date()
    to.setUTCHours(23,59,59,999)

    const from = new Date()
    from.setUTCHours(0,0,0,0);

    if (daysAgo > 1) {
        if(daysAgo == 30) {
            from.setDate(1)
        } else {
            from.setDate(from.getDate() - daysAgo)
        }
    }
    const dateRange = {
        dateRange: { 
            from: from.toISOString(), 
            to: to.toISOString()
    }}
    return dateRange
}

function changeRange(filter: DateFilterRanges){
    dropdownOpened.value = false;
    currentRange.value = filter.value
    const dateRange = datePrepare(filter.value)
    emit('rangeUpd', dateRange)
}

const dropdownOpened = ref<boolean>(false);

const statusText = computed(() => {
  return props.rangesConfig.find((filter: DateFilterRanges) => filter.value == currentRange.value)?.header
})

const handleBodyClick = (event: MouseEvent) => {

  const dropdown = document.querySelector('.dropdown');
  if (dropdown && !dropdown.contains(event.target as Node)) {
    dropdownOpened.value = false;
  }
};


onMounted(() => {
  document.body.addEventListener('click', handleBodyClick);
});


onUnmounted(() => {
  document.body.removeEventListener('click', handleBodyClick);
});

</script>

<template>
    <div class="flex flex-row flex-wrap gap-1 content-center">
        <!-- <CustomDrop
            :statusText="statusText || ''"
            :rangesConfig="rangesConfig"
            :currentRange="currentRange"
            :changeRange="changeRange"
            :class="'bg-base-300'"
        /> -->
        <div class="dropdown group relative" @click="dropdownOpened = !dropdownOpened" @click.stop>
            <div
                class=" font-normal normal-case btn-primary bg-opacity-20 border-none text-base-content btn btn-sm w-[94px] lg:w-[120px] flex items-center justify-between px-2 flex-nowrap"
              >
                <span>{{ statusText }}</span>
                <Icon v-if="dropdownOpened" name="formkit:up" size="18" />
                <Icon v-else name="formkit:down" size="18" />
            </div>
            <ul class="absolute shadow-md z-[1] bg-base-100 p-1 rounded-lg mt-1 max-w-[200px]"
            v-if="dropdownOpened"
            >
                <li>
                    <Button             
                        v-for="filter in rangesConfig"
                        :class="[
                            'btn btn-ghost btn-sm normal-case font-normal w-full my-0.5 hover:bg-primary hover:bg-opacity-20',
                            { 'bg-primary bg-opacity-20': filter.value == currentRange }
                        ]"
                        @click="changeRange(filter)"
                        >
                        {{ filter.header }}
                    </Button>
                </li>
            </ul>
        </div>
    </div>
</template>
