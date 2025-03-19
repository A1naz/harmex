<script setup lang="ts">
defineProps({
  show: { type: Boolean, required: true },
});

const emit = defineEmits(["close"]);
const { notify } = useNotification();
const { user } = useUserSession();
const bankDetails: any = ref({});
const currency = useCurrency()
const {width} = useWindowSize()

function closeModal() {
  summ.value = 500;
  email.value = user.value?.email;
  form.value = "addBalance";
  emit("close");
}

const qrImage = ref("null");
const paymentUuid = ref("null");
const loading = ref(false);
const summ = ref(500);
const email = ref("");
const summArr = [5000, 25000, 50000, 100000];
const form = ref("addBalance");

async function balanceUpdate() {
  loading.value = true;
  const { data, error }: any = await useFetch("/api/payment/getQR", {
    method: "GET",
    params: {
      summ: summ.value,
      email: email.value,
      faceType: "yurFace",
    },
  });

  if (error.value) {
    notify({
      title: "Что-то пошло не так",
      text: error.value?.data?.message,
     group: "error",
      duration: 3000,
    });
    return;
  }
  if (data.value) {
    qrImage.value = data.value.qrCode;
    paymentUuid.value = data.value.uuid;
    loading.value = false;
    bankDetails.value = data.value.bankDetails;
    notify({
     group: "success",
      title: "Успешно",
      text: "Реквизиты для пополнения кошелька созданы",
    });
  }

  form.value = "result";
  loading.value = false;
  return;
}

const isEmail = computed(() => {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email.value);
});

onMounted(() => {
  email.value = user.value?.email ? user.value?.email : "";
});
const showTooltip = ref(false);
</script>

