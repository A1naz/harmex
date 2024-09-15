<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: true,
  title: 'Справочник',
})

const mpChange = useMPChange()
const mainStore = useMainStore()
const mpList =
  mainStore.client?.username === 'test'
    ? mpChange.pages.map((page) => page.value)
    : mpChange.pages.filter((page) => !page.test).map((page) => page.value)
const isCollapsed = ref(false)
const isMobileMenuVisible = ref(false) // добавленная переменная состояния для мобильного меню
const dinamicComponent = ref()
const searchQuery = ref('')

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const toggleMobileMenu = () => {
  isMobileMenuVisible.value = !isMobileMenuVisible.value // функция для переключения состояния мобильного меню
}

function toUpperCaseFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function toLowerCaseFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

const page = ref('С чего начать')

const setPage = (componentName: string) => {
  const navbar = navbarData.value
    .flatMap((category: any) => category.tabs)
    .find(
      (tab: any) =>
        tab.value === toLowerCaseFirstLetter(componentName.replace('Guide', ''))
    )?.title
  const mps = toUpperCaseFirstLetter(
    mpList.find(
      (tab: any) =>
        tab === toLowerCaseFirstLetter(componentName.replace('Guide', ''))
    ) || ''
  )
  page.value = navbar || mps || ''
}

const setComponent = (componentName: string) => {
  setPage(componentName)
  dinamicComponent.value.setComponent(componentName)
}

const navbarData = ref([
  {
    title: 'Рекомендуемые',
    value: 'recommended',
    tabs: [
      {
        title: 'С чего начать',
        value: 'start',
      },
      {
        title: 'Обзор кабинета',
        value: 'updates',
      },
      {
        title: 'Популярные вопросы',
        value: 'popularQuestions',
      },
      {
        title: 'Партнерская программа',
        value: 'partner',
      },
    ],
  },
  // {
  //   title: 'Справочная база',
  //   value: 'guide',
  //   tabs: [
  //     {
  //       title: 'Наша терминология',
  //       value: 'terminology',
  //     },
  //     {
  //       title: 'Рабочее пространство',
  //       value: 'workspace',
  //     },
  //     {
  //       title: 'Личный кабинет',
  //       value: 'profile',
  //     },
  //   ],
  // },
  // {
  //   title: 'Функции платформы',
  //   value: 'functions',
  //   tabs: [
  //     {
  //       title: 'Выкупы под ключ',
  //       value: 'ff',
  //     },
  //     {
  //       title: 'Выкупы+забор',
  //       value: 'buyoutsPickup',
  //     },
  //     {
  //       title: 'Забор',
  //       value: 'pickup',
  //     },
  //   ],
  // },
])

const filteredNavbarData = computed(() => {
  if (!searchQuery.value) return navbarData.value
  return navbarData.value
    .map((category) => ({
      ...category,
      tabs: category.tabs.filter((tab) =>
        tab.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      ),
    }))
    .filter((category) => category.tabs.length > 0)
})

