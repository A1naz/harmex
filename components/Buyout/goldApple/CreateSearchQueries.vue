<script setup lang="ts">
import type { SearchQuery } from "@/data/buyout/createProduct";
import { rules } from "~/data/buyout/rules";

interface Props {
  queries: SearchQuery[];
  article: number;
  productIndex: number;
  rules: [];
}
const props = defineProps<Props>();

const sorts = [
  {
    ruleId: 10,
    sort: "popular",
  },
  {
    ruleId: 11,
    sort: "priceup",
  },
  {
    ruleId: 12,
    sort: "pricedown",
  },
  {
    ruleId: 13,
    sort: "newly",
  },
  {
    ruleId: 14,
    sort: "benefit",
  },
  {
    ruleId: 15,
    sort: "rate",
  },
];

const emit = defineEmits(["update", "add", "remove"]);
const store = useGoldAppleBuyoutStore();
async function findSearchQuery(value: string) {
  let sortType = "popular";
  if (props.rules && props.rules.length > 0) {
    props.rules.forEach((rule: any) => {
      sorts.forEach((sort: any) => {
        if (rule.id === sort.ruleId) {
          sortType = sort.sort;
        }
      });
    });
  }

  // const { data, error } = await useFetch('/api/product/getSearchPosition', {
  //   query: {
  //     article: props.article,
  //     query: value,
  //     sort: sortType || 'popular',
  //   },
  // })
  return {
    found: false,
    page: -1,
    advert: false,
  };
}
const findSearchQueryDebounced = useDebounceFn(findSearchQuery, 1000);

const queries = computed(() => props.queries);

async function onInput(event: Event, index: number) {
  const newValue = (event.target as HTMLInputElement).value;
  store.changeSearchQuery(
    {
      value: newValue,
      queryIndex: index,
      productIndex: props.productIndex,
    },
    false,
    false
  );

  // if (!newValue) return
  // store.changeSearchQueryStatus(index, props.productIndex, false, true)

  // const result = await findSearchQueryDebounced(props.queries[index].value)

  // if (!result) return
  // if (result) {
  //   if (result.found) {
  //     store.changeSearchQueryStatus(
  //       index,
  //       props.productIndex,
  //       false,
  //       false,
  //       `Товар найден на ${result.page} стр.`
  //     )
  //     if (result.advert)
  //       store.changeSearchQueryStatus(
  //         index,
  //         props.productIndex,
  //         false,
  //         false,
  //         `Товар найден в рекламе на ${result.page} стр.`
  //       )
  //   } else {
  //     store.changeSearchQueryStatus(index, props.productIndex, true, false)
  //   }
  // }
  store.changeSearchQueryStatus(index, props.productIndex, false, false, ``);
}

onMounted(async () => {
  for (let i = 0; i < props.queries.length; i++) {
    if (!props.queries[i].value) continue;
    const result = await findSearchQuery(props.queries[i].value);
    if (!result) continue;
    // if (!result.found)
    // store.changeSearchQueryStatus(i, props.productIndex, true, false)
  }
});
</script>

<template>
  <div
    v-for="(query, index) of queries"
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
             :disabled="store.createProducts[props.productIndex].category"
          type="text"
          placeholder="Поисковый запрос"
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

    <span
      v-if="query.loading"
      class="absolute right-8 loading loading-spinner loading-xs p-2"
    />
    <div
       :disabled="store.createProducts[props.productIndex].category"
      v-if="index === 0"
      class="absolute right-0 btn btn-ghost btn-sm btn-square"
      @click="emit('add')"
    >
      <Icon size="16" name="ic:round-plus" />
    </div>
    <div
      v-else
      class="absolute right-0 btn btn-ghost btn-sm btn-square"
      @click="emit('remove', index)"
    >
      <Icon size="16" name="material-symbols:close" />
    </div>
  </div>
</template>

<style scoped></style>
