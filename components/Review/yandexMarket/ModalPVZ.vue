<script setup lang="ts">

const props = defineProps({
    review: {} as any,
    state: { type: Boolean, required: true },
    uuid: { type: String, required: true },
    deliveryid: { type: String, required: true },
    pvz: { type: Boolean, default: true }
});
const emit = defineEmits(["close", "publish"]);
const config = useRuntimeConfig();
const store = useMainStore();
const { user } = useUserSession();

const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const closeButton = ref<HTMLElement>();
const { notify } = useNotification();
const creatingReview = ref(false);
const now = useNow();
const { restrictUrl } = useValidation();

const form = reactive({
    text: "",
    rating: 5,
    date: now.value,
    whatLikedInDelivery: {
        fastDelivery: false,
        easyToTrack: false,
    },
    whatLikedInPVZ: {
        canCheckOrder: false,
        easyToFind: false,
        fastService: false,
        politeStaff: false,
        goodCondition: false,
    },
    whatLikedInProduct: {
        goodQuality: false,
        wellPackaged: false,
    },
});

const textValidation = computed(() => {
    return restrictUrl(form.text);
});
const textValidError = computed(() => {
    return textValidation.value
        ? ""
        : "В тексте присутствуют запрещенные символы (нельзя указывать ссылки)";
});

const defaultDelIndex = props.review.delivs.findIndex(
    (rev: any) => rev.delivId == props.deliveryid
);
const selectedDeliv = ref({
    deliveryid: props.review.delivs[defaultDelIndex].delivId,
    uuid: props.review.delivs[defaultDelIndex].buyoutId,
});


async function clearForm() {
    form.date = new Date();
    form.text = "";
    form.rating = 5;
    form.whatLikedInDelivery = {
        fastDelivery: false,
        easyToTrack: false,
    };
    form.whatLikedInPVZ = {
        canCheckOrder: false,
        easyToFind: false,
        fastService: false,
        politeStaff: false,
        goodCondition: false,
    };
    form.whatLikedInProduct = {
        goodQuality: false,
        wellPackaged: false,
    };
}

async function publishReview() {
    creatingReview.value = true;
    // @ts-ignore
    const { data, error } = await useFetch("/api/yandexMarket/review/publish", {
        method: "POST",
        body: {
            ...form,
            pvz: true,
            deliveryid: selectedDeliv.value.deliveryid,
            buyoutuuid: selectedDeliv.value.uuid,
        },
        headers,
    });
    if (error.value) {
        notify({
            title: "Что-то пошло не так",
            text: error.value?.data?.message,
            group: "error",
            duration: 3000,
        });
        creatingReview.value = false;
        return;
    }
    notify({
        title: "Успешно",
        text: "Отзыв успешно опубликован",
        group: "success",
        duration: 3000,
    });
    creatingReview.value = false;
    emit("close");
    emit("publish");
}

watch(
    () => props.uuid,
    (uuid) => {
        clearForm();
    }
);

onMounted(() => {
    clearForm();
});

const isMouseDownOnOverlay = ref(false);

const handleMouseDown = (event: any) => {
    if (event.target.classList.contains("modal")) {
        isMouseDownOnOverlay.value = true;
    } else {
        isMouseDownOnOverlay.value = false;
    }
};

const handleMouseUp = (event: any) => {
    if (isMouseDownOnOverlay.value && event.target.classList.contains("modal")) {
        isMouseDownOnOverlay.value = false;
        emit("close");
    }
};
</script>

<template>
    <input id="review-modal-pvz" type="checkbox" class="modal-toggle" />
    <div ref="closeButton" :class="{
        'modal-open': state,
    }" class="modal overflow-x-hidden cursor-pointer" @mousedown="handleMouseDown" @mouseup="handleMouseUp">
        <div class="modal-box z-50 max-w-xl sm:w-xs w-xl cursor-auto" @click.stop>
            <label for="review-modal-pvz" class="btn btn-sm btn-circle absolute right-2 top-2 btn-ghost"
                @click="$emit('close')">✕</label>
            <div class="flex flex-row justify-center -mt-4">
                <p class="text-xs text-gray-500 justify-self-center">
                    - {{ review.article }} -
                </p>
            </div>

            <h3 class="text-xl font-bold mb-4">Оставить отзыв</h3>
            <div class="pb-2 font-medium">Доставка:</div>
            <select v-model="selectedDeliv" class="select w-full mb-4 bg-base-200 text-gray-500">
                <option v-for="(rev, index) in review.delivs" :default="index == rev[defaultDelIndex]"
                    :value="{ deliveryid: rev.delivId, uuid: rev.buyoutId }" class="m-6">
                    {{
                        `${defaultDateShort(rev.updatedAt)} ${rev.sex == "Нет" ? "" : " - получатель: " + rev.sex
                        } - размер: ${rev.sizeparam} - цена: ${rev.pricebuy}р.`
                    }}
                </option>
            </select>

            <div class="flex flex-col gap-4">
                <div class="w-full">
                    <div class="pb-2 font-medium">Комментарий</div>

                    <textarea v-model="form.text" class="textarea w-full textarea-md bg-base-200"
                        placeholder="Поделитесь впечатлениями о пункте выдачи" />

                    <div class="text-error">
                        {{ textValidError }}
                    </div>
                </div>

                <div>
                    <div class="pb-2 font-medium mb-4">Что вам особенно понравилось</div>
                    
                    <div class="mb-4">
                        <div class="text-sm font-semibold mb-2">Доставка</div>
                        <div class="flex flex-col gap-2 ml-4">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input 
                                    v-model="form.whatLikedInDelivery.fastDelivery" 
                                    type="checkbox" 
                                    class="checkbox checkbox-primary checkbox-sm"
                                />
                                <span class="text-sm">Быстро привезли</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input 
                                    v-model="form.whatLikedInDelivery.easyToTrack" 
                                    type="checkbox" 
                                    class="checkbox checkbox-primary checkbox-sm"
                                />
                                <span class="text-sm">Удобно отследить</span>
                            </label>
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="text-sm font-semibold mb-2">Пункт выдачи</div>
                        <div class="flex flex-col gap-2 ml-4">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input 
                                    v-model="form.whatLikedInPVZ.canCheckOrder" 
                                    type="checkbox" 
                                    class="checkbox checkbox-primary checkbox-sm"
                                />
                                <span class="text-sm">Можно проверить заказ</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input 
                                    v-model="form.whatLikedInPVZ.easyToFind" 
                                    type="checkbox" 
                                    class="checkbox checkbox-primary checkbox-sm"
                                />
                                <span class="text-sm">Пункт выдачи легко найти</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input 
                                    v-model="form.whatLikedInPVZ.fastService" 
                                    type="checkbox" 
                                    class="checkbox checkbox-primary checkbox-sm"
                                />
                                <span class="text-sm">Быстрое обслуживание</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input 
                                    v-model="form.whatLikedInPVZ.politeStaff" 
                                    type="checkbox" 
                                    class="checkbox checkbox-primary checkbox-sm"
                                />
                                <span class="text-sm">Вежливые сотрудники</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input 
                                    v-model="form.whatLikedInPVZ.goodCondition" 
                                    type="checkbox" 
                                    class="checkbox checkbox-primary checkbox-sm"
                                />
                                <span class="text-sm">Состояние: чистота и ремонт</span>
                            </label>
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="text-sm font-semibold mb-2">Товары</div>
                        <div class="flex flex-col gap-2 ml-4">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input 
                                    v-model="form.whatLikedInProduct.goodQuality" 
                                    type="checkbox" 
                                    class="checkbox checkbox-primary checkbox-sm"
                                />
                                <span class="text-sm">Хорошее качество</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input 
                                    v-model="form.whatLikedInProduct.wellPackaged" 
                                    type="checkbox" 
                                    class="checkbox checkbox-primary checkbox-sm"
                                />
                                <span class="text-sm">Товары надёжно упакованы</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="pb-2 font-medium">Запланировать отзыв</div>
                    <div class="relative w-full p-6 bg-base-200 rounded-lg">
                        <div class="absolute left-3 top-3 text-gray-500">
                            {{
                                form.date <= now ? "Опубликовать сейчас" : $dayjs(form.date).format("DD.MM.YYYY HH:mm") }}
                                </div>
                                <div class="absolute right-3 top-2 w-30" style="z-index: 9999999">
                                    <DatePicker v-model="form.date" />
                                </div>
                        </div>
                    </div>
                </div>
                <div class="modal-action justify-between">
                    <div>
                        <button class="btn btn-sm btn-ghost btn-outline border-none text-error" @click="clearForm">
                            Сбросить
                        </button>
                    </div>
                    <div class="flex gap-2">
                        <label for="review-modal-pvz" class="btn btn-sm btn-ghost"
                            @click="$emit('close')">Отмена</label>
                        <button for="review-modal-pvz" class="btn btn-primary btn-sm border-none text-white"
                            :disabled="!textValidation || creatingReview" @click="publishReview">
                            Отправить
                        </button>
                    </div>
                </div>
            </div>
        </div>
</template>

<style scoped>
</style>