const filteredMPList = computed(() => {
  if (!searchQuery.value) return mpList
  return mpList.filter((page) =>
    page.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="flex flex-col gap-4 my-4 h-[90vh]">
    <div
      class="rounded-lg bg-base-100 py-3.5 px-3 flex justify-between flex-col lg:flex-row gap-4 drop-shadow-sm"
    >
      <h2
        class="font-bold text-sm lg:text-2xl text-[#8f8e93] lg:text-base-content flex my-auto items-center gap-0.5 whitespace-nowrap"
      >
        Справочный центр
        <span class="lg:hidden -p-2"
          ><Icon name="ic:round-keyboard-arrow-right" size="25"
        /></span>
        <span class="lg:hidden text-sm flex items-center text-base-content">
          {{ page }}</span
        >
      </h2>
      <div class="flex gap-1 w-full justify-end">
        <button
          @click="toggleMobileMenu"
          class="lg:hidden btn btn-ghost btn-sm flex items-center my-auto"
        >
          <Icon name="mdi:menu" size="30" />
        </button>
        <div
          class="join lg:w-[30%] w-full border-base-300 border-2 rounded-lg flex items-center justify-center h-full"
        >
          <button
            style="pointer-events: none"
            class="join-item w-[10%] flex justify-center items-center btn btn-ghost btn-sm p-0 h-[40px] rounded-none"
          >
            <Icon name="guidance:search" size="16" />
          </button>
          <input
            type="text"
            placeholder="Поиск"
            v-model="searchQuery"
            class="join-item input input-sm input-bordered sm:text-sm rounded-lg w-[90%] border-none border-l-none h-full p-2.5"
          />
        </div>
      </div>
    </div>

    <div class="flex gap-5 h-full w-full drop-shadow-sm">
      <div
        v-if="isMobileMenuVisible"
        class="fixed inset-0 z-50 flex justify-end h-[90vh] overflow-hidden"
      >
        <div
          class="bg-base-100 w-[75%] p-0 flex flex-col gap-2 rounded-lg h-[84%] overflow-y-auto"
        >
          <div
            v-for="tabs in filteredNavbarData"
            class="flex flex-col gap-1 mx-4 mt-4 mb-4"
          >
            <h4 class="px-2 text-sm text-[#6e6e73] font-semibold">
              {{ tabs.title }}
            </h4>
            <button
              v-for="tab in tabs.tabs"
              class="flex gap-2 px-2 btn btn-sm btn-ghost justify-start flex-nowrap"
              @click="setComponent(`Guide${toUpperCaseFirstLetter(tab.value)}`)"
            >
              <nuxt-img
                class="w-4 h-4"
                :src="`/icons/figma/guide/${tab.value}.svg`"
              />
              <span class="text-sm text-base-content font-semibold truncate">{{
                tab.title
              }}</span>
            </button>
          </div>
          <div class="flex flex-col gap-1 mx-4">
            <h4
              v-if="filteredMPList.length"
              class="px-2 text-sm text-[#6e6e73] font-semibold"
            >
              Самовыкупы
            </h4>
            <button
              v-for="page in filteredMPList"
              :key="page"
              class="flex gap-2 px-2 btn btn-sm btn-ghost justify-start flex-nowrap"
              @click="setComponent(`Guide${toUpperCaseFirstLetter(page)}`)"
            >
              <nuxt-img
                class="w-4 h-4"
                :src="`/icons/figma/guide/${page}.svg`"
              />
              <span class="text-sm text-base-content font-semibold truncate">{{
                toUpperCaseFirstLetter(page)
              }}</span>
            </button>
          </div>
          <div class="mt-auto bg-[#f5f5f7] dark:bg-base-300 px-3 py-1 w-full">
            <a target="_blank" href="https://t.me/wb_soft_bot" class="w-full">
              <div
                class="join-item w-full btn btn-ghost gap-2 flex justify-start items-center normal-case hover:cursor-pointer rounded-lg p-0 m-0"
              >
                <Icon
                  class="text-primary"
                  name="ri:telegram-2-line"
                  size="24"
                />
                <span> Telegram-бот </span>
              </div>
            </a>
          </div>
        </div>
        <div
          class="bg-black bg-opacity-50 bg-opacity-transition w-[25%] rounded-r-lg "
          @click="toggleMobileMenu"
        ></div>
      </div>

      <div
        :class="{ collapsed: isCollapsed, expanded: !isCollapsed }"
        class="transition-width w-[25%] duration-300 bg-base-100 rounded-lg h-[100%] overflow-y-auto flex-col gap-4 hidden lg:flex"
      >
        <button
          @click="toggleCollapse"
          class="btn btn-ghost btn-sm w-[50px] flex ml-auto"
          :class="{
            'p-0 justify-center items-center w-[30px] ml-0': isCollapsed,
          }"
        >
          <Icon v-if="!isCollapsed" name="ep:d-arrow-left" size="15" />

          <Icon v-else name="ep:d-arrow-right" size="15" />
        </button>
        <div
          v-for="(tabs, index) in filteredNavbarData"
          class="flex flex-col gap-1"
        >
          <h4
            v-if="!isCollapsed"
            class="px-2 text-sm text-[#6e6e73] font-semibold truncate"
          >
            {{ tabs.title }}
          </h4>
          <div
            v-else
            class="divider my-0 mb-1"
            :class="{ 'opacity-0 mb-1': index === 0 }"
          ></div>
          <button
            v-for="tab in tabs.tabs"
            class="flex gap-2 px-2 btn btn-sm btn-ghost justify-start flex-nowrap"
            @click="setComponent(`Guide${toUpperCaseFirstLetter(tab.value)}`)"
          >
            <nuxt-img
              class="w-4 h-4"
              :src="`/icons/figma/guide/${tab.value}.svg`"
            />
            <span v-if="!isCollapsed" class="text-sm truncate">{{
              tab.title
            }}</span>
          </button>
        </div>
        <div class="flex flex-col gap-1">
          <h4
            v-if="!isCollapsed && filteredMPList.length"
            class="px-2 text-sm text-[#6e6e73] font-semibold"
          >
            Самовыкупы
          </h4>
          <div v-else class="divider my-0 mb-1"></div>
          <button
            v-for="page in filteredMPList"
            :key="page"
            class="flex gap-2 px-2 btn btn-sm btn-ghost justify-start flex-nowrap"
            @click="setComponent(`Guide${toUpperCaseFirstLetter(page)}`)"
          >
            <nuxt-img class="w-4 h-4" :src="`/icons/figma/guide/${page}.svg`" />
            <span v-if="!isCollapsed" class="text-sm truncate">{{
              toUpperCaseFirstLetter(page)
            }}</span>
          </button>
        </div>
        <div class="mt-auto bg-[#f5f5f7] dark:bg-base-300 w-full">
          <a target="_blank" href="https://t.me/wb_soft_bot">
            <div
              class="join-item w-full btn btn-ghost gap-2 flex justify-start items-center normal-case hover:cursor-pointer rounded-lg p-2 m-0 mx-auto flex-nowrap"
            >
              <Icon
                class="text-primary flex"
                name="ri:telegram-2-line"
                size="24"
              />
              <span
                v-if="!isCollapsed"
                class="whitespace-nowrap font-semibold truncate"
              >
                Telegram-бот
              </span>
            </div>
          </a>
        </div>
      </div>

      <div class="bg-base-100 rounded-lg flex w-full h-[100%] drop-shadow-sm">
        <GuideDinamicComponent
          ref="dinamicComponent"
          :componentName="resolveComponent"
          @setPage="(componentName) => setPage(componentName)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.transition-width {
  transition: 0.25s;
}

.collapsed {
  width: 40px;
}

.expanded {
  max-width: 25%;
}

.bg-opacity-50 {
  background-color: rgba(0, 0, 0, 0.5);
}

.transition-width {
  transition: width 0.3s ease-out, max-width 0.3s ease-out;
}

.animate-slide-left {
  animation: slideLeft 0.15s ease-out;
}

@keyframes slideLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0%);
    opacity: 1;
  }
}
</style>
