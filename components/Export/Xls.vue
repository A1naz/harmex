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
    configColumns: { 
        type: Array as PropType<ConfigTable[]>, 
        required: false
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
const columns = ref<ConfigTable[]>([])

function prepareColummns() {
    if(props.configColumns){
        for(let i=0; i<props.configColumns.length ;i++){
        columns.value.push(
            {
                header: props.configColumns[i].header, 
                key: props.configColumns[i].field, 
                font: { bold: true }, 
                width: 25 
            })
        }
    }
}

async function exportToXLS() {
  btnLoading.value = true
  prepareColummns()
  const { data } = await useFetch(props.api, {
    method: 'POST',
    body: {
      exportDates: exportDates.value,
      columns: columns
    },
    responseType: 'blob',
  })
  const fileURL = window.URL.createObjectURL(new Blob([data.value as any]))
  const fileLink = document.createElement('a')
  fileLink.href = fileURL
  fileLink.setAttribute('download', `${props.fileName}.xlsx`)
  document.body.appendChild(fileLink)
  fileLink.click()
  columns.value = []
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
