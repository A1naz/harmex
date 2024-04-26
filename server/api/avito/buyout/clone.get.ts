import { Buyout } from '@/server/lib/models/avito/Buyout'
import { getServerSession } from '#auth'
import { findImage, findProductCard } from '@/server/lib/helpers'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const query = getQuery(event)
  
  const buyout = await Buyout.findOne({ uuid: query.uuid })
  if (!buyout) {
    return createError({
      statusCode: 400,
      message: 'Выкуп не найден',
    })
  }

  const article = buyout?.article
  const data: any = await $fetch('http://95.163.249.133:4141', {
    method: 'POST',
    body: {
      type: 'avitoProduct',
      url: `https://www.avito.ru/${article}`,
    },
  })

  if (!data) {
    return createError({
      statusCode: 400,
      message: 'Товар не найден',
    })
  }
  return {
    image: data.image || '',
    article: article,
    name: data.name || '',
    sizes: data.sizes.length ? data.sizes : ['0'],
    price: data.price || 0,
    priceText: data.price ? data.price + ' ₽' : '',
    quantity: buyout.quantity,
    sex: buyout.gender,
    searchQuery: buyout.searchQuery.split(', '),
    adress: buyout.point,
    dateRange: [buyout.dateStart, buyout.dateEnd],
    selectedSize: buyout.sizeparam,
    rules: buyout.rules,
  }
})
