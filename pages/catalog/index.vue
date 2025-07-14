<script lang="ts" setup>
definePageMeta({ middleware: "auth", layout: "app" });

const { user } = useUserSession();

const { notify } = useNotification();
const menuItems = ref([
  "Маркетплейсы",
  "Недвижимость",
  "Медицина",
  "Карты",
  "Стриминг",
  "Блоггинг",
  "Услуги", 
]);
const modalStore = useModalStore();
const introductionModal = ref(false);
const route = useRoute();
const socialNetworks = ref([]);
const loading = ref(true);

async function getServices() {
  loading.value = true;
  const { data }: any = await useFetch("/api/catalog/get", {
    method: "GET",
    params: {
      type: modalStore.selectedCatalog,
    },
  });

  if (data.value) {
    socialNetworks.value = data.value.services;
  }
  loading.value = false;
}

getServices();
const bouncedGet = useDebounceFn(getServices, 250);

const favourites = ref([]) as any;
const loadingFavourites = ref(true);
async function getFavourites() {
  try {
    const response: any = await $fetch("/api/user/favourites", {
      method: "GET",
    });
    if (response?.favouritesPaths) {
      favourites.value = response.favouritesPaths;
    }
  } catch (err: any) {
    notify({
      group: "error",
      title: "Ошибка загрузки избранного",
      text: err.message,
    });
  } finally {
    loadingFavourites.value = false;
  }
}
getFavourites();

async function setFavourites(path: string) {
  if (!user.value) {
    notify({
      group: "error",
      title: "Необходима авторизация",
    });
    return;
  }
  try {
    loadingFavourites.value = true;
    if (favourites.value.includes(path)) {
      favourites.value = favourites.value.filter(
        (item: string) => item !== path
      );
    } else {
      if (favourites.value.length >= 10) {
        favourites.value.shift();
      }
      favourites.value.push(path);
    }

    await $fetch("/api/user/setFavourite", {
      method: "POST",
      body: {
        favourites: favourites.value,
      },
    });
    notify({
      group: "success",
      title: "Избранное обновлено",
    });
  } catch (err: any) {
    notify({
      group: "error",
      title: "Ошибка при обновлении избранного",
      text: err.message,
    });
  } finally {
    loadingFavourites.value = false;
  }
}

const voteLoading = ref(false);
async function voteForMp(slug: string) {
  if (!user.value) {
    notify({
      group: "error",
      title: "Необходима авторизация",
    });
    return;
  }
  voteLoading.value = true;
  const response: any = await $fetch("/api/catalog/vote", {
    method: "POST",
    query: {
      slug,
    },
  });
  if (response.status === "ok") {
    notify({
      group: "success",
      title: "Успешно",
      text: "Вы успешно проголосовали за добавление маркетплейса",
    });
  } else {
    notify({
      group: "error",
      title: "Ошибка",
      text: response.message,
    });
  }
  voteLoading.value = false;
}

const isChecked = ref(false);

function toggleCheckbox() {
  isChecked.value = !isChecked.value;
  localStorage.setItem("welcomeModal", isChecked.value.toString());
}

onMounted(() => {
  const storedValue = localStorage.getItem("welcomeModal");

  isChecked.value = storedValue === "true";

  if ((storedValue && !isChecked.value) || !storedValue) {
    introductionModal.value = true;
  }
  // if (route.query.introductionModal) {
  //   introductionModal.value = true
  // }
});

watch(
  () => modalStore.selectedCatalog,
  () => {
    getServices();
  }
);
</script>

<template>
  <div class="flex pt-4">
    <div class="left-menu sm:block sm:ml-3 mr-6 -ml-10 hidden">
      <CatalogLeftMenu
        v-model:selected-type="modalStore.selectedCatalog"
        :items="menuItems"
        v-model:introduction-modal="introductionModal"
        v-model:is-checked="isChecked"
      />
    </div>
    <!-- <div v-if="loading" class="hero -mt-80 text-[#bdc8fc]">
      <span class="loading loading-dots loading-lg text-primary" />
    </div> -->
    <div class="md:px-10 px-0 sm:mr-0 mr-3 w-full mb-12">
      <div class="flex justify-between">
        <div class="breadcrumbs text-sm ml-3 mb-5">
          <ul class="font-medium text-[18px] mt-0.5 text-[#909090]">
            <li v-if="!loading" class="cursor-pointer">
              {{ modalStore.selectedCatalog }}
            </li>
          </ul>
        </div>
        <div
          class="font-medium text-[18px] text-[#909090] cursor-pointer mt-1.5 mr-3"
          @click="introductionModal = true"
        >
          Введение
          <Icon name="material-symbols:info-outline-rounded" size="24" class="ml-1 -mb-1" />
        </div>
      </div>
      <CatalogContent
        v-if="!loading && modalStore.selectedCatalog !== 'Услуги'"
        :items="socialNetworks"
        :favourites="favourites"
        @vote="voteForMp"
        @set-favourites="setFavourites"
      />
      <CatalogServices
        v-if="!loading && modalStore.selectedCatalog === 'Услуги'"
        :favourites="favourites"
        :items="socialNetworks"
        @vote="voteForMp"
        @set-favourites="setFavourites"
      />
    </div>
    <IntroductionModal
      :show="introductionModal"
      :is-checked="isChecked"
      @close="introductionModal = false"
      @checkbox-toggle="toggleCheckbox"
    />
  </div>
</template>

<style scoped>
.left-menu {
  width: 240px;
}
</style>
