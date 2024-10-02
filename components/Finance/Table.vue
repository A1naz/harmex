<script setup lang="ts">
import { notify } from '@kyvg/vue3-notification'

const props = defineProps({
  tableData: { type: Array as () => Array<any>, default: () => [] },
  headers: { type: Array as () => Array<any>, default: () => [] },
})

const currency = useCurrency()
</script>

<template>
  <div class="flex flex-col gap-[25px]">
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm font-light">
        <thead class="border-b">
          <tr>
            <th
              v-for="(header, index) in headers"
              :key="index"
              scope="col"
              class="px-6 py-4 text-center"
            >
              <div class="flex items-center justify-center gap-1">
                <span>{{ header }}</span>
                <button>
                  <Icon
                    name="octicon:filter-24"
                    class="text-[#7f7f7f]"
                    size="20px"
                  />
                </button>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in tableData" :key="row.number" class="">
            <td class="px-6 py-4 text-center">{{ row.number }}</td>
            <td class="px-6 py-4 text-center">{{ row.date }}</td>
            <td class="px-6 py-4 text-center">{{ row.source }}</td>
            <td class="px-6 py-4 text-center">{{ row.direction }}</td>
            <td class="px-6 py-4 text-center">{{ row.status }}</td>
            <td class="px-6 py-4 text-center">{{ row.summ }}</td>
            <td v-if="row.comment" class="px-6 py-4 text-center">
              {{ row.comment }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-center items-center text-[#8c8c8c] mb-[25px]">
      <Icon name="solar:alt-arrow-left-linear" class="" size="22px" />
      <button v-for="item in 5" :key="item" class="mx-2">
        {{ item }}
      </button>
      <Icon name="solar:alt-arrow-right-linear" class="" size="22px" />
    </div>
  </div>
</template>

<style scoped></style>
