<script lang="ts" setup>
const { loggedIn, user } = useUserSession();
const currency = useCurrency();
const drawerContent: any = ref(null);
const favouritesModal = ref(false);
const notificationsModal = ref(false);
const store = useMainStore();

const isOpen = ref(false)
const modalOpen = ref(false)

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

const searchData = ref([]) as any;
const dataLoading = ref(false);
async function search(searchQuery: any) {
  dataLoading.value = true;

  try {
    const response: any = await $fetch(`/api/catalog/search`, {
      method: "GET",
      query: {
        type: "Маркетплейсы",
        searchQuery: searchQuery || "",
      },
      watch: false,
    });

    if (response.status === "ok") {
      searchData.value = response.services;
    } else {
      console.error(response.error);
      searchData.value = [];
    }
  } catch (error) {
    console.error("Ошибка при запросе:", error);
    searchData.value = [];
  } finally {
    dataLoading.value = false;
  }
}

function openNotificationsModal() {
  if (notificationsModal.value) {
    notificationsModal.value = false;
  } else {
    setTimeout(() => {
      notificationsModal.value = !notificationsModal.value;
    }, 50);
  }
}
onMounted(() => {
  if (user?.value && user.value.balance !== undefined && user.value.balance < 0) {
    modalOpen.value = true;
  }
})
</script>

<template>
  <div class="drawer lg:drawer-open z-10 h-full">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" />

    <div
      ref="drawerContent"
      style="z-index: 9999"
      class="drawer-content w-full"
    >
      <div
        class="drawerShadow flex w-full items-center gap-2 px-8 sm:px-0 h-[65px] bg-white border border-b border-[#ebebeb] justify-center"
      >
        <div class="lg:px-16 flex w-full relative gap-2">
          <NuxtLinkLocale
            to="/catalog?introductionModal=true"
            class="sm:flex hidden cursor-pointer items-center"
          >
            <nuxt-img src="/img/HARMEX.svg" width="150px" />
          </NuxtLinkLocale>
          <NuxtLinkLocale
            to="/catalog"
            class="btn btn-sm h-[2.5rem] btn-primary text-[#fff] sm:flex text-[16px] ml-2 hidden rounded-[10px] pr-8 font-medium"
          >
            <label
              :class="{ opened: isOpen }"
              aria-label="Main Menu"
              class="cursor-pointer -mr-2 -ml-2"
            >
              <svg width="50" height="30" viewBox="0 0 100 100">
                <path
                  class="line line1"
                  d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058"
                />
                <path class="line line2" d="M 20,50 H 80" />
                <path
                  class="line line3"
                  d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942"
                />
              </svg>
            </label>
            Каталог
          </NuxtLinkLocale>

          <NuxtLinkLocale
            to="/"
            class="flex items-center sm:hidden -mr-2 -ml-1.5"
          >
            <nuxt-img src="/img/H.svg" width="30px" />
          </NuxtLinkLocale>
          <MenuSearch
            :data="searchData"
            :loading="dataLoading"
            @search="search"
          />
          <div class="sm:flex hidden ml-5">
            <NuxtLinkLocale
              to="/paymenthistory"
              class="btn btn-outline border-base-200 btn-sm h-[2.5rem] text-base-300 rounded-full p-2 bg-white hover:bg-white hover:border-base-200 hover:shadow-xl active:bg-base-300 active:text-white flex justify-center items-center text-xs hover:text-primary"
            >
              <Icon name="solar:wallet-linear" size="24" />
              {{ user?.balance ? currency.format(user.balance) : "" }}
            </NuxtLinkLocale>
            <button
              @click="favouritesModal = true"
              class="myCustomBtnNavbar ml-2"
            >
              <Icon name="tabler:heart" size="24" />
            </button>
            <div
              class="dropdown dropdown-end bg-white"
              :class="{ 'dropdown-open': notificationsModal }"
            >
              <div
                class="btn btn-outline border-base-200 btn-sm h-[2.5rem] text-base-300 rounded-full p-2 bg-white hover:bg-white hover:text-black hover:border-base-200 hover:shadow-xl ml-btn ml-2"
                :class="{ 'text-primary': notificationsModal }"
                @click="openNotificationsModal"
              >
                <Icon name="pajamas:notifications" size="24" />
                <span class="badge badge-sm indicator -mt-[8px] -mr-4 text-primary font-medium" v-if="store.notificationsLength">
                 {{ store.notificationsLength }}
                </span>
              </div>
              <div
                tabindex="0"
                class="menu dropdown-content z-[2] bg-white p-2 shadow rounded-2xl"
                style="z-index: 1000"
              >
                <NotificationsModal v-model:show="notificationsModal" />
              </div>
            </div>
            <NuxtLinkLocale
              :to="loggedIn ? '/profile' : '/auth'"
              class="myCustomBtnNavbar ml-2"
            >
              <Icon name="gg:profile" size="24" />
            </NuxtLinkLocale>
          </div>
          <NuxtLinkLocale
            to="/catalog"
            class="btn btn-sm h-[2.5rem] bg-[#7209b7] hover:bg-[#9235ff] text-[#fff] flex text-[16px] ml-2 rounded-[10px] pr-8 font-medium sm:hidden justify-center items-center"
          >
            <label
              :class="{ opened: isOpen }"
              aria-label="Main Menu"
              class="cursor-pointer -mr-8 -ml-4 sm:hidden"
            >
              <svg width="50" height="30" viewBox="0 0 100 100">
                <path
                  class="line line1"
                  d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058"
                />
                <path class="line line2" d="M 20,50 H 80" />
                <path
                  class="line line3"
                  d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942"
                />
              </svg>
            </label>
          </NuxtLinkLocale>
        </div>
      </div>
      <div
        v-if="isOpen"
        class="w-full top-[85px] h-[100%] bg-white"
        style="z-index: 99"
      >
        <div class="hero text-3xl mt-10">Тут будут элементы меню</div>
      </div>

      <div class="">
        <slot />
        <FavouritesUserFavourites v-model:show="favouritesModal" />
      </div>
      <!-- Page content here -->
    </div>
    <NotEnoughtBalance :show="modalOpen" @close="modalOpen = false" />
  </div>
</template>

<style scoped>
.b24-widget-button-position-bottom-right {
  left: 35px;
}

.line {
  fill: none;
  stroke: white;
  stroke-width: 6;
  transition: stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1),
    stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.line1 {
  stroke-dasharray: 60 207;
  stroke-width: 6;
}

.line2 {
  stroke-dasharray: 60 60;
  stroke-width: 6;
}

.line3 {
  stroke-dasharray: 60 207;
  stroke-width: 6;
}

.opened .line1 {
  stroke-dasharray: 90 207;
  stroke-dashoffset: -134;
  stroke-width: 6;
}

.opened .line2 {
  stroke-dasharray: 1 60;
  stroke-dashoffset: -30;
  stroke-width: 6;
}

.opened .line3 {
  stroke-dasharray: 90 207;
  stroke-dashoffset: -134;
  stroke-width: 6;
}

.drawerShadow {
  box-shadow: 0px 2px 10px rgb(186, 189, 220);
}
</style>
