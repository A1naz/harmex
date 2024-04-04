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
        likesOzon: [
            { title: 'Лайк на отзыв/комментарий', value: '/likes/create/ozon' },
            { title: 'Лайк на товар/бренд', value: '/productlikes/create/ozon' },
            { title: 'Лайк на вопрос', value: '/questionLikes/create/ozon' },
        ]
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