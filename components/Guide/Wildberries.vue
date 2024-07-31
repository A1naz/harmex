<script setup lang="ts">
const liArchiveQuestData = []

const inputs = reactive<any>({
  first: false,
  second: false,
  third: false,
  fourth: false,
  fifth: false,
  sixth: false,
  seventh: false,
  eighth: false,
})

const closeOtherInputs = (input: string) => {
  Object.keys(inputs).forEach((key: any) => {
    if (key !== input) {
      inputs[key] = false
    }
  })
}
</script>

<template>
  <div class="flex flex-col gap-4 px-7 pb-20 w-full overflow-y-auto">
    <div class="font-bold text-2xl mb-4">Wildberries</div>

    <div class="flex justify-center items-center w-full text-lg font-bold">
    В разработке...
  </div>
  
  </div>
</template>

<style scoped></style>
