<script setup lang="ts">
import { FieldsType, OptionsMulti } from '~/data/types';
import MenuBuilder from '~/server/utils/menuBuilder';


definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Моя команда',
})

const { width, height } = useWindowSize()

const myTeam = ref([]) as any

async function getMyTeam() {
  const { data, error } = await useFetch('/api/team/get')
  myTeam.value = data.value
}

await getMyTeam()

const configColumns = [
    { field: 'username', header: 'Ник' },
    { field: 'firstName', header: 'Имя' },
    { field: 'lastName', header: 'Фамилия' },
    { field: 'email', header: 'E-Mail' },
    { field: 'allowedPathes', header: 'Разрешения' },
    { field: 'actions', header: 'Действия', actions: [
        { label: 'Изменить', action: (uuid: string, index: number) => userEdit(uuid, index) },
    ]},
];

const modal = ref(false)
const selectedUser = ref()
const selectedIndex = ref()
const multiOptions: OptionsMulti[] = MenuBuilder.pathOptions()

const configModal: ConfigModal[] = [
    { field: 'username', header: 'Ник', type: FieldsType.text },
    { field: 'firstName', header: 'Имя', type: FieldsType.text  },
    { field: 'lastName', header: 'Фамилия', type: FieldsType.text  },
    { field: 'email', header: 'E-Mail', type: FieldsType.text  },
    { field: 'allowedPathes', header: 'Разрешения', type: FieldsType.multiOptions, options: multiOptions }
];

function userEdit (uuid: string, index: number) {
    selectedUser.value = {...myTeam.value.find((user: any) => user.uuid == uuid)}
    selectedIndex.value = index
    modal.value = true
}

const saveUser = async () => {
    const updatedUser = {
        username: selectedUser.value.username,
        firstName: selectedUser.value.firstName,
        lastName: selectedUser.value.lastName,
        email: selectedUser.value.email,
        allowedPathes: selectedUser.value.allowedPathes
    }
    // const { error } = await useFetch('/api/user/post', )
    // if(error){
    //     console.log(error)
    // }
    console.log(updatedUser)
    modal.value = false
}

</script>

<template>
  <div>

    <h1 class="text-2xl font-bold mt-4">Моя команда</h1>
    <p class="text-xs font-light mt-1 lg:text-sm">
      Делигируйте задачи между вашими сотрудниками для эффективного продвижения товаров.
    </p>

    <div class="flex justify-end mb-8 mt-6 items-center">
      <NuxtLink
        to="/team/create"
        class="btn btn-primary btn-sm gap-2 font-medium normal-case self-end"
      >
        <Icon name="fluent:add-24-filled" size="24" />
        Добавить сотрудника
      </NuxtLink>
    </div>

    <div v-if="myTeam.length">

        <DataTable 
            v-if="width > 1024"
            :value="myTeam" 
            class="bg-base-200 hidden lg:block overflow-visible"
            :rowsPerPageOptions="[5, 10, 20, 50]"
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
                        <div 
                            v-for="(itm, index) in data[col.field]" 
                            :key="index"
                            class="text-sm text-white bg-warning px-3 py-1 m-1 rounded-full "
                            >
                            {{ itm.name }}
                        </div>
                    </div>
                </template>
                <template v-else-if="col.field == 'actions'" #body="{ data }">
                    <Button 
                        v-for="(act, index) in col.actions"
                        :key="index"
                        class="btn btn-sm btn-primary m-1" 
                        :label="act.label"  
                        @click="act.action(data.uuid, index)"
                        ></Button>
                </template>
                <template v-else #body="{ data }">
                    {{ data[col.field] }}
                </template>
            </Column>
        </DataTable>

      <!-- <ul v-else class="w-full lg:hidden">
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
                  <div class="image">
                    <nuxt-img
                      width="32"
                      class="rounded-lg object-contain"
                      :src="item.image"
                      loading="lazy"
                    />
                  </div>
                  <div class="article flex flex-col gap-0.5">
                    <div class="text-xs">Артикул</div>
                    <a
                      :href="`https://www.wildberries.ru/catalog/${item.article}/detail.aspx`"
                      target="_blank"
                      class="text-secondary link link-hover text-sm"
                    >
                      {{ item.article }}
                    </a>
                  </div>
                  <div class="status flex flex-col gap-0.5">
                  </div>
                </div>
              </div>
              <div
                class="absolute top-0 text-gray-400 right-3 date text-xs text-center mt-2 xs:bottom-0 xs:top-20"
              >
                <div>
                  {{ defaultDate(item.createdDate) }}
                </div>
              </div>
            </div>
            <div class="collapse-content flex gap-4">
              <div class="flex flex-col">
                <dt class="mb-1 text-gray-500 text-sm dark:text-gray-400">
                  Лайков
                </dt>
                <dd class="font-semibold text-sm">
                  {{ item.likes }}
                </dd>
              </div>
              <div class="flex flex-col">
                <dt class="mb-1 text-gray-500 text-sm dark:text-gray-400">
                  Дизлайков
                </dt>
                <dd class="font-semibold text-sm">
                  {{ item.dislikes }}
                </dd>
              </div>
              <div class="flex flex-col">
                <dt class="mb-1 text-gray-500 text-sm dark:text-gray-400">
                  Дата завершения
                </dt>
                <dd class="font-semibold text-sm">
                  <div v-if="item.endedDate">
                    {{ defaultDate(item.endedDate) }}
                  </div>
                  <div v-else>Нет</div>
                </dd>
              </div>
              <div class="flex flex-col">
                <dt class="mb-1 text-gray-500 text-sm dark:text-gray-400">
                  Сроки выполнения
                </dt>
                <dd class="font-semibold text-sm flex">
                  <div v-if="item.dateEnd">
                    <div>
                      {{ `С ${defaultDate(item.dateStart)}` }}
                    </div>
                    <div>
                      {{ `По ${defaultDate(item.dateEnd)}` }}
                    </div>
                  </div>
                  <div v-else>Нет</div>
                </dd>
              </div>
            </div>
            <div class="ml-4 mb-2" v-if="item.status === 'created'">
              <button
              class="btn btn-sm btn-error"
              >
              Удалить
            </button>
          </div>
          </div>
        </li>
      </ul> -->


    </div>

    <Hero v-else />
    <input type="checkbox" id="reviewRemoveModal" class="modal-toggle" />

    <EditModal
      v-if="modal"
      titleModal="Редактирование пользователя"
      :modelValue="selectedUser"
      :config="configModal"
      :state="modal"
      :index="selectedIndex"
      @save="saveUser"
      @close="modal = false"
    />

  </div>
</template>

<style>
.p-datatable-wrapper {
  @apply overflow-visible !important;
}
</style>
