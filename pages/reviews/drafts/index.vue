<script setup lang="ts">

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Черновики отзывов',
})

const headers = useRequestHeaders(['cookie']) as HeadersInit

const params = ref({})
const drafts = ref<IReviewDraft>([])
const modalConfirm = ref(false)

const selectedDraft = ref()
const selectedIndex = ref()
const btnSaveLoading = ref(false)

const getData = async () => { 
    const res = await $fetch('/api/review/drafts', {
        method: 'GET',
        params: params
    })
    if(res && res.length > 0){
        drafts.value = res
    }
}

const postData = async (draft: IReviewDraft, i: number) => { 
    drafts.value[i].isEdit = true
    const res = await $fetch('/api/review/drafts', {
        method: 'POST',
        body: draft
    })
    if(res) drafts.value[i] = draft
    drafts.value[i].isEdit = false

}
function closeConfirmModal(){
    selectedIndex.value = ''
    selectedDraft.value = {}
    modalConfirm.value = false
}
const deleteConfirmed = async (isConfirmed: boolean) => {
    btnSaveLoading.value = true
    if(isConfirmed){
        const res = await $fetch('/api/review/drafts', {
            method: 'DELETE',
            body: selectedDraft.value,
            headers,
        })
        if(res) drafts.value.splice(selectedIndex.value, 1)
    }
    closeConfirmModal()
    btnSaveLoading.value = false
}

function updateDraft(draft: IReviewDraft, i: number){
    postData(draft, i)
}

function openDeleteConfirm(id: string, i: number){
    selectedDraft.value = {...drafts.value[i]}
    selectedIndex.value = i
    modalConfirm.value = true
}

onMounted( ()=> getData() )
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

</template>
