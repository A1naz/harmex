<script lang="ts" setup>
defineProps({
  rating: {
    type: Number,
    required: true,
  },
});
</script>
<template>
  <div class="rating gap-2">
    <input
      type="radio"
      disabled
      name="rating-2"
      :checked="rating === 1"
      class="mask mask-star-2 bg-yellow-400"
    />
    <input
      type="radio"
      disabled
      name="rating-2"
      :checked="rating === 2"
      class="mask mask-star-2 bg-yellow-400"
    />
    <input
      type="radio"
      disabled
      name="rating-2"
      :checked="rating === 3"
      class="mask mask-star-2 bg-yellow-400"
    />
    <input
      type="radio"
      disabled
      name="rating-2"
      :checked="rating === 4"
      class="mask mask-star-2 bg-yellow-400"
    />
    <input
      type="radio"
      disabled
      name="rating-2"
      :checked="rating === 5"
      class="mask mask-star-2 bg-yellow-400"
    />
  </div>
</template>
