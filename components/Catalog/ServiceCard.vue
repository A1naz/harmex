<script setup lang="ts">
import MenuBuilder from "~/server/utils/menuBuilder";
const { user } = useUserSession();

defineProps({
  item: { type: Object, required: true },
  favourites: { type: Array, default: () => [] },
  index: { default: 0 },
});

const { notify } = useNotification();
const accesses = MenuBuilder.filteredAccess(
  user?.value?.acesses || []
).allowedPathes;

async function vote(slug: string, mp: string) {
  const response: any = await $fetch("/api/catalog/voteForService", {
    method: "POST",
    query: {
      slug,
      mp,
    },
  });
  if (response.status === "ok") {
    notify({
      type: "success",
      title: "Успешно",
      text: "Вы успешно проголосовали за добавление маркетплейса",
    });
  } else {
    notify({
      type: "error",
      title: "Ошибка",
      text: response.message,
    });
  }
}

function checkAccess(items: any) {
  const found = accesses.some((access: any) =>
    items.path.includes("likes")
      ? access.value === "/productlikes"
      : access.value === items.path
  );

  return accesses.length === 0 ? true : found;
}

defineEmits(["setFavourites"]);
</script>

<template>
  <div
    class="card bg-secondary border p-2.5 rounded-lg shadow-md text-center sm:w-[201px] w-full h-[228px]"
  >
    <div>
      <div
        @click="
          item.items[index].disabled || !checkAccess(item.items[index])
            ? ''
            : navigateTo(`/${item.slug}${item.items[index].path}`)
        "
        class="flex items-start justify-center w-full relative overflow-hidden rounded-lg cursor-pointer h-[83px]"
        :style="{ backgroundColor: item.backgroundColor }"
      >
        <div
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-[24px] font-medium text-center"
        >
          {{ item.name }}
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
        v-if="!item.items[index].disabled && checkAccess(item.items[index])"
        class="heart-btn absolute top-3 right-5"
        @click="
          $emit('setFavourites', `/${item.slug}${item.items[index].path}`)
        "
      >
        <IconCSS
          v-if="favourites.includes(`/${item.slug}${item.items[index].path}`)"
          name="solar:heart-bold"
          class="text-[#1b38ca]"
          size="21"
        />
        <IconCSS
          v-else
          name="solar:heart-outline"
          class="text-[#c8c8c8] heart-outline"
          size="20"
        />
      </button>
    </div>
    <div
      class="w-full text-start mt-3"
      :class="{ 'mt-10': item.items[index].disabled }"
    >
      <div
        class="badge bg-[#FCD1A1] text-[#653600] whitespace-nowrap relative text-[11.5px] text-start -ml-1 cursor-pointer"
        @click="
          item.items[index].disabled || !checkAccess(item.items[index])
            ? ''
            : navigateTo(`/${item.slug}${item.items[index].path}`)
        "
      >
        {{ item.items[index].title }}
      </div>
      <p class="text-[16px] font-bold text-gray-800 my-2 ml-1">
        {{
          item.items[index].priceText
            ? item.items[index].priceText
            : item.items[index].price
            ? item.items[index].price + " ₽"
            : "&nbsp;"
        }}
      </p>
    </div>
    <NuxtLink
      v-if="!item.items[index].disabled"
      :to="
        checkAccess(item.items[index])
          ? `/${item.slug}${item.items[index].path}`
          : ``
      "
      class="btn bg-[#F5F7FF] w-full rounded-xl"
    >
      Перейти
    </NuxtLink>
    <button
      v-if="item.items[index].disabled"
      @click="vote(`${item.items[index].path}`, item.slug)"
      class="z-10 px-5 py-2 bg-[#48b752] text-xl rounded-lg text-white text-[16px] absolute font-medium cursor-pointer -bottom-[5px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-[#3a9642] active:scale-95 active:shadow-md"
    >
      Запросить
    </button>
    <span
      v-if="!checkAccess(item.items[index])"
      class="z-10 px-5 py-2 text-lg rounded-lg text-white text-[16px] absolute font-medium bottom-[50px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out whitespace-nowrap"
    >
      Нет доступа
    </span>

    <div
      v-if="item.items[index].disabled || !checkAccess(item.items[index])"
      class="absolute inset-0 bg-black opacity-70 pointer-events-none rounded-lg"
    />
  </div>
</template>

<style scoped>
.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.heart-outline {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover .heart-outline {
  opacity: 1;
}
</style>
