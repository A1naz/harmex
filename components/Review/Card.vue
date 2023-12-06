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

const deliveryId = props.info.delivs[0].delivId
const buyoutuuId = props.info.delivs[0].buyoutId
const article = props.info.article
const productimage = props.info.productimage[0]
const productname = props.info.productname[0]
const updatedAt = props.info.lastUpdated
const size = props.info.delivs[0].sizeparam
const count = props.info.count


const genderMap = new Map<string, string>([
    ['female', 'Женский'],
    ['male', 'Мужской'],
])

const sex = props.info.delivs[0].gender.map( (g: string) => {
    let gen = genderMap.get(g.toLowerCase())
    if (gen) return gen
    return 'Нет'
})
const sexFormated = sex[0]

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
          <div>Пол: {{ sexFormated }}</div>
          <div>Размер: {{ size === 'none' ? 'Нет' : size }}</div>
        </div>
        <label
          for="review-modal" class="btn btn-sm btn-primary"
          @click="$emit('openModal', buyoutuuId, deliveryId)"
        >Оставить отзыв (доступно: {{ count }})
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
