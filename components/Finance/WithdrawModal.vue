<!-- eslint-disable ts/no-use-before-define -->
<script setup lang="ts">
const props = defineProps({
  show: { type: Boolean, required: true },
});

const { user } = useUserSession();
const config = useRuntimeConfig();
const { notify } = useNotification();
const emit = defineEmits(["close"]);
const currency = useCurrency();
function closeModal() {
  emit("close");
  modalType.value = "choice";
  selectedWalletType.value = null;
  walletError.value.value = false;
  selectedOption.value = null;
}

const modalType = ref("choice");
const form = ref(["Личный баланс", "Партнерская программа"]);
const selectedOption = ref<string | null>(null);

const walletError = ref({ title: "Выберите счет списания", value: false });
const selectedWalletType = ref<string | null>("wallet");
const amountRaw = ref(0);
const partnerAgreement = ref(false);

async function getPartnerAgreement() {
  const { data }: any = await useFetch("/api/finance/partnerAgreement");
  partnerAgreement.value = data.value;
}

await getPartnerAgreement();

const withdrawForm = ref({
  amount: currency.format(amountRaw.value),
  walletType: modalType.value,
});
const formattedAmount = ref(currency.format(amountRaw.value));
const cardNumberInn = ref("");
const cardInfo = ref({
  BIK: "",
  CS: "",
  RS: "",
  bankName: "",
  orgName: "",
  FIO: "",
});
function formatCurrency(value: number) {
  return currency.format(value);
}
function updateAmount(event: Event) {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/[^\d.,]/g, "");

  // Convert value to a number and then back to string to remove extraneous characters
  if (value === "") {
    amountRaw.value = 0;
    formattedAmount.value = "";
  } else {
    amountRaw.value = Number.parseFloat(value.replace(/,/g, ""));
    if (!Number.isNaN(amountRaw.value)) {
      formattedAmount.value = formatCurrency(amountRaw.value);
    }
  }

  withdrawForm.value.amount = formattedAmount.value;
}

async function createPartnerWithdraw() {
  const { data }: any = await useFetch("/api/partnerDetails/createWithdraw", {
    method: "POST",
    body: {
      amount: amountRaw.value,
    },
    watch: false,
  });
  if (data.value && data.value.status === "ok") {
    modalType.value = "finalForm";
  } else if (data.value && data.value.status === "error") {
    notify({
      title: "Что-то пошло не так",
      text: data.value.message,
      type: "error",
      duration: 3000,
    });
  }
}

async function createBalanceWithdraw() {
  const { data, error }: any = await useFetch("/api/finance/createWithdraw", {
    method: "POST",
    body: {
      amount: amountRaw.value,
      info: cardNumberInn,
      cardInfo: cardInfo.value,
    },
    watch: false,
  });
  if (data.value && data.value.status === "ok") {
    modalType.value = "finalForm";
  } else if (data.value && data.value.status === "error") {
    console.log(error.value);
    notify({
      title: "Что-то пошло не так",
      text: data.value.message,
      type: "error",
      duration: 3000,
    });
  }
}
onMounted(() => {
  if (!user.value.fizFace && user.value?.orgInn) {
    cardNumberInn.value = user.value?.orgInn;
  }
});
</script>

