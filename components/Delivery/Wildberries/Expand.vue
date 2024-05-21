<script setup lang="ts">
const theme = useColorMode()
const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  state: {
    type: Boolean,
  },
  index: {
    type: Number,
  }
})
const emit = defineEmits(['openModal', 'openStatusModal', 'openPenaltyModal'])
const currency = useCurrency()
const store = useMainStore()
const router = useRouter()
const opened = ref()
const qrCode = ref(null)

function openBuyout() {
  router.push(`/buyouts/wildberries?uuid=${props.info.uuid}`)
}
onMounted(async () => {
  opened.value = props.state
})
watch(() => props.state, (newState) => {
  opened.value = newState
})
function daysToPenalty(statusdelivery: any[]) {
  const item = statusdelivery.find(item => item.status === 'Готов к выдаче')
  if (!item)
    return

  const updatedAt = new Date(item.date)
  const penaltyDay = new Date(updatedAt.getTime() + (7 * 24 * 60 * 60 * 1000))
  const now = new Date()
  const timeLeft = penaltyDay.getTime() - now.getTime()
  // eslint-disable-next-line max-statements-per-line
  if (timeLeft < 0) { return 'Получение со штрафом!' }
  else {
    const days = Math.round(timeLeft / 1000 / 60 / 60 / 24)
    return `До штрафа осталось: ${days} д.`
  }
}
</script>

<template>
<div class="collapse collapse-arrow border bg-base-200 rounded-box z-0 overflow-hidden border-[#eff0ff] dark:border-primary dark:border-opacity-10 "
>
    
    <input v-model="opened"  type="checkbox">
    
    <div class="collapse-title relative text-xl font-medium bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10 "
    >
        <div class="flex gap-4">
            <nuxt-img
                fit="contain" :src="info?.productimage" width="36"
                loading="lazy"
                class="rounded-lg transition-opacity ease-in-out duration-200 hidden lg:block"
                />

            <div class="w-full">

                
                <div class="flex justify-between flex-wrap lg:flex-nowrap gap-1">
                    <div class="flex gap-1">
                        <span> 
                            Доставка
                        </span>
                        <div v-if="info.currentstatus === 'Готов к выдаче' && info.statusdelivery.length > 1 " 
                        class="text-s link bg-[#FF6666] dark:bg-red-500 link-hover rounded-full my-auto max-h-6 font-normal text-xs flex gap-1 text-white z-20"                            @click="emit('openPenaltyModal')"
                        style="min-width: fit-content;"
                            >
                            <IconCSS name="ph:warning-circle-light" size="25" />
                            
                            <span class="mr-1 my-auto">{{ daysToPenalty(info.statusdelivery) }}</span>
                        </div>
                    </div>
                    
                    <label
                        class="text-[0.6rem] link link-hover sm:text-[0.8rem] lg:text-xs hover:text-primary break-all z-10"
                        @click="openBuyout"
                        style="white-space: nowrap;"
                        >#{{info.uuid }}
                    </label>
                </div>
                

                <div class="flex justify-between flex-wrap gap-1 items-center">
                    <div class="flex gap-2">
                        <button 
                            class="text-xs font-normal btn btn-xs btn-primary bg-[#d3d6ff] dark:bg-primary dark:bg-opacity-20 border-none text-base-content rounded-md z-10 mt-1 px-3"
                            @click="emit('openStatusModal', info.statusdelivery)
                            ">
                            <span class="font-semibold"> Статус:</span>
                            <span>{{ info.currentstatus }} </span>
                        </button>
                        <div class="dark:bg-base-300 bg-[#d8d8d8] rounded-md text-sm font-normal my-auto p-0.5 mt-1 px-2">
                            Wildberries
                        </div>
                    </div>
                    
                    
                    <div class="mt-2 lg:m-0 text-xs text-primary font-normal"
                    
                    >
                        Обновлено 
                        {{ 
                        $dayjs(info.updatedAt).locale('ru').format(
                        'D MMMM YYYY HH:mm'
                        ) }}
                    </div>
                </div>

            </div>

        </div>
    </div>


    <div class="collapse-content bg-[#eff0ff] dark:bg-primary dark:bg-opacity-10"
    >
        <div class="product flex flex-col gap-4 lg:gap-8 flex-wrap">
            <div class="flex flex-col">
                <div >
                    <!-- <div class="text-sm text-gray-500 ">
                        Название
                    </div> -->
                    <div >
                        {{ info.productname }}
                    </div>
                </div>
                <div>
                <!-- <div class="text-sm text-gray-500">
                    Артикул
                </div> -->
                <a
                    :href="`https://www.wildberries.ru/catalog/${info.article}/detail.aspx`" target="_blank"
                        class=" text-primary link link-hover text-sm"
                        >
                        {{ info.article }}
                    </a>
                </div>

                
            </div>
            <div class="flex gap-10">
                <div class="flex">
                    <div class="text-sm text-gray-500">
                        <span>Цена: </span>
                        
                        <span class="ml-2 rounded-md bg-success p-1 text-base-content">{{ currency.format(info.pricebuy) }}</span>
                    </div>
                    
                </div>

                <div class="flex">
                    <div class="text-sm text-gray-500">
                        <span>Размер: </span>
                        
                        <span class="ml-2 rounded-md bg-[#ececec] dark:bg-base-300 dark:bg-opacity-30  p-1 text-base-content">{{ info.size === 'none' ? 'Не указан' : info.size }}</span>
                    </div>
                    
                </div>

                <!-- <div class="flex">
                    <div class="text-sm text-gray-500">
                        <span>Размер: </span>
                        
                        <span class="ml-2 rounded-md bg-[#ececec] dark:bg-base-300 dark:bg-opacity-30 p-1 text-base-content">{{ '%' }}</span>
                    </div>
                    
                </div> -->
            </div>
            

        </div>

        <div class="divider my-2" />

        <div class="receipt flex gap-4 lg:gap-4 items-center flex-wrap">

            <div class="flex gap-2 md:gap-10 lg:gap-10">
                <div class="lg:mr-10 text-primary text-xs">
                    <div class="text-sm text-gray-500 mb-1">
                        Получатель:
                    </div>
                    {{ info.recipient }} {{ info.recipientphone }}
                    
                </div>

                
                <div class="text-primary text-xs">
                    <div class="text-sm text-gray-500 mb-1">
                        Код получения:
                    </div>
                    {{ info?.receiptcode ? info?.receiptcode : 'Товар не доставлен' }}
                </div>
                
                <div v-if="info.receiptcodeqr" class="flex justify-end">
                <label
                    for="qr-modal" class="btn btn-primary btn-xs flex bg-opacity-20 border-opacity-5 text-primary rounded-md gap-2" @click="emit('openModal', parseInt(info.receiptcode), info.receiptcodeqr, info)"
                    >
                    <Icon name="material-symbols:qr-code" size="24" /> <span class="hidden lg:block">QR-код</span>
                </label>
            </div>
            </div>
            
            <div class="w-76">
                <div class="text-sm text-gray-500">
                    Адрес:
                </div>
                <a
                    target="_blank" class="text-base-content text-xs link link-hover w-52 lg:w-76 break-all"
                    :href="`https://yandex.ru/maps/?mode=search&text=${info.point}`"
                    >
                    {{ info.point }}
                </a>
            </div>

        </div>
        
    </div>

</div>
</template>

<style scoped>
</style>
