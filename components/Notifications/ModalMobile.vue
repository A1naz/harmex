<script setup lang="ts">
const emit = defineEmits(["update:show"]);
const notifications = ref<any>([]);
const lastGetDate = ref(new Date());
const store = useMainStore();

const props = defineProps({
  show: { type: Boolean },
});

async function getNotifications() {
  //ts-ignore
  const { data }: any = await useFetch("/api/notifications/get", {
    method: "GET",
    params: { lastGetDate: lastGetDate.value },
    watch: false,
  });

  notifications.value = [];
  lastGetDate.value = new Date(Date.now());
  notifications.value.push(...(data.value as any));
}

getNotifications();

onMounted(() => {
  setInterval(() => {
    getNotifications();
  }, 60000);
});

async function seenNotification(notification: any) {
  if (!notification.isReaded) {
    useLazyFetch("/api/notifications/seen", {
      method: "POST",
      params: { uuid: notification.uuid },
      watch: false,
    });
  }
}

async function removeSelectedNotifications() {
  const selectedNotifications = notifications.value.filter(
    (n: any) => n.isChecked
  );

  await useFetch("/api/notifications/remove", {
    method: "POST",
    params: { uuids: selectedNotifications.map((n: any) => n.uuid) },
    watch: false,
  });

  notifications.value = notifications.value.filter((n: any) => !n.isChecked);
}

const unreadNotificationsLength = computed(() => {
  return notifications.value.filter((n: any) => !n.isReaded).length;
});

watch(unreadNotificationsLength, (newValue: number) => {
  store.notificationsLength = newValue;
});

const isAllChecked = computed(() => {
  return notifications.value.every((n: any) => n.isChecked);
});

const checkAll = () => {
  if (!isAllChecked.value) {
    notifications.value.map((n: any) => (n.isChecked = true));
  } else {
    notifications.value.map((n: any) => (n.isChecked = false));
  }
};

const modalContent = ref<HTMLDivElement | null>(null);

// onMounted(() => {
//   document.addEventListener("click", (e) => {
//     if (modalContent.value?.contains(e.target as Node) || props.show !== true)
//       return;
//     emit("update:show", false);
//   });
// });
</script>

<template>
  <div
    v-if="show"
    class="modal overflow-y-auto z-50"
    :class="{ 'modal-open': show }"
  >
    <div class="modal-box cursor-auto w-full" @click.stop>
      <div>
        <div class="flex justify-between text-[16px] font-medium mt-4">
          <p>Оповещения ({{ unreadNotificationsLength }})</p>
          <form method="dialog">
            <label
              for="selectUsers"
              class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-lg"
              @click="$emit('update:show', false)"
            >
              ✕
            </label>
          </form>
          <p
            class="text-[14px] text-red-400 cursor-pointer mr-2"
            @click="removeSelectedNotifications"
            v-if="notifications.some((n: any) => n.isChecked)"
          >
            Удалить выбранные
          </p>
        </div>
        <div class="divider"></div>
        <div class="form-control -ml-1" v-if="notifications.length > 0">
          <label class="label cursor-pointer flex justify-start">
            <input
              type="checkbox"
              :checked="isAllChecked"
              @click="checkAll"
              class="checkbox checkbox-primary mr-2"
            />
            <span class="label-text">Выбрать все</span>
          </label>
        </div>
        <div
          v-for="notification of notifications"
          :key="notification.uuid"
          class="flex mt-1"
        >
          <input
            type="checkbox"
            class="checkbox mt-8 mr-1 checkbox-primary"
            :checked="notification.isChecked"
            @change="notification.isChecked = !notification.isChecked"
            style="z-index: 9999"
          />
          <div
            class="collapse rounded-box border-[#eff0ff]"
            :class="{
              'bg-[#f9faff]': !notification.isReaded,
              'bg-white': notification.isReaded,
            }"
          >
            <input
              type="checkbox"
              @change="
                [seenNotification(notification), (notification.isReaded = true)]
              "
            />

            <div class="collapse-title">
              <div class="flex mx-2 my-2 gap-2">
                <div class="flex flex-col flex-wrap w-full">
                  <div class="font-medium flex justify-start w-full text-sm ">
                    {{ notification.category }}
                    <div class="text-xs ml-4 mt-1 absolute right-4">
                      {{ $dayjs(notification.date).fromNow() }}
                    </div>
                  </div>
                  <p class="title-message text-nowrap max-w-40 text-xs">
                    {{ notification.text }}
                  </p>
                </div>
              </div>
            </div>

            <div
              class="collapse-content mx-4 w-full whitespace-normal break-words text-xs"
            >
              {{ notification.text }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  height: 8px;
  width: 4px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 5px;
  border-radius: 4px;
}
</style>
