<script setup lang="ts">

const colorMode = useColorMode()

defineProps({
  titleModal: { type: String, required: true },
  modelValue: { type: Object as any, required: true },
  config: {  type: Object as PropType<ConfigModal[]>, required: true },
  index: { type: Number, required: true },
  state: { type: Boolean, required: true },
  btnSaveLoading: { type: Boolean, required: true },
  saveError: { type: String, required: false }
})

defineEmits(['update:modelValue', 'save', 'close'])

const multiselectStyle = {
    root: ({ props }: any) => ({
        class: [
            {  
                'bg-white border-gray-400': colorMode.value == 'light', 
                'bg-gray-800 ':  colorMode.value == 'dark'
            },
            'inline-flex cursor-pointer select-none',
            ' border transition-colors duration-200 ease-in-out rounded-md',
            'w-full',
            { 'opacity-60 select-none pointer-events-none cursor-default': props?.disabled }
        ]
    }),
    labelContainer: {
        class: 'overflow-hidden flex flex-auto cursor-pointer'
    },
    label: ({ props }: any) => ({
        class: [
            {
                'text-gray-800': colorMode.value == 'light', 
                'text-white/80':  colorMode.value == 'dark'
            },
            'block overflow-hidden whitespace-nowrap cursor-pointer text-ellipsis',
            'p-3 transition duration-200',
            {
                '!p-3': props.display !== 'chip' && (props?.modelValue == null || props?.modelValue == undefined),
                '!py-1.5 px-3': props.display == 'chip' && props?.modelValue !== null,
            }
        ]
    }),
    token: {
        class: [
            {
                'bg-orange-300 text-gray-700': colorMode.value == 'light', 
                'bg-gray-700 text-white/80':  colorMode.value == 'dark'
            },
            'py-1 px-2 mr-2 rounded-full', 'cursor-default inline-flex items-center']
    },
    removeTokenIcon: {
        class: 'ml-2'
    },
    trigger: {
        class: [
            {
                'text-gray-600': colorMode.value == 'light', 
                'text-white/70':  colorMode.value == 'dark'
            },
            'flex items-center justify-center shrink-0', 'bg-transparent w-12 rounded-tr-lg rounded-br-lg']
    },
    panel: {
        class: [
            {
                'bg-white text-gray-700': colorMode.value == 'light', 
                'bg-gray-900 text-white/80':  colorMode.value == 'dark'
            },
            'border-0 rounded-md shadow-lg']
    },
    header: {
        class: [
            {
                'border-gray-300 text-gray-700 bg-gray-100': colorMode.value == 'light', 
                'border-orange-900/40 text-white/80 bg-gray-800':  colorMode.value == 'dark'
            },
            'p-3 border-b rounded-t-lg', 'flex items-center justify-between']
    },
    headerCheckboxContainer: {
        class: ['inline-flex cursor-pointer select-none align-bottom relative', 'mr-2', 'w-6 h-6']
    },
    headerCheckbox: ({ context }: any) => ({
        class: [
            {
                'text-gray-600 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]': colorMode.value == 'light', 
                'text-white/70 focus:shadow-[0_0_0_0.2rem_rgba(147,197,253,0.5)]':  colorMode.value == 'dark'
            },
            'flex items-center justify-center',
            'border-2 w-6 h-6 rounded-lg transition-colors duration-200',
            'hover:border-orange-500 focus:outline-none focus:outline-offset-0',
            {
                'border-orange-500 bg-orange-500': context?.selected,
                'border-gray-300 bg-white': !context?.selected && colorMode.value == 'light',
                'border-orange-900/40 bg-gray-900': !context?.selected && colorMode.value == 'dark',
            }
        ]
    }),
    headercheckboxicon: {
        class: 'w-4 h-4 transition-all duration-200 text-white text-base'
    },
    closeButton: {
        class: [
            {
                'text-gray-500 hover:text-gray-700 hover:bg-gray-200 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]': colorMode.value == 'light', 
                'text-white/70 hover:text-white/80 hover:bg-gray-800/80 focus:shadow-[0_0_0_0.2rem_rgba(147,197,253,0.5)]':  colorMode.value == 'dark'
            },
            'flex items-center justify-center overflow-hidden relative',
            'w-8 h-8 border-0 bg-transparent rounded-full transition duration-200 ease-in-out mr-2 last:mr-0',
            'hover:border-transparent',
            'focus:outline-none focus:outline-offset-0'
        ]
    },
    closeButtonIcon: {
        class: 'w-4 h-4 inline-block'
    },
    wrapper: {
        class: [
            {
                'bg-white text-gray-700': colorMode.value == 'light', 
                'bg-gray-900 text-white/80':  colorMode.value == 'dark'
            },
            'max-h-[200px] overflow-auto border-0 rounded-md shadow-lg']
    },
    list: {
        class: 'py-3 list-none m-0'
    },
    item: ({ context }: any) => ({
        class: [
            'cursor-pointer font-normal overflow-hidden relative whitespace-nowrap',
            'm-0 p-3 border-0  transition-shadow duration-200 rounded-none',
            {
                'text-gray-700 hover:text-gray-700 hover:bg-gray-200': !context.focused && !context.selected && colorMode.value == 'light',
                'text-white/80 hover:text-gray-700 hover:bg-gray-800': !context.focused && !context.selected && colorMode.value == 'dark',
                'bg-gray-300 text-gray-700 hover:text-gray-700 hover:bg-gray-200': context.focused && !context.selected && colorMode.value == 'light',
                'bg-gray-800/90 text-white/80 hover:text-gray-700 hover:bg-gray-800': context.focused && !context.selected && colorMode.value == 'dark',
                'bg-orange-100 text-orange-700': context.focused && context.selected && colorMode.value == 'light',
                'bg-orange-400 text-white/80': context.focused && context.selected && colorMode.value == 'dark',
                'bg-orange-50 text-orange-700': !context.focused && context.selected && colorMode.value == 'light',
                'bg-orange-300 text-white/80': !context.focused && context.selected && colorMode.value == 'dark'
            }
        ]
    }),
    checkboxContainer: {
        class: ['inline-flex cursor-pointer select-none align-bottom relative', 'mr-2', 'w-6 h-6']
    },
    checkbox: ({ context }: any) => ({
        class: [
            {
                'text-gray-600 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]': colorMode.value == 'light', 
                'text-white/80 focus:shadow-[0_0_0_0.2rem_rgba(147,197,253,0.5)]':  colorMode.value == 'dark'
            },
            'flex items-center justify-center',
            'border-2 w-6 h-6 rounded-lg transition-colors duration-200',
            'hover:border-orange-500 focus:outline-none focus:outline-offset-0',
            {
                'border-gray-300 bg-white': !context?.selected && colorMode.value == 'light',
                'border-orange-900/40 bg-gray-900': !context?.selected && colorMode.value == 'dark',
                'border-orange-500 bg-orange-500': context?.selected
            }
        ]
    }),
    checkboxicon: {
        class: 'w-4 h-4 transition-all duration-200 text-white text-base'
    },
    itemgroup: {
        class: [
            {
                'text-gray-800 bg-white': colorMode.value == 'light', 
                'text-white/80bg-gray-900':  colorMode.value == 'dark'
            },
            'm-0 p-3 font-bold cursor-auto'
        ]
    },
    filtercontainer: {
        class: 'relative'
    },
    filterinput: {
        class: [
            {
                'text-gray-700 bg-white border-gray-300 hover:border-orange-500 focus:shadow-[0_0_0_0.2rem_rgba(191,219,254,1)]': colorMode.value == 'light', 
                'text-white/80 bg-gray-900 border-orange-900/40 hover:border-orange-300 focus:shadow-[0_0_0_0.2rem_rgba(147,197,253,0.5)]': colorMode.value == 'dark'
            },
            'pr-7 -mr-7',
            'w-full',
            'font-sans text-base py-3 px-3 border transition duration-200 rounded-lg appearance-none',
            'focus:outline-none focus:outline-offset-0'
        ]
    },
    filtericon: {
        class: '-mt-2 absolute top-1/2'
    },
    clearicon: {
        class: 'text-gray-500 right-12 -mt-2 absolute top-1/2'
    },
    transition: {
        enterFromClass: 'opacity-0 scale-75',
        enterActiveClass: 'transition-transform transition-opacity duration-150 ease-in',
        leaveActiveClass: 'transition-opacity duration-150 ease-linear',
        leaveToClass: 'opacity-0'
    }
}

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

        <div v-if="modelValue.uuid" class="text-xs text-gray-500">
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
                    :pt="multiselectStyle"
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

        <div v-if="saveError"><p class="text-red-600" > {{ saveError }}</p></div>

        <div class="flex m-4">
            <Button 
                class="btn btn-sm btn-primary m-1" 
                label="Сохранить"
                :loading="btnSaveLoading"
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
