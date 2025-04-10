whitespa
<script setup lang="ts">
const props = defineProps({
  items: {
    type: Array as () => Array<any>,
    default: () => [],
  },
  favourites: {
    type: Array as () => Array<any>,
    default: () => [],
  },
});

const emit = defineEmits(["setFavourites", "vote"]);

function getServices(items: Array<any>) {
  return items.filter(
    (items: any) =>
      !items.disabled &&
      (items.path == "/buyouts" ||
        items.path == "/deliveries" ||
        items.path == "/reviews")
  );
}
</script>
<template>
  <main class="flex-1 mx-3">
    <div class="flex flex-wrap gap-y-5 gap-x-[25px] w-full justify-start">
      <div
        v-for="(social, index) in items"
        :key="index"
        class="card border rounded-lg shadow-md md:w-[236px] w-full p-3 relative bg-[#fafbff]"
      >
        <div class="flex flex-col gap-2 w-full">
          <div
            @click="
              social.disabled ? '' : navigateTo(`/catalog/${social.slug}`)
            "
            class="flex items-start justify-center w-full relative overflow-hidden rounded-lg cursor-pointer h-[83px]"
            :style="{ backgroundColor: social.backgroundColor }"
          >
            <div
              class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-[24px] font-medium text-center"
            >
              {{ social.name }}
            </div>
            <!-- <NuxtImg
              :src="social.mainImage"
              :alt="social.name"
              class="w-full h-full object-cover cursor-pointer"
              @click="
                social.disabled ? '' : navigateTo(`/catalog/${social.slug}`)
              "
            /> -->
          </div>

          <button
            v-if="!social.disabled"
            class="heart-btn absolute top-3 right-4"
            @click="$emit('setFavourites', `/catalog/${social.slug}`)"
          >
            <Icon
              v-if="favourites.includes(`/catalog/${social.slug}`)"
              name="solar:heart-bold"
              class="text-[#353742]"
              size="21"
            />
            <Icon
              v-else
              name="solar:heart-outline"
              class="text-[#c8c8c8] heart-outline"
              size="20"
            />
          </button>

          <div class="flex font-bold text-[12px] h-7">
            Организация:
            {{ social.organization }}
          </div>
          <div class="flex text-[12px] whitespace-nowrap">
            ИНН:
            {{ social.INN }}
          </div>
          <div class="flex text-[12px] whitespace-nowrap">
            Локация:
            {{ social.location }}
          </div>
          <div class="flex text-[12px] whitespace-nowrap">
            Промокод:
            {{ social.promoCode }}
          </div>
          <div class="text-[12px] flex flex-col">
            Услуги:
            <div
              class="badge bg-[#ede9fe] rounded-md text-[#4338ca] h-[40px] w-full text-[12px] font-semibold text-start mt-1"
            >
              <span class="w-full text-start">
                {{ social.description }}
              </span>
            </div>
          </div>

          <div class="flex justify-between w-full">
            <a
              :href="`tel:${social.phoneNumber.replaceAll(' ', '')}`"
              class="text-[14px] btn btn-primary btn-sm flex justify-between mt-1 sm:w-[180px] w-[84%]"
              :class="{
                'cursor-default': social.disabled,
              }"
            >
              {{ social.phoneNumber }}
              <Icon name="ic:round-phone" size="22" class="mr-1" />
            </a>
            <button
              class="btn btn-outline btn-sm btn-square border-[#d8d8d8] text-[#909090] mt-1 ml-1"
              @click="
                navigateTo(`https://t.me/${social.telegram}`, {
                  open: {
                    target: '_blank',
                  },
                })
              "
            >
              <Icon size="24" class="my-1 mx-1" name="ic:sharp-telegram" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
