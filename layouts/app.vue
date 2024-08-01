<script lang="ts" setup>
const storeMain = useMainStore()
const colorMode = useColorMode()
const { width } = useWindowSize()

const mpStore = useMPStore()

const theme = ref('light')
const route = useRoute()
const { signOut } = useAuth()
const currency = useCurrency()
const lightMode = ref(colorMode.value === 'dark')
function changeTheme() {
  if (colorMode.value === 'light') colorMode.preference = 'dark'
  else colorMode.preference = 'light'
}

async function deleteToken(uuid: string) {
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

onMounted(() => {
  theme.value = localStorage.getItem('theme') || 'light'
})

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

const isInfoModal = ref<boolean>(false)
function toggleInfoModal() {
  isInfoModal.value = !isInfoModal.value
}

const statusText = computed(() => {
  if (route.path.startsWith('/profile')) {
    return 'Профиль'
  } else if (route.path.startsWith('/tariffs')) {
    return 'Тарифы'
  } else if (route.path.startsWith('/productlikes')) {
    return 'Лайки'
  } else {
    return storeMain.client.mmenuItems
      .flatMap((section) => section.items)
      .find((item) => route.path.startsWith(item.path))?.title
  }
})

// const menuConditions = ref(storeMain.client.mmenuItems)

// onMounted(() => {
//   menuConditions.value.map((section: any) => {
//     for (const item of section.items) {
//       if (item.path == '/productlikes' || item.path == '/delivery' || item.path == '/buyouts' || item.path == '/questions' || item.path == '/cart') {
//         item.path = mpStore.selectedMP
//           ? item.path + '/' + mpStore.selectedMP
//           : item.path + '/wildberries'
//       }
//     }
//     return section
//   })
// })
</script>

<template>
  <div class="drawer lg:drawer-open z-10">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" />

    <div
      ref="drawerContent"
      @scroll="handleScroll"
      class="drawer-content w-full overflow-auto h-[100vh] scrollbar-thumb-primary scrollbar-track-base-200 scrollbar-thin bg-base-200"
      :class="{ 'overflow-hidden': route.path === '/guide' }"
    >
      <Transition name="bounce">
        <Icon
          name="mdi-transfer-up"
          class="scroll-to-top btn btn-primary btn-circle p-1.5 fixed bottom-[13px] z-20"
          @click="scrollToTop"
          v-if="showUpButton"
        />
      </Transition>
      <div class="w-full navbar bg-base-100 lg:hidden">
        <div class="flex-none justify-between w-full">
          <label for="my-drawer" class="btn btn-square btn-ghost drawer-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block w-6 h-6 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <InfoButton @openModal="toggleInfoModal" />
        </div>
        <div v-if="width > 1024" class="flex-1 justify-center mr-12">
          <Logo />
        </div>
      </div>
      <div
        class="hidden items-center gap-2 p-4 justify-between bg-base-100 lg:flex"
      >
        <h1 class="text-2xl font-bold">{{ statusText }}</h1>
        <InfoButton @openModal="toggleInfoModal" />
      </div>
      <div class="px-4">
        <slot />
      </div>
      <!-- Page content here -->
    </div>
    <div class="drawer-side z-100 shadow-sm">
      <label for="my-drawer" class="drawer-overlay" />
      <ul
        class="menu w-72 z-100 h-full text-base-content flex-nowrap overflow-auto overflow-x-hidden scrollbar-none bg-base-100"
      >
        <!-- Sidebar content here -->
        <div class="hidden title w-full justify-center p-2 xl:flex">
          <Logo />
        </div>
        <div class="card m-4 mx-4 bg-neutral-focus text-neutral-content">
          <div class="card-body gap-4 p-0">
            <div>
              <div class="flex justify-between items-start p-2">
                <div class="flex gap-5">
                  <div
                    v-if="storeMain.client.role !== UserRoles.staff"
                    class="tooltip"
                    data-tip="Профиль"
                  >
                    <NuxtLink
                      :class="{
                        'bg-neutral-focus': route.path !== '/profile',
                        'text-white': route.path === '/profile',
                      }"
                      to="/profile"
                      class="relative btn btn-sm btn-neutral btn-circle bg-neutral-focus border-none hover:bg-neutral text-xl font-bold text-center"
                    >
                      <IconCSS name="gg:profile" size="24" />
                    </NuxtLink>
                  </div>
                  <div class="font-bold mt-1">
                    {{
                      storeMain.client?.username
                        ? storeMain.client.username
                        : storeMain.client.telegram
                        ? storeMain.client.telegram
                        : storeMain.client.email
                        ? storeMain.client.email
                        : 'Нет данных'
                    }}
                  </div>
                  <!-- <div class="balance text-xs text-gray-400">
                    Баланс: {{ currency.format(storeMain.client.balance) }}
                  </div> -->
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="tooltip before:w-[109px] before:content-[attr(data-tip)]"
                    data-tip="Инструкция по платформе"
                  >
                    <!-- <button
                      class="relative btn btn-sm btn-neutral btn-circle bg-neutral-focus hover:bg-neutral text-xl font-bold text-center"
                      @click="toggleInfoModal"
                    >
                      i
                    </button> -->

                    <!-- <NuxtLink
                      :external="true"
                      target="_blank"
                      to="https://drive.google.com/file/d/1d6FLWMIgqhrWXHpdHFdAu2H8wnVdB_2S/view?usp=sharing"
                      class="relative btn btn-sm btn-neutral btn-circle bg-neutral-focus hover:bg-neutral text-xl font-bold text-center"
                    >
                      i
                    </NuxtLink> -->
                  </div>
                </div>
              </div>
              <hr class="border-gray-600 bg-gray-600 h-[1px]" />
              <div class="flex justify-between items-start p-2">
                <div class="flex gap-5">
                  <div
                    v-if="storeMain.client.role !== UserRoles.staff"
                    class="tooltip"
                  >
                    <div
                      class="relative btn btn-sm btn-neutral btn-circle border-none bg-neutral-focus hover:bg-neutral text-xl font-bold text-center"
                    >
                      <IconCSS name="fe:wallet" size="24" />
                    </div>
                  </div>
                  <div class="balance font-bold mt-1">
                    Баланс: {{ currency.format(storeMain.client.balance) }}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="tooltip before:w-[109px] before:content-[attr(data-tip)]"
                    data-tip="Пополнить баланс"
                  >
                    <div v-if="storeMain.client.role !== UserRoles.staff">
                      <label
                        for="payment-modal"
                        class="btn btn-block relative btn-sm btn-neutral btn-circle bg-neutral-focus hover:bg-neutral text-xl font-bold"
                      >
                        +
                      </label>
                    </div>

                    <!-- <NuxtLink
                      :external="true"
                      target="_blank"
                      to="https://drive.google.com/file/d/1d6FLWMIgqhrWXHpdHFdAu2H8wnVdB_2S/view?usp=sharing"
                      class="relative btn btn-sm btn-neutral btn-circle bg-neutral-focus hover:bg-neutral text-xl font-bold text-center"
                    >
                      i
                    </NuxtLink> -->
                  </div>
                </div>
              </div>
            </div>
            <!-- <div v-if="storeMain.client.role !== UserRoles.staff">
              <label
                for="payment-modal"
                class="btn btn-block btn-sm btn-neutral hover:bg-neutral"
              >
                Пополнить
              </label>
            </div> -->
            <!-- <div class="-mt-3">
              <label
                for="swapAccountModal"
                class="btn btn-block btn-sm btn-neutral hover:bg-neutral"
              >
                Сменить аккаунт
              </label>
            </div> -->
          </div>
        </div>

        <section v-for="section in storeMain.client.mmenuItems">
          <h3 class="opacity-60 text-md p-2 px-8 uppercase">
            {{ section.subTitle }}
          </h3>

          <SidebarItem
            v-for="(item, index) in section.items"
            :key="index"
            :title="item.title"
            :icon="item.icon"
            :href="item.path.includes('productlikes') ? '/likes' : item.path"
          />
        </section>

        <div class="mt-auto">
          <div class="w-full hover:cursor-default p-0 block mt-8 lg:mt-0">
            <div class="join flex justify-around w-full items-center p-0 m-0">
              <label class="join-item btn btn-ghost btn-square z-10"
                ><Icon class="w-6 h-6" name="mdi:support"
              /></label>
              <!-- <a target="_blank" href="#">
                <label class="join-item btn btn-ghost btn-square z-10"
                  ><Icon class="w-6 h-6" name="mdi:support"
                /></label>
              </a> -->
              <label
                class="join-item btn btn-ghost btn-square z-10 w-[20%] swap swap-rotate"
              >
                <!-- this hidden checkbox controls the state -->
                <input
                  v-model="lightMode"
                  type="checkbox"
                  @click="changeTheme"
                />

                <!-- sun icon -->
                <Icon
                  class="swap-on fill-current w-6 h-6"
                  name="fluent:weather-sunny-24-regular"
                />

                <!-- moon icon -->
                <Icon class="swap-off fill-current w-6 h-6" name="ooui:moon" />
              </label>
              <div
                class="join-item btn btn-ghost gap-2 flex justify-center items-center normal-case w-[20%] hover:cursor-pointer rounded-lg p-0 m-0"
                @click="logout"
              >
                <Icon name="ion:exit" size="24" />
                <!-- <span> Выйти </span> -->
              </div>
            </div>
          </div>
        </div>
      </ul>
    </div>
    <PaymentModal />
    <SwapAccountModal />
    <InfoFaqModal />

    <!-- <InfoModal
      :isModal="isInfoModal"
      title="Как пользоваться платформой MARKETMONSTR?"
      ytSrc="https://www.youtube.com/embed/YqIw35-LiOk?si=d1FdsCsb04ADG8JZ"
      @changeVisibility="toggleInfoModal"
    >
      <div class="flex flex-col gap-2">
        <p>Посмотрите обзор кабинета прямо сейчас. Время просмотра 3 минуты.</p>
        <NuxtLink to="https://t.me/+8kOkq5w7N2ZmODFi" target="_blank">
          <button class="btn btn-outline btn-info max-w-fit mb-1">
            <Icon class="-ml-1" size="28" name="logos:telegram" />
            Вступайте в чат-клуб клиентов платформы TovTop!
          </button>
        </NuxtLink>
        <p>Закажите услугу Выкупы под ключ</p>
        <NuxtLink to="https://t.me/topVtopsale_bot" target="_blank">
          <button class="btn btn-outline btn-info max-w-fit mb-2">
            <Icon class="-ml-1" size="28" name="logos:telegram" />
            Узнать подробности
          </button>
        </NuxtLink>
      </div>
    </InfoModal> -->
  </div>
</template>

<style scoped>
.drawer-content {
  /* Добавляем CSS-анимацию для плавной прокрутки */
  scroll-behavior: smooth;
}

.bounce-enter-active,
.bounce-leave-active {
  transition: opacity 0.3s ease;
}

.bounce-enter-from,
.bounce-leave-to {
  opacity: 0;
}

.b24-widget-button-position-bottom-right {
  left: 35px;
}
</style>
