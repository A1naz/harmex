<script setup lang="ts">
const props = defineProps({
  // ratingList: {
  //   type: Boolean,
  //   required: true,
  // },
  // factorsList: {
  //   type: Boolean,
  //   required: true,
  // },
  ratingValue: {
    type: Object as any,  
    required: true,
  },
  factorsValue: {
    type: Object as any,
    required: true,
  },
  firstTariff: {
    type: String,
    required: true,
  },
  secondTariff: {
    type: String,
    required: true,
  },
})

const ratingList = ref(true)
const factorsList = ref(true)
</script>

<template>
  <div class="flex flex-col mt-5">
      <div class="collapse collapse-arrow bg-base-100 rounded-box z-0">
        <input v-model="ratingList" type="checkbox" />
        <div class="collapse-title relative text-xl font-medium">
          <div class="flex gap-4 text-lg font-bold">Повышение рейтинга</div>
        </div>
        <div class="collapse-content pb-0">
          <div
            v-for="tariff in ratingValue"
            class="flex flex-col md:hidden px-5 pt-5 py-1 rounded-lg w-full"
          >
            <span class="text-sm font-bold mb-1">{{ tariff.title }}</span>
            <div class="flex w-full">
              <div
                class="flex w-1/2 border-b border-[#e5e7e8] dark:border-[#1a1817]"
              >
                <Icon
                  v-if="tariff[firstTariff.toLowerCase()] === 0"
                  name="mingcute:close-line"
                  size="25"
                  class="text-[#f9654b]"
                />
                <span v-else>{{ tariff[firstTariff.toLowerCase()] }}</span>
              </div>
              <div
                class="flex w-1/2 border-b border-[#e5e7e8] dark:border-[#1a1817]"
              >
                <Icon
                  v-if="tariff[secondTariff.toLowerCase()] === 0"
                  name="mingcute:close-line"
                  size="25"
                  class="text-[#f9654b]"
                />
                <span v-else>{{ tariff[secondTariff.toLowerCase()] }}</span>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto hidden md:flex">
            <table
              class="table table-zebra border-b border-[#e5e7e8] dark:border-[#1a1817]"
            >
              <tbody>
                <tr></tr>
                <tr v-for="(value, index) in ratingValue" :key="index">
                  <th
                    class="w-1/5 border-r border-[#e5e7e8] dark:border-[#1a1817]"
                  >
                    {{ value.title }}
                  </th>
                  <td
                    class="w-1/5 text-center border-r border-[#e5e7e8] dark:border-[#1a1817]"
                  >
                    {{ value.demo }}
                  </td>
                  <td
                    class="w-1/5 text-center border-r border-[#e5e7e8] dark:border-[#1a1817]"
                  >
                    <div class="flex w-full justify-center">
                      <Icon
                        v-if="value.start === 0"
                        name="mingcute:close-line"
                        size="25"
                        class="w-10 text-[#f9654b]"
                      />
                      <span v-else>
                        {{ value.start }}
                      </span>
                    </div>
                  </td>
                  <td class="w-1/5 text-center border-r-4 border-[#25ba7b]">
                    <div class="flex w-full justify-center">
                      <Icon
                        v-if="value.pro === 0"
                        name="mingcute:close-line"
                        size="25"
                        class="w-8 text-[#f9654b]"
                      />
                      <span v-else>
                        {{ value.pro }}
                      </span>
                    </div>
                  </td>
                  <td class="w-1/5 text-center border-r-4 border-[#25ba7b]">
                    <div class="flex w-full justify-center">
                      <Icon
                        v-if="value.vip === 0"
                        name="mingcute:close-line"
                        size="25"
                        class="text-[#f9654b]"
                      />
                      <span v-else>
                        {{ value.vip }}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="collapse collapse-arrow bg-base-100 rounded-box z-0">
        <input v-model="factorsList" type="checkbox" />
        <div class="collapse-title relative text-xl font-medium">
          <div class="flex gap-4 text-lg font-bold">Поведенческие факторы</div>
        </div>
        <div class="collapse-content pb-0">
          <div
            v-for="tariff in factorsValue"
            class="flex flex-col md:hidden px-5 pt-5 py-1 rounded-lg w-full"
          >
            <span class="text-sm font-bold mb-1">{{ tariff.title }}</span>
            <div class="flex w-full">
              <div
                class="flex w-1/2 border-b border-[#e5e7e8] dark:border-[#1a1817]"
              >
                <Icon
                  v-if="tariff[firstTariff.toLowerCase()] === 0"
                  name="mingcute:close-line"
                  size="25"
                  class="text-[#f9654b]"
                />
                <span v-else>{{ tariff[firstTariff.toLowerCase()] }}</span>
              </div>
              <div
                class="flex w-1/2 border-b border-[#e5e7e8] dark:border-[#1a1817]"
              >
                <Icon
                  v-if="tariff[secondTariff.toLowerCase()] === 0"
                  name="mingcute:close-line"
                  size="25"
                  class="text-[#f9654b]"
                />
                <span v-else>{{ tariff[secondTariff.toLowerCase()] }}</span>
              </div>
            </div>
          </div>
          <div class="overflow-x-auto hidden md:flex">
            <table
              class="table table-zebra border-b border-[#e5e7e8] dark:border-[#1a1817]"
            >
              <tbody>
                <tr></tr>
                <tr v-for="(value, index) in factorsValue" :key="index">
                  <th
                    class="w-1/5 border-r border-[#e5e7e8] dark:border-[#1a1817]"
                  >
                    {{ value.title }}
                  </th>
                  <td
                    class="w-1/5 text-center border-r border-[#e5e7e8] dark:border-[#1a1817]"
                  >
                    {{ value.demo }}
                  </td>
                  <td
                    class="w-1/5 text-center border-r border-[#e5e7e8] dark:border-[#1a1817]"
                  >
                    <div class="flex w-full justify-center">
                      <Icon
                        v-if="value.start === 0"
                        name="mingcute:close-line"
                        size="25"
                        class="text-[#f9654b]"
                      />
                      <span v-else>
                        {{ value.start }}
                      </span>
                    </div>
                  </td>
                  <td class="w-1/5 text-center border-r-4 border-[#25ba7b]">
                    <div class="flex w-full justify-center">
                      <Icon
                        v-if="value.pro === 0"
                        name="mingcute:close-line"
                        size="25"
                        class="text-[#f9654b]"
                      />
                      <span v-else>
                        {{ value.pro }}
                      </span>
                    </div>
                  </td>
                  <td class="w-1/5 text-center border-r-4 border-[#25ba7b]">
                    <div class="flex w-full justify-center">
                      <Icon
                        v-if="value.vip === 0"
                        name="mingcute:close-line"
                        size="25"
                        class="text-[#f9654b]"
                      />
                      <span v-else>
                        {{ value.vip }}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>

</style>
