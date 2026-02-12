<script lang="ts" setup>
import MenuBuilder from "~/server/utils/menuBuilder";
const { user } = useUserSession();

defineProps({
  items: {
    type: Array as () => Array<any>,
    default: () => [],
  },
  favourites: {
    type: Array as () => Array<any>,
    default: () => [],
  },
  type: {
    type: String,
    default: "Маркетплейсы",
  },
});

const accesses = MenuBuilder.filteredAccess(
  user?.value?.acesses || []
).allowedPathes;

function getServices(items: Array<any>) {
  const allowedPaths = ["/buyouts", "/deliveries", "/reviews"];
  const found = items.filter(
    (item: any) => !item.disabled && allowedPaths.includes(item.path)
  );

  return accesses.length === 0
    ? found
    : found.filter((item: any) =>
        accesses.some((access: any) => access.value === item.path)
      );
}

defineEmits(["setFavourites", "vote"]);
</script>

<template>
  <main class="flex-1 mx-3">
    <div class="flex flex-wrap gap-y-5 gap-x-[7px] w-full justify-start">
      <div
        v-for="(social, index) in items"
        :key="index"
        class="card border rounded-lg shadow-md md:w-[250px] w-full p-3 relative bg-[#fafbff]"
      >
        <div class="flex flex-col gap-2 w-full">
          <div
            @click="
              social.disabled &&
              (user.username !== 'test' || social.test !== true)
                ? ''
                : navigateTo(`/catalog/${social.slug}`)
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
              class="text-[#1b38ca]"
              size="21"
            />
            <Icon
              v-else
              name="solar:heart-outline"
              class="text-[#c8c8c8] heart-outline"
              size="20"
            />
          </button>

          <div>
            <p class="text-[15px] font-normal mb-1">Доступные услуги:</p>
            <div class="flex gap-x-0.5 text-[#fe6601c2] text-[15px] -ml-1">
              <NuxtLink
                :to="social.disabled ? '' : `/${social.slug}${service.path}`"
                v-for="(service, i) in getServices(social.items)"
                :key="i"
              >
                <div
                  class="badge bg-[#ede9fe] rounded-md text-[#4338ca] h-[20px] text-[11px] font-medium"
                >
                  {{ service.title }}
                </div>
              </NuxtLink>
            </div>
          </div>
          <div class="flex w-full justify-center self-end mt-2">
            <NuxtLink
              :to="
                social.disabled &&
                (user.username !== 'test' || social.test !== true)
                  ? ''
                  : `/catalog/${social.slug}`
              "
              class="text-[15px] w-full btn btn-primary btn-sm"
              :class="{
                'cursor-default':
                  social.disabled &&
                  (user.username !== 'test' || social.test !== true),
              }"
            >
              Все услуги
            </NuxtLink>
          </div>
        </div>
        <button
          v-if="
            social.disabled &&
            (user.username !== 'test' || social.test !== true)
          "
          class="px-5 py-2 bg-[#e86b35] text-xl rounded-lg text-white text-[16px] absolute font-medium cursor-pointer top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out hover:bg-primary"
          style="z-index: 10"
          @click="$emit('vote', social.slug)"
        >
          Запросить
        </button>

        <div
          v-if="
            social.disabled &&
            (user.username !== 'test' || social.test !== true)
          "
          class="absolute inset-0 bg-black opacity-70 pointer-events-none rounded-lg"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
.overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 36px;
  color: rgba(0, 0, 0, 0.35);
  font-weight: bold;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
}

.heart-outline {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover .heart-outline {
  opacity: 1;
}
</style>
