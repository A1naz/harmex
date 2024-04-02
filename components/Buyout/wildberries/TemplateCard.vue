<script setup lang="ts">
const props = defineProps({
  product: {
    type: Object as any,
    required: true,
  },
})
</script>

<template>
  <div
    class="buyout-card max-w-[270px] md:max-w-[285px] card shadow-xl bg-base-100"
  >
    <div
      class="card-body flex flex-col justify-center md:justify-start max-h-[312px] p-3"
    >
      <div class="flex flex-col justify-between mt-2">
        <span class="text-xs">Даты выкупов: </span>
        <div class="text-xs">
          <span> {{ defaultDate(product.dateRange[0]) }}</span>
          -
          <span> {{ defaultDate(product.dateRange[1]) }}</span>
        </div>
      </div>
      <div class="flex justify-between">
        <div class="w-full flex flex-col items-start gap-1">
          <div class="flex flex-col md:flex-row gap-1 w-full">
            <span class="text-xs">Адрес: </span>
            <div v-if="product.adress" class="text-xs">
              {{ product.adress }}
            </div>
            <div v-else class="text-xs ml-2">Нет</div>
          </div>
        </div>
      </div>
      <div class="flex justify-between">
        <div class="w-full flex flex-col items-start">
          <div
            v-if="product.rules.length > 0"
            class="flex flex-col gap-1 w-full"
          >
            <span class="text-xs">Правила: </span>
            <div class="text-xs">
              {{
                product.rules.length
                  ? product.rules.map((rule: any) => rule.id).join(', ')
                  : ''
              }}
            </div>
          </div>
          <div v-else class="my-2"></div>
        </div>
      </div>
      <div></div>
      <div class="divider -my-2" />
      <div class="flex gap-1 items-center">
        <div
          class="flex items-center flex-none flex-0 h-full"
          style="width: 100px"
        >
          <nuxt-img
            style="object-fit: fill"
            class="rounded-xl h-full"
            width="130"
            height="204"
            :src="product?.image || '/logo/logocolor.svg'"
            loading="lazy"
          />
        </div>
        <div class="flex flex-col truncate">
          <div class="truncate">
            <p class="text-sm truncate font-semibold">
              {{ product.name }}
            </p>
            <a
              :href="`https://www.wildberries.ru/catalog/${product.article}/detail.aspx`"
              target="_blank"
              class="text-sm text-primary link link-hover"
            >
              {{ product.article }}
            </a>
          </div>
          <div>
            <span class="text-sm text-gray-500 mr-2">Цена: </span>
            <span class="rounded-md py-0 px-2 bg-success text-sm">{{
              product.priceText
            }}</span>
          </div>
          <div class="flex">
            <span class="text-sm text-gray-500 my-auto mr-2">Количество: </span>
            <span class="rounded-md py-0 px-2 bg-warning text-sm">
              {{ product.quantity }}
            </span>
          </div>
          <div class="flex">
            <span class="text-sm text-gray-500 my-auto mr-2">Размер: </span>
            <div class="flex items-center m-1">
              <div
                v-if="product.sizes"
                class="rounded-md py-0 px-2 bg-success text-sm"
              >
                {{ product.sizes[0] }}
              </div>
              <div v-else class="text-sm text-center ml-2">Нет</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
