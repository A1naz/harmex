import { defineStore } from 'pinia'

export const useMPStore = defineStore('mp', {
  state: () => ({
    selectedMP: 'wildberries' as String,
    MPTabs: [
      { title: 'Ozon', value: 'ozon' },
      { title: 'Wildberries', value: 'wildberries' },
    ],
    MPTabsTest: [
      { title: 'Ozon', value: 'ozon' },
      { title: 'Wildberries', value: 'wildberries' },
      { title: 'Avito', value: 'avito' },
    ],
    MPTabsAll: [
      { title: 'Все', value: 'all' },
      { title: 'Ozon', value: 'ozon' },
      { title: 'Wildberries', value: 'wildberries' },
    ],
    MPTabsAllTest: [
      { title: 'Все', value: 'all' },
      { title: 'Ozon', value: 'ozon' },
      { title: 'Wildberries', value: 'wildberries' },
      { title: 'Avito', value: 'avito' },
    ],
  }),
  persist: {
    storage: persistedState.localStorage,
  },
  actions: {
    setSelectedMP(selectedMP: string) {
      this.selectedMP = selectedMP
    },
  },
})
