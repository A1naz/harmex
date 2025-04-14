<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps({
  categories: Array,
  selected: Object,
});

const emit = defineEmits(["selectCategory"]);

const openIndexes = ref([]);

const isOpen = (index) => openIndexes.value.includes(index);
const toggle = (index) => {
  if (isOpen(index)) {
    openIndexes.value = openIndexes.value.filter((i) => i !== index);
  } else {
    openIndexes.value.push(index);
  }
};

const selectCategory = (oldCategories, index) => {
  if (oldCategories && oldCategories.length) {
    oldCategories.unshift(props.categories[index].name);
    emit("selectCategory", oldCategories);
  } else {
    const categories = [];
    categories.push(props.categories[index].name);

    emit("selectCategory", categories);
  }
};
</script>

<template>
  <div>
    <ul class="pl-4" style="z-index: 999">
      <li v-for="(category, index) in categories" :key="index" class="my-1">
        <div class="flex items-center gap-2">
          <div
            v-if="category.subcategories && category.subcategories.length"
            @click="toggle(index)"
            class="cursor-pointer ml-5"
          >
            <button class="btn btn-square btn-sm">
              <Icon
                name="material-symbols:keyboard-arrow-down-rounded"
                size="20"
                v-if="isOpen(index)"
              />
              <Icon
                name="material-symbols:keyboard-arrow-right"
                size="20"
                v-else
              />
            </button>
          </div>
          <span v-else class="ml-4"></span>

          <button
            v-if="!category.childrenOnly"
            class="btn btn-sm normal-case"
            @click="selectCategory(category, index)"
          >
            {{ category.name }}
          </button>
          <button v-else class="btn btn-sm normal-case" @click="toggle(index)">
            {{ category.name }}
          </button>
        </div>

        <BuyoutCategoryTreeSelect
          v-if="category.subcategories && isOpen(index)"
          :categories="category.subcategories"
          @selectCategory="(val) => selectCategory(val, index)"
        />
      </li>
    </ul>
  </div>
</template>
