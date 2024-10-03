import { defineStore } from 'pinia'

export const usePersistedStore = defineStore('persisted', {
  state: () => ({
    activeDropdown: 'sad' as String,
  }),
  persist: {
    storage: persistedState.localStorage,
  },
})
