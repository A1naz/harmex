<script setup lang="ts">
import { ConfigTable } from '~/data/types';
import { FieldsType } from '~/data/enums';

const props = defineProps({
    data: { type: Array as PropType<any[]>, required: true },
    count: { type: Number, required: true },
    currentLimit: { type: Number, required: true },
    currentSkip: { type: Number, required: true },
    config:  { type: Array as PropType<ConfigTable[]>, required: true },
    isLoading: { type: Boolean, required: true },    
})
const emit = defineEmits(['sort', 'changePage', 'changeLimit'])
const { width, height } = useWindowSize()

const limitList = [20 ,40, 60]

const pageNum = computed( () => {
    const res = props.count / props.currentLimit 
    return Math.ceil(res).toString()
})

const currentPage = computed ( () => {
    return props.currentSkip == 0 ? 1 : props.currentSkip / props.currentLimit + 1
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
        :docs-count="count"
        :current-page="currentPage"
        :current-limit="currentLimit"
        :current-skip="currentSkip"
        :current-count="data.length"
        @change-limit="changeLimit"
        @change-page="changePage"
        />

    <DataTable 
        v-if="width > 1024"
        :value="data" 
        >
        <Column
            v-for="col of config"
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

    <div v-else
        class="w-full flex flex-col gap-2"
        >
        <div
            v-for="item of data"
            class="w-full flex flex-col"
            >
            <div
                class="bg-base-200 p-2 w-full rounded-xl"
                >
                <div 
                    v-for="col of config" 
                    >
                    <span v-if="col.type == FieldsType.price" >
                        <b>{{ col.header }}: </b>{{ Number.parseFloat(item[col.field]).toFixed(2) }} р.
                    </span>
                    <span v-else-if="col.type == FieldsType.date">
                        <b>{{ col.header }}: </b>{{ defaultDate(item[col.field]) }}
                    </span>
                    <span v-else ><b>{{ col.header }}: </b> {{ item[col.field] }}</span>
                </div>
            </div>
        </div>
    </div>

    <TablePagination  
        v-if="!isLoading && data.length > 10"
        :page-nums="pageNum"
        :limit-list="limitList"
        :docs-count="count"
        :current-page="currentPage"
        :current-limit="currentLimit"
        :current-skip="currentSkip"
        :current-count="data.length"
        @change-limit="changeLimit"
        @change-page="changePage"
        />

</div>
</template>

<style scoped></style>
