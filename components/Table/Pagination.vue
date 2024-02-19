<script setup lang="ts">

const props = defineProps({
    pageNums: { type: Number, required: true },
    limitList: { type: Array as PropType<number[]>, required: true },
    currentPage: { type: Number, required: true },
    currentLimit: { type: Number, required: true },
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
    if (props.pageNums !== 1 && n !== props.currentPage) {
        emit('changePage', n)
    }
}

</script>

<template>
    <div class="flex flex-row flex-wrap justify-between content-center gap-3 ">

        <div 
            class="flex flex-row gap-1 py-1 px-1 bg-primary bg-opacity-20 rounded-lg align-center justify-center max-h-[32px] my-auto"
        >
            <!-- <div class="flex flex-row">
                <div class="self-center text-sm mr-1">Страница</div>
            </div> -->
            <!-- <Button 
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
                {{ n +' '+ pageNums+' ' + currentPage }}
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
            </Button> -->
            
            <Icon @click="changePage(currentPage - 1)" v-if="currentPage > 1" name="formkit:left" class="mr-1 rounded-full bg-primary bg-opacity-20 my-auto cursor-pointer hover:bg-opacity-50" size="22" />
            <Icon v-else name="formkit:left" class="ml-1 rounded-full bg-base-300 my-auto" size="22" />
                <input type="number" class="bg-primary rounded-full bg-opacity-20 font-medium text-center block max-w-[35px] max-h-[35px] my-auto" placeholder="" :value="currentPage" @keydown.enter="updateCurrentPage">
            <Icon @click="changePage(currentPage + 1)" v-if="currentPage < pageNums" name="formkit:right" class="mr-1 rounded-full bg-primary bg-opacity-20 my-auto cursor-pointer hover:bg-opacity-50" size="22" />
            <Icon v-else name="formkit:right" class="ml-1 rounded-full bg-base-300 my-auto" size="22" />    
        </div>

        <div class="flex flex-row gap-1">
            <!-- <div class="flex flex-row">
                <div class="self-center text-sm mr-1">Показывать по</div>
            </div> -->
            <Button 
                v-for="l in limitList" 
                :class="[
                    'btn btn-sm rounded-xl',
                    { 'btn-primary border-none bg-opacity-20 text-base-content': l == currentLimit }
                    ]"
                @click="emit('changeLimit', l)"
                >
                {{ l }}
            </Button>
        </div>

    </div>
</template>
