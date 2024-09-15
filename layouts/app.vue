<script lang="ts" setup>
const storeMain = useMainStore()
const colorMode = useColorMode()
const { width } = useWindowSize()

const theme = ref('light')
const route = useRoute()
const { signOut, status } = useAuth()
const currency = useCurrency()

async function deleteToken(uuid: string) {
  //@ts-ignore
  const { data, error }: any = await useFetch('/api/token/deleteToken')
}

async function reloginCycle() {
  const { data, error }: any = await useFetch('/api/token/reLoginCycle', {
    method: 'GET',
  })
  if (data.value) {
    if (data.value.status == 'logined') {
      return 'logined'
    } else {
      return 'ol'
    }
  }
}

async function logout() {
  await deleteToken(storeMain.client.uuid)
  const loginStatus = await reloginCycle()

  if (loginStatus !== 'logined') {
    await signOut({
      callbackUrl: '/auth',
    })
  } else {
    location.reload()
  }
  storeMain.setClient()
}

const drawerContent: any = ref(null)

const showUpButton = computed(() => {
  return scrollTop.value > 200
})

const scrollTop = ref(0)
const handleScroll = (event: any) => {
  scrollTop.value = event.target.scrollTop
}

function scrollToTop() {
  drawerContent.value.scrollTop = 0
}

const MenuIcon1: any = ref(null)
const MenuIcon2: any = ref(null)
const isOpen = ref(false)

function toggleMenu() {
    isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="drawer lg:drawer-open z-10 h-fullX">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" />

    <div
      ref="drawerContent"
      style="z-index: 9999"
      @scroll="handleScroll"
      class="drawer-content w-full overflow-hidden scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin"
    >
      <div
        class="drawerShadow items-center gap-2 p-4 h-[75px] bg-[#f5f7ff] justify-between"
      >
        <div class="lg:mx-[14%] flex">
          <nuxt-img
            src="/img/SARAFAN.svg"
            width="150px"
            class="sm:block hidden"
          />
          <nuxt-img
            src="/img/S.svg"
            width="30px"
            class="block sm:hidden -mr-2 -ml-1.5"
          />

          <button
            @click="toggleMenu"
            class="btn bg-[#7209b7] hover:bg-[#9235ff] text-[#fff] sm:flex text-[16px] ml-8 hidden rounded-[10px] pr-8 font-medium"
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
          </button>
          <label class="flex items-center gap-2 w-full ml-4">
            <input
              type="text"
              placeholder="Поиск по услуге, категории, функционалу и справочнику"
              class="input input-bordered w-full border-[#1B38CA] bg-white"
            />
            <Icon
              name="mynaui:search"
              size="25"
              class="-ml-12 bg-white rounded-lg"
            />
          </label>
          <div class="sm:flex mr-10 hidden">
            <button
              class="btn btn-outline btn-[#1b38ca] hover:bg-[#1a36c3] ml-4 border-[#1b38ca] rounded-xl bg-white"
            >
              <Icon name="fluent:shopping-bag-24-regular" size="24"> </Icon>
            </button>
            <button
              class="btn btn-outline btn-[#1b38ca] hover:bg-[#1a36c3] ml-4 border-[#1b38ca] rounded-xl bg-white"
            >
              <Icon name="solar:wallet-linear" size="24"> </Icon>
            </button>
            <button
              class="btn btn-outline btn-[#1b38ca] hover:bg-[#1a36c3] ml-4 border-[#1b38ca] rounded-xl bg-white"
            >
              <Icon name="gg:profile" size="24"></Icon>
            </button>
          </div>
          <button
            @click="toggleMenu"
            class="btn bg-[#7209b7] hover:bg-[#9235ff] text-[#fff] flex text-[16px] ml-2 rounded-[10px] pr-8 font-medium sm:hidden"
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
          </button>
        </div>
      </div>
      <div
        v-if="isOpen"
        class="w-full absolute top-[85px] h-[100%] bg-white"
        style="z-index: 99"
      >
        <div class="hero text-3xl mt-10">Тут будут элементы меню</div>
      </div>
      <div class="px-4">
        <slot />
      </div>
      <!-- Page content here -->
    </div>
  </div>
</template>

<style scoped>
.b24-widget-button-position-bottom-right {
  left: 35px;
}

.menu {
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  padding: 0;
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
