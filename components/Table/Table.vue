<script setup lang="ts">
import { ConfigTable } from '~/data/types';
import { FieldsType } from '~/data/enums';

const props = defineProps({
    data: { type: Array as PropType<any[]>, required: true },
    count: { type: Number, required: true },
    currentLimit: { type: Number, required: true },
    currentSkip: { type: Number, required: true },
    currentSort: { type: Object, required: true },
    config:  { type: Array as PropType<ConfigTable[]>, required: true },
    isLoading: { type: Boolean, required: true },    
})
const emit = defineEmits(['sort', 'changePage', 'changeLimit'])
const { width, height } = useWindowSize()

const limitList = [20 ,40, 60]

const pageNum = computed( () => {
    const res = props.count / props.currentLimit 
    return Math.ceil(res)
})

const currentPage = computed ( () => {
    return props.currentSkip == 0 ? 1 : props.currentSkip / props.currentLimit + 1
})

const displayed = computed( ()=>{
    const from = props.currentSkip + 1
    const to = props.currentSkip + props.data.length
    return `Показано ${from}-${to} из ${props.count}`
})

const changePage = (numPage: number) => {
    emit('changePage', numPage)
}

const changeLimit = (limit: number) => {
    emit('changeLimit', limit)
}

</script>

<template>
<div>

    <TablePagination  
        :page-nums="pageNum"
        :limit-list="limitList"
        :current-page="currentPage"
        :current-limit="currentLimit"
        @change-limit="changeLimit"
        @change-page="changePage"
        />
    
    <div class="flex flex-row w-full justify-end">
        <div class="self-center text-sm">{{ displayed }}</div>
    </div>
    
    <DataTable 
        :value="data" 
        :sort-field="Object.keys(currentSort)[0]"
        :sort-order="Object.values(currentSort)[0]"
        @sort="(v: any) => $emit('sort', v)"
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
    
    <div class="flex flex-row w-full justify-end">
        <div class="self-center text-sm">{{ displayed }}</div>
    </div>

    <div class="mb-24">
        <TablePagination  
            v-if="!isLoading && data.length > 10"
            :page-nums="pageNum"
            :limit-list="limitList"
            :current-page="currentPage"
            :current-limit="currentLimit"
            @change-limit="changeLimit"
            @change-page="changePage"
            />
    </div>

</div>
</template>

<style scoped></style>
