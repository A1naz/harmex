<script setup lang="ts">
import { ConfigTable, ItemData, ItemSearch } from '~/data/types';
import { FieldsType } from '~/data/enums';

const props = defineProps({
    endpoint: { type: String, required: true },
    config:  { type: Array as PropType<ConfigTable[]>, required: true },
    
    // data: { type: Array as PropType<any[]>, required: true },
    // count: { type: Number, required: true },
    // currentLimit: { type: Number, required: true },
    // currentSkip: { type: Number, required: true },
    // currentSort: { type: Object, required: true },
    // isLoading: { type: Boolean, required: true },    
})

// const emit = defineEmits(['sort', 'changePage', 'changeLimit'])

const changePage = (numPage: number) => {
    // emit('changePage', numPage)
    updateFilter('skip', numPage)
}

const changeLimit = (limit: number) => {
    // emit('changeLimit', limit)
    updateFilter('limit', limit)
}

// function initListData(){
//     listData.value = {
//         staffactions: {    
//             data: [],
//             count: 0,
//             search: {
//                 skip: 0,
//                 limit: limitInit,
//                 sort: { createdAt: -1 },
//                 filter: {}
//             }
//         },
//     }
// }

const { getData, } = useApi()
const { width, height } = useWindowSize()
const isLoading = ref(false)
const limitList = [20 ,40, 60]
const limitInit = 20


const listData = reactive<ItemData>({
    data: [],
    count: 0,
    search: {
        skip: 0,
        limit: limitInit,
        sort: { createdAt: -1 },
        filter: {}
    }
})

const _fetchData = async () => {
    listData.data = []
    const { search } = listData
    const res = await getData(props.endpoint, {
            skip: search.skip, 
            limit: search.limit,
            sort: JSON.stringify(search.sort),
            filter: JSON.stringify(search.filter)
    })
    if(res && res.status =='ok') {
        listData.data = res.data.list
        listData.count = res.data.count
    }
    isLoading.value = false
}
const _getDataDebounced = useDebounceFn(()=> _fetchData() , 700)

function fetchData(){
    isLoading.value = true
    _getDataDebounced()
}
fetchData()

const pageNum = computed( () => {
    const res = listData.count / listData.search.limit
    return res == 0 ? 1 : Math.ceil(res)
})

const currentPage = computed ( () => {
    return listData.search.skip == 0 ? 1 : listData.search.skip / listData.search.limit + 1
})

const displayed = computed( ()=>{
    const from = listData.count == 0 ? 0 : listData.search.skip + 1
    const to = listData.search.skip + listData.data.length
    return `Показано ${from}-${to} из ${listData.count}`
})

function updateFilter<T extends keyof ItemSearch>(key: T, value: ItemSearch[T]) {
    if(key =='skip') {
        value = listData.search.limit * (value - 1)
    }
    if(key =='limit') {
        listData.search.skip = 0
    }
    if(key == 'sort') value = { [value.sortField]: value.sortOrder }

    if(key == 'filter') {
        listData.search.skip = 0
    }
    listData.search[key] = value
    listData.data = []
    fetchData()
}

</script>

<template>
<div>

    <TablePagination  
        :page-nums="pageNum"
        :limit-list="limitList"
        :current-page="currentPage"
        :current-limit="listData.search.limit"
        @change-limit="changeLimit"
        @change-page="changePage"
        />
    
    <div class="flex flex-row w-full justify-end">
        <div class="self-center text-sm">{{ displayed }}</div>
    </div>
    
    <DataTable 
        :value="listData.data" 
        :sort-field="Object.keys(listData.search.sort)[0]"
        :sort-order="Object.values(listData.search.sort)[0]"
        @sort="(v: any) => updateFilter('sort', v)"
        >
        <Column
            v-for="col of config"
            sortable
            :key=col.field
            :field=col.field 
            :header=col.header
            >
            <template v-if="col.type == FieldsType.boolean" #body="{ data }">
                {{ data[col.field] ? "Выполнен" : "Активный" }}
            </template>
            <template v-if="col.type == FieldsType.date" #body="{ data }">
                {{ defaultDateShort(data[col.field]) }}
            </template>
            <template v-else-if="col.type == FieldsType.price" #body="{ data }">
                {{ Number.parseFloat(data[col.field]).toFixed(2)  }} р.
            </template>
            <template v-else #body="{ data }">
                {{ data[col.field] }}
            </template>
        </Column>
    </DataTable>

    <div v-if="isLoading" class="flex justify-center mt-10">
        <span class="loading loading-spinner loading-lg text-primary "/>
    </div>

    <Hero v-if="!isLoading && listData.count == 0" />
    
    <div v-if="!isLoading && listData.data.length > 10">
        <div class="flex flex-row w-full justify-end">
            <div class="self-center text-sm">{{ displayed }}</div>
        </div>
        <div class="mb-24">
            <TablePagination  
                :page-nums="pageNum"
                :limit-list="limitList"
                :current-page="currentPage"
                :current-limit="listData.search.limit"
                @change-limit="changeLimit"
                @change-page="changePage"
                />
        </div>
    </div>

</div>
</template>

<style scoped></style>
