<script setup lang="ts">
import { ConfigTable } from '~/data/types';
import { FieldsType } from '~/data/enums';

defineProps({
    data: { type: Array, required: true},
})

const { width, height } = useWindowSize()

const configColumns: ConfigTable[] = [
    {field: 'username', header: 'Ник', type: FieldsType.text},
    {field: 'email', header: 'E-mail', type: FieldsType.text},
    {field: 'registrationDate', header: 'Дата регистрации', type: FieldsType.date},
    {field: 'deals', header: 'Сделок', type: FieldsType.text},
]

</script>

<template>

    <DataTable 
        v-if="width > 1024"
        :value="data" 
        :rowsPerPageOptions="[5, 10, 20, 50]"
        >
        <Column
            v-for="col of configColumns"
            :sortable="!['user'].includes(col.field)"
            :key=col.field
            :field=col.field 
            :header=col.header
            >
            <template v-if="col.type == FieldsType.date" #body="{ data }">
                {{ defaultDate(data[col.field]) }}
            </template>
            <template v-else #body="{ data }">
                {{ data[col.field] }}
            </template>
        </Column>
    </DataTable>

</template>

<style scoped></style>
