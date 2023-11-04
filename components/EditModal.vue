<script setup lang="ts">

const props = defineProps({
  titleModal: { type: String, required: true },
  modelValue: { type: Object as any, required: true },
  config: {  type: Object as PropType<ConfigModal[]>, required: true },
  index: { type: Number, required: true },
  state: { type: Boolean, required: true }
})

defineEmits(['update:modelValue', 'save', 'close'])

onKeyStroke('Escape', (e) => { e.preventDefault() })

</script>

<template>
  <div
    id="teamEditModal" 
    :class="{ 'modal-open': state }" 
    class="modal"
  >
    <div v-if="state" class="modal-box max-w-2xl">
      <div class="">
        <a class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="$emit('close')">✕</a>
        <div class="text-xl font-bold">
            {{ titleModal }}
        </div>

        <div class="text-xs text-gray-500">
          #{{ modelValue.uuid }}
        </div>

        <div class="flex flex-col gap-2 mt-2 justify-center">

            <div v-for="(conf, index) in config" >
                <label :for="conf.type">
                    {{ conf.header }}
                </label><br>

                <MultiSelect 
                    v-if="conf.type == FieldsType.multiOptions && conf.options"
                    :key="'multi' + index"
                    v-model="modelValue[conf.field]" 
                    :options="conf.options"
                    optionLabel="name"
                    display="chip" 
                    class="w-full md:w-20rem" 
                    />

                <input
                    v-else
                    :key="index"
                    v-model="modelValue[conf.field]"
                    :placeholder="conf.header"
                    :type="conf.type"
                    class="input input-bordered w-full"
                />
            </div>

        </div>

        <div class="flex m-4">
            <Button 
                class="btn btn-sm btn-primary m-1" 
                label="Сохранить"
                @click="$emit('save')"
                ></Button>

            <Button 
                class="btn btn-sm btn-neutral m-1" 
                label="Отменить"
                @click="$emit('close')"
                ></Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
