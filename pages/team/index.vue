<script setup lang="ts">
import { MenuEnums } from '~/data/menu/types'
import { FieldsType } from '~/data/enums'
import { ConfigTable, OptionsMulti } from '~/data/types'
import MenuBuilder from '~/server/utils/menuBuilder'

definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Моя команда',
})

const { getData } = useApi()
const route = useRoute()
const { width, height } = useWindowSize()
const myTeam = ref([]) as any
const headers = useRequestHeaders(['cookie']) as HeadersInit
const tab = computed(() => route.query.tab)

async function getMyTeam() {
  const res = await getData('/team/get')
  if (res && res.length > 0) {
    myTeam.value = res
  }
}
await getMyTeam()

const store = useMainStore()
const modalEdit = ref(false)
const modalConfirm = ref(false)
const editModalConfig = ref()
const titleModal = ref()
const selectedUser = ref()
const selectedIndex = ref()
const btnSaveLoading = ref(false)
const saveError = ref('')
const multiOptions: OptionsMulti[] = MenuBuilder.pathOptions()
const selectOptions = [
  { value: 'manager', text: 'Менеджер' },
  { value: 'courier', text: 'Курьер' },
  { value: 'financier', text: 'Финансист' },
  { value: 'accountant', text: 'Бухгалтер' },
  { value: 'admin', text: 'Админ' },
]

const configModalBase: ConfigModal[] = [
  { field: 'username', header: 'Ник', type: FieldsType.text },
  { field: 'firstName', header: 'Имя', type: FieldsType.text },
  { field: 'lastName', header: 'Фамилия', type: FieldsType.text },
  { field: 'email', header: 'Номер телефона', type: FieldsType.text },
  {
    field: 'allowedPathes',
    header: 'Разрешения',
    type: FieldsType.multiOptions,
    options: multiOptions,
  },
  {
    field: 'post',
    header: 'Должность',
    type: FieldsType.select,
    options: selectOptions,
  },
]
const configModalEdit: ConfigModal[] = [
  ...configModalBase,
  { field: 'newPassword', header: 'Новый пароль', type: FieldsType.text },
]
const configModalCreate: ConfigModal[] = [
  ...configModalBase,
  { field: 'password', header: 'Пароль', type: FieldsType.text },
]

function openEditModal(isCreate: boolean, uuid?: string, index?: number) {
  titleModal.value = isCreate
    ? 'Добавить сотрудника'
    : 'Редактирование сотрудника'
  editModalConfig.value = isCreate ? configModalCreate : configModalEdit
  selectedUser.value = isCreate
    ? {}
    : { ...myTeam.value.find((user: any) => user.uuid == uuid) }
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
    allowedPathes:
      selectedUser.value.allowedPathes.length == multiOptions.length
        ? [MenuEnums.fullAccess]
        : selectedUser.value.allowedPathes.map((path: any) => {
            return path.value
          }),
    tariff: store.client.tariff,
    post: selectedUser.value.post,
  }

  if (selectedUser.value.uuid) {
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
  if (error.value) {
    saveError.value = error.value
      ? error.value.data.message
      : 'Повторите попытку'
  } else {
    await getMyTeam()
    closeEditModal()
  }
  btnSaveLoading.value = false
}

function closeEditModal() {
  titleModal.value = ''
  selectedUser.value = {}
  selectedIndex.value = ''
  saveError.value = ''
  editModalConfig.value = {}
  modalEdit.value = false
}
function closeConfirmModal() {
  saveError.value = ''
  selectedIndex.value = ''
  selectedUser.value = {}
  titleModal.value = ''
  modalConfirm.value = false
}

function openConfirmModal(uuid: string, index: number) {
  selectedUser.value = {
    ...myTeam.value.find((user: any) => user.uuid == uuid),
  }
  selectedIndex.value = index
  titleModal.value = 'Вы уверены что хотите удалить сотрудника?'
  modalConfirm.value = true
}
const closeConfirm = async (isConfirmed: boolean) => {
  saveError.value = ''
  btnSaveLoading.value = true
  if (isConfirmed) {
    const { error } = await useFetch('/api/team/delete', {
      method: 'DELETE',
      body: selectedUser.value,
      headers,
    })
    if (error.value) {
      saveError.value = error.value
        ? error.value.data.message
        : 'Повторите попытку'
    } else {
      await getMyTeam()
      closeConfirmModal()
    }
  } else {
    closeConfirmModal()
  }
  btnSaveLoading.value = false
}

