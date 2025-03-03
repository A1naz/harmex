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
});
const emit = defineEmits(["openModal"]);
const { width } = useWindowSize();
const router = useRouter();

const delIndex = 0;
const deliveryId = props.info.delivs[delIndex].delivId;
const buyoutuuId = props.info.delivs[delIndex].buyoutId;
const article = props.info.article;
const productimage = props.info.productimage[delIndex];
const productname = props.info.productname[delIndex];
const updatedAt = props.info.lastUpdated;
const size = props.info.delivs[delIndex].sizeparam;
const countAllAvailable = props.info.countAvailable;
const countSoonAvailable = props.info.countSoon
  ? props.info.countSoon
  : undefined;
const sex = props.info.delivs[delIndex].sex;

function openBuyout() {
  router.push(`/ym/buyouts?uuid=${buyoutuuId}`);
}
</script>

<template>
  <div class="card bg-base-100 shadow-lg min-w-[214px]">
    <div
      class="card-body flex-shrink-0 flex flex-col justify-start gap-4 p-3 relative"
    >
      <div class="flex gap-3 w-full truncate mt-6">
        <div
          class="flex-none"
          style="
            width: 80px;
            height: 124px;
            margin-top: auto;
            margin-bottom: auto;
          "
        >
          <nuxt-img
            class="rounded-xl h-full"
            width="120"
            height="150"
            format="webp"
            loading="lazy"
            :src="productimage || '/logo/logocolor.svg'"
          />
        </div>
        <div class="flex flex-col w-full">
          <div class="flex flex-col gap-1.5">
            <div class="flex gap-2">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Товар:
              </span>
              <div
                class="rounded-md py-0 px-2 text-sm text-[0.725rem] text-primary"
              >
                <a
                  :href="`https://market.yandex.ru/pr/${article}`"
                  target="_blank"
                  class="link link-hover"
                >
                  {{ info.article }}
                </a>
              </div>
            </div>

            <div class="flex gap-2 w-2/3">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Название:
              </span>
              <div class="truncate text-[0.9rem] text-bold">
                {{ productname }}
              </div>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Статус:
              </span>
              <div class="rounded-md py-0 px-2 text-sm text-[0.725rem]">
                Доступно
              </div>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Площадка:
              </span>
              <div class="rounded-md py-0 px-2 text-sm text-[0.725rem]">
                Yandex Market
              </div>
            </div>
            <div class="flex gap-2">
              <span class="text-sm text-[0.725rem] text-gray-500 my-auto"
                >Количество:
              </span>
              <div class="rounded-md py-0 px-2 text-sm text-[0.725rem]">
                {{ countAllAvailable }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <label
        for="review-modal"
        class="btn btn-sm h-[2.5rem] mt-2 text-[20px] rounded-2xl font-normal text-white btn-primary opacity-80 hover:opacity-100"
        @click="$emit('openModal', buyoutuuId, deliveryId)"
      >
        Создать заявку
      </label>
    </div>
  </div>
</template>
