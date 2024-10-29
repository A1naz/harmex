import { defineStore } from 'pinia'
import { useMPStore } from './mp'

export const useMPChange = defineStore('mpChange', {
  state: () => ({
    pages: [
      {
        title: 'Wildberries',
        value: 'wildberries',
        tabs: [
          'buyouts',
          'delivery',
          'productlikes',
          'reports',
          'reviews',
          'stats',
          'cart',
          'likes',
          'questions',
          'viewings',
        ],
        likes: [
          {
            title: 'Отзывы',
            value: 'likes',
          },
          {
            title: 'Товар/бренд',
            value: 'productlikes',
          },
        ],
      },
      {
        title: 'Ozon',
        value: 'ozon',
        tabs: [
          'buyouts',
          'delivery',
          'reports',
          'reviews',
          'stats',
          'cart',
          'questions',
          'viewings',
        ],
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
          },
        ],
      },
      {
        title: 'Avito',
        value: 'avito',
        test: true,
        tabs: [
          'buyouts',
          'delivery',
          'productlikes',
          'reports',
          'reviews',
          'stats',
        ],
        likes: [
          {
            title: 'Товар/бренд',
            value: 'productlikes',
          },
        ],
      },
      // {
      //   title: 'Flowwow',
      //   value: 'flowwow',
      //   test: true,
      //   tabs: ['buyouts', 'delivery', 'reviews'],
      // },
    ],
  }),

  actions: {
    changeMp(mp: string, tab: string, query?: string) {
      const mpStore = useMPStore()
      let pageFound = false
      this.pages.forEach((page) => {
        if (page.value === mp) {
          if (tab.includes('likes')) {
            page.likes.forEach((pageTab) => {
              if (pageTab.value === tab) {
                mpStore.selectedMP = mp
                if (tab === 'questionlikes' || tab === 'likes') {
                  pageFound = true
                  return
                }
                pageFound = true
                navigateTo('/' + tab + '/' + mp)
              }
            })
          } else {
            page.tabs.forEach((pageTab) => {
              if (pageTab === tab) {
                mpStore.selectedMP = mp
                pageFound = true
                navigateTo('/' + tab + '/' + mp + (query ? query : ''))
              }
            })
          }
        }
      })

      if (!pageFound) {
        this.pages.forEach((page) => {
          if (page.value === mp) {
            if (tab.includes('likes')) {
              if (!page.likes) {
                const mpWithLikes = this.pages.find((page) =>
                  page.likes?.some((like) => like.value === 'productlikes')
                )
                return `/productlikes/${mpWithLikes?.value || 'wildberries'}`
              }
              if (page.likes.length > 0) {
                if (tab === 'questionlikes' || tab === 'likes') {
                  mpStore.selectedMP = mp
                  navigateTo('/' + page.likes[0].value)
                  return
                }
                mpStore.selectedMP = mp
                navigateTo('/' + page.likes[0].value + '/' + mp)
              }
            } else {
              mpStore.selectedMP = mp
              navigateTo('/' + page.tabs[0] + '/' + mp)
            }
          }
        })
      }
    },
    changeTab(mp: string, tabslash: string, query?: string) {
      const tab = tabslash.split('/')[1]
      const mpStore = useMPStore()

      if (tab.includes('likes')) {
        const isLikesExist = this.pages.find((page) => page.value === mp)?.likes
        if (
          !isLikesExist ||
          isLikesExist.length === 0 ||
          !isLikesExist.length
        ) {
          const mpWithLikes = this.pages.find((page) =>
            page.likes?.some((like) => like.value === 'likes')
          )
          return `/likes`
        }

        const currentTab = isLikesExist.find((page) => page.value === tab)
        if (!currentTab || !currentTab.value) {
          const likesPage = isLikesExist[0]
          return likesPage.value.includes('product')
            ? `/${likesPage.value}/${mp}`
            : `/${likesPage.value}`
        }

        return tab.includes('product')
          ? `/${tab}/${currentTab.value}`
          : `/${tab}`
      } else {
        const mpPage = this.pages
          .find((page) => page.value === mp)
          ?.tabs.find((page) => page === tab)
        if (!mpPage) {
          const alternativeMp = this.pages.find((page) =>
            page.tabs.includes(tab)
          )
          return '/' + (alternativeMp ? tab + '/' + alternativeMp.value : tab)
        }
        return '/' + tab + '/' + mp
      }
    },
  },
})
