import type { Rule } from '@/data/buyout/rules'
// import { findPositionByQuery } from '@/server/lib/helpers'
// import getPickpoints from '@/server/utils/wildberries/getPoints'
// import { ProxySearchQuery } from '~/server/lib/models/ProxySearchQuery'

interface Item {
  image: string
  name: string
  article: number
  price: number
  priceText: string
  quantity: number
  sizes: number[] | string[]
  sex: string
  searchQuery: any[]
  adress: string
  dateRange: [Date, Date]
  selectedSize: number | string
  rules: Rule[]
  purchaseSoon: boolean
}

const sorts = [
  {
    ruleId: 10,
    sort: 'popular',
  },
  {
    ruleId: 11,
    sort: 'priceup',
  },
  {
    ruleId: 12,
    sort: 'pricedown',
  },
  {
    ruleId: 13,
    sort: 'newly',
  },
  {
    ruleId: 14,
    sort: 'benefit',
  },
  {
    ruleId: 15,
    sort: 'rate',
  },
]

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)
  const query = getQuery(event)
  const { userTimezoneOffsetHours } = query
  // const { points } = await getPickpoints()
  // const allProxies: any = await ProxySearchQuery.find()
  // const proxies: string[] = allProxies[0].proxies

  const products: Item[] = body
  const result = {
    success: true,
    message: '',
  }
  for (const item of products) {
    const rules = item.rules.map((rule) => rule.id)
    let sort = 'popular'
 
    const curDate = new Date()
    curDate.setHours(curDate.getHours() - Number(userTimezoneOffsetHours))
    const firstDate = new Date(item.dateRange[0])

    if (!item.purchaseSoon && firstDate < curDate) {
      result.success = false
      result.message = `Дата ${item.article} не может быть меньше текущей по МСК`
    }

    // if (rules.includes(11)) sort = 'priceup'
    // if (rules.includes(12)) sort = 'pricedown'
    // if (rules.includes(13)) sort = 'newly'
    // if (rules.includes(14)) sort = 'benefit'
    // if (rules.includes(15)) sort = 'rate'

    // if (rules.includes(5) || rules.includes(9)) {
    //   for (const query of item.searchQuery) {
    //     if(query.value === '') {
    //         result.success = false
    //         result.message = `У товара ${item.article} не заполнен поисковой запрос`
    //         return result
    //     }
    //     const searchResult = await findPositionByQuery(
    //       query.value,
    //       item.article,
    //       proxies,
    //       sort
    //     )
    //     if (!searchResult.found) {
    //       result.success = false
    //       result.message = `Товар ${item.article} не найден в поисковой выдаче по запросу ${query.value}`
    //       return result
    //     }
    //   }
    // }
    // if (rules.includes(8)) {
    //   for (const query of item.searchQuery) {
    //     if(query.value === '') {
    //         result.success = false
    //         result.message = `У товара ${item.article} не заполнен поисковой запрос`
    //         return result
    //     }
    //     const searchResult = await findPositionByQuery(
    //       query.value,
    //       item.article,
    //       proxies,
    //       sort
    //     )
    //     if (!searchResult.found) {
    //       result.success = false
    //       result.message = `Товар ${item.article} не найден в поисковой выдаче по запросу ${query.value}`
    //       return result
    //     }
    //     if (!searchResult.advert) {
    //       result.success = false
    //       result.message = `Товар ${item.article} не найден в рекламе по запросу ${query.value}`
    //       return result
    //     }
    //   }
    // }

 
    // const foundPoint = points.find((p: { a: string }) => p.a === item.adress)

    // if (!foundPoint) {
    //   result.success = false
    //   result.message = `ПВЗ ${item.adress} не найдено`
    //   return result
    // }
  }

  return result
})
