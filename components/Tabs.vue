<script setup lang="ts">
import { ITabs } from '~/data/types';

defineProps({
    tabs: { type: Object as PropType<ITabs[]>, required: true },
})
const route = useRoute()
const router = useRouter()

function isActive(slot: string, query: string){
    return route.query.tab ? route.query.tab == slot : '' == query
}

</script>
<template>

    <Button
        v-for="tab in tabs"
        :class="{ 'btn-active': isActive(tab.slot, tab.query) }" 
        class="btn btn-ghost btn-sm normal-case font-medium"
        @click="router.push(`${route.path}${tab.query}`)"
        >
            {{ tab.title }}
    </Button>

    <div v-for="(tab, index) in tabs" 
        class="mt-2"
        >
        <slot :name="tab.slot" :key="index"
            v-if="isActive(tab.slot, tab.query)"
            >
        </slot>
    </div>

</template>
