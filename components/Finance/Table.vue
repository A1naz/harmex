<script setup lang="ts">
import { ref, computed } from 'vue';

interface HeaderForTable {
  value: string
  label: string
}

const emit = defineEmits(['swapPage'])

const props = defineProps({
  tableData: { type: Array as () => Array<any>, default: () => [] },
  headers: { type: Array as () => Array<HeaderForTable>, default: () => [] },
  loading: { type: Boolean, default: true },
})

const currentPage = ref(1)
const itemsPerPage = ref(15)
const totalPages = computed(() => Math.ceil(240 / itemsPerPage.value))

const paginatedData = computed(() => {
  return props.tableData
})

const displayPages = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  let start = Math.max(currentPage.value - 2, 1)
  let end = Math.min(start + maxVisiblePages - 1, totalPages.value)

  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(end - maxVisiblePages + 1, 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

function swapPage(swapTo: number) {
  currentPage.value += swapTo
  emit('swapPage', currentPage.value)
}
</script>

<template>
  <div class="finance-table-container">
    <div class="table-wrapper ">
      <table class="finance-table">
        <thead>
          <tr>
            <th v-for="(header, index) in props.headers" :key="index" scope="col" class="table-header">
              <div class="header-content">
                <span>{{ header.label }}</span>
                <button>
                  <Icon name="octicon:filter-24" class="filter-icon" size="20px" />
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedData" :key="row.id" class="table-row">
            <td v-for="(header, index) in props.headers" :key="index" class="table-cell">
              <span >{{ row[header.value] }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="tableData.length === 0 && !loading">
        <Hero />
      </div>
      <div v-if="loading" class="flex w-full justify-center" >
        <span class="loading loading-spinner loading-lg bg-[#4960d3]"></span>
      </div>
    </div>
    <div v-if="tableData.length > 0" class="pagination-controls flex items-center mt-auto">
      <button class="pagination-button flex items-center" :disabled="currentPage === 1" @click="swapPage(-1)">
        <Icon name="solar:alt-arrow-left-linear" size="24" />
      </button>
      
      <button v-for="page in displayPages" :key="page" class="pagination-button" :class="{ active: currentPage === page }"
        @click="[currentPage = page, swapPage(0)]">
        {{ page }}
      </button>
      
      <button class="pagination-button flex items-center" :disabled="currentPage === totalPages" @click="swapPage(1)">
        <Icon name="solar:alt-arrow-right-linear" size="24" />
      </button>
    </div>
  </div>
</template>


<style scoped>
.finance-table-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.table-wrapper {
  overflow-x: auto;
  width: 60vw;
}

.finance-table {
  @apply table;
  width: 100%;
  table-layout: auto;
}

.table-header,
.table-cell {
  padding: 0.5em;
  text-align: center;
  height: 55px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-icon {
  color: #7f7f7f;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1em;
  color: #8c8c8c;
}

.pagination-button {
  background: none;
  border: none;
  cursor: pointer;
  margin: 0 0.2em;
}

.pagination-button:disabled {
  cursor: not-allowed;
}

.pagination-button.active {
  @apply text-blue-800;
}

@media (max-width: 640px) {
  .table-wrapper {
    width: 100%;
  }

  .finance-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .table-header,
  .table-cell {
    padding: 0.25em;
  }

  .pagination-button {
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>
