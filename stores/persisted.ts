import { notify } from '@kyvg/vue3-notification'
import { defineStore } from 'pinia'

export const usePersistedStore = defineStore('persisted', {
  state: () => ({
    accesses: [] as string[],
    quickAccesses: [] as string[],
    language: 'ru',
    currency: 'RUB',
    activeDropdown: '',
    accessesLoading: false,
    ref: null as string | null,
  }),
  actions: {
    updateLanguage(language: string) {
      this.language = language
    },
    updateCurrency(currency: string) {
      this.currency = currency
    },
    updateQuickAccesses(quickAccesses: string[]) {
      this.quickAccesses = quickAccesses
    },
    updateActiveDropdown(dropdown: string) {
      this.activeDropdown = dropdown
    },
    async getAccesses() {
      if (this.quickAccesses.length) {
        return
      }
      this.accessesLoading = true
      const response = await $fetch('/api/user/accesses', {
        method: 'GET',
        watch: false,
      })
        .catch((err) => {
          notify({
            type: 'error',
            title: 'Не получить доступы',
            text: err.data.message || err.message,
          })
        })
        .finally(() => {
          this.accessesLoading = false
        })
      if (response) {
        this.accesses = response.accesses
        this.quickAccesses = response.quickAccesses
      }
    },
  },
  persist: true,
})
