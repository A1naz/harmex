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

const exportDates = ref<Date[]>([])
const btnLoading = ref(false)

const expDatesVModel = computed({
    get: () => exportDates.value,
    set: (val) => exportDates.value = val
})

function prepareColummns(): any[] {
    let cols: any[] = []
    if(props.configColumns){
        for(let i=0; i<props.configColumns.length ;i++){
            cols.push(
            {
                header: props.configColumns[i].header, 
                key: props.configColumns[i].field, 
                font: { bold: true }, 
                width: 25 
            })
        }
        return cols
    }
    return cols
}

async function exportToXLS() {
  btnLoading.value = true
  const { data } = await useFetch(props.api, {
    method: 'POST',
    body: {
      exportDates: expDatesVModel.value,
      columns: prepareColummns()
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
                v-if="!btnLoading"
                v-model="expDatesVModel" 
                :save-button="saveButton" 
                :start-date="new Date()" 
                @select="exportToXLS"
                >
                <Button 
                    type="button"                   
                    class="btn btn-sm px-3 btn-primary dark:bg-primary bg-[#eff0ff] dark:bg-opacity-20 border-none text-base-content" 
                >
                <span v-if="!btnLoading">XLS</span>
                </Button>
            </DateRangePicker>
                <Button 
                    v-else
                    disabled
                        type="button"                   
                        class="btn btn-sm px-3 btn-primary dark:bg-primary bg-[#eff0ff] dark:bg-opacity-20 border-none text-base-content" 
                    >
                    <span class="loading loading-spinner loading-xs text-primary">XLS</span>
                </Button>
        </ClientOnly>
    </div>
</template>

<style scoped></style>
