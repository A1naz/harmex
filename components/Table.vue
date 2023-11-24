<script setup lang="ts">
import { ConfigTable } from '~/data/types';
import { FieldsType } from '~/data/enums';

const props = defineProps({
    data: { type: Array as PropType<any[]>, required: true },
    count: { type: Number, required: true },
    perPage: { type: Number, required: true },
    currentSkip: { type: Number, required: true },
    config:  { type: Array as PropType<ConfigTable[]>, required: true },
    isLoading: { type: Boolean, required: true },
    
})
const emit = defineEmits(['sort', 'changePage', 'update:endList'])

const { width, height } = useWindowSize()
const target = ref(null)

const pageNum = computed( () => {
    const res = props.count / props.perPage 
    return res < props.perPage ? '1' : Math.ceil(res).toString()
})

const currentPage = computed ( () => {
    return props.currentSkip == 0 ? 1 : props.currentSkip / props.perPage
})

const changePage = (numPage: number) => {
    emit('changePage', numPage)
}

const { stop } = useIntersectionObserver( target,
  ([{ isIntersecting }], observerElement) => {
    emit('update:endList', isIntersecting)
  },
)

</script>

<template>
<div>
<!-- pagination -->
    <div class="flex flex-row gap-1 ml-5 mb-1">
        <Button 
            v-for="n in parseInt(pageNum)" 
            :class="[
                'btn btn-sm rounded-xl',
                { 'btn-primary': n == currentPage }
                ]"
            :disabled="n == currentPage"
            @click="changePage(n)"
            >{{ n }}</Button>
    </div>


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
                        <b>{{ col.header }}: </b> {{ item[col.field] }} р.
                    </span>
                    <span v-else-if="col.type == FieldsType.date">
                        <b>{{ col.header }}: </b>{{ defaultDate(item[col.field]) }}
                    </span>
                    <span v-else ><b>{{ col.header }}: </b> {{ item[col.field] }}</span>
                </div>
            </div>
        </div>
    </div>

</div>
</template>

<style scoped></style>
