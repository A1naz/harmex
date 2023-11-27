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
    currentRange.value = filter.value
    const dateRange = datePrepare(filter.value)
    emit('rangeUpd', dateRange)
}

</script>

<template>
    <div class="flex flex-row flex-wrap gap-1 content-center">
        <Button             
            v-for="filter in rangesConfig"
            :class="[
                'btn btn-ghost btn-sm normal-case font-medium',
                { 'btn-active': filter.value == currentRange }
            ]"
            @click="changeRange(filter)"
            >
            {{ filter.header }}
        </Button>
    </div>
</template>
