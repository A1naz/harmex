import { v4 as uuid } from 'uuid'
import type { Rule } from '@/data/buyout/rules'
import { Buyout } from '@/server/lib/models/Buyout'
import getPickpoints from '~/server/lib/getPoints'

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
}
export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)
  const last = await Buyout.findOne({ user }).sort({ _id: -1 })
  const params = getQuery(event)
  const { userTimezoneOffsetHours, userOffsetMinutes } = params

  const activeBuyouts = await Buyout.find({
    user,
    status: { $in: ['active', 'work', 'created'] },
  })
  const sum = activeBuyouts.reduce((acc, item) => {
    const price =
      parseInt(item.product.price) * (item.quantity - item.completed)
    return acc + price
  }, 0)

    if (user.balance < sum)
    throw createError('Пополните баланс для создания новых выкупов.')

    const { points } = await getPickpoints()

    const products: Item[] = body
    for await (const product of products) {
        const rules = product.rules.map((rule) => rule.id)
        const searchQueries = product.searchQuery.map((item: any) => item.value)

        if (userTimezoneOffsetHours && userOffsetMinutes) {
            const date1 = new Date(product.dateRange[0])
            const date2 = new Date(product.dateRange[1])
            date1.setHours(date1.getHours() + Number(userTimezoneOffsetHours))
            date2.setHours(date2.getHours() + Number(userTimezoneOffsetHours))
            date1.setMinutes(date1.getMinutes() + Number(userOffsetMinutes))
            date2.setMinutes(date2.getMinutes() + Number(userOffsetMinutes))
            product.dateRange = [date1, date2]
        }

        const foundPoint = points.find((p: { a: string }) => p.a === product.adress)
        if (!foundPoint) throw createError('Выберите существующий пункт выдачи')

        let city, state
        if(foundPoint.city && foundPoint.state){
            city = foundPoint.city
            state = foundPoint.state
        } else {
            ({city, state} = await getCityByGeo(foundPoint.lt, foundPoint.lg))
        }

        const buyout = new Buyout({
            article: product.article,
            searchQuery: searchQueries.join(', '),
            point: product.adress,
            point_city: city,
            point_state: state,
            dateStart: product.dateRange[0],
            dateEnd: product.dateRange[1],
            sizeparam: product.selectedSize,
            quantity: product.quantity,
            gender: product.sex,
            status: 'active',
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
        })
        await buyout.save()
    }

  return { status: 'ok' }
})
