<script setup lang="ts">
import { ITabs } from '~/data/types';

defineProps({
    tabs: { type: Object as PropType<ITabs[]>, required: true },
})
const emit = defineEmits(['changeTab'])
const route = useRoute()
const router = useRouter()

function changeTab(newRoute: string, newSlot: string){
    emit('changeTab', newSlot)
    router.push(newRoute)
}

function isActive(slot: string, query: string): boolean {
    return route.query.tab ? route.query.tab == slot : '' == query
}

</script>
<template>

    <Button
        v-for="tab in tabs"
        v-if="!route.path.startsWith('/partner')"
        :class="{ 'btn-active': isActive(tab.slot, tab.query) }" 
        class="btn btn-sm normal-case btn-primary bg-opacity-20 border-none text-base-content font-medium mx-1 mt-2"
        @click="changeTab(`${route.path}${tab.query}`, tab.slot)"
        >
        {{ tab.title }}
    </Button>

    <div v-for="(tab, index) in tabs" 
        class="mt-2"
        >
        <slot 
            :name="tab.slot" 
            :key="index"
            v-if="isActive(tab.slot, tab.query)"
            >
        </slot>
    </div>

</template>
