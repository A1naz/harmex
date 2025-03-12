<script lang="ts" setup></script>

<template>
  <div>
    <NuxtNotifications
      position="top right"
      :max="2"
      :close-on-click="true"
      :pause-on-hover="true"
      :speed="500"
    />
    <NuxtNotifications
      group="success"
      type="success"
      :duration="5000"
      :width="400"
      position="top right"
      dangerously-set-inner-html
    >
      <template #body="{ item, close }">
        <div class="bg-[#fce9e1] w-[364px] mt-5 min-h-[60px] rounded-lg flex pt-2">
          <div class="w-[50px]">
            <Icon name="si:info-fill" size="22" class="ml-3" />
          </div>
          <div>
            <div class="text-[14px]">
              {{ item.title }}
            </div>
            <div class="text-[12px] mb-2 max-w-[300px]">
              {{ item.text }}
            </div>
          </div>
        </div>
      </template>
    </NuxtNotifications>
    <NuxtNotifications
      group="error"
      type="error"
      :duration="5000"
      :width="400"
      position="top right"
      dangerously-set-inner-html
    >
      <template #body="{ item, close }">
        <div
          class="bg-[#f4eaeb] w-[364px] mt-5 min-h-[60px] rounded-lg flex pt-2"
        >
          <div class="w-[50px]">
            <Icon name="ix:error" size="22" class="ml-3" />
          </div>
          <div>
            <div class="text-[14px]">
              {{ item.title }}
            </div>
            <div class="text-[12px] mb-2 max-w-[300px]">
              {{ item.text }}
            </div>
          </div>
        </div>
      </template>
    </NuxtNotifications>
    <NuxtLayout class="overflow-hidden">
      <NuxtLoadingIndicator color="#296dff" />
      <NuxtPage />
      <div class="my-12 md:hidden" />
    </NuxtLayout>
  </div>
</template>

<style lang="scss">
@import "@/assets/style/datepicker.css";

.myCustomBtnNavbar {
  @apply btn btn-outline border-base-200 btn-sm h-[2.5rem] text-base-300 rounded-full p-2 bg-white 
         hover:bg-white hover:text-black hover:border-base-200 hover:shadow-xl
         active:bg-base-300 active:text-white;
  &:hover {
    box-shadow: 0 4px 15px rgb(207, 212, 226);
  }
}

.myCustomBtnSm {
  @apply btn btn-sm btn-outline border-[#1b38ca] rounded-xl bg-white 
         hover:bg-white hover:text-black hover:border-[#1b38ca] hover:shadow-xl
         active:bg-[#1934bd] active:text-white;
  &:hover {
    box-shadow: 0 4px 15px rgb(207, 212, 226);
  }
}

.myCustomBtn {
  @apply btn btn-outline border-primary rounded-xl bg-white 
         hover:bg-white hover:text-black hover:border-primary hover:shadow-xl
         active:bg-primary-content;
  &:hover {
    box-shadow: 0 4px 15px rgb(207, 212, 226);
  }
}

html {
  height: 100%;
}
body {
  font-family: "Inter", sans-serif;
  height: 100%;
}

.notify-text {
  font-size: 0.9rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
  color: gray;
}

.notify-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: white;
}

.notify-card {
  padding: 1rem;
  background-color: #121212;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  width: 300px;
  max-width: 100%;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease-in-out;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s linear;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active,
.pop-leave-active {
  transition: transform 0.4s cubic-bezier(0.5, 0, 0.5, 1), opacity 0.4s linear;
}

.pop-enter,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.3) translateY(-50%);
}

.page-enter-active,
.page-leave-active {
  transition: all 0.1s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(0.1rem);
}

.heading {
  @apply text-xl font-bold mt-1;
}

.title {
  @apply text-2xl font-bold mt-1;
}

.description {
  @apply text-sm font-light mt-1;
}
</style>
