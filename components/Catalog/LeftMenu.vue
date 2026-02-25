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
  isChecked: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:selectedType"]);

const selectedType = toRef(props, "selectedType");

function selectType(type: string) {
  emit("update:selectedType", type);
}
const { height } = useWindowSize();
</script>

<template>
  <div
    class="w-[260px] absolute h-screen overflow-hidden py-4 lg:block hidden"
  >
    <div class="fixed top-[65px] bottom-0 w-[2px] bg-[#bdc8fc] pointer-events-none" style="left: 260px;" />
    <ul class="-mt-4 cursor-pointer">
      <li v-for="item in items" :key="item">
        <a
          class="flex justify-between p-2 text-[##909090] rounded-lg w-[240px]"
          :class="{ 'bg-[#fce9e1] text-[#e86b35]': selectedType === item }"
          @click="selectType(item)"
        >
          <div>
            <Icon
              name="iconamoon:menu-burger-horizontal-fill"
              size="25"
              class="mr-4 -mb-2"
              :class="{
                'text-primary': selectedType === item,
              }"
            />
            <span class="font-medium text-[16px]">{{ item }}</span>
          </div>
          <div>
            <Icon
              name="material-symbols-light:keyboard-arrow-right"
              size="25"
              class="mr-4"
            />
          </div>
        </a>
      </li>
    </ul>
  </div>
</template>
