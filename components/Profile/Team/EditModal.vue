<script setup lang="ts">
import { FieldsType } from '~/data/enums'

const colorMode = useColorMode()

const props = defineProps({
  modelValue: { type: Object as any, required: true },
  multiOptions: { type: Array as PropType<OptionsMulti[]>, required: true },
  state: { type: Boolean, required: true },
  btnSaveLoading: { type: Boolean, required: true },
  saveError: { type: String, required: false },
})

const emit = defineEmits(['update:modelValue', 'save', 'close'])

watch(
  () => props.modelValue,
  () => {
    if(!props.btnSaveLoading){
      form.username = props.modelValue.username || '',
      form.phoneNumber = props.modelValue.phoneNumber || '',
      form.allowedPathes = props.modelValue.allowedPathes ? props.modelValue.allowedPathes.map((item: any) => item.value) : [],
      form.post = props.modelValue.post 
    }
  }
)

const selectOptions = [
  { value: 'manager', text: 'Менеджер' },
  { value: 'courier', text: 'Курьер' },
  { value: 'financier', text: 'Финансист' },
  { value: 'accountant', text: 'Бухгалтер' },
  { value: 'admin', text: 'Админ' },
]

const form = reactive({
  username: '',
  phoneNumber: '',
  allowedPathes: [] as string[],
  post: '',
  password: '',
})

function toggleAll() {
  const isFullySelected = form.allowedPathes.length === props.multiOptions.length; 

  if (isFullySelected) {
    form.allowedPathes = []; 
  } else {
    form.allowedPathes = props.multiOptions.map(option => option.value); 
  }
}

function toggleOption(value: string) {
  const index = form.allowedPathes.indexOf(value);
  if (index === -1) {
    form.allowedPathes.push(value); 
  } else {
    form.allowedPathes.splice(index, 1); 
  }
}

function save() {
  const user = props.modelValue

  user.username = form.username
  user.phoneNumber = form.phoneNumber
  user.allowedPathes = props.multiOptions.filter(option => form.allowedPathes.includes(option.value))
  user.post = form.post
  user.password = form.password

  emit('save', user)
}
</script>

