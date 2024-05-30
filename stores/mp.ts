import { defineStore } from 'pinia'
import { useMPChange } from './mpChange'

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
      { title: 'Flowwow', value: 'flowwow' },
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
      { title: 'Flowwow', value: 'flowwow' },
    ],
    likesOzon: [
      { title: 'Лайк на отзыв/комментарий', value: '/likes/create/ozon' },
      { title: 'Лайк на товар/бренд', value: '/productlikes/create/ozon' },
      { title: 'Лайк на вопрос', value: '/questionLikes/create/ozon' },
    ],
  }),

  actions: {
    setSelectedMP(mp: String) {
      this.selectedMP = mp
    },
    changeMp(mp: string, tab: string, query?: string) {
      const mpChange = useMPChange()
      mpChange.changeMp(mp, tab, query)
    },
    sortMp(tab: string, test?: boolean) {
      const mpChange = useMPChange()
      const filteredPages =
        test !== undefined
          ? mpChange.pages.filter(
              (page) => !page.test && page.tabs.includes(tab)
            )
          : mpChange.pages.filter((page) => page.tabs.includes(tab))
      return filteredPages
    },
    sortLikes(mp: string) {
      const mpChange = useMPChange()
      return mpChange.pages.find((page) => page.value === mp)?.likes
    },
  },
  persist: {
    storage: persistedState.localStorage,
  },
})
