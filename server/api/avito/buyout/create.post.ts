import { v4 as uuid } from 'uuid'
import type { Rule } from '@/data/buyout/rules'
import { Buyout } from '@/server/lib/models/avito/Buyout'
import { userLog } from '~/server/utils/userLog'
import { DocuemntEnum } from '~/data/enums'

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
  newDateRange: [Date, Date]
  selectedSize: number | string
  rules: Rule[]
  purchaseSoon: boolean
  key: boolean
  searchQueryRegion: any[]
  pointCoordinates: any[]
  appartmentNumber: string
  pvzType: string
  pointId: string
  selectedParameter: string
  category: string[] | null
}
export default eventHandler(async (_event) => {
  throw createError({
    statusCode: 503,
    message: 'Создание выкупов приостановлено. Компания Harmex прекратила оказание услуг самовыкупов. Для вывода средств оформите заявку в разделе Финансы.',
  })
  const user = await getAdminEntity(_event)
  if (!user) return sendRedirect(_event, '/auth', 302)

  const body = await readBody(event)
  const last = await Buyout.findOne({ user }).sort({ _id: -1 })
  const params = getQuery(event)
  const { userTimezoneOffsetHours, userOffsetMinutes } = params

  const activeBuyouts = await Buyout.find({
    user,
    status: { $in: ['active', 'work', 'created'] },
  })

  // if (user.balance < sum)
  // throw createError('Пополните баланс для создания новых выкупов.')

  const products: Item[] = body
  if (products.length > 10) {
    throw createError('Можно создать максимум 10 выкупов за раз')
  }
  for await (const product of products) {
    const rules = product.rules.map((rule) => rule.id)
    const searchQueries = product.searchQuery.map((item: any) => item.value)
    const searchQuerieRegions = product.searchQueryRegion.map(
      (item: any) => item.value
    )

    if (userTimezoneOffsetHours && userOffsetMinutes) {
      const date1 = product.purchaseSoon
        ? new Date()
        : new Date(product.dateRange[0])
      const date2 = product.purchaseSoon
        ? new Date()
        : new Date(product.dateRange[1])

      if (!product.purchaseSoon) {

           const curDate = new Date();
        if (date1 < curDate) {
          throw createError(
            `Для продукта ${product.article} выбрано некорректное время, дата выкупа не может быть меньше текущей даты`
          );
        }
        
        date1.setHours(
          date1.getHours()
          // + Number(userTimezoneOffsetHours)
        )
        date1.setMinutes(
          date1.getMinutes()
          // + Number(userOffsetMinutes)
        )

        date2.setHours(
          date2.getHours()
          //  + Number(userTimezoneOffsetHours)
        )
        date2.setMinutes(
          date2.getMinutes()
          //  + Number(userOffsetMinutes)
        )
      } else {
        date1.setHours(date1.getHours())
        date2.setHours(date2.getHours())
      }

      product.dateRange = [date1, date2]
    }

    // let city, state
    // if (foundPoint.city && foundPoint.state) {
    //   city = foundPoint.city
    //   state = foundPoint.state
    // } else {
    //   ;({ city, state } = await getCityByGeo(foundPoint.lt, foundPoint.lg))
    // }

    const buyout = new Buyout({
      article: product.article,
      searchQuery: searchQueries.join(', '),
      searchQueryRegion: searchQuerieRegions.join(', '),
      // point: product.adress,
      // point_city: city,
      // point_state: state,
      point: product.adress,
      point_city: '',
      point_state: '',
      dateStart: product.dateRange[0],
      dateEnd: product.dateRange[1],
      sizeparam: product.selectedSize,
      quantity: product.quantity,
      pvzType: product.pvzType,
      gender: product.sex,
      status: 'active',
      pointId: product.pointId,
      user,
      rules,
      product: {
        name: product.name,
        price: product.price,
        priceText: product.priceText,
        image: product.image,
      },
      uuid: uuid(),
      place: last ? last.place + 1 : 1,
      purchaseSoon: product.purchaseSoon,
      ff: product.key || false,
      pointCoordinates: product.pointCoordinates,
      appartmentNumber: product.appartmentNumber,
      categories: product.category,
      isCategoriesEnabled: product.category && product.category.length > 0 ? true : false,
    })

    await buyout.save()

    await userLog(event, {
      documentType: DocuemntEnum.Buyout,
      documentId: buyout.uuid,
    })
  }

  return { status: 'ok' }
})
