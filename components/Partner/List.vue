<script setup lang="ts">

defineProps({
    data: { type: Array, required: true},
})

const { width, height } = useWindowSize()

const configColumns = [
    {field: 'username', header: 'Username'},
    {field: 'email', header: 'email'},
    {field: 'registrationDate', header: 'registrationDate'},
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
            <template #body="{ data }">
                {{ data[col.field] }}
            </template>
        </Column>
    </DataTable>

</template>

<style scoped></style>
