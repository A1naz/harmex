<script setup lang="ts">
import { ITabs } from '~/data/types';

defineProps({
    parentRoute: { type: String, required: true },
    tabs: { type: Object as PropType<ITabs[]>, required: true },
})
const route = useRoute()
const router = useRouter()

</script>
<template>

    <Button
        v-for="tab in tabs"
        :class="{ 'btn-active': route.query.tab ? route.query.tab == tab.slot : '' == tab.query }" 
        class="btn btn-ghost btn-sm normal-case font-medium"
        @click="router.push(`${parentRoute}${tab.query}`)"
        >
            {{ tab.title }}
    </Button>

    <div v-for="{slot, query} in tabs" >
        <slot :name="slot"
            v-if="route.query.tab ? route.query.tab == slot : '' == query"
            >
        </slot>
    </div>

</template>
