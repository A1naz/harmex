<script setup lang="ts">
import { rules } from '~/data/buyout/rules'

interface Props {
  regions: any[] 
  article: number
  productIndex: number
  rules: []
}
const props = defineProps<Props>()

const sorts = [
  {
    ruleId: 10,
    sort: 'popular',
  },
  {
    ruleId: 11,
    sort: 'priceup',
  },
  {
    ruleId: 12,
    sort: 'pricedown',
  },
  {
    ruleId: 13,
    sort: 'newly',
  },
  {
    ruleId: 14,
    sort: 'benefit',
  },
  {
    ruleId: 15,
    sort: 'rate',
  },
]

const emit = defineEmits(['update', 'add', 'remove'])
const store = useAvitoBuyoutStore()

const regions = computed(() => props.regions)

async function onInput(event: Event, index: number) {
  const newValue = (event.target as HTMLInputElement).value
  store.changeSearchQueryRegion(
    {
      value: newValue,
      queryIndex: index,
      productIndex: props.productIndex,
    },
    false,
    false
  )

}

</script>

<template>
  <div
    v-for="(query, index) of regions"
    :key="index"
    class="relative flex items-center flex-grow-0 w-full"
  >
    <div class="dropdown w-full">
      <label tabindex="0"
        ><input
          :value="query.value"
          :class="{
            'input-error': query.error,
          }"
          type="text"
          placeholder="Регион"
          class="input bg-base-200 input-sm w-full rounded-xl"
          @input="onInput($event, index)"
        />
      </label>
      <!-- <ul
        v-if="!query.loading && query.value"
        tabindex="0"
        class="dropdown-content z-[1] p-2 shadow bg-base-100 rounded-lg w-full"
      >
        <div v-if="!query.loading">
          <div v-if="query.error">Товар не найден</div>
          <div v-else>
            <div v-if="query.value && query.message">
              {{ query.message }}
            </div>
          </div>
        </div>
      </ul> -->
    </div>

    <!-- <span
      v-if="query.loading"
      class="absolute right-8 loading loading-spinner loading-xs p-2"
    /> -->
    <!-- <div
      v-if="index === 0"
      class="absolute right-0 btn btn-ghost btn-sm btn-square"
      @click="emit('add')"
    >
      <Iconze="16" name="ic:round-plus" />
    </div> -->
    <!-- <div
      v-else
      class="absolute right-0 btn btn-ghost btn-sm btn-square"
      @click="emit('remove', index)"
    >
      <Icon size="16" name="material-symbols:close" />
    </div> -->
  </div>
</template>

<style scoped></style>