const configColumns: ConfigTable[] = [
  { field: 'username', header: 'Ник', type: FieldsType.text },
  { field: 'firstName', header: 'Имя', type: FieldsType.text },
  { field: 'lastName', header: 'Фамилия', type: FieldsType.text },
  { field: 'email', header: 'E-Mail', type: FieldsType.text },
  { field: 'post', header: 'Должность', type: FieldsType.select, },
  {
    field: 'allowedPathes',
    header: 'Разрешения',
    type: FieldsType.multiOptions,
  },
  {
    field: 'actions',
    header: 'Действия',
    type: FieldsType.actions,
    actions: [
      {
        btnLabel: 'Изменить',
        btnClass: 'btn btn-sm m-1 btn-primary',
        action: (uuid: string, index: number) =>
          openEditModal(false, uuid, index),
      },
      {
        btnIcon: 'pi pi-trash',
        btnClass: 'btn btn-sm  m-1 btn-outline btn-error',
        action: (uuid: string, index: number) => openConfirmModal(uuid, index),
      },
    ],
  },
]

const tabs: ITabs[] = [
  { title: 'Сотрудники', slot: 'main', query: '' },
  {
    title: 'История действий',
    slot: 'staffactions',
    query: '?tab=staffactions',
  },
]

const listConfigAcrions: ConfigTable[] = [
  { field: 'userNick', header: 'Ник', type: FieldsType.text },
  { field: 'userEmail', header: 'E-mail', type: FieldsType.email },
  { field: 'description', header: 'Действие', type: FieldsType.text },
  { field: 'createdAt', header: 'Дата', type: FieldsType.datetime },
  { field: 'documentId', header: 'id документа', type: FieldsType.text },
]

const getPostName = (post: string) => {
  return selectOptions.find((p: any) => p.value == post)?.text
}

</script>

