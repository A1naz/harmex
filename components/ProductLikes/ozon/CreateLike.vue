<script setup lang="ts">
const { notify } = useNotification();

const props = defineProps({
  show: { type: Boolean, required: true },
});

const emit = defineEmits(["closeModal", "create"]);
const amount = ref(0);
const loadingUrl = ref(false);
const url = ref("");
const period = ref("3h");
const productData = ref<any>(null);
const urlError = ref(false);
const creatingLike = ref(false);

async function create() {
  creatingLike.value = true;
  const { data, error } = await useFetch("/api/ozon/productlikes/create", {
    method: "POST",
    body: {
      url: url.value,
      amount: amount.value,
      period: period.value,
      productData: productData.value,
    },
  });
  if (error.value) {
    creatingLike.value = false;
    return notify({
      type: "error",
      title: "Что-то пошло не так",
      text: error.value.message,
    });
  }
  if (data.value) {
    creatingLike.value = false;
    creatingLike.value = false;
    url.value = "";
    amount.value = 0;
    productData.value = null;
    notify({ type: "success", title: "Успешно" });
    emit("create");
    emit("closeModal");
    // getProductLikes()
  }

  removeProduct();
}
async function sendUrl() {
  const { data, error } = await useFetch("/api/ozon/productlikes/extract", {
    method: "POST",
    body: {
      url: url.value,
    },
  });
  if (data.value) {
    productData.value = data.value;
    urlError.value = false;
  }
  if (error.value) urlError.value = true;

  loadingUrl.value = false;
}

let timeout = null as NodeJS.Timer | null;
async function changeUrl() {
  if (url.value === "") return;
  loadingUrl.value = true;
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(sendUrl, 2000);
}
function selectPeriod(event: any) {
  period.value = event.target.value;
}
function removeProduct() {
  productData.value = null;
  url.value = "";
  amount.value = 0;
}
</script>

<template>
  <div
    v-if="props.show === true"
    :class="{ 'modal-open': props.show }"
    class="modalCustom fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm"
    @click="$emit('closeModal')"
  >
    <div
      class="flex flex-col bg-base-100 rounded-lg w-full max-w-sm gap-5 p-4"
      @click.stop
    >
      <div class="flex justify-end">
        <button
          class="text-gray-500 hover:text-gray-700 self-end"
          @click="$emit('closeModal')"
        >
          <Icon name="material-symbols:close-rounded" size="24" />
        </button>
      </div>
      <div class="bg-base-100 rounded-lg">
        <div class="flex flex-wrap items-center gap-6 mb-2">
          <div class="relative w-full">
            <div>Вставьте ссылку:</div>
            <div class="join w-full min-h-min md:min-h-[48px] mt-2">
              <input
                v-model="url"
                :class="{
                  'input-error': urlError,
                  'input-success': productData,
                }"
                :disabled="productData"
                tabindex="0"
                class="input w-full input-sm bg-base-200 h-[2.5rem] text-lg join-item"
                placeholder="Введите ссылку"
                type="text"
                @input="changeUrl"
              />
              <button
                :class="{
                  'btn-disabled': !productData,
                }"
                class="btn btn-sm btn-ghost btn-circle bg-base-200 h-[2.5rem] join-item rounded-r-md"
                @click="removeProduct"
              >
                <span
                  v-show="loadingUrl"
                  class="loading loading-spinner loading-xs p-2"
                />

                <!-- Insert a backspace svg -->
                <div v-if="!loadingUrl">
                  <IconCSS
                    v-if="productData"
                    class="w-6 h-6"
                    name="fluent:backspace-24-regular"
                  />
                </div>
              </button>
            </div>
          </div>
          <div>
            <div>Количество:</div>
            <div class="relative flex items-center justify-center ml-auto mt-2">
              <button
                :disabled="amount <= 0"
                class="absolute left-0 btn btn-ghost btn-sm btn-square h-[2.5rem]"
                @click="amount -= 10"
              >
                <IconCSS size="16" name="ic:round-minus" />
              </button>
              <div
                class="input-sm rounded-lg w-24 text-center bg-base-200 h-[2.5rem] md:pt-2.5 text-lg"
              >
                {{ amount }}
              </div>
              <button
                :disabled="amount >= 1000"
                :class="{
                  'btn-disabled': !productData,
                }"
                class="absolute right-0 btn btn-ghost btn-sm btn-square h-[2.5rem]"
                @click="amount += 10"
              >
                <IconCSS size="16" name="ic:round-plus" />
              </button>
            </div>
          </div>
          <div>
            <div>Период выполнения:</div>
            <select
              :disabled="!productData"
              class="select select-sm h-[2.5rem] w-44 mt-2"
              @change="selectPeriod"
            >
              <option value="3h">3 часа</option>
              <option value="12h">12 часов</option>
              <option value="1day">1 день</option>
              <option value="3days">3 дня</option>
              <option value="7days">7 дней</option>
              <option value="14days">14 дней</option>
            </select>
          </div>
          <div
            v-if="productData && productData.type === 'brand'"
            class="productinfo"
          >
            <div>Информация о бренде:</div>
            <div class="flex gap-4 mt-2 items-start">
              <nuxt-img
                class="rounded-lg object-contain h-8"
                :src="productData.image"
              />
              <div class="name truncate">
                {{ productData.name }}
              </div>
            </div>
          </div>
          <div class="w-full ml-auto self-end justify-end">
            <button
              :disabled="creatingLike"
              :class="{
                'btn-disabled': !productData || amount <= 0,
              }"
              class="btn btn-sm h-[2.5rem] w-full btn-primary border-none text-white"
              @click="create"
            >
              Добавить
            </button>
          </div>
        </div>
        <div
          v-if="productData && productData.type === 'product'"
          class="productinfo mt-4"
        >
          <div>Информация о товаре:</div>
          <div class="flex gap-4 mt-2 items-start">
            <nuxt-img
              width="32"
              class="rounded-lg object-contain w-8"
              :src="productData.image"
            />
            <div class="article">
              <a
                :href="`https://www.ozon.ru/product/${productData.article}`"
                target="_blank"
                class="text-sm text-primary link link-hover"
              >
                {{ productData.article }}
              </a>
            </div>
            <div class="name truncate">
              {{ productData.name }}
            </div>
            <div class="price">
              {{ productData.priceText }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
