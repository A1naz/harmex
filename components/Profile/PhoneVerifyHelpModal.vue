<script setup lang="ts">
defineProps<{ show: boolean }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <input type="checkbox" class="modal-toggle" :checked="show" />
  <div
    v-if="show"
    class="modal modal-open"
    style="z-index: 99999"
    @click.self="emit('close')"
  >
    <div class="modal-box rounded-xl p-6 max-w-md relative">
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-gray-400"
        @click="emit('close')"
      >✕</button>

      <div class="flex flex-col items-center text-center gap-4">
        <div class="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
          <Icon name="material-symbols:phone-locked-outline" size="28" class="text-orange-500" />
        </div>

        <h3 class="text-lg font-semibold text-gray-800">
          {{ $t("Не получается верифицировать номер телефона?") }}
        </h3>

        <p class="text-sm text-gray-500 leading-relaxed">
          {{ $t("Напишите нам в службу поддержки — мы подтвердим номер вручную в кратчайшие сроки. Также можно воспользоваться синей кнопкой поддержки в правом нижнем углу страницы.") }}
        </p>

        <div class="flex flex-col gap-3 w-full mt-2">
          <a
            href="https://t.me/HarmexSupport_bot"
            target="_blank"
            class="btn btn-primary w-full gap-2"
            @click="emit('close')"
          >
            <Icon name="logos:telegram" size="20" />
            Telegram
          </a>
          <a
            href="https://max.ru/id644651000810_bot"
            target="_blank"
            class="btn btn-outline w-full gap-2"
            @click="emit('close')"
          >
            <Icon name="simple-icons:vk" size="20" />
            Max
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

