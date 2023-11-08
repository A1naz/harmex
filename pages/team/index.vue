<script setup lang="ts">
import { MenuEnums } from '~/data/menu/types';
import { FieldsType, OptionsMulti } from '~/data/types';
import MenuBuilder from '~/server/utils/menuBuilder';

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Моя команда',
})

const { width, height } = useWindowSize()
const myTeam = ref([]) as any
const headers = useRequestHeaders(['cookie']) as HeadersInit

async function getMyTeam() {
  const { data, error } = await useFetch('/api/team/get')
  myTeam.value = data.value
}

await getMyTeam()

const modalEdit = ref(false)
const modalConfirm = ref(false)
const editModalConfig = ref()
const titleModal = ref()
const selectedUser = ref()
const selectedIndex = ref()
const btnSaveLoading = ref(false)
const saveError = ref('')
const multiOptions: OptionsMulti[] = MenuBuilder.pathOptions()

const configModalBase: ConfigModal[] = [
    { field: 'username', header: 'Ник', type: FieldsType.text },
    { field: 'firstName', header: 'Имя', type: FieldsType.text  },
    { field: 'lastName', header: 'Фамилия', type: FieldsType.text  },
    { field: 'email', header: 'E-Mail', type: FieldsType.text  },
    { field: 'allowedPathes', header: 'Разрешения', type: FieldsType.multiOptions, options: multiOptions }
];
const configModalEdit: ConfigModal[] = [
    ...configModalBase,
    { field: 'newPassword', header: 'Новый пароль', type: FieldsType.text  },
];
const configModalCreate: ConfigModal[] = [
    ...configModalBase,
    { field: 'password', header: 'Пароль', type: FieldsType.text }
];

function openEditModal(isCreate: boolean, uuid?: string, index?: number){
    titleModal.value = isCreate ? 'Создать сотрудника' : 'Редактирование сотрудника'
    editModalConfig.value = isCreate ? configModalCreate : configModalEdit
    selectedUser.value = isCreate ? {} : {...myTeam.value.find((user: any) => user.uuid == uuid)}
    selectedIndex.value = isCreate ? 10000 : index
    modalEdit.value = true
}

const saveUser = async () => {
    saveError.value = ''
    btnSaveLoading.value = true
    let endpoint = ''

    const userData: any = {
        username: selectedUser.value.username,
        firstName: selectedUser.value.firstName,
        lastName: selectedUser.value.lastName,
        email: selectedUser.value.email,
        newPassword: selectedUser.value.newPassword,
        allowedPathes: selectedUser.value.allowedPathes.length == multiOptions.length
                        ? [MenuEnums.fullAccess]
                        : selectedUser.value.allowedPathes.map( (path: any) => { return path.value})
    }

    if(selectedUser.value.uuid){
        userData.uuid = selectedUser.value.uuid
        endpoint = '/api/team/update'
    } else {
        userData.password = selectedUser.value.password
        endpoint = '/api/team/register'
    }

    const { error } = await useFetch(endpoint, {
        method: 'POST',
        body: userData,
        headers,
    })
    if(error.value){
        saveError.value = error.value ? error.value.data.message : 'Повторите попытку'
    } else {
        await getMyTeam()
        closeEditModal()
    }
    btnSaveLoading.value = false
}

function closeEditModal(){
    titleModal.value = ''
    selectedUser.value = {}
    selectedIndex.value = ''
    saveError.value = ''
    editModalConfig.value = {}
    modalEdit.value = false
}
function closeConfirmModal(){
    saveError.value = ''
    selectedIndex.value = ''
    selectedUser.value = {}
    titleModal.value = ''
    modalConfirm.value = false
}

function openConfirmModal(uuid: string, index: number){
    selectedUser.value = {...myTeam.value.find((user: any) => user.uuid == uuid)}
    selectedIndex.value = index
    titleModal.value = 'Подтверждаете удаление сотрудника?'
    modalConfirm.value = true
}
const closeConfirm = async (isConfirmed: boolean) => {
    saveError.value = ''
    btnSaveLoading.value = true
    if(isConfirmed){
        const { error } = await useFetch('/api/team/delete', {
            method: 'DELETE',
            body: selectedUser.value,
            headers,
        })
        if(error.value){
            saveError.value = error.value ? error.value.data.message : 'Повторите попытку'
        } else {
            await getMyTeam()
            closeConfirmModal()
        }
    } else {
        closeConfirmModal()
    }
    btnSaveLoading.value = false
}

const configColumns = [
    { field: 'username', header: 'Ник' },
    { field: 'firstName', header: 'Имя' },
    { field: 'lastName', header: 'Фамилия' },
    { field: 'email', header: 'E-Mail' },
    { field: 'allowedPathes', header: 'Разрешения' },
    { field: 'actions', header: 'Действия', actions: [
        { 
            btnLabel: 'Изменить', 
            btnClass: 'btn btn-sm m-1 btn-primary',
            action: (uuid: string, index: number) => openEditModal(false, uuid, index) 
        },
        {
            btnIcon: 'pi pi-trash',
            btnClass: 'btn btn-sm  m-1 btn-outline btn-error',
            action: (uuid: string, index: number) => openConfirmModal(uuid, index) 
        },
    ]},
];

</script>

