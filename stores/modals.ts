import { defineStore } from 'pinia'

export const useModalStore = defineStore('modals', {
        state: (): any => ({
                payment: false,
                selectedCatalog: 'Маркетплейсы',
        })
})
