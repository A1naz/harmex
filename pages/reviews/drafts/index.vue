<script setup lang="ts">
import useApi from '~/composables/useApi';


definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Черновики отзывов',
})

const { getData, postData, deleteData } = useApi()

const endpoint = '/review/drafts'
const params = ref({})
const drafts = ref<IReviewDraft>([])
const modalEdit = ref(false)
const modalConfirm = ref(false)

const selectedDraft = ref()
const selectedIndex = ref()
const btnSaveLoading = ref(false)
const saveError = ref('')

const get = async () => { 
    const res = await getData<any[]>(endpoint, params)
    if(res && res.length > 0) drafts.value = res
}

const post = async (draft: IReviewDraft, i: number) => { 
    drafts.value[i].isEdit = true
    const res = await postData(endpoint, draft)
    if(res) {
        drafts.value[i] = draft
        drafts.value[i].isEdit = false
    }
}

const deleteConfirmed = async (isConfirmed: boolean) => {
    btnSaveLoading.value = true
    if(isConfirmed){
        const res = await deleteData(endpoint, {...selectedDraft.value})
        if(res) drafts.value.splice(selectedIndex.value, 1)
    }
    closeConfirmModal()
    btnSaveLoading.value = false
}

function closeConfirmModal(){
    selectedIndex.value = ''
    selectedDraft.value = {}
    saveError.value = ''
    modalConfirm.value = false
}
function closeEditModal(){
    selectedIndex.value = ''
    selectedDraft.value = {}
    saveError.value = ''
    modalEdit.value = false
}

function updateDraft(draft: IReviewDraft, i: number){
    post(draft, i)
}
function createDraft(){

}

function openDeleteConfirm(id: string, i: number){
    selectedDraft.value = {...drafts.value[i]}
    selectedIndex.value = i
    modalConfirm.value = true
}

const configModalEdit: ConfigModal[] = [
    { field: 'draftName', header: 'Название черновика', type: FieldsType.text },
    { field: 'article', header: 'Артикул', type: FieldsType.text  },
    { field: 'text', header: 'Текст отзыва', type: FieldsType.text  },
];

onMounted( ()=> get() )
</script>

<template>

    <div class="page-header mb-10">
      <div class="flex flex-col items-start  gap-2 mt-4  w-full">
        <NuxtLink to="/reviews" class="btn btn-ghost btn-sm "> 
            {{ `< назад` }} 
        </NuxtLink>
        <div class="flex flex-row justify-between   w-full">
            <h1 class="text-2xl font-bold">Черновики отзывов</h1>
            <button class='btn btn-primary btn-sm normal-case font-medium'>+ Новый черновик</button>
        </div>
      </div>
    </div>

    <div>
        <div class="cards grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <div v-for="(draft, index) in drafts"> 
                <ReviewDraftCard 
                    :draft="draft" 
                    :index="index"
                    @update-draft="updateDraft"
                    @deleter-draft="openDeleteConfirm"
                    />
            </div>
        </div>
    </div>

    <ConfirmModal 
        v-if="modalConfirm"
        titleModal="Подтверждаете удаление черновика?"
        :sub-descr="selectedDraft.article ? `для артикула ${selectedDraft.article}` : '' "
        :descr="selectedDraft.draftName ? selectedDraft.draftName : '' "
        :index="selectedIndex"
        :state="modalConfirm"
        :btnSaveLoading="btnSaveLoading"
        @click="deleteConfirmed"
        />

    <EditModal
        v-if="modalEdit"
        titleModal="Создать новый черновик"
        :modelValue="selectedDraft"
        :config="configModalEdit"
        :state="modalEdit"
        :btnSaveLoading="btnSaveLoading"
        :index="selectedIndex"
        @save="createDraft"
        :saveError="saveError"
        @close="closeEditModal"
        />

</template>
