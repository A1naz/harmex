<script setup lang="ts">
const props = defineProps({
  items: {
    type: Array as () => Array<any>,
    default: () => [],
  },
  selectedType: {
    type: String,
    default: "Маркетплейсы",
  },
});

const selectedType = toRef(props, "selectedType");

const emit = defineEmits(["update:selectedType"]);

function selectType(type: string) {
  emit("update:selectedType", type);
}
</script>
<template>
  <aside
    class="w-[270px] h-screen py-4 border-2 border-l-0 border-t-0 border-b-0 border-[#bdc8fc] lg:block hidden"
  >
    <ul class="space-y-2 mx-2 mt-4 cursor-pointer">
      <li v-for="item in items" :key="item">
        <a
          @click="selectType(item)"
          class="flex justify-between p-2 text-[##909090] rounded-lg"
          :class="{ 'bg-[#f5f7ff] text-[#212121]': selectedType == item }"
        >
          <div>
            <Icon
              name="iconamoon:menu-burger-horizontal-fill"
              size="20"
              class="mr-4"
              :class="{
                'text-[#F72585]': selectedType == item,
              }"
            />
            <span class="font-medium text-sm">{{ item }}</span>
          </div>
          <div>
            <Icon
              name="material-symbols-light:keyboard-arrow-right"
              size="25"
              class="mr-4"
              :class="{
                'text-[#F72585]': selectedType == item,
              }"
            />
          </div>
        </a>
      </li>
    </ul>
  </aside>
</template>
