<script setup lang="ts">
defineProps({
  item: { type: Object, required: true },
  favourites: { type: Array, default: () => [] },
  index: { default: 0 },
});

const { notify } = useNotification();

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

defineEmits(["setFavourites"]);
</script>

<template>
  <div
    class="card bg-secondary border p-2.5 rounded-lg shadow-md text-center w-[201px] h-[252px]"
  >
    <div>
      <NuxtImg
        :src="item.mainImage || 'null'"
        class="mx-auto rounded-xl cursor-pointer"
        width="170px"
        height="105px"
        @click="
          item.items[index].disabled
            ? ''
            : navigateTo(`/${item.slug}${item.items[index].path}`)
        "
      />
      <button
        v-if="!item.items[index].disabled"
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
          item.items[index].disabled
            ? ''
            : navigateTo(`/${item.slug}${item.items[index].path}`)
        "
      >
        {{ item.items[index].title }}
      </div>
      <p class="text-[16px] font-bold text-gray-800 my-2">
        от {{ item.items[index].price }} ₽
      </p>
    </div>
    <NuxtLink
      v-if="!item.items[index].disabled"
      :to="`/${item.slug}${item.items[index].path}`"
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

    <div
      v-if="item.items[index].disabled"
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
