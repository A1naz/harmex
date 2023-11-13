<script setup lang="ts">

const props = defineProps({
    api: {
        type: String, 
        required: true
    },
    fileName: {
        type: String, 
        required: true
    },
    saveButton: {
        type: String, 
        default: "Скачать",
        required: false
    },
    isVisible: {
        type: Boolean, 
        required: true
    }
})

const exportDates = ref([])
const btnLoading = ref(false)

async function exportToXLS() {
  btnLoading.value = true
  const { data } = await useFetch(props.api, {
    method: 'POST',
    body: {
      exportDates: exportDates.value,
    },
    responseType: 'blob',
  })
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]))
  const fileLink = document.createElement('a')
  fileLink.href = fileURL
  fileLink.setAttribute('download', `${props.fileName}.xlsx`)
  document.body.appendChild(fileLink)
  fileLink.click()
  btnLoading.value = false
}

</script>

<template>
    <div v-if="isVisible" >
        <ClientOnly>
            <DateRangePicker 
                v-model="exportDates" 
                :save-button="saveButton" 
                :start-date="new Date()" 
                @select="exportToXLS"
                >
                <Button 
                    type="button" 
                    label="Экспорт XLS" 
                    class="btn btn-sm btn-primary" 
                    :loading="btnLoading" 
                    />
            </DateRangePicker>
        </ClientOnly>
    </div>
</template>

<style scoped></style>