<template>
  <div>

    <h1 class="text-2xl font-bold mt-4">Моя команда</h1>
    <p class="text-xs font-light mt-1 lg:text-sm">
      Делигируйте задачи между вашими сотрудниками для эффективного продвижения товаров.
    </p>

    <div class="flex justify-end mb-8 mt-6 items-center">

        <Button 
            class="btn btn-sm btn-primary m-1" 
            @click="openEditModal(true)"
            >
            <Icon name="fluent:add-24-filled" size="24" />
            Добавить сотрудника
        </Button>

        <!-- <Icon name="" size="24" /> -->
    </div>

    <div v-if="myTeam.length">
        <DataTable 
            v-if="width > 1024"
            :value="myTeam" 
            :rowsPerPageOptions="[5, 10, 20, 50]"
            class="bg-base-200 hidden lg:block overflow-visible"
            >
            <Column
                v-for="col of configColumns"
                :sortable="!['actions', 'allowedPathes'].includes(col.field)"
                :key=col.field
                :field=col.field 
                :header=col.header
                >
                <template v-if="col.field == 'allowedPathes'" #body="{ data }">
                    <div class="flex flex-wrap" >
                        <div v-if="data[col.field].length == multiOptions.length"
                            class="text-sm px-3 py-1 m-1 rounded-2xl border border-success text-success"
                            > Полный доступ
                        </div>
                        <div 
                            v-else
                            v-for="(itm, index) in data[col.field]" 
                            :key="index"
                            class="text-sm px-3 py-1 m-1 rounded-2xl border border-warning text-warning"
                            >
                            {{ itm.name }}
                        </div>
                    </div>
                </template>
                <template v-else-if="col.field == 'actions'" #body="{ data }">
                    <div class="flex flex-column content-center">
                        <Button 
                            v-for="(act, index) in col.actions"
                            :key="index"
                            :class="act.btnClass"
                            @click="act.action(data.uuid, index)"
                            >
                            <span v-if="act.btnLabel">{{ act.btnLabel }}</span>
                            <span v-if="act.btnIcon" :class=act.btnIcon></span>
                        </Button>
                    </div>
                </template>
                <template v-else #body="{ data }">
                    {{ data[col.field] }}
                </template>
            </Column>
        </DataTable>



        <ul v-else class="w-full lg:hidden">
        <li
          v-for="(item, index) in myTeam"
          :key="index"
          class="pb-3 sm:pb-4"
        >
          <div
            tabindex="0"
            class="relative collapse collapse-arrow bg-base-200 rounded-box"
          >
            <div class="collapse-title font-medium">
              <div class="flex gap-6 items-center w-full">
                <div class="flex gap-4 items-start">

                  <div class="flex flex-col gap-0.5 text-sm">
                        <div class="text-xs">Email</div>
                        {{ item.email }}
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <div class="text-xs">Имя</div>
                    {{ item.firstName }}
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <div class="text-xs">Фамилия</div>
                    {{ item.lastName }}
                  </div>

                </div>
              </div>
              <div class="absolute top-0 text-gray-400 right-3 date text-xs text-center mt-2 xs:bottom-0 xs:top-20 invisible md:visible">
                  #{{ item.uuid }}
              </div>
            </div>
            <div class="collapse-content flex gap-4">
              <div class="flex flex-col">
                <dt class="mb-1 text-gray-500 text-sm dark:text-gray-400">
                  Разрешения
                </dt>
                <dd class="font-semibold text-sm">
                    <div class="flex flex-wrap" >
                        <div 
                            v-if="item.allowedPathes.length == multiOptions.length"
                            class="text-sm px-3 py-1 m-1 rounded-2xl border border-success text-success"
                            > Полный доступ
                        </div>
                        <div 
                            v-else
                            v-for="(itm, index) in item.allowedPathes" 
                            :key="index"
                            class="text-sm px-3 py-1 m-1 rounded-2xl border border-warning text-warning"
                            >
                            {{ itm.name }}
                        </div>
                    </div>
                </dd>
              </div>
              
            </div>
            <div class="flex justify-end ml-4 mb-2" >
                <Button 
                    class="btn btn-sm m-1 btn-primary"
                    @click="openEditModal(false, item.uuid, index)"
                    >
                    <span>Изменить</span>
                </Button>
                <Button 
                    class="btn btn-sm  m-1 btn-outline btn-error"
                    @click="openConfirmModal(item.uuid, index)"
                    >
                    <span class="pi pi-trash"></span>
                </Button>
          </div>
          </div>
        </li>
      </ul>

    </div>

    <Hero v-else />
    <input type="checkbox" id="reviewRemoveModal" class="modal-toggle" />

    <EditModal
      v-if="modalEdit"
      :titleModal="titleModal"
      :modelValue="selectedUser"
      :config="editModalConfig"
      :state="modalEdit"
      :btnSaveLoading="btnSaveLoading"
      :index="selectedIndex"
      @save="saveUser"
      :saveError="saveError"
      @close="closeEditModal"
    />

    <ConfirmModal 
        v-if="modalConfirm"
        :titleModal="titleModal"
        :modelValue="selectedUser"
        :index="selectedIndex"
        :state="modalConfirm"
        :btnSaveLoading="btnSaveLoading"
        @click="closeConfirm"
        />

  </div>
</template>

<style>
.p-datatable-wrapper {
  @apply overflow-visible !important;
}
</style>
