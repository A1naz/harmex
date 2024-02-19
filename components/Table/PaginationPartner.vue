<script setup lang="ts">

// const props = defineProps({
//     pageNums: { type: Number, required: true },
//     limitList: { type: Array as PropType<number[]>, required: true },
//     currentPage: { type: Number, required: true },
//     currentLimit: { type: Number, required: true },
// })

const props = defineProps({
    pageNums: { type: Number, required: true },
    currentPage: { type: Number, required: true },
})

const route = useRoute()

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
function updateCurrentPage(event: KeyboardEvent){
  if (event.key === 'Enter') {
    const inputElement = event.target as HTMLInputElement;
    const n:number = +inputElement.value
    if (props.pageNums !== 1 && n !== props.currentPage) {
        emit('changePage', n)
    }}
}
function changePage(n: number) {
    // if (props.pageNums !== 1 && n !== props.currentPage) {
        emit('changePage', n)
        // console.log('changing page')
    // }
}

</script>

<template>
    <div class="flex flex-row flex-wrap justify-between content-center gap-3 ">

        <div 
            class="flex flex-row gap-0.5 py-1 px-1 bg-primary bg-opacity-20 rounded-lg align-center justify-center max-h-[32px] my-auto"
        >   
            <Button 
                :class="{
                    'rounded-full bg-primary bg-opacity-20 my-auto cursor-pointer text-base-content hover:bg-opacity-50': props.pageNums > 1,
                    'rounded-full bg-base-200 text-gray-400 my-auto cursor-default': props.pageNums <= 1
                    }"
                :disabled="props.pageNums <= 1"
                @click="changePage(currentPage - 1)"
            >
                <Icon name="formkit:left" class="" size="22" />
            </Button>
                <input type="number" class="btn btn-xs btn-ghost p-0 py-0 rounded-full font-medium text-center block max-w-[25px] max-h-[35px] my-auto outline-none" placeholder="" :value="currentPage" @keydown.enter="updateCurrentPage">
            <Button 
                :class="{
                    'rounded-full bg-primary bg-opacity-20 my-auto cursor-pointer text-base-content hover:bg-opacity-50': props.pageNums > props.currentPage,
                    'rounded-full bg-base-200 text-gray-400 my-auto cursor-default': props.pageNums <= props.currentPage
                    }"
                :disabled="props.pageNums <= props.currentPage"
                @click="changePage(currentPage + 1)"
            >
                <Icon name="formkit:right" class="" size="22" />
            </Button>    
        </div>

    </div>
</template>
