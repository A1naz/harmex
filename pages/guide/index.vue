<script setup lang="ts">
import { ref } from 'vue'
import Button from '~/components/Info/Button.vue'

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

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

function toUpperCaseFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
</script>

<template>
  <div class="flex flex-col gap-4 my-4 h-[90vh]">
    <div class="rounded-lg bg-base-100 py-3.5 px-3 flex justify-between">
      <h2 class="font-bold text-2xl flex my-auto">Справочный центр</h2>
      <div
        class="join w-[30%] border-base-300 border-2 rounded-lg flex items-center justify-center h-full"
      >
        <button
          class="join-item w-[10%] flex justify-center items-center btn btn-ghost btn-sm p-0 h-[40px] rounded-none"
        >
          <Icon name="guidance:search" size="16" />
        </button>
        <input
          type="text"
          placeholder="Поиск"
          class="join-item input input-sm input-bordered sm:text-sm rounded-lg w-[90%] border-none border-l-none h-full p-2.5"
        />
      </div>
    </div>

    <div class="flex gap-5 h-full w-full">
      <div
        :class="{ collapsed: isCollapsed, expanded: !isCollapsed }"
        class="transition-width w-[30%] duration-300 bg-base-100 rounded-lg flex h-[100%] overflow-hidden flex-col gap-4"
      >
        <button
          @click="toggleCollapse"
          class="btn btn-ghost btn-sm w-[50px] flex ml-auto"
        >
          <Icon v-if="!isCollapsed" name="ep:d-arrow-left" size="15" />
          <Icon v-else name="ep:d-arrow-right" size="15" />
        </button>

        <div class="flex flex-col gap-1">
          <h4
            v-if="!isCollapsed"
            class="px-2 text-sm text-[#6e6e73] font-semibold"
          >
          Справочная база
          </h4>
          <button
            class="flex gap-2 px-2 btn btn-sm btn-ghost justify-start flex-nowrap"
          >
            <nuxt-img class="w-4 h-4" :src="`/icons/figma/guide/${'ff'}.svg`" />
            <span
              v-if="!isCollapsed"
              class="text-xs text-base-content font-semibold"
              >Наша терминология</span
            >
          </button>
          <button
            class="flex gap-2 px-2 btn btn-sm btn-ghost justify-start flex-nowrap"
          >
            <nuxt-img class="w-4 h-4" :src="`/icons/figma/guide/${'buyoutPickup'}.svg`" />
            <span
              v-if="!isCollapsed"
              class="text-xs text-base-content font-semibold whitespace-nowrap"
              >Рабочее пространство</span
            >
          </button>
          <button
            class="flex gap-2 px-2 btn btn-sm btn-ghost justify-start flex-nowrap"
          >
            <nuxt-img class="w-4 h-4" :src="`/icons/figma/guide/${'pickup'}.svg`" />
            <span
              v-if="!isCollapsed"
              class="text-xs text-base-content font-semibold"
              >Личный кабинет</span
            >
          </button>
        </div>

        <div class="flex flex-col gap-1">
          <h4
            v-if="!isCollapsed"
            class="px-2 text-sm text-[#6e6e73] font-semibold"
          >
          Функции платформы
          </h4>
          <button
            class="flex gap-2 px-2 btn btn-sm btn-ghost justify-start flex-nowrap"
          >
            <nuxt-img class="w-4 h-4" :src="`/icons/figma/guide/${'ff'}.svg`" />
            <span
              v-if="!isCollapsed"
              class="text-xs text-base-content font-semibold"
              >Выкупы под ключ</span
            >
          </button>
          <button
            class="flex gap-2 px-2 btn btn-sm btn-ghost justify-start flex-nowrap"
          >
            <nuxt-img class="w-4 h-4" :src="`/icons/figma/guide/${'buyoutPickup'}.svg`" />
            <span
              v-if="!isCollapsed"
              class="text-xs text-base-content font-semibold"
              >Выкупы+забор</span
            >
          </button>
          <button
            class="flex gap-2 px-2 btn btn-sm btn-ghost justify-start flex-nowrap"
          >
            <nuxt-img class="w-4 h-4" :src="`/icons/figma/guide/${'pickup'}.svg`" />
            <span
              v-if="!isCollapsed"
              class="text-xs text-base-content font-semibold"
              >Забор</span
            >
          </button>
        </div>


        <div class="flex flex-col gap-1">
          <h4
            v-if="!isCollapsed"
            class="px-2 text-sm text-[#6e6e73] font-semibold"
          >
            Самовыкупы
          </h4>
          <button
            v-for="page in mpList"
            class="flex gap-2 px-2 btn btn-sm btn-ghost justify-start flex-nowrap"
          >
            <nuxt-img class="w-4 h-4" :src="`/icons/figma/guide/${page}.svg`" />
            <span
              v-if="!isCollapsed"
              class="text-xs text-base-content font-semibold"
              >{{ toUpperCaseFirstLetter(page) }}</span
            >
          </button>
        </div>
      </div>

      <div class="bg-base-100 rounded-lg flex w-full">

        <!-- <GuideButton1 />
        <GuideButton2 /> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.transition-width {
  transition: width 0.3s;
}

.collapsed {
  width: 4%;
}

.expanded {
  max-width: 30%;
}
</style>
