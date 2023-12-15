<script setup lang="ts">
import useApi from '~/composables/useApi';

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Черновики отзывов',
})

const { getData, postData, putData, deleteData } = useApi()

const endpoint = '/review/drafts'
const params = reactive({
    sort: { createdAt: -1 },
    search: {}
})

const drafts = ref<IReviewDraft>([])
const modalCreate = ref(false)
const modalConfirm = ref(false)

const selectedDraft = ref()
const selectedIndex = ref()
const btnSaveLoading = ref(false)
const saveError = ref('')

const fetch = async () => { 
    const res = await getData<any[]>(endpoint, params)
    if(res) drafts.value = res
}
const fetchDebounce = useDebounceFn(()=> fetch(), 800)

const edit = async (draft: IReviewDraft, i: number) => { 
    drafts.value[i].isEdit = true
    const res = await postData(endpoint, draft.value)
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

const createDraft = async () => {
    btnSaveLoading.value = true
    const res = await putData(endpoint, {...selectedDraft.value})
    closeCreateModal()
    btnSaveLoading.value = false
    if(res) fetch()
}


function updateDraft(draft: IReviewDraft, i: number){
    edit(draft, i)
}

function closeConfirmModal(){
    selectedIndex.value = ''
    selectedDraft.value = {}
    saveError.value = ''
    modalConfirm.value = false
}
function closeCreateModal(){
    selectedIndex.value = ''
    selectedDraft.value = {}
    saveError.value = ''
    modalCreate.value = false
}

function openCreate(){
    selectedDraft.value = {
        draftName: '',
        article: '',
        text: ''
    }
    modalCreate.value = true
}

function openDeleteConfirm(id: string, i: number){
    selectedDraft.value = {...drafts.value[i]}
    selectedIndex.value = i
    modalConfirm.value = true
}

const inputChange = computed({
    get(){ return params.search.article ? params.search.article : '' },
    set(val:any){ 
        if (val.length > 0) params.search = { article: val }
        else params.search = {}
        fetchDebounce()
    }
})
const sortChange = computed({
    get(){ return params.sort },
    set(val:any){ 
        params.sort = val
        fetchDebounce()
    }
})

const selectConfig = [
    { title: 'Артикул A', value: { article: -1 } },
    { title: 'Артикул D', value: { article: 1 } },
    { title: 'Название A', value: { draftName: -1 } },
    { title: 'Название D', value: { draftName: 1 } },
    { title: 'Текст A', value: { text: -1 } },
    { title: 'Текст D', value: { text: 1}  },
    { title: 'Создан A', value: { createdAt: -1 } },
    { title: 'Создан D', value: { createdAt: 1 } },
]

const configModalCreate: ConfigModal[] = [
    { field: 'draftName', header: 'Название черновика', type: FieldsType.text },
    { field: 'article', header: 'Артикул', type: FieldsType.text  },
    { field: 'text', header: 'Текст отзыва', type: FieldsType.textArea  },
];

onMounted( ()=> fetch() )
</script>

<template>

    <div class="page-header mb-10">
      <div class="flex flex-col items-start  gap-2 mt-4  w-full">
        <NuxtLink to="/reviews" class="btn btn-ghost btn-sm "> 
            {{ `< назад` }} 
        </NuxtLink>
        <div class="flex flex-row justify-between   w-full">
            <h1 class="text-2xl font-bold">Черновики отзывов</h1>
        </div>
      </div>
    </div>


    <div class="flex justify-between bg-base-200 rounded-xl mb-2 p-2 gap-4" >
        <div class="flex flex-row gap-2">
            <div class="flex flex-row gap-1">
                <input type="text" class="bordered" v-model="inputChange" placeholder="Артикул">
            </div>
            <select
                class="select select-bordered select-sm"
                v-model="sortChange"
            >
            <option 
                v-for="field in selectConfig"
                :value="field.value" 
                :selected="field.value.toString() == params.sort.toString()"
                :default="field.value.toString() == params.sort.toString()"
                >
                {{ field.title }}
                </option>
            </select>
        </div>
        <button 
            class='btn btn-primary btn-sm normal-case font-medium' 
            @click="openCreate">+ Новый черновик</button>

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
        v-if="modalCreate"
        titleModal="Создать новый черновик"
        :modelValue="selectedDraft"
        :config="configModalCreate"
        :state="modalCreate"
        :btnSaveLoading="btnSaveLoading"
        :index=101109
        :saveError="saveError"
        @save="createDraft"
        @close="closeCreateModal"
        />

</template>
