<script setup lang="ts">
const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})
const { width } = useWindowSize()
const emit = defineEmits(['openModal'])
const router = useRouter()

const delIndex = 0
const deliveryId = props.info.delivs[delIndex].delivId
const buyoutuuId = props.info.delivs[delIndex].buyoutId
const article = props.info.article
const productimage = props.info.productimage[delIndex]
const productname = props.info.productname[delIndex]
const updatedAt = props.info.lastUpdated
const size = props.info.delivs[delIndex].sizeparam
const countAllAvailable = props.info.countAvailable
const countSoonAvailable = props.info.countSoon
  ? props.info.countSoon
  : undefined
const sex = props.info.delivs[delIndex].sex

function openBuyout() {
  router.push(`/buyouts/avito?uuid=${buyoutuuId}`)
}
</script>

<template>
  <div class="rounded-lg bg-primary bg-opacity-10 border-none text-base-content">
    <div class="p-4 relative text-xl font-medium flex flex-col gap-2">
      <label
              class="text-[0.6rem] self-start link link-hover sm:text-[0.8rem] lg:text-xs text-gray-500 hover:text-primary truncate lg:hidden "
              @click="openBuyout"
              >#{{ buyoutuuId }}</label
            >
      <div class="flex gap-4">
        
        <a
          class=""
          :href="`https://www.avito.ru/${info.article}`"
          target="_blank"
        >
          <div class="dropdown dropdown-hover ">
            <label tabindex="0">
              <nuxt-img
                width="50"
                class="rounded-lg"
                loading="lazy"
                fit="fill"
                :src="productimage"
              />
            </label>
            <ul
              tabindex="0"
              class="dropdown-content mt-4 p-2 shadow bg-base-100 rounded-box w-52 z-10"
            >
              <nuxt-img
                class="rounded-lg"
                loading="lazy"
                fit="fill"
                :src="productimage"
              />
            </ul>
          </div>
        </a>
        <div class="w-full">
          <div class="flex justify-between flex-wrap">
            <div class="flex gap-2.5">
              <span> {{ productname }} </span>
              <a
                :href="`https://www.avito.ru/${article}`"
                target="_blank"
                class="text-sm mt-1.5 text-primary link link-hover"
              >
                {{ article }}
              </a>
             
            </div>
            <label
              class="text-[0.6rem] self-end link link-hover sm:text-[0.8rem] lg:text-xs text-gray-500 hover:text-primary truncate hidden lg:block "
              @click="openBuyout"
              >#{{ buyoutuuId }}</label
            >
          </div>
          <div class="flex justify-between flex-wrap gap-2 items-center mt-2 mb-2">
            <div class="lg:m-0 text-xs bg-primary bg-opacity-20 border-none text-base-content rounded-md px-4 py-1.5">
              Обновлено 
              {{ $dayjs(updatedAt).locale('ru').format(
                        'D MMMM YYYY HH:mm'
                        ) }}
            </div>
          </div>
        <div class="flex justify-between flex-wrap gap-2 items-center mt-1">
          <div class="flex gap-4 text-sm">
          <div class="text-gray-500">Пол: 
            <span class="rounded-md bg-[#FDD5C9] dark:bg-[#9C4F4F]  px-1 text-base-content py-0.5 ml-1">{{ sex }}</span>
            
          </div>
          <div class="text-gray-500">Размер: 
            <span class="rounded-md bg-[#FDD5C9] dark:bg-[#9C4F4F] px-1 text-base-content py-0.5 ml-1">{{ size === 'none' ? 'Нет' : size }}</span>
          </div>
        </div>

        <div class="flex-col justify-center gap-2 hidden lg:flex">
          <label
            for="review-modal"
            class="btn btn-sm btn-primary bg-opacity-20 border-none text-base-content"
            @click="$emit('openModal', buyoutuuId, deliveryId)"
            >Оставить отзыв (доступно: {{ countAllAvailable }})
          </label>
          <!-- <div v-if="countSoonAvailable" class="text-xs text-warning mx-auto">
            Скоро будет доступно еще {{ countSoonAvailable }}
          </div> -->
        </div>
      </div>
      </div>
      
        
      </div>
      <div class="flex flex-col justify-center gap-2 lg:hidden">
          <label
            for="review-modal"
            class="btn btn-sm btn-primary bg-opacity-20 border-none h-10 text-base-content "
            @click="$emit('openModal', buyoutuuId, deliveryId)"
            >Оставить отзыв (доступно: {{ countAllAvailable }})
          </label>
          <!-- <div v-if="countSoonAvailable" class="text-xs text-warning mx-auto">
            Скоро будет доступно еще {{ countSoonAvailable }}
          </div> -->
        </div>
      
    </div>
  </div>
</template>