<template>
  <input id="selectUser" type="checkbox" :checked="show" class="modal-toggle" />
  <div class="modal cursor-pointer z-[9999]" @click="closeModal">
    <div
      class="modal-box rounded-[8px] w-full sm:w-9/12 sm:max-w-2xl cursor-auto border py-[36px] px-[10px] sm:px-[58px] border-[#dee2e6]"
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

      <!-- ///choice form  -->
      <div v-if="modalType === 'choice'" class="flex flex-col w-full gap-[72]">
        <div class="flex flex-col w-full justify-center items-center gap-4">
          <h1 class="text-2xl font-bold">Вывод средств</h1>
          <div class="text-lg">Выберите откуда вывести средства</div>

          <div class="flex flex-col gap-4 w-full">
            <button
              class="btn btn-ghost bg-base-200 w-full hover:text-blue-500 hover:bg-blue-50 shadow-none drop-shadow-none"
              @click="modalType = 'baseBalance'"
            >
              <span class="text-base-content">Личный баланс</span>
              <Icon class="ml-auto" name="tabler:arrow-right" size="24" />
            </button>
            <button
              class="btn btn-ghost bg-base-200 w-full hover:text-blue-500 hover:bg-blue-50"
              @click="modalType = 'partnerBalance'"
            >
              <span class="text-base-content">Партнерская программа</span>
              <Icon class="ml-auto" name="tabler:arrow-right" size="24" />
            </button>
          </div>
        </div>
      </div>
      <!-- ///baseBalance form  -->
      <div v-if="modalType === 'baseBalance'">
        <div class="flex flex-col w-full justify-center gap-1.5">
          <div>
            <div class="label">
              <span class="label-text text-base-content">Сумма вывода</span>
            </div>
            <input
              v-model.lazy="formattedAmount"
              type="text"
              placeholder="Введите сумму вывода"
              class="input input-primary w-full"
              @input="updateAmount"
            />
          </div>

          <div class="-mt-2">
            <div class="label">
              <span class="label-text text-base-content">{{
                user?.fizFace ? "Номер карты" : "ИНН организации"
              }}</span>
            </div>
            <input
              v-model="cardNumberInn"
              class="input input-primary w-full"
              :placeholder="user?.fizFace ? 'Номер карты' : 'ИНН организации'"
            />
          </div>
          <div class="-mt-2">
            <div class="label">
              <span class="label-text text-base-content">БИК</span>
            </div>
            <input
              v-model="cardInfo.BIK"
              class="input input-primary w-full"
              placeholder="БИК"
            />
          </div>
          <div class="-mt-2">
            <div class="label">
              <span class="label-text text-base-content">Расчетный счет</span>
            </div>
            <input
              v-model="cardInfo.RS"
              class="input input-primary w-full"
              placeholder="Расчетный счет"
            />
          </div>
          <div class="-mt-2">
            <div class="label">
              <span class="label-text text-base-content"
                >Корреспондентский счет</span
              >
            </div>
            <input
              v-model="cardInfo.CS"
              class="input input-primary w-full"
              placeholder="Корреспондентский счет"
            />
          </div>
          <div class="-mt-2">
            <div class="label">
              <span class="label-text text-base-content"
                >Наименование банка</span
              >
            </div>
            <input
              v-model="cardInfo.bankName"
              class="input input-primary w-full"
              placeholder="Наименование банка"
            />
          </div>
          <div class="-mt-2" v-if="!user.fizFace">
            <div class="label">
              <span class="label-text text-base-content"
                >Наименование организации</span
              >
            </div>
            <input
              v-model="cardInfo.orgName"
              class="input input-primary w-full"
              placeholder="Наименование организации"
            />
          </div>
          <div class="-mt-2" v-if="user.fizFace">
            <div class="label">
              <span class="label-text text-base-content">ФИО</span>
            </div>
            <input
              v-model="cardInfo.FIO"
              class="input input-primary w-full"
              placeholder="ФИО"
            />
          </div>
          <h1 class="text-2xl font-bold">
            Вывод средств c личного кабинента
            <div class="text-sm text-base-content font-normal">
              Вывод осуществляется в течение 14 дней с даты подачи заявки
            </div>
          </h1>

          <div class="agreement flex gap-2 items-center w-full">
            Пользовательское соглашение
            <a
              class="link link-primary"
              :href="config.public.siteUrl + '/api/docs/get'"
              target="_blank"
            >
              Скачать
            </a>
          </div>
          <div class="w-full flex justify-end">
            <button class="btn btn-primary" @click="createBalanceWithdraw">
              Вывести
            </button>
          </div>
        </div>
      </div>
      <!-- ///partnerBalance form  -->
      <div v-if="modalType === 'partnerBalance'">
        <div class="flex flex-col w-full justify-center gap-4">
          <div>
            <div class="label">
              <span class="label-text text-base-content">Сумма вывода</span>
            </div>
            <input
              v-model.lazy="formattedAmount"
              type="text"
              placeholder="Введите сумму вывода"
              class="input input-primary w-full"
              @input="updateAmount"
            />
          </div>

          <h1 class="text-2xl font-bold">
            Вывод средств c партнерской программы
            <div class="text-sm text-base-content font-normal">
              Вывод осуществляется в течение 14 дней с даты подачи заявки
            </div>
          </h1>

          <div
            v-if="partnerAgreement"
            class="agreement flex gap-2 items-center w-full"
          >
            Партнёрское соглашение
            <a class="link link-primary">Скачать</a>
          </div>
          <div v-else>
            Партнёрское соглашение не заключено
            <NuxtLinkLocale
              class="link link-primary"
              to="/profile?partnerDetailsModal=true"
            >
              Перейти
            </NuxtLinkLocale>
          </div>
          <div class="w-full flex justify-end">
            <button
              :disabled="!partnerAgreement"
              class="btn btn-primary"
              @click="createPartnerWithdraw"
            >
              Вывести
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="modalType === 'finalForm'"
        class="flex flex-col w-full gap-[72]"
      >
        <div
          class="flex flex-col w-full justify-center items-center gap-[15px] mb-[47px]"
        >
          <h1 class="text-xl font-bold">
            Запрос на вывод средств отправлен успешно!
          </h1>
          <span class="text-[0.925rem] leading-5 text-center"
            >Наши специалисты обработают запрос в течении нескольких рабочих
            дней. Следите за статусом заявки в разделе "История выплат"</span
          >
        </div>

        <!-- <div class="flex gap-[16px] self-end">
          <button
            class="py-2 px-9 disabled:hover:text-white border rounded-lg disabled:bg-[#595959] disabled:border-[#595959] text-white bg-[#1b38ca] border-blue-800 hover:bg-transparent hover:text-[#1b38ca] hover:border-blue-800"
          >
            Посмотреть
          </button>
        </div> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-ghost {
  box-shadow: none;
}
</style>