<template>
  <div 
  >
    <div class="mb-4">
      <!-- <div class="flex">
        <h1 class="text-2xl font-bold mt-4">Моя команда</h1>
      </div>
      <p class="text-xs font-light mt-4 lg:text-sm">
        Делегируйте задачи между вашими сотрудниками для эффективного
        продвижения товаров.
      </p> -->
    </div>

    <!-- <Tabs :tabs="tabs" class="flex flex-col">
      <template v-slot:main> -->
        <div class="flex justify-start mb-4 mt-2 items-center">
          <Button
            class="btn btn-sm bg-[#B2BAFF] h-[2.5rem] hover:bg-primary hover:bg-opacity-80 text-base-content border-none m-1 dark:bg-[#5557C2] dark:bg-opacity-100"
            @click="openEditModal(true)"
          >
            <Icon name="fluent:add-24-filled" size="24" />
            Добавить сотрудника
          </Button>
        </div>

        <div v-if="myTeam && myTeam.length">
          <!-- <DataTable
            v-if="width > 1024"
            :value="myTeam"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            
          >
            <Column
              v-for="col of configColumns"
              :sortable="!['actions', 'allowedPathes'].includes(col.field)"
              :key="col.field"
              :field="col.field"
              :header="col.header"
              class="bg-base-100"
            >
              <template
                v-if="col.type == FieldsType.multiOptions"
                #body="{ data }"
                
              >
                <div class="flex flex-wrap">
                  <div
                    v-if="data[col.field].length == multiOptions.length"
                    class="text-sm px-3 py-1 m-1 rounded-2xl border border-success text-success"
                  >
                    Полный доступ
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
              <template
                v-else-if="col.type == FieldsType.actions"
                #body="{ data }"
              >
                <div class="flex flex-column content-center">
                  <Button
                    v-for="(act, index) in col.actions"
                    :key="index"
                    :class="act.btnClass"
                    @click="act.action(data.uuid, index)"
                  >
                    <span v-if="act.btnLabel">{{ act.btnLabel }}</span>
                    <span v-if="act.btnIcon" :class="act.btnIcon"></span>
                  </Button>
                </div>
              </template>
              <template v-else-if="col.type == FieldsType.select" #body="{ data }">
                {{ getPostName(data[col.field]) }}
              </template>
              <template v-else #body="{ data }">
                {{ data[col.field] }}
              </template>
            </Column>
          </DataTable> -->

          <ul class="w-full grid-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 navbar:grid-cols-3 nbar100:grid-cols-3 lg:grid-cols-4 gap-4"

          >
            <li
              v-for="(item, index) in myTeam"
              :key="index"
              class="pb-3 sm:pb-4 col-span-1"
            >
              <div
                tabindex="0"
                class="flex flex-col justify-start relative bg-base-100 rounded-box px-5 py-4"
              >
              <div class="dropdown dropdown-end absolute right-1 top-2 z-10">
                <label tabindex="0" class="btn btn-sm btn-square btn-ghost ">
                  <Icon name="ph:dots-three-outline-vertical-fill" class="text-primary" size="20" />
                </label>
                <ul
                  tabindex="0"
                  class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <a @click="openEditModal(false, item.uuid, index)">
                      <Icon name="fluent:send-logging-24-filled" />Изменить
                    </a>
                  </li>
                  <li>
                    <a @click="openConfirmModal(item.uuid, index)">
                      <Icon name="fluent:delete-24-filled" />Удалить
                    </a>
                  </li>
                </ul>
              </div>
                <div class="font-medium">
                  <div class="flex flex-col flex-wrap gap-5">
                    <div class="text-primary">
                      @{{ item.username }}
                    </div>
                    <div class="text-lg">
                      {{ item.firstName + " " + item.lastName }}
                    </div>
                    <div class="flex flex-col text-sm gap-2">
                      <span>Номер телефона:</span>
                      <span>{{'+' + item.email.slice(1, 2) + " (" + item.email.slice(2, 5) + ") " + item.email.slice(5, 8) + "-" + item.email.slice(8, 10) + "-" + item.email.slice(10, 12) }}</span>

                    </div>
                    <div class="flex flex-col">
                      <dt class="mb-2 text-sm ">
                        Разрешения:
                      </dt>
                      <dd class="font-semibold">
                        <div class="flex flex-wrap gap-1 overflow-y-hidden sm:overflow-y-auto sm:h-[60px] align-center items-center"
                        
                        >
                          <div
                            v-if="
                              item.allowedPathes.length == multiOptions.length
                            "
                            class="text-sm p-1 rounded-2xl bg-success text-green-400 bg-opacity-50 w-fit border-none "
                          >
                            Полный доступ
                          </div>
                          <div
                            v-else
                            v-for="(itm, index) in item.allowedPathes"
                            :key="index"
                            class="text-sm py-1 px-2 rounded-2xl bg-primary bg-opacity-20 border-none text-primary"
                          >
                            {{ itm.name }}
                          </div>
                        </div>
                      </dd>
                    </div>
                  </div>
                  <!-- <div class="flex gap-6 items-center w-full">
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
                  </div> -->
                  <!-- <div
                    class="absolute top-0 text-gray-400 right-3 date text-xs text-center mt-2 xs:bottom-0 xs:top-20 invisible md:visible"
                  >
                    #{{ item.uuid }}
                  </div> -->
                </div>
                <!-- <div class="collapse-content flex gap-4">
                  <div class="flex flex-col">
                    <dt class="mb-1 text-gray-500 text-sm dark:text-gray-400">
                      Разрешения
                    </dt>
                    <dd class="font-semibold">
                      <div class="flex flex-wrap">
                        <div
                          v-if="
                            item.allowedPathes.length == multiOptions.length
                          "
                          class="text-sm px-3 py-1 m-1 rounded-2xl border border-success text-success"
                        >
                          Полный доступ
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
                </div> -->
                <!-- <div class="flex justify-end ml-4 mb-2">
                  <Button
                    class="btn btn-sm m-1 btn-primary"
                    @click="openEditModal(false, item.uuid, index)"
                  >
                    <span>Изменить</span>
                  </Button>
                  <Button
                    class="btn btn-sm m-1 btn-outline btn-error"
                    @click="openConfirmModal(item.uuid, index)"
                  >
                    <span class="pi pi-trash"></span>
                  </Button>
                </div> -->
              </div>
            </li>
          </ul>
        </div>
        <Hero v-else />
      <!-- </template> -->
      <!-- <template v-slot:staffactions>
        <Table endpoint="/team/staffactions" :config="listConfigAcrions" />
      </template>
    </Tabs> -->

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
      :sub-descr="''"
      :descr="selectedUser.firstName + ' ' + selectedUser.lastName"
      :index="selectedIndex"
      :state="modalConfirm"
      :btnSaveLoading="btnSaveLoading"
      @click="closeConfirm"
    />
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 12px;
  border-radius: 8px;
}


::-webkit-scrollbar-thumb {
  background-color: #6366f1; 
  border-radius: 8px; 
}


::-webkit-scrollbar-track {
  background-color: rgba(99, 102, 241, .4) ;
  
  border-radius: 8px; 
}
</style>
