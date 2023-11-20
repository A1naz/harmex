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
        <template #header>
            <div class="flex flex-wrap align-center justify-between gap-2">
                <span class="text-xl text-900 font-bold">
                    Приглашенных
                </span>
                <Button 
                    class="btn btn-sm m-1 btn-primary rounded-xl"
                    @click="$emit('refresh')" 
                    >
                    <span class="pi pi-refresh"></span>
                </Button>
            </div>
        </template>
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
        class="w-full"
        >
        <v-row
            v-for="item of data"
            class="m-2 bg-base-200 w-full p-2"
            >
            <v-col>
                <div 
                    v-for="col of config" 
                    class="w-full bg-base-200 flex flex-col p-1 rounded-xl"
                    >
                    <p v-if="col.type == FieldsType.price" >
                        <b>{{ col.header }} : </b> {{ item[col.field] }} р.
                    </p>
                    <p v-else ><b>{{ col.header }} : </b> {{ item[col.field] }}</p>
                </div>
            </v-col>
        </v-row>
    </div>


</template>

<style scoped></style>
