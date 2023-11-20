<script setup lang="ts">
import { ConfigTable } from '~/data/types';
import { FieldsType } from '~/data/enums';

defineProps({
    data: { type: Array as PropType<any[]>, required: true},
    config:  { type: Array as PropType<ConfigTable[]>, required: true},
    isLoading: { type: Boolean, required: true},
})
defineEmits(['refresh'])
const { width, height } = useWindowSize()

</script>

<template>

    <DataTable 
        v-if="width > 1024"
        :value="data" 
        :loading="isLoading"
        :rowsPerPageOptions="[5, 10, 20, 50]"
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

</template>

<style scoped></style>
