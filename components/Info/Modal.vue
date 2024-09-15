<script setup lang="ts">

const props = defineProps({
  isModal: { type: Boolean, required: true },
  title: { type: String, required: true },
  ytSrc: String
})

const emit = defineEmits(['changeVisibility'])

function toggleModal(){ 
    emit('changeVisibility') 
}

const lsKey = 'infoModal-' + props.title

const isOpening = ref()
function toggleCheckBox(){
    isOpening.value = !isOpening.value
    localStorage.setItem(lsKey, JSON.stringify(isOpening.value))
}

onKeyStroke('Escape', (e) => {
    if(props.isModal) toggleModal()
})

onMounted(()=>{
    const ls = localStorage.getItem(lsKey)
    if(ls){
        const parse = JSON.parse(ls)
        isOpening.value = parse ? true : false
        if(!isOpening.value) toggleModal()
    } else {
        toggleModal()
    }
})

</script>

<template>
    <!-- <div v-if="isModal">
        <input id="infoModal" type="checkbox" class="modal-toggle">
        <div class='modal modal-open' >
            <div class="modal-box w-11/12 max-w-4xl">
                <label for="review-modal" class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
                    @click="toggleModal">✕</label>
                <h1 class="text-xl font-bold mb-4"> {{ title }} </h1>

                <div class="flex flex-col gap-2">
                    <slot />

                </div>

                <iframe :src="ytSrc" class="w-full h-[30rem] rounded-lg my-4" title="YouTube video player" frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen />

                <InputsCheckbox 
                    :value="isOpening" 
                    label="Не показывать"
                    @updateValue="toggleCheckBox" />

            </div>
            <label class="modal-backdrop" for="infoModal" @click="toggleModal">Close</label>
        </div>
    </div> -->
</template>
