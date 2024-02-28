import { defineStore } from 'pinia'

export const useMPStore = defineStore('mp', {
    state: () => ({
        selectedMP: 'wildberries' as String,
    }),
    persist: {
        storage: persistedState.localStorage,
    },
    actions: {
        setSelectedMP(selectedMP: string) {
            this.selectedMP= selectedMP
        }
    }
})