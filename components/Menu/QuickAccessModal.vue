<script setup lang="ts">
const { user, session, fetch } = useUserSession()

const props = defineProps({
  show: { type: Boolean, required: true },
  accesses: { type: Array, required: true, default: () => [] },
  quickAccesses: { type: Object, required: true, default: () => {} },
})

const emit = defineEmits(['close', 'save'])

function closeModal() {
  emit('close')
}

const items: Array<{ title: string; icon: string; path?: string }> = [
  {
    title: 'Финансы',
    icon: 'solar:wallet-money-outline',
    path: '/paymenthistory',
  },
  {
    title: 'Партнерка',
    icon: 'solar:users-group-rounded-outline',
    path: '/partner',
  },
  { title: 'Пополнение ', icon: 'solar:alarm-outline', path: '/balance' },
  { title: 'Заказы', icon: 'solar:bag-4-outline', path: '/orders' },
  { title: 'Вывод', icon: 'solar:plain-outline', path: '/withdraw' },
  { title: 'Команда', icon: 'solar:heart-outline', path: '/team' },
]

const acesses: any = computed(() => {
  return acesses.value?.acesses
})

watch(
  () => props.show,
  async (newVal) => {
    if (newVal) {
      if (props.accesses?.length > 0) {
        availableItems.value = items.filter((item) =>
          props.accesses.includes(item.path)
        )
      } else {
        availableItems.value = items
      }
      if (props.quickAccesses?.length > 0) {
        quickItems.value = items.filter((item) =>
          props.quickAccesses.includes(item.path)
        )
      } else {
        quickItems.value = []
      }
      availableItems.value = availableItems.value.filter(
        (i: any) => !quickItems.value.some((q: any) => q.path === i.path)
      )
    }
  }
)

const availableItems = ref([]) as any

const quickItems = ref([]) as any

function addToAvailable(item: any) {
  quickItems.value = quickItems.value.filter((i: any) => i.path !== item.path)
  availableItems.value.push(item)

}

function addToQuick(item: any) {
  availableItems.value = availableItems.value.filter(
    (i: any) => i.path !== item.path
  )
  quickItems.value.push(item)

}

function save() {
  emit('save', availableItems.value, quickItems.value)
}

</script>

<template>
  <input type="checkbox" id="selectUser" :checked="show" class="modal-toggle" />
  <div
    class="modal z-[9999] cursor-pointer backdrop-blur-[2px]"
    @click="closeModal"
  >
    <div
      class="modal-box w-full cursor-auto rounded-[8px] border border-[#dee2e6] p-0 sm:max-w-2xl"
      @click.stop
    >
      <form method="dialog">
        <label
          class="btn btn-circle btn-xs absolute right-2 top-2 bg-[#e5e5e5]"
          @click="closeModal"
        >
          ✕
        </label>
      </form>

      <div
        class="flex w-full flex-col items-center justify-center gap-6 px-[20px] py-[30px] pb-[25px] sm:px-[32px]"
      >
        <h3 class="text-[20px] font-[600]">Быстрый доступ</h3>
        <div
          class="flex w-full flex-col items-center gap-4 text-[14px] font-[400]"
        >
          <h4 class="text-[16px] font-[500]">Сохраненные функции</h4>
          <div
            v-if="quickItems && quickItems.length > 0"
            class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
          >
            <label
              v-for="item of quickItems"
              class="myCustomBtn relative md:min-w-40"
              @click="addToAvailable(item)"
            >
              <div class="flex items-center justify-center">
                <Icon :name="item.icon" size="19px" />
                <span class="ml-3">
                  {{ item.title }}
                </span>
              </div>
              <div
                class="absolute right-[-7px] top-[-5px] flex h-5 w-5 items-center justify-center rounded-full border border-black bg-[#CC5F5F] text-white"
              >
                <span class="text-xs text-white">-</span>
              </div>
            </label>
          </div>
          <div
            v-else
            class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
          >
            <p class="col-span-3 flex w-full items-center justify-center">
              Нет сохраненных функций
            </p>
          </div>
        </div>
      </div>

      <div class="w-full border-b border-[#BDC8FC]"></div>

      <div
        class="flex w-full flex-col items-center justify-center gap-6 px-[20px] py-[30px] pt-[25px] sm:px-[32px]"
      >
        <div
          class="flex w-full flex-col items-center gap-4 text-[14px] font-[400]"
        >
          <h4 class="text-[16px] font-[500]">Доступные функции</h4>
          <div
            v-if="availableItems && availableItems.length > 0"
            class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
          >
            <label
              v-for="item of availableItems"
              class="myCustomBtn relative md:min-w-40"
              @click="addToQuick(item)"
            >
              <div class="flex items-center justify-center">
                <Icon :name="item.icon" size="19px" />
                <span class="ml-3">
                  {{ item.title }}
                </span>
              </div>
              <div
                class="absolute right-[-7px] top-[-5px] flex h-5 w-5 items-center justify-center rounded-full border border-black bg-[#519C66] text-white"
              >
                <span class="text-xs text-white">+</span>
              </div>
            </label>
          </div>
          <div
            v-else
            class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
          >
            <p class="col-span-3 flex w-full items-center justify-center">
              Нет доступных функций
            </p>
          </div>
        </div>
        <div
          class="grid w-full grid-cols-1 items-center justify-center gap-4 md:grid-cols-3"
        >
          <div></div>
          <label
            @click="save"
            class="btn w-full border bg-[#1B38CA] px-8 text-white hover:border-[#1B38CA] hover:bg-white hover:text-black"
            >Сохранить</label
          >
          <div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
