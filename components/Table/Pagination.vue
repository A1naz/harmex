<script setup lang="ts">

const props = defineProps({
    pageNums: { type: Number, required: true },
    limitList: { type: Array as PropType<number[]>, required: true },
    currentPage: { type: Number, required: true },
    currentLimit: { type: Number, required: true },
})
const emit = defineEmits(['changePage', 'changeLimit'])
const { width, height } = useWindowSize()
const range = 2

const renderPages = computed ( (): number[] => {
    const arr = []
    const start = props.currentPage - range > 0 ? props.currentPage - range : 1
    const end = props.currentPage + range < props.pageNums ? props.currentPage + range : props.pageNums
    for(let i = start ; i <= end ; i++){
        arr.push(i)
    }
    return arr
})

function changePage(n: number) {
    if (props.pageNums !== 1 && n !== props.currentPage) {
        emit('changePage', n)
    }
}

</script>

<template>
    <div class="flex flex-row flex-wrap justify-between content-center my-2">

        <div class="m-2 flex flex-row gap-1">
            <div class="flex flex-row">
                <div class="self-center text-sm mr-1">Страница</div>
            </div>
            <Button 
                v-if="currentPage-range > 1"
                :class="[
                    'btn btn-sm rounded-xl',
                ]"
                @click="changePage(1)"
                >
                {{ 1 }}
            </Button>
            <div 
                v-if="currentPage-range > range"
                class="self-end"
                >...</div>
            <Button 
                v-for="n in renderPages" 
                :class="[
                    'btn btn-sm rounded-xl',
                    { 'btn-primary': n == currentPage }
                ]"
                @click="changePage(n)"
                >
                {{ n }}
            </Button>
            <div 
                v-if="currentPage+range < pageNums"
                class="self-end"
                >...</div>
            <Button 
                v-if="currentPage+range < pageNums"
                :class="[
                    'btn btn-sm rounded-xl',
                ]"
                @click="changePage(pageNums)"
                >
                {{ pageNums }}
            </Button>
        </div>

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

    </div>
</template>
