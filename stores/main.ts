import { defineStore } from "pinia";
import { StateMain } from "~/data/types";
import { ITariff } from "~/data/types";

export const useMainStore = defineStore("main", {
  state: (): StateMain => ({
    client: {} as Client,
    dodge: false,
    theme: "light",
    pickpoints: [] as any,
    selectedItem: null as number | null,
    drawerOpened: null as boolean | null,
    faqModal: false,
    swapAccountModal: false,
    twoFaQRModal: false,
    notificationsLength: 0,
  }),
  actions: {
    checkTelegramId() {
      if (this.client.telegram && !this.client.telegramUserId) return false;
      else return true;
    },
    tariffString(item: keyof ITariff): string {
      if (this.client.tariff[item]) {
        const symbol =
          this.client.tariff[item].type == TariffTypeEnum.percent ? "%" : "р.";
        return this.client.tariff[item].value + symbol;
      }
      return '"тариф не найден"';
    },
    async getClient() {
      const { data } = await useFetch("/api/user/client", {
        headers: useRequestHeaders(["cookie"]) as HeadersInit,
      });
      if (data.value) {
        this.setClient(data.value.client);
      } else {
        console.warn("store.getClient did not return client");
      }
    },
    setClient(client?: Client) {
      if (client) {
        this.client = client;
      } else {
        this.client = {} as Client;
      }
    },
    async getPrices(mp: string = "wildberries") {
      const { data } = await useFetch("/api/prices/buyoutPrices", {
        method: "GET",
        query: {
          mp,
        },
      });

      if (data.value) {
        return data.value;
      } else {
        return {
          minPrice: 150,
          price: 150,
          type: "price",
        };
      }
    },
    getBuyoutsSumm(
      productsPrices: number[],
      prices: { minPrice: number; value: number; type: string }
    ) {
  
      let summ: number = 0;
      let serviceSumm : number = 0;
      if (prices.type === "price") {
        productsPrices.forEach((item) => {
          summ += item;
          summ += prices.value;
          serviceSumm += prices.value;
        });

      } else if (prices.type === "percent") {
        productsPrices.forEach((item) => {
          summ += item;
          serviceSumm += item * (prices.value / 100);
         const currentServicePrice: number = item * (prices.value / 100);
          summ += currentServicePrice < prices.minPrice ? prices.minPrice : currentServicePrice;
        });


      }
      return {
        summ: summ,
        serviceSumm: serviceSumm,
      };
    },
  },
});