<template>
  <input type="checkbox" id="selectUser" :checked="show" class="modal-toggle" />
  <div class="modal cursor-pointer z-[9999]" @click="closeModal">
    <div
      class="modal-box rounded-[8px] w-full max-w-xl cursor-auto border py-[36px] px-[10px] sm:px-[40px] border-[#dee2e6]"
      @click.stop
    >
      <form method="dialog">
        <label
          class="btn btn-sm btn-circle btn-ghost bg-[#e5e5e5] absolute right-2 top-2"
          @click="closeModal"
        >
          ✕
        </label>
      </form>
      <div v-if="form == 'addBalance'" class="flex flex-col w-full gap-[72]">
        <div
          class="flex flex-col w-full justify-center items-center gap-[15px] mb-[47px]"
        >
          <h1 class="text-xl font-bold">Пополнение счета</h1>
          <div class="flex flex-col gap-[4px] justify-start w-full">
            <span>{{ "Введите почту для отправки чека" }}</span>
            <input
              type="text"
              class="w-full input input-bordered rounded-lg p-2 mt-[4px]"
              placeholder="example@example.com"
              v-model="email"
            />
            <span>{{ "Сумма пополнения" }}</span>
            <input
              type="number"
              class="w-full input input-bordered rounded-lg p-2 mt-[4px]"
              placeholder="Введите сумму пополнения"
              v-model="summ"
            />
          </div>
          <div class="flex gap-[3px] w-full flex-nowrap flex-row justify-between">
            <button
              @click="summ = item"
              v-for="item in summArr"
              class="md:px-6 rounded-[10px] btn btn-sm py-1.5 mt-0.5 md:mt-0 btn-neutral text-white"
            >
              {{ currency.format(item) }} <span class="hidden md:inline">

        
              </span>
            </button>
          </div>
        </div>
        <div class="w-full">
          <div class="my-0.5 mx-2 text-[12px] -mt-8">
            Пополнение с Понедельника по Пятницу с 07:00 до 19:00.
          </div>
          <div class="my-0.5 mx-2 text-[12px]">
            Переводы, сделанные в выходные, начисляются в Понедельник до 09:00.
          </div>
          <div class="my-0.5 mx-2 text-[12px]">
            Финансовые средства зачисляются на баланс от 3х минут до 72 часов.
          </div>
          <div v-if="user.fizFace">
            <div class="my-0.5 mx-2 text-[12px]">
              После пополнения баланса, если вам потребуется вывести средства, сумма вывода будет уменьшена на 15% для учета налоговых обязательств. 
            </div>
            <div class="my-0.5 mx-2 text-[12px]">
              В целях безопасности ваших данных, пожалуйста, не начинайте процесс вывода самостоятельно.
            </div>
          </div>
        </div>

        <div class="flex gap-[16px] self-end mt-1">
          <button
            :disabled="!summ || loading || !isEmail || summ < 250"
            @click="balanceUpdate"
            class="py-2 px-9 btn btn-sm h-[2.5rem] disabled:text-white border rounded-lg disabled:bg-[#595959] disabled:border-[#595959] text-white bg-primary border-primary hover:bg-white hover:text-primary hover:border-primary"
          >
            Далее
          </button>
        </div>
      </div>
      <div v-else class="flex flex-col w-full gap-[72]">
        <div
          class="flex flex-col w-full justify-center items-center gap-[20px]"
        >
          <h1 class="text-xl font-bold">Пополнение счета</h1>
          <div class="flex gap-[20px] justify-start w-full">
            <span class="text-lg font-semibold">{{
              "Оплата заказа" + " #" + paymentUuid
            }}</span>
            <div
              class="badge badge-primary min-w-auto h-[25px] min-w-[130px]"
            >
              {{ summ +  ' ₽' }}
            </div>
          </div>

          <div class="flex flex-col gap-[10px] w-full justify-start">
            <div
            @mouseover="showTooltip = true"
            @mouseleave="showTooltip = false"
              class="flex flex-col rounded-[10px] leading-4 px-[13px] py-[7px] bg-[#f6f6f6] cursor-pointer"
              data-tip
            >
            <div class="relative group inline-block">
              <div class="flex flex-col">

                <span class="text-sm">Получатель платежа:</span>
                <span class="font-semibold">{{bankDetails.IP}}</span>
              </div>
              
              <div v-if="showTooltip" class="absolute left-1/2 text-xs md:text-sm -translate-x-1/2 mt-2 w-max rounded bg-gray-800 text-white p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 whitespace-pre-wrap">
                  <br> БИК {{ bankDetails.NameBank }}</br>
                  <br> БИК {{ bankDetails.BIC }}</br>
                  <br> Корреспондентский счёт {{ bankDetails.CS }}</br>
                  <br> Счёт получателя {{ bankDetails.RS }}</br>
                  <br> Наименование получателя {{ bankDetails.IP }}</br>
                  <br> ИНН {{ bankDetails.INN }}</br>
                </div>
                </div>
            </div>
            <div
              class="flex flex-col rounded-[10px] leading-4 px-[13px] py-[7px] bg-[#f6f6f6]"
            >
              <span class="text-sm">Метод оплаты:</span>
              <span class="font-semibold">Перевод на расчетный счет с карты физ.лица или бизнес-карты</span>
            </div>
          </div>
          <div class="flex flex-col gap-[10px] w-full justify-start">
            <span class="font-semibold">Быстрое пополнение по QR-коду:</span>
            <div class="flex justify-around gap-4">
              <ol class="list-decimal pl-6 font-medium text-sm">
                <li>Откройте приложение банка на моб. телефоне.</li>
                <li>Выберите оплату по QR-коду.</li>
                <li>Наведите камеру телефона на QR-код счета.</li>
                <li>Произведите оплату.</li>
                <li>
                  Оплата будет зачислена автоматически в течении 3х часов.
                </li>
                <li>
                  Если у Вас возникли проблемы с платежом, напишите в службу поддержки (справа внизу).
                </li>
                <li>
                  Для пополнения баланса по счетам с расчетного счета вашей организации на наш р/с, напишите в службу поддержки, чтобы заключиться между организациями по ЭДО и выставить счет на оплату.
                </li>
              </ol>
       
            </div>
          </div>
          <div
              class="flex flex-col w-full gap-[20px] items-center justify-center"
            >
              <NuxtImg :src="qrImage" class="w-[200px] h-[200px]" />
              <span class="text-[#cc5f5f] text-xs"
                >Не изменяйте данные, иначе платеж не будет зачислен</span
              >
            </div>
          <div>
            <span class="text-[0.825rem]"
              >Ваши личные данные будут использоваться для обработки ваших
              заказов и других целей, описанных в нашей
              <a target="_blank" href="/docs/conf_policy.pdf"  class="text-primary link no-underline hover:underline"
                >политике конфидециальности</a
              >, продолжая вы соглашаетесь с условиями<a
              target="_blank" :href="bankDetails.docName ? `/docs/${bankDetails.docName}.pdf` : '/docs/oferta.pdf'"  
                class="text-primary link no-underline hover:underline"
              >
                оферты</a
              >.</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
[data-tip] {
  white-space: pre-wrap; /* Поддержка переноса строк */
}
</style>
