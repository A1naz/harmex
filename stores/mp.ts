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
    likesOzon: [
      { title: 'Лайк на отзыв/комментарий', value: '/likes/create/ozon' },
      { title: 'Лайк на товар/бренд', value: '/productlikes/create/ozon' },
      { title: 'Лайк на вопрос', value: '/questionLikes/create/ozon' },
    ],
    pages: [
      {
        title: 'Wildberries',
        value: 'wildberries',
        tabs: ['buyouts', 'delivery','productlikes','reports','reviews','stats','cart','likes','questions'],
        likes: ['likes', 'productlikes'], 
      },
      {
        title: 'Ozon',
        value: 'ozon',
        tabs: ['buyouts', 'delivery','reports','reviews','stats','cart','questions'],
        likes: ['likes', 'productlikes', 'questionlikes'],  
      },
      {
        title: 'Avito',
        value: 'avito',
        test: true,
        tabs: ['buyouts', 'delivery','productlikes','reports','reviews','stats'],
        likes: ['productlikes'], 
      },
    ]
  }),

  actions: {
    setSelectedMP(mp: String) {
      this.selectedMP = mp
    },
    changeMp(mp: string, tab: string, query?: string) {
      let pageFound = false;
      this.pages.forEach((page) => {
        if (page.value === mp) {
          if(tab.includes('likes')) {
            page.likes.forEach((pageTab) => {
              if (pageTab === tab) {
                this.selectedMP = mp
                if (tab === 'questionlikes' || tab === 'likes') {
                  pageFound = true;
                  return;
                }
                pageFound = true;
                navigateTo('/' + tab + '/' + mp)
              }
            })
          }else{
            page.tabs.forEach((pageTab) => {            
              if (pageTab === tab) {
                console.log('fdsfsdfsd')
                this.selectedMP = mp
                pageFound = true;
                navigateTo('/' + tab + '/' + mp + (query ? query : ''))
              }
            })
          }
        }
      })
      
      if (!pageFound) {
        this.pages.forEach((page) => {
          if (page.value === mp) {
            if(tab.includes('likes')) {
             if(page.likes.length > 0){
              if (tab === 'questionlikes' || tab === 'likes') {
                this.selectedMP = mp
                navigateTo('/' + page.likes[0])
                return;
              }
              this.selectedMP = mp
              navigateTo('/' + page.likes[0] + '/' + mp)
             }
            }else{
              this.selectedMP = mp
              navigateTo('/' + page.tabs[0] + '/' + mp)
            }
          }
        })
      }
    },
    sortMp(tab: string, test?: boolean) {
      const filteredPages = test !== undefined 
      ? this.pages.filter(page => !page.test && page.tabs.includes(tab)) 
      : this.pages.filter(page => page.tabs.includes(tab))
      return filteredPages;
    }
  },
  persist: {
    storage: persistedState.localStorage,
  },
})
