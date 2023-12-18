<script setup lang="ts">

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
const isLoading = ref(false)

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
    isLoading.value = false
}
const fetchDebounce = useDebounceFn(()=> fetch(), 800)
const startFetch = () =>{
    isLoading.value = true
    fetchDebounce()
}

const edit = async (draft: IReviewDraft, i: number) => { 
    drafts.value[i].isEdit = true
    const res = await postData(endpoint, draft)
    if(res) {
        drafts.value[i] = draft
    }
    drafts.value[i].isEdit = false
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
        startFetch()
    }
})
const sortChange = computed({
    get(){ return params.sort },
    set(val:any){ 
        params.sort = val
        startFetch()
    }
})

const selectConfig = [
    { title: 'Артикул', icon: 'd', value: { article: -1 } },
    { title: 'Артикул', icon: 'a', value: { article: 1 } },
    { title: 'Название', icon: 'd', value: { draftName: -1 } },
    { title: 'Название', icon: 'a', value: { draftName: 1 } },
    { title: 'Текст', icon: 'd', value: { text: -1 } },
    { title: 'Текст', icon: 'a', value: { text: 1}  },
    { title: 'Создан', icon: 'd', value: { createdAt: -1 } },
    { title: 'Создан', icon: 'a', value: { createdAt: 1 } },
]

const configModalCreate: ConfigModal[] = [
    { field: 'draftName', header: 'Название черновика', type: FieldsType.text },
    { field: 'article', header: 'Артикул', type: FieldsType.text  },
    { field: 'text', header: 'Текст отзыва', type: FieldsType.textArea  },
];

onMounted( ()=> startFetch() )
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
        <p>
            Вы можете создать сколь угодно черновиков на любой артикул.
        </p>
        <p>
            Если артикул не указан в черновике, то такой черновик будет "общим" и будет доступен для выбора в каждом новом отзыве.
        </p>
    </div>


    <div class="flex justify-between flex-wrap bg-base-200 rounded-xl mb-2 p-2 gap-4" >
        <div class="flex flex-row gap-4">
            <input 
                type="text" 
                class="input input-sm input-bordered"
                v-model="inputChange" 
                placeholder="Поиск по артикулу">
            <div class="flex flex-row  gap-1">
                <p class="self-center">Сортировка:</p>
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
                    {{ field.title + ' '}} {{ field.icon == 'd' ? `&darr;` : '&uarr;'  }}
                    </option>
                </select>
            </div>
        </div>
        <button 
            class='btn btn-primary btn-sm normal-case font-medium' 
            @click="openCreate">+ Новый черновик</button>
    </div>

    <div v-show="!isLoading">
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
    <div v-show="isLoading" class="flex justify-center mt-10">
        <span class="loading loading-spinner loading-lg text-primary "/>
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
