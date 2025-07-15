<script lang="ts" setup>
definePageMeta({ layout: "app", middleware: "auth" });
defineProps({
  show: { type: Boolean, required: true },
});

const emit = defineEmits(["update:show"]);

const { user } = useUserSession();

const items: Array<{
  title: string;
  icon: string;
  path: string;
  value?: boolean;
}> = [
  {
    title: "Финансы",
    icon: "solar:wallet-money-outline",
    path: "/paymenthistory",
    value: true,
  },
  {
    title: "Партнерка",
    icon: "solar:users-group-rounded-outline",
    path: "/partner",
    value: false,
  },
  {
    title: "Пополнение ",
    icon: "solar:alarm-outline",
    path: "/balance",
    value: false,
  },
  {
    title: "Заказы",
    icon: "solar:bag-4-outline",
    path: "/orders",
    value: false,
  },
  {
    title: "Вывод",
    icon: "solar:plain-outline",
    path: "/withdraw",
    value: false,
  },
  {
    title: "Команда",
    icon: "solar:heart-outline",
    path: "/team",
    value: false,
  },
];

const userFavourites = ref([]) as any;

const quickAccessModal = ref(false);
const accesses = ref([]) as any;
const quickAccesses = ref({}) as any;
const accessesLoading = ref(true);
const { notify } = useNotification();

async function getAccesses() {
  accessesLoading.value = true;
  const response = await useFetch("/api/user/accesses", {
    method: "GET",
    watch: false,
  })
    .catch((err) => {
      notify({
       group: "error",
        title: "Не получить доступы",
        text: err.data.message || err.message,
      });
      accessesLoading.value = false;
    })
    .finally(() => {
      accessesLoading.value = false;
    });
  if (response) {
    accesses.value = response.data.value?.acesses;
    quickAccesses.value = response.data.value?.quickAccesses
      .map((path: string) => items.find((item) => item.path === path))
      .filter(Boolean);
  }
}

if (user.value) {
  getAccesses();
} else {
  quickAccesses.value = items;
  accessesLoading.value = false;
}

async function getFavourites() {
  // loading.value = true
  const response: any = await useFetch("/api/user/favourites", {
    method: "GET",
    watch: false,
  }).catch((err) => {
    notify({
     group: "error",
      title: "Не получить доступы",
      text: err.data.message || err.message,
    });
    // loading.value = false
  });

  if (response) {
    userFavourites.value = response.data.value.favourites;

    if (
      userFavourites &&
      userFavourites.value &&
      userFavourites.value.length === 0
    ) {
      userFavourites.value = response.data.value.services
        .map((item: any) => ({
          path: `/catalog/${item.slug}`,
          title: item.name,
          image: item.mainImage,
          disabled: item.disabled,
        }))
        .filter((item: any) => !item.disabled);
    }
  }

  // loading.value = false
}
getFavourites();

function closeModal() {
  emit("update:show", false);
}
</script>

<template>
  <input type="checkbox" id="selectUser" :checked="show" class="modal-toggle" />
  <div class="modal z-[9999] cursor-pointer w-full" @click="closeModal">
    <div
      class="modal-box w-full cursor-auto rounded-[8px] border border-[#dee2e6] px-[10px] py-[36px] sm:w-9/12 sm:max-w-2xl sm:px-[58px]"
      @click.stop
    >
      <form method="dialog">
        <label
          class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2 bg-[#e5e5e5]"
          @click="closeModal"
        >
          ✕
        </label>
      </form>

      <div class="w-full rounded-xl pt-5">
        <div class="flex flex-wrap justify-center">
          <div class="w-full font-semibold text-[20px] text-center">
            Избранное
          </div>
          <Nuxt-link
            @click="closeModal"
            v-for="item in userFavourites"
            :key="item.id"
            :to="item.path"
            class="bg-white text-[14px] w-[110px] h-[125px] ml-2 mt-5 rounded-xl mb-2"
          >
            <div
              class="flex justify-center h-[75px] w-full rounded-xl"
              :style="{ backgroundColor: item.backgroundColor }"
            >
              <div
                class="flex items-center justify-center font-medium text-center text-white h-auto w-auto"
              >
                {{ item.name ? item.name : item.title }}
              </div>
              <!-- <NuxtImg
                :src="item.image"
                width="95px"
                height="75px"
                class="rounded-xl"
              /> -->
            </div>
            <div class="text-sm font-medium text-center mt-0.5">
              {{ item.title }}
            </div>
          </Nuxt-link>
          <div v-if="!items.length" class="hero">
            <div
              class="hero-content text-center flex justify-center items-center h-80"
            >
              <div class="max-w-md">
                <h1 class="text-3xl font-bold">Здесь ничего нет</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
