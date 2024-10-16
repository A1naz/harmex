<script lang="ts" setup>

const props = defineProps({
    uuid: {
        type: String,
    }
})

const uuid = ref(props.uuid)
const emit = defineEmits(['deleteTemplate'])

function deleteTemplate() {
    emit('deleteTemplate')
}

</script>
<template>
    <input :id="'delete-template-modal'+uuid" type="checkbox" class="modal-toggle" />
  <div class="modal">

    <div class="modal-box max-w-xs">
      <label
        ref="closeWarningModal"
        :for="'delete-template-modal' + uuid"
        class="btn btn-sm btn-circle btn-ghost absolute right-1 top-1"
        >✕</label
      >
      <h3 class="font-bold text-lg text-center">Вы уверены?</h3>
{{ uuid }}
      <div class="modal-action flex justify-between">
        <label :for="'delete-template-modal' + uuid" class="btn btn-primary my-2 md:my-0"
          >Отмена</label
        >

        <label
        :for="'delete-template-modal' + uuid"
          class="btn bg-red-400"
          @click="deleteTemplate"
          >Удалить</label
        >
      </div>
    </div>
  </div>
</template>