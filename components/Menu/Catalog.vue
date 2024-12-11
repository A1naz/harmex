<script setup lang="ts">
const props = defineProps({
  items: {
    type: Array as () => Array<any>,
    default: () => [],
  },
  selectedType: {
    type: String,
    default: "Маркетплейсы",
  }
});

const emit = defineEmits(["update:selectedType"]);

const selectedType = toRef(props, "selectedType");

function selectType(type: string) {
        console.log(type);
  emit("update:selectedType", type);
}
</script>

<template>
  <div
    class="py-4 border-2 border-l-0 border-t-0 border-b-0 border-[#bdc8fc]"
  >
    <ul class="mt-4 cursor-pointer">
      <li v-for="item in items" :key="item">
        <a
          class="flex justify-between p-2 text-[##909090] rounded-lg ml-4 mr-8"
          :class="{ 'bg-[#fce9e1] text-[#e86b35]': selectedType === item }"
          @click="selectType(item)"
        >
          <div>
            <Icon
              name="iconamoon:menu-burger-horizontal-fill"
              size="25"
              class="mr-4"
              :class="{
                'text-primary': selectedType === item,
              }"
            />
            <span class="font-medium text-sm">{{ item }}</span>
          </div>
          <div>
            <Icon
              name="material-symbols-light:keyboard-arrow-right"
              size="25"
              class="-mr-1"
 
            />
          </div>
        </a>
      </li>
    </ul>
  </div>
</template>
