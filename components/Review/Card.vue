<script setup lang="ts">
const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  }
})
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
const countSoonAvailable = props.info.countSoon ? props.info.countSoon : undefined
const sex = props.info.delivs[delIndex].sex

function openBuyout() {
  router.push(`/buyouts?uuid=${buyoutuuId}`)
}

</script>

<template>
  <div class="rounded-lg bg-base-200">
    <div class="p-4 relative text-xl font-medium flex flex-col gap-2">
      <div class="flex gap-4">
        <a
          class="" :href="`https://www.wildberries.ru/catalog/${article}/detail.aspx`"
          target="_blank"
        >
          <div class="dropdown dropdown-hover">
            <label tabindex="0"> <nuxt-img
              width="36"
              class="rounded-lg" loading="lazy" fit="fill"
              :src="productimage"
            />
            </label>
            <ul
              tabindex="0"
              class="dropdown-content mt-4 p-2 shadow bg-base-100 rounded-box w-52 z-10"
            >
              <nuxt-img
                class="rounded-lg" loading="lazy" fit="fill"
                :src="productimage"
              />
            </ul>
          </div>
        </a>
        <div class="w-full">
          <div class="flex justify-between flex-wrap">
            <span> {{ productname }}
            </span>
            <label
              class="text-[0.6rem] link link-hover sm:text-[0.8rem] lg:text-xs text-gray-500 hover:text-primary truncate z-10"
              @click="openBuyout"
            >#{{ buyoutuuId }}</label>
          </div>
          <div class="flex justify-between flex-wrap gap-2 items-center">
            <div class="text-sm">
              <a
                :href="`https://www.wildberries.ru/catalog/${article}/detail.aspx`" target="_blank"
                class="text-sm text-secondary link link-hover"
              >
                {{ article }}
              </a>
            </div>

            <div class="mt-2 lg:m-0 text-xs">
              Обновлено {{ defaultDate(updatedAt) }}
            </div>
          </div>
        </div>
      </div>


      <div class="flex justify-between items-center">
        <div class="flex gap-2 text-sm">
          <div>Пол: {{ sex }}</div>
          <div>Размер: {{ size === 'none' ? 'Нет' : size }}</div>
        </div>

        <div class="flex flex-col justify-center gap-2">
            <label
                for="review-modal" class="btn btn-sm btn-primary"
                @click="$emit('openModal', buyoutuuId, deliveryId )"
                >Оставить отзыв (доступно: {{ countAllAvailable }})
                </label>
            <div v-if="countSoonAvailable" class="text-xs text-warning mx-auto"
                >Скоро будет доступно еще {{ countSoonAvailable }}</div>
        </div>
        
      </div>


    </div>
  </div>
</template>
