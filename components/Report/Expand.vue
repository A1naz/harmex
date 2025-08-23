<script setup lang="ts">
const props = defineProps({
  info: {
    type: Object as any,
    required: true,
  },
  state: {
    type: Boolean,
  },
});
const route = useRoute();
const emit = defineEmits(["openModal"]);
const opened = ref();
const selectedMP = ref("");
const config = useRuntimeConfig();

const { notify } = useNotification();

function openBuyout() {
  navigateTo(`/wildberries/buyouts/?uuid=${props.info.buyout.uuid}`);
}
onMounted(async () => {
  selectedMP.value = route.path.split("/")[2];
  opened.value = props.state;
});
watch(
  () => props.state,
  (newState) => {
    opened.value = newState;
  }
);

</script>

<template>
  <div
    class="collapse collapse-arrow bg-[#f7e6e2] rounded-box z-0"
    :class="{ 'text-primary': opened }"
  >
    <input v-model="opened" type="checkbox" />
    <div class="collapse-title relative text-xl font-medium">
      <div class="flex gap-4">
        <nuxt-img
          fit="fill"
          :src="info.buyout.image"
          width="50"
          loading="lazy"
          class="rounded-lg transition-opacity ease-in-out duration-200 hidden lg:block"
        />
        <div class="w-full">
          <div class="flex justify-between flex-wrap">
            <span class="text-base-content text-[16px]">
              {{ info.buyout.name }}
            </span>
            <label
              class="text-[0.6rem] link link-hover sm:text-[0.8rem] lg:text-xs text-base-content font-normal hover:text-primary truncate z-10"
              @click="openBuyout"
              >#{{ info.buyout.uuid }}</label
            >
          </div>
          <div class="flex flex-wrap gap-2 items-center mt-1">
            <!-- <div
              class="mt-2 lg:m-0 text-xs font-normal text-base-content bg-primary bg-opacity-20 rounded-md px-5 py-0.5"
            >
              Дата выкупа: {{ $dayjs(info.date).format('D MMMM HH:mm') }}
            </div> -->
            <div
              v-if="selectedMP"
              class="rounded-md font-normal my-auto p-0.5 text-sm text-primary"
            >
              {{ info.buyout.article }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="collapse-content">
      <div class="flex flex-col gap-4">
        <div class="screenshots flex flex-col gap-2">
          <div class="images flex gap-6 flex-wrap max-w-full">
            <div v-for="(image, index) of info.screenshots" :key="index">
              <nuxt-img
                v-if="image"
                loading="lazy"
                fit="contain"
                alt=""
                :src="
                  image.includes('yandex') || image.includes('data:image')
                    ? image
                    : config.public.DOMAIN_API_IMAGES_URL + image
                "
                class="rounded-lg object-contain w-full lg:w-64"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.collapse-arrow .collapse-title:after {
  height: 0.7rem;
  width: 0.7rem;
}
</style>