<template>
  <div id="teamEditModal" :class="{ 'modal-open': state }" class="modal">
    <div v-if="state" class="modal-box max-w-2xl py-5 px-7 bg-white">
      <div class="">
        <a
          class="btn btn-sm btn-circle btn-ghost absolute right-5 top-5 text-lg"
          @click="$emit('close')"
          >✕</a
        >
        <div class="text-lg font-bold mb-5">
          {{ modelValue.uuid ? 'Редактировать сотрудника' : 'Добавить сотрудника' }}
        </div>

        <div v-if="modelValue.uuid" class="text-xs text-gray-500">
          #{{ modelValue.uuid }}
        </div>
        <div class="flex flex-col gap-2 mt-2 justify-center">
          <div class="flex flex-col gap-2">
            <label> Логин  </label>
            <input
              v-model="form.username"
              placeholder="Логин"
              type="text"
              class="input input-sm h-[2.5rem] bg-base-100 border-none w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label> Номер телефона  </label>
            <input
              v-model="form.phoneNumber"
              type="text"
              class="input input-sm h-[2.5rem] bg-base-100 border-none w-full"
              v-maska
              data-maska="+7 (###) ###-##-##"
              placeholder="+7 (___) ___-__-__"
              required="true"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label> Разрешения  </label>
            <CustomDropdown position="bottom-end" :matchTriggerWidth="true">
              <template #button>
                <div class="flex w-full">
                  <button
                    tabindex="0"
                    role="button"
                    class="h-[2.5rem] py-3 px-2.5 border border-[#d8d8d8] rounded-lg flex items-center w-full justify-between bg-base-100 border-none"
                    :class="{
                      'text-[#9ca3af]': !multiOptions
                      .filter(el => form.allowedPathes.includes(el.value))
                      .map(el => el.name)
                      .join(', ')
                    }"
                  >
                    <span class="text-sm truncate">{{ multiOptions.length === form.allowedPathes.length ? 'Полный доступ' :  multiOptions
                      .filter(el => form.allowedPathes.includes(el.value))
                      .map(el => el.name)
                      .join(', ') || 'Разрешения'}}
                    </span>
                    <div class="flex flex-col ml-5">
                      <Icon name="iconoir:nav-arrow-up" class="text-[#909090] w-4 h-4" />
                      <Icon name="iconoir:nav-arrow-down" class="text-[#909090] w-4 h-4 -mt-2" />
                    </div>
                  </button>
                </div>
              </template>

              <template #content="{ close }">
                <div
                  class="menu border border-[#d8d8d8] rounded-lg bg-white shadow-lg flex flex-col gap-0 p-0 max-h-[200px] overflow-y-auto flex-nowrap"
                >
                  <button
                    class="btn btn-sm h-[2.5rem] bg-base-100 btn-ghost justify-start font-normal rounded-none py-2"
                    :class="{ 'bg-[#f3e9dd]': form.allowedPathes.length === multiOptions.length }"
                    @click="toggleAll()"
                  >
                    <input
                      type="checkbox"
                      class="checkbox [--chkbg:#e86b35] [--chkfg:#ffffff] mr-2"
                      :checked="form.allowedPathes.length === multiOptions.length"
                    />
                    <span>Выбрать все</span>
                  </button>

                  <label
                    v-for="status in multiOptions"
                    :key="status.value"
                    class="btn btn-sm btn-ghost justify-start font-normal rounded-none active:scale-0"
                    :class="{ 'bg-[#f3e9dd]': form.allowedPathes.includes(status.value) }"
                  >
                    <input
                      type="checkbox"
                      class="checkbox [--chkbg:#e86b35] [--chkfg:#ffffff] mr-2"
                      :checked="form.allowedPathes.includes(status.value)"
                      @change="toggleOption(status.value)"
                    />
                    <span>{{ status.name }}</span>
                  </label>
                </div>
              </template>
            </CustomDropdown>
          </div>
          <div class="flex flex-col gap-2">
            <label> Должность  </label>
            <CustomDropdown position="bottom-end" :matchTriggerWidth="true">
              <template #button>
                <div class="flex w-full">
                  <button 
                    tabindex="0" 
                    role="button" 
                    class="h-[2.5rem] py-3 px-2.5 border border-[#d8d8d8] rounded-lg flex items-center w-full justify-between bg-base-100 border-none"
                    :class="{
                      'text-[#9ca3af]': !selectOptions.find(el => el.value === form.post)?.text
                    }"
                  >
                    <span class="text-sm">{{ selectOptions.find(el => el.value === form.post)?.text || 'Должность'}}</span>
                    <div class="flex flex-col ml-5">
                      <Icon name="iconoir:nav-arrow-up" class="text-[#909090] w-4 h-4" />
                      <Icon name="iconoir:nav-arrow-down" class="text-[#909090] w-4 h-4 -mt-2" />
                    </div>
                  </button>
                </div>
              </template>

              <template #content="{ close }">
                <div 
                  class="menu border border-[#d8d8d8] rounded-lg bg-white shadow-lg flex flex-col gap-1 p-0.5 max-h-[150px] flex-nowrap overflow-y-auto" 
                >
                    <button 
                      v-for="status in selectOptions"
                      class="btn btn-sm btn-ghost justify-between font-normal"
                      @click="[form.post = status.value, close()]"
                    >
                      <span>{{ status.text }}</span>
                      <Icon 
                        v-if="form.post === status.value"  
                        name="material-symbols:check-circle" size="15" class="text-[#22c55d]" 
                      />
                    </button>
                </div>
              </template>
            </CustomDropdown>
          </div>
          <div class="flex flex-col gap-2">
            <label> Пароль  </label>
            <input
              v-model="form.password"
              placeholder="Пароль"
              type="password"
              class="input input-sm h-[2.5rem] bg-base-100 border-none w-full"
            />
          </div>
        </div>

        <div v-if="saveError">
          <p class="text-red-600">{{ saveError }}</p>
        </div>

        <div class="flex my-4 justify-between">
          <button
            class="btn btn-sm btn-neutral m-1 sm:px-10 opacity-0"
          >
            Отменить
          </button>
          <button
            class="btn btn-sm btn-primary text-white border-none m-1 sm:px-10 w-1/3 h-[2.5rem]"
            label="Сохранить"
            :disabled="btnSaveLoading"
            @click="save()"
          >
            Сохранить
          </button>

          
        </div>
      </div>
    </div>
    <label
      class="modal-backdrop cursor-pointer"
      @click="$emit('close')"
    ></label>
  </div>
</template>

<style scoped>
</style>
