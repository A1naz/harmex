<script setup lang="ts">

const props = defineProps({
    pageNums: { type: String, required: true },
    currentPage: { type: Number, required: true },
    limitList: { type: Array as PropType<number[]>, required: true },
    currentLimit: { type: Number, required: true },
    displayed: { type: String, required: true }
})
const emit = defineEmits(['changePage', 'changeLimit'])
const { width, height } = useWindowSize()

</script>

<template>
    <div class="flex flex-row justify-between content-center p-3">

        <div class="flex flex-row gap-1">
            <div class="flex flex-row">
                <div class="self-center text-sm mr-1">Показывать по</div>
            </div>
            <Button 
                v-for="l in limitList" 
                :class="[
                    'btn btn-sm rounded-xl',
                    { 'btn-primary': l == currentLimit }
                    ]"
                @click="emit('changeLimit', l)"
                >
                {{ l }}
            </Button>
        </div>

        <div class="flex flex-row gap-1 -ml-20">
            <div class="flex flex-row">
                <div class="self-center text-sm mr-1">Страница</div>
            </div>
            <Button 
                v-for="n in parseInt(pageNums)" 
                :class="[
                    'btn btn-sm rounded-xl',
                    { 'btn-primary': n == currentPage }
                    ]"
                @click="$emit('changePage', n)"
                >
                {{ n }}
            </Button>
        </div>

        <div class="flex flex-row">
            <div class="self-center text-sm">{{ displayed }}</div>
        </div>

    </div>
</template>
