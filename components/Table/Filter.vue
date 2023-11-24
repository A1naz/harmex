<script setup lang="ts">

const props = defineProps({
    phrase: { type: String, required: true },
    field: { type: String, required: true },
    fieldList: { type: Array as PropType<string[]>, required: true },
})
const emit = defineEmits(['changePage', 'changeLimit'])

</script>

<template>
    

</template>
