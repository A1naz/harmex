<script setup lang="ts">

const props = defineProps({
    pageNums: { type: String, required: true },
    limitList: { type: Array as PropType<number[]>, required: true },
    currentPage: { type: Number, required: true },
    currentSkip: { type: Number, required: true },
    currentLimit: { type: Number, required: true },
    docsCount: { type: Number, required: true },
    currentCount: { type: Number, required: true }
})
const emit = defineEmits(['changePage', 'changeLimit'])
const { width, height } = useWindowSize()

const displayed = computed( ()=>{
    const from = props.currentSkip + 1
    const to = props.currentSkip + props.currentCount
    return `Показано ${from}-${to} из ${props.docsCount}`
})

function changePage(n: number) {
    if (props.pageNums !== '1') {
        emit('changePage', n)
    }
}

</script>

<template>
    <div class="flex flex-row flex-wrap justify-between content-center p-3">

        <div class="m-2 flex flex-row gap-1">
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

        <div class="m-2 flex flex-row gap-1">
            <div class="flex flex-row">
                <div class="self-center text-sm mr-1">Страница</div>
            </div>
            <Button 
                v-for="n in parseInt(pageNums)" 
                :class="[
                    'btn btn-sm rounded-xl',
                    { 'btn-primary': n == currentPage }
                    ]"
                @click="changePage(n)"
                >
                {{ n }}
            </Button>
        </div>

        <div class="m-2 flex flex-row">
            <div class="self-center text-sm">{{ displayed }}</div>
        </div>

    </div>
</template>
