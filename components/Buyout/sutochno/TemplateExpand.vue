<script lang="ts" setup>
const { notify } = useNotification();

const props = defineProps({
  uuid: {
    type: String,
  },
  info: {
    type: Object as any,
    required: true,
  },
  opened: {
    type: Boolean,
  },
});

const emit = defineEmits(["getTemplates", "closeModal"]);
const uuid = toRef(props, "uuid");
const store = useSutochnoBuyoutStore();
const opened = ref();

onMounted(async () => {
  opened.value = props.opened;
});
watch(
  () => props.opened,
  (newState) => {
    opened.value = newState;
  }
);

async function selectTemplate() {
  if (props.info.buyoutsArray.length <= 10) {
    store.createProducts = props.info.buyoutsArray;
  } else {
    notify({
      title: "За раз можно создать максимум 10 выкупов",
      text: "Добавлены первые 10 выкупов",
     group: "error",
    });
    store.createProducts = props.info.buyoutsArray.slice(0, 10);
  }
  emit("closeModal");
}

async function deleteTemplate() {
  const { data, error }: any = await useFetch(
    "/api/sutochno/buyout/deleteTemplate",
    {
      method: "DELETE",
      params: { uuid: props.uuid },
    }
  );

  if (data.value) {
    notify({
      title: "Шаблон удален",
     group: "success",
      duration: 3000,
    });

    emit("getTemplates", uuid.value);
  }
}
</script>

<template>
  <div
    class="collapse collapse-arrow bg-primary bg-opacity-5 rounded-box z-0 overflow-hidden"
  >
    <input v-model="opened" type="checkbox" />
    <div
      class="collapse-title relative text-md font-medium flex flex-col md:justify-between md:flex-row"
    >
      <div>
        <div>
          {{ info.title }}
        </div>
      </div>
      <div class="flex z-10 gap-3">
        <label
          class="btn btn-ghost btn-sm text-red-500 z-10"
          @click="deleteTemplate"
          >Удалить</label
        >
        <nuxt-link to="/sutochno/buyouts/create">
          <label
            class="btn btn-sm btn-primary truncate mr-1 border-none text-white"
            @click="selectTemplate"
            >Добавить</label
          >
        </nuxt-link>
      </div>
    </div>
    <div
      class="collapse-content flex items-center justify-center md:justify-start gap-2 max-h-[56rem] md:max-h-full flex-row space-x-2 overflow-x-auto"
    >
      <BuyoutSutochnoTemplateCard
        v-for="product in info.buyoutsArray"
        :product="product"
      />
    </div>
  </div>
  <!-- <BuyoutDeleteConfirmModal :uuid="uuid" @delete-template="deleteTemplate"></BuyoutDeleteConfirmModal> -->
</template>
