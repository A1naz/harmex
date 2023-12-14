<script setup lang="ts">

const props = defineProps({
    value: Boolean,
    label: String
})
const emit = defineEmits(['updateValue'])

const val = computed({
    get(){
        return props.value
    },
    set(val:boolean){ 
        emit('updateValue')
    }
})

</script>

<template>
    <div class="flex flex-row gap-2">
        <input 
            class="checkbox checkbox-primary"
            type="checkbox" 
            id="checkBox" 
            v-model="val" >
        <label v-if="label" for="checkBox"> {{ label }}</label>
    </div>
</template>
