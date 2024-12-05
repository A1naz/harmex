<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";

type DropdownPosition = "bottom-end" | "bottom-start" | "top-end" | "top-start";

const props = defineProps({
  position: {
    type: String as PropType<DropdownPosition>,
    default: "bottom-end",
  },
  matchTriggerWidth: {
    type: Boolean,
    default: false,
  },
});

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const dropdownWidth = ref<string>("auto");

const dropdownPosition = computed(() => {
  const positions: Record<DropdownPosition, string> = {
    "bottom-end": "right-0 top-full",
    "bottom-start": "left-0 top-full",
    "top-end": "right-0 bottom-full",
    "top-start": "left-0 bottom-full",
  };
  return positions[props.position];
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    isOpen.value = false;
  }
};

const updateDropdownWidth = () => {
  if (props.matchTriggerWidth && triggerRef.value) {
    dropdownWidth.value = `${triggerRef.value.offsetWidth}px`;
  } else {
    dropdownWidth.value = "auto";
  }
};

onMounted(() => {
  updateDropdownWidth();
  window.addEventListener("resize", updateDropdownWidth);
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateDropdownWidth);
  document.removeEventListener("click", handleClickOutside);
});

watch(isOpen, (newVal) => {
  if (newVal) {
    updateDropdownWidth();
  }
});
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block w-full">
    <div ref="triggerRef" @click="toggleDropdown" class="cursor-pointer">
      <slot name="button" :isDropdownOpen="isOpen">
        <button class="btn">Кнопка</button>
      </slot>
    </div>
    <transition name="fade">
      <div
        v-if="isOpen"
        class="absolute dropdown-content bg-white rounded-box shadow border border-[#eaeaea] z-10 mt-0.5"
        :class="dropdownPosition"
        :style="{ width: dropdownWidth }"
      >
        <slot name="content" :close="() => (isOpen = false)">
          <p class="p-4 text-gray-500">Добавьте содержимое через слот</p>
        </slot>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
