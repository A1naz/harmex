<script lang="ts" setup>
const { loggedIn, user } = useUserSession();
const currency = useCurrency();
const drawerContent: any = ref(null);
const favouritesModal = ref(false);
const notificationsModal = ref(false);
const store = useMainStore();

const isOpen = ref(false);
const modalOpen = ref(false);

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

const searchData = ref([]) as any;
const dataLoading = ref(false);
async function search(searchQuery: any) {
  dataLoading.value = true;

  try {
    const { data, error } = await useFetch(`/api/catalog/search`, {
      method: "GET",
      query: {
        type: "Маркетплейсы",
        query: searchQuery || "",
      },
      watch: false,
    });

    if (data.value) {
      searchData.value = data.value;
    } else if (error.value) {
      notify({
        group: "error",
        title: "Ошибка",
        text: error.value.message,
      });
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
  if (
    user?.value &&
    user.value.balance !== undefined &&
    user.value.balance < 0
  ) {
    modalOpen.value = true;
  }
});

const modalStore = useModalStore();
const menuItems = ref([
  "Маркетплейсы",
  "Недвижимость",
  "Медицина",
  "Карты",
  "Услуги",
]);

watch(
  () => modalStore.selectedCatalog,
  () => {
    isOpen.value = false;
  }
);

watch(isOpen, (newValue: boolean) => {
  if (newValue) {
    document.body.style.overflow = "hidden"; // Отключить скролл
  } else {
    document.body.style.overflow = ""; // Включить скролл
  }
});
</script>

<template>
  <div class="drawer lg:drawer-open z-10 h-full">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" />

    <div
      ref="drawerContent"
      style="z-index: 9999"
      class="drawer-content w-full min-h-screen"
    >
      <div
        class="drawerShadow flex w-full items-center gap-2 px-8 sm:px-0 h-[65px] bg-white border border-b border-[#ebebeb] justify-center"
      >
        <div class="lg:px-16 sm:flex hidden w-full relative gap-2">
          <NuxtLinkLocale
            to="/catalog?introductionModal=true"
            class="sm:flex hidden cursor-pointer items-center"
          >
            <nuxt-img src="/img/HARMEX.svg" width="180px" />
          </NuxtLinkLocale>
          <NuxtLinkLocale
            to="/catalog"
            class="btn btn-sm h-[2.5rem] btn-primary text-[#fff] sm:flex text-[16px] ml-0.5 hidden rounded-[10px] pr-8 font-medium"
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
          <MenuSearch
            :data="searchData"
            :loading="dataLoading"
            @search="search"
          />
          <div class="sm:flex hidden mr-12 ml-4">
            <NuxtLinkLocale
              to="/paymenthistory"
              class="btn btn-outline border-base-200 btn-sm h-[2.5rem] text-base-300 rounded-full p-2 bg-white hover:bg-white hover:border-base-200 hover:shadow-xl active:bg-base-300 active:text-white flex justify-center items-center text-xs hover:text-primary"
            >
              <Icon name="solar:wallet-linear" size="24" />
              {{ user?.balance ? currency.format(user.balance) : "" }}

              <div
                class="btn -mt-1 btn-sm btn-circle btn-outline border-[#e6eaec] btn-primary"
                @click="modalStore.payment = true"
              >
                <Icon name="ic:round-plus" size="24" />
              </div>
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
                <span
                  class="badge badge-sm indicator -mt-[8px] py-2 -mr-4 text-white bg-primary font-medium"
                  v-if="store.notificationsLength"
                >
                  {{ store.notificationsLength }}
                </span>
              </div>
              <div
                tabindex="0"
                class="menu dropdown-content z-[2] bg-white p-2 shadow rounded-2xl"
                style="z-index: 1000"
              >
                <NotificationsModal v-model:show="notificationsModal" class="hidden sm:block" />
              </div>
            </div>
            <NuxtLinkLocale
              :to="loggedIn ? '/profile' : '/auth'"
              class="myCustomBtnNavbar ml-2"
            >
              <Icon name="gg:profile" size="24" />
            </NuxtLinkLocale>
          </div>
        </div>
        <div class="sm:hidden h-[100%] pt-2 w-full" style="overflow-y: none">
          <div class="lg:px-16 flex w-full gap-2">
            <NuxtLinkLocale
              to="/catalog?introductionModal=true"
              class="flex items-center sm:hidden -mr-5 -ml-4"
            >
              <nuxt-img src="/img/HARMEX.svg" width="130px" />
            </NuxtLinkLocale>
            <MenuSearch
              :data="searchData"
              :loading="dataLoading"
              @search="search"
            />
            <NuxtLinkLocale
              @click="isOpen = !isOpen"
              to="/catalog"
              class="sm:hidden block ml-2 -mt-1 -mr-2"
            >
              <button
                v-if="!isOpen"
                class="btn btn-circle btn-outline border-[#e5e9eb]"
              >
                <Icon name="ic:round-menu" size="24" />
              </button>
              <button
                v-else
                class="btn btn-circle btn-outline border-[#e5e9eb]"
              >
                <Icon name="ic:round-close" size="24" />
              </button>
            </NuxtLinkLocale>
          </div>
          <div
            v-if="isOpen"
            class="top-[60px] w-full absolute -ml-6"
            style="z-index: 99"
          >
            <div class="bg-white -pt-5 w-full">
              <MenuCatalog
                v-model:selected-type="modalStore.selectedCatalog"
                :items="menuItems"
              />
            </div>
            <div
              class="h-[9999px] bg-opacity-10 backdrop-blur-[3px]"
              style="z-index: 99"
              @click="isOpen = false"
            ></div>
          </div>
        </div>
      </div>
      <!-- <div
        v-if="isOpen"
        class="w-full top-[85px] h-[100%]"
        style="z-index: 99"
      >
        <div class="hero text-3xl mt-10">Тут будут элементы меню</div>
      </div> -->

      <div class="mb-28">
        <slot />
        <FavouritesUserFavourites v-model:show="favouritesModal" />
        <div
          class="sm:hidden fixed bottom-0 left-0 right-0 w-full bg-white"
          style="z-index: 100"
          @click="isOpen = false"
        >
          <ul
            class="menu menu-horizontal w-full flex flex-nowrap justify-between"
          >
            <NuxtLinkLocale
              to="/paymenthistory"
              class="btn btn-outline border-base-200 btn-sm h-[2.5rem] text-base-300 rounded-full p-2 bg-white hover:bg-white hover:border-base-200 hover:shadow-xl active:bg-base-300 active:text-white flex justify-center items-center text-xs hover:text-primary ml-2"
            >
              <Icon name="solar:wallet-linear" size="24" />
              {{ user?.balance ? user.balance + " рублей" : "" }}

              <button
                class="btn -mt-1 btn-sm btn-circle btn-outline border-[#e6eaec] btn-primary"
                @click="modalStore.payment = true"
              >
                <Icon name="ic:round-plus" size="24" />
              </button>
            </NuxtLinkLocale>

            <button
              @click="navigateTo('/catalog')"
              class="myCustomBtnNavbar ml-2 text-base-300"
            >
              <Icon name="iconamoon:home-bold" size="24" />
            </button>

            <div
              class="btn btn-outline border-base-200 btn-sm h-[2.5rem] text-base-300 rounded-full p-2 bg-white hover:bg-white hover:text-black hover:border-base-200 hover:shadow-xl ml-btn ml-2"
              :class="{ 'text-primary': notificationsModal }"
              @click="openNotificationsModal"
            >
              <Icon name="pajamas:notifications" size="24" />
              <span
                class="badge badge-sm indicator -mt-[8px] ml-10 py-2.5 text-white bg-primary font-medium absolute"
                v-if="store.notificationsLength"
              >
                {{ store.notificationsLength }}
              </span>
            </div>

            <NuxtLinkLocale
              :to="loggedIn ? '/profile' : '/auth'"
              class="myCustomBtnNavbar ml-2 text-base-300 mr-2"
            >
              <Icon name="gg:profile" size="24" />
            </NuxtLinkLocale>
          </ul>
        </div>
      </div>
      <!-- Page content here -->
    </div>
    <NotEnoughtBalance :show="modalOpen" @close="modalOpen = false" />
  </div>
  <NotificationsModalMobile v-model:show="notificationsModal" class="block sm:hidden" />
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
