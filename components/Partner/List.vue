<script setup lang="ts">
import { ConfigTable } from '~/data/types';
import { FieldsType } from '~/data/enums';

defineProps({
    data: { type: Array, required: true},
    isLoading: { type: Boolean, required: true},
})
defineEmits(['refresh'])
const { width, height } = useWindowSize()

const configColumns: ConfigTable[] = [
    { field: 'username', header: 'Ник', type: FieldsType.text },
    { field: 'email', header: 'E-mail', type: FieldsType.text },
    { field: 'registrationDate', header: 'Дата регистрации', type: FieldsType.date },
    { field: 'refCount', header: 'Приглашенных', type: FieldsType.text },
    { field: 'deals', header: 'Выполнено услуг', type: FieldsType.text },
    { field: 'summ', header: 'Сумма услуг', type: FieldsType.price },
]

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
            v-for="col of configColumns"
            :sortable="!['user'].includes(col.field)"
            :key=col.field
            :field=col.field 
            :header=col.header
            >
            <template v-if="col.type == FieldsType.date" #body="{ data }">
                {{ defaultDate(data[col.field]) }}
            </template>
            <template v-else-if="col.type == FieldsType.price" #body="{ data }">
                {{ data[col.field] }}р.
            </template>
            <template v-else #body="{ data }">
                {{ data[col.field] }}
            </template>
        </Column>
    </DataTable>

</template>

<style scoped></style>
