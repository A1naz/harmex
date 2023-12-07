import { defineStore } from 'pinia'
import { StateMain } from '~/data/types'
import { ITariff } from '~/data/types';

export const useMainStore = defineStore('main', {
  state: (): StateMain => ({
    client: {} as Client,
    dodge: false,
    theme: 'light',
    pickpoints: [] as any,
    selectedItem: null as number | null,
    drawerOpened: null as boolean | null,
    infoModal: false,
    infoType: '',
    faqModal: false,
    swapAccountModal: false
  }),
  actions: {
    checkTelegramId() {
     
      if (this.client.telegram && !this.client.telegramUserId)
        return false
      else
        return true
    },
    tariffString(item: keyof ITariff): string {
        const symbol = this.client.tariff[item].type == TariffTypeEnum.percent ? '%' : 'р.'
        return this.client.tariff[item].value + symbol
    },
    async getClient() {
        const { data } = await useFetch('/api/user/client', {
            headers: useRequestHeaders(['cookie']) as HeadersInit,
        })
        if (data.value) {
            this.setClient(data.value.client)
        } else {
            console.warn('store.getClient did not return client')
        }
    },
    setClient(client?: Client) {
        if(client){
            this.client = client
        } else {
            this.client = {} as Client
        }
    },
  },
})
