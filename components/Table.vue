<script setup lang="ts">
import { ConfigTable } from '~/data/types';
import { FieldsType } from '~/data/enums';

const props = defineProps({
    data: { type: Array as PropType<any[]>, required: true},
    config:  { type: Array as PropType<ConfigTable[]>, required: true},
    isLoading: { type: Boolean, required: true},
    endList: { type: Boolean, required: true },
    sortCurrent: { type: Object, required: false },
    
})
const emit = defineEmits(['sort', 'update:endList'])

const { width, height } = useWindowSize()
const target = ref(null)

const sort = computed( ()=> {
    if (props.sortCurrent) {
        const key = Object.keys(props.sortCurrent)[0]
        const value = props.sortCurrent[key]
        return { field: key, order: value }
    }
    return undefined
})

const { stop } = useIntersectionObserver( target,
  ([{ isIntersecting }], observerElement) => {
    emit('update:endList', isIntersecting)
  },
)

</script>

<template>
<div>
<!-- pagination -->
    <div>

    </div>


    <DataTable 
        v-if="width > 1024"
        :value="data" 
        :sort-field="sort?.field"
        :sort-order="sort?.order"
        @sort="(value: any) => $emit('sort', value)"
        >
        <Column
            v-for="col of config"
            :sortable="!['user'].includes(col.field)"
            :key=col.field
            :field=col.field 
            :header=col.header
            >
            <template v-if="col.type == FieldsType.date" #body="{ data }">
                {{ defaultDate(data[col.field]) }}
            </template>
            <template v-else-if="col.type == FieldsType.price" #body="{ data }">
                {{ data[col.field] }} р.
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
