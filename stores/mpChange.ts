import { defineStore } from 'pinia'
import { useMPStore } from './mp';

export const useMPChange = defineStore('mpChange', {
  state: () => ({
    pages: [
      {
        title: 'Wildberries',
        value: 'wildberries',
        tabs: ['buyouts', 'delivery','productlikes','reports','reviews','stats','cart','likes','questions'],
        likes: [
          {
            title: 'Отзывы',
            value: 'likes',
          },
          {
            title: 'Товар/бренд',
            value: 'productlikes',
          }
        ],
      },
      {
        title: 'Ozon',
        value: 'ozon',
        tabs: ['buyouts', 'delivery','reports','reviews','stats','cart','questions'],
        likes: [
          {
            title: 'Отзывы',
            value: 'likes',
          },
          {
            title: 'Товар/бренд',
            value: 'productlikes',
          },
          {
            title: 'Вопрос',
            value: 'questionlikes',
          }
        ],
      },
      {
        title: 'Avito',
        value: 'avito',
        test: true,
        tabs: ['buyouts', 'delivery','productlikes','reports','reviews','stats'],
        likes: [
          {
            title: 'Товар/бренд',
            value: 'productlikes',
          }
        ],
      },
    ]
  }),

  actions: {
    changeMp(mp: string, tab: string, query?: string) {
      const mpStore = useMPStore();
      let pageFound = false;
      this.pages.forEach((page) => {
        if (page.value === mp) {
          if(tab.includes('likes')) {
            page.likes.forEach((pageTab) => {
              if (pageTab.value === tab) {
                mpStore.selectedMP = mp
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
                mpStore.selectedMP = mp
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
                mpStore.selectedMP = mp
                navigateTo('/' + page.likes[0].value)
                return;
              }
              mpStore.selectedMP = mp
              navigateTo('/' + page.likes[0].value + '/' + mp)
             }
            }else{
              mpStore.selectedMP = mp
              navigateTo('/' + page.tabs[0] + '/' + mp)
            }
          }
        })
      }
    },
    changeTab(mp: string, tabslash: string, query?: string) {
      const tab = tabslash.split('/')[1]
      // console.log(mp, tab, query)
      let pageFound = false;
      if(tab.includes('likes')) {
        const mpPage = this.pages.find((page) => page.value === mp)?.likes.find((page) => page.value === tab)
        
      }else{
        const mpPage = this.pages.find((page) => page.value === mp)?.tabs.find((page) => page === tab) 
        if(!mpPage){
          console.log(tab)
          const alternativeMp = this.pages.find(page => page.tabs.includes(tab))
          console.log(alternativeMp)
          return ('/' + (alternativeMp ? tab+ '/' + alternativeMp.value : tab) )
        }
        console.log(mpPage)
        return ('/' + tab + '/' + mp)
      }
    }
    
  },
})
