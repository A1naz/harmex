<script setup lang="ts">
const accountStore = useAccountStore()
const store = useMainStore()

onKeyStroke('Escape', (e) => {
  e.preventDefault()
  store.swapAccountModal = false
})
function close() {
  store.swapAccountModal = false
}

</script>

<template>
  <input id="swapAccountModal" type="checkbox" class="modal-toggle" />
  <div
    :class="{
      'modal-open': store.swapAccountModal,
    }"
    class="modal"
  >
    <div class="modal-box w-11/12 max-w-4xl">
      <label
        for="swapAccountModal"
        class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
        @click="close"
        >✕</label
      >
      <p class="py-4">This modal works with a hidden checkbox!</p>
      <div class="modal-action">
        <div class="collapse bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title text-xl font-medium text-center">
            Добавить аккаунт 
          </div>
          <div class="collapse-content">
            <p>hello</p>
          </div>
        </div>
      </div>
    </div>

    <label
      class="modal-backdrop cursor-pointer"
      for="swapAccountModal"
      @click="close"
      >Close</label
    >
  </div>
</template>

<style scoped></style>
