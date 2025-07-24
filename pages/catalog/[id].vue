<script lang="ts" setup>
const { notify } = useNotification();

definePageMeta({ middleware: "auth", layout: "app" });

const { user } = useUserSession();
const route: any = useRoute();
const id = route.params.id;
const loading = ref(true);
const item = ref({} as any);
const store = useMainStore();
// const userInfo = ref([]) as any

// function getUser() {
//   const { data }: any = useFetch('/api/user/getCurrentUser', {
//     method: 'GET',
//     watch: false,
//   })

//   if (data.value) {
//     userInfo.value = data.value
//   }
// }

// if (user.value && user.value.fizFace === false) {
//   getUser()
// }
// getUser()

// const sellLeaders = ref([] as any)

async function getService() {
  loading.value = true;
  const { data }: any = await useFetch("/api/catalog/info", {
    params: {
      slug: id,
    },
  });

  if (data.value) {
    item.value = data.value.service;
    item.value.items = item.value.items.sort((a: any, b: any) => {
      const disabledA = a.disabled ?? false; // Если нет поля disabled, то считать как false
      const disabledB = b.disabled ?? false;
      return disabledA - disabledB;
    });
    loading.value = false;
  }
}
// async function getLeaders() {
//   loading.value = true
//   const { data }: any = await useFetch('/api/catalog/sellLeaders', {
//     params: {
//       slug: id,
//     },
//   })

//   if (data.value) {
//     sellLeaders.value = data.value
//     loading.value = false
//   }
// }

getService();

function navigateToCatalog() {
  navigateTo("/catalog");
}

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
  } catch (err) {
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

    getUserFavourites();
    notify({
     group: "success",
      title: "Избранное обновлено",
    });
  } catch (err) {
    notify({
     group: "error",
      title: "Ошибка при обновлении избранного",
      text: err.message,
    });
  } finally {
    loadingFavourites.value = false;
  }
}


async function getUserFavourites() {
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
    store.client.favourites = response.data.value.favourites;

    if (
      store.client.favourites &&
      store.client.favourites.length === 0
    ) {
      store.client.favourites = response.data.value.services
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
</script>

<template>
  <div class="mx-12 mt-7">
    <div
      class="breadcrumbs text-sm flex justify-between w-full overflow-y-hidden"
    >
      <ul class="text-sm sm:text-base font-medium text-[18px] text-[#909090]">
        <li class="cursor-pointer" @click="navigateToCatalog">
          {{ item.type }}
        </li>
        <li class="text-[#212121]">
          {{ item.name }}
        </li>
      </ul>
    </div>
    <div class="flex flex-wrap overflow-x-auto">
      <div v-if="loading" class="hero mt-20">
        <span class="loading loading-dots loading-lg text-primary" />
      </div>
      <div v-else class="flex flex-wrap gap-x-4 w-full overflow-hidden">
        <div
          v-for="(service, index) in item.items"
          :key="index"
          class="mt-8 sm:w-auto w-full"
        >
          <CatalogServiceCard
            :favourites="favourites"
            :item="item"
            :index="index"
            @set-favourites="setFavourites"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
