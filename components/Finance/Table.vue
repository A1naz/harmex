<script setup lang="ts">
import { ref, computed } from 'vue';

interface HeaderForTable {
  value: string
  label: string
}

const emit = defineEmits(['swapPage', 'changePagination'])

const props = defineProps({
  tableData: { type: Array as () => Array<any>, default: () => [] },
  headers: { type: Array as () => Array<HeaderForTable>, default: () => [] },
  loading: { type: Boolean, default: true },
})

const currentPage = ref(1)
const itemsPerPage = ref(15)
const paginations = ref([
  { title: 'Показывать по 15', value: 15 },
  { title: 'Показывать по 25', value: 25 },
  { title: 'Показывать по 50', value: 50 },
])
const totalPages = 100

function changePagination(value: number) {
  itemsPerPage.value = value
  emit('changePagination', itemsPerPage.value)
}


const displayPages = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  let start = Math.max(currentPage.value - 2, 1)
  let end = Math.min(start + maxVisiblePages - 1, totalPages)

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
  emit('swapPage', currentPage.value, itemsPerPage.value)
}
</script>

<template>
  <div class="finance-table-container">
    <div class="table-wrapper px-6">
      <table class="finance-table border border-[#ebeef1]">
        <thead>
          <tr>
            <th v-for="(header, index) in props.headers" :key="index" scope="col" class="table-header">
              <div class="header-content">
                <span>{{ header.label }}</span>
                <button>
                  <Icon name="carbon:caret-down" class="filter-icon ml-2" size="15px" />
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in  props.tableData" :key="row.id" class="table-row">
            <td v-for="(header, index) in props.headers" :key="index" class="table-cell">
              <span >{{ row[header.value] || '-' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="tableData.length === 0 && !loading ">
        <Hero />
      </div>
      <div v-if="loading" class="flex w-full justify-center" >
        <span class="loading loading-spinner loading-lg bg-[#4960d3]"></span>
      </div>
    </div>
    <div class="pagination-controls flex justify-between mt-auto mb-10 border-t w-full py-2 px-4 scroll-hidden">
      <custom-select :tabs="paginations" :class="'text-black bg-white h-[2.5rem]'" :dropdownContainerClass="'bg-white'" :arrowsClass="'text-primary'" @change-value="(e:any) => changePagination(e.value)" />
      <div class="flex justify-end gap-1">
        <button class="btn btn-primary btn-xs font-normal px-0 flex items-center bg-transparent text-primary border-none hover:text-white shadow-none" :disabled="currentPage === 1" @click="swapPage(-1)">
          <Icon name="solar:alt-arrow-left-linear" size="24" />
        </button>
        
        <button
          v-for="page in displayPages"
          :key="page"
          class="btn btn-primary btn-xs text-black shadow-none border-none flex items-center hover:text-white"
          :class="{'text-white': currentPage === page, 'bg-transparent': currentPage !== page}"
          @click="(currentPage = page, swapPage(0))"
        >
          {{ page }}
        </button>
        
        <button class="btn btn-primary btn-xs p-0 bg-transparent text-primary border-none flex items-center hover:text-white shadow-none" :disabled="currentPage === totalPages" @click="swapPage(1)">
          <Icon name="solar:alt-arrow-right-linear" size="24" />
        </button>
      </div>
    </div>
  </div>
</template>


<style scoped>

.finance-table-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 85vh;
}

.table-wrapper {
  overflow-x: auto;
  width: 100%;
  flex-grow: 1;
}

.finance-table {
  width: 100%;
  table-layout: auto;
  border-radius: 10px;
  border: 1px solid #ebeef1;
  overflow: hidden;
  border-collapse: separate;
  border-spacing: 0;
}

.table-cell {
  padding: 0.3em 0.4em;
  text-align: left;
  height: 40px;
  border: 1px solid #ebeef1;
  font-size: 0.85rem;
}

.table-header{
  padding: 0.3em 0.4em;
  text-align: left;
  height: 25px;
  border: 1px solid #ebeef1;
  font-size: 0.85rem;}

.table-row:nth-child(odd) {
  background-color: #f8f9fb;
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
  align-items: center;
  margin-top: 1em;
  color: #8c8c8c;
  font-size: 0.9rem;
}

.pagination-button {
  width: 1.8rem;
  height: 1.8rem;
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
}

</style>
