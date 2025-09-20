<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useIntersectionObserver, useDebounceFn } from "@vueuse/core";
import ReportExpand from "~/components/Report/Expand.vue";
import CustomSelect from "~/components/Custom/Select.vue";
import Hero from "~/components/Hero.vue";
import {
  useOzonReports,
  type Report,
} from "~/composables/useOzonReports";

definePageMeta({
  layout: "app",
  middleware: "auth",
  title: "Отчеты по выкупам",
});

const { fetchReports, searchReports } = useOzonReports();
const reports = ref<Report[]>([]);
const loading = ref(false);
const router = useRouter();
const route = useRoute();
const status = computed(() => route.query?.status?.toString() || "all");
const search = reactive({
  text: "",
  loading: false,
  type: "uuid",
});
const autoTarget = ref(true);
const target = ref(null);
const targetIsVisible = ref(false);
const skip = ref(0);
const end = ref(false);
const openAll = ref(false);
const codeInput = ref();

async function getReports(initial = false) {
  if (initial) {
    reports.value = [];
    skip.value = 0;
    end.value = false;
  }
  if (end.value || loading.value) return;

  loading.value = true;
  try {
    const newReports = await fetchReports(skip.value, 20, status.value);
    if (newReports && newReports.length > 0) {
      reports.value.push(...newReports);
      skip.value += 20;
    } else {
      end.value = true;
    }
  } catch (error) {
    console.error("Failed to fetch reports:", error);
  } finally {
    loading.value = false;
  }
}

async function findReports(value: string, type: string) {
  if (!value) {
    autoTarget.value = true;
    await getReports(true);
    return;
  }
  search.loading = true;
  try {
    reports.value = await searchReports(value, type);
  } catch (error) {
    console.error("Failed to search reports:", error);
  } finally {
    search.loading = false;
  }
}

const findReportsDebounced = useDebounceFn(findReports, 1000);

function onSearchInput() {
  autoTarget.value = false;
  search.loading = true;
  findReportsDebounced(search.text, search.type);
}

function selectStatus(e: { value: string }) {
  router.push({
    path: route.path,
    query: {
      status: e.value,
    },
  });
}

const { stop } = useIntersectionObserver(target, ([{ isIntersecting }]) => {
  if (isIntersecting && autoTarget.value) {
    getReports();
  }
});

watch(
  () => route.query.status,
  () => {
    autoTarget.value = true;
    getReports(true);
  },
  { immediate: true }
);

const updateSearchType = (filter: { value: string }) => {
  search.type = filter.value;
};

// Mock data for stores if they don't exist
const mpStore = {
  sortMp: () => [
    { title: "Wildberries", value: "wildberries" },
    { title: "Ozon", value: "ozon" },
  ],
};

function changeFilter(e: { value: string }) {
  // Placeholder for mpStore.changeMp(e.value, 'reports')
  console.log("Marketplace changed to:", e.value);
}
</script>

<template>
  <div class="px-4 sm:px-16 pt-8">
    <div class="breadcrumbs text-sm">
      <ul class="text-sm sm:text-base font-medium text-[18px] text-[#909090]">
        <li class="cursor-pointer">
          <NuxtLink to="/catalog" class="cursor-pointer text-[#909090]">
            Маркетплейсы
          </NuxtLink>
        </li>
        <li class="cursor-pointer">
          <NuxtLink
            to="/catalog/ozon"
            class="cursor-pointer text-[#909090]"
          >
            Ozon
          </NuxtLink>
        </li>
        <li class="cursor-pointer text-[#1e2734]">Отчеты</li>
      </ul>
    </div>

    <div
      class="flex flex-col md:flex-row justify-between items-center mb-8 mt-6 gap-4"
    >
      <div class="flex gap-2 w-full md:w-auto"></div>
      <div class="flex gap-2 w-full md:w-auto justify-end">
        <div
          class="relative flex justify-end items-center flex-grow-0 md:w-80 gap-2.5 w-full"
        >
          <input
            ref="codeInput"
            v-model="search.text"
            type="text"
            class="input input-sm w-full mb-2 md:mb-0 bg-base-200 border-base-200"
            placeholder="Поиск по ID и артикулу"
            @input="onSearchInput"
          />
          <Icon
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
            name="tabler:search"
            size="24"
            @click="codeInput.focus()"
          />
        </div>
      </div>
    </div>
    <div v-if="reports.length > 0">
      <div class="grid grid-cols-1 lg:grid-cols-2 lg:items-start gap-3">
        <ReportExpand
          v-for="item in reports"
          :key="item.uuid"
          :state="openAll"
          :info="item"
        />
      </div>
      <div ref="target" class="h-20" />
      <div v-if="loading" class="w-full flex justify-center items-center mt-4">
        <span class="loading loading-dots loading-lg text-primary"></span>
      </div>
    </div>
    <Hero v-else-if="!loading" />
    <div
      v-if="loading && reports.length === 0"
      class="w-full flex justify-center items-center mt-20"
    >
      <span class="loading loading-dots loading-lg text-primary"></span>
    </div>
  </div>
</template>

<style scoped>
/* Minimal styling, relies on DaisyUI and Tailwind */
</style>