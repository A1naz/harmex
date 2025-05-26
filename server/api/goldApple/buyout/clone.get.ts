import { findImage, findProductCard } from '@/server/lib/helpers'
import { Buyout } from '@/server/lib/models/goldApple/Buyout'
const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const query = getQuery(event)
  const buyout = await Buyout.findOne({ uuid: query.uuid })
  if (!buyout) {
    return createError({
      statusCode: 400,
      message: 'Выкуп не найден',
    })
  }

  const data: any = await $fetch('http://95.163.249.133:3000', {
    method: 'POST',
    body: {
      type: 'flowwowProduct',
      url: buyout.url,
      token: config.PARSER_TOKEN,
    },
  }).catch((e) => {
    throw createError({
      statusCode: 404,
      message:
        'Не удалось получить информацию по товару. Пожалуйста, проверьте правильность введенного артикула.',
    })
  })

  return {
    image: data.image || '',
    article: data.article,
    slug: data.slug || '',
    url: buyout.url || '',
    name: data.name || '',
    nameOrganization: data.nameOrganization || '',
    parameters: data.parametres && data.parametres.length ? data.parametres : ['0'],
    selectedParameter: buyout.selectedParameter ? buyout.selectedParameter : data.parametres && data.parametres.length ? data.parametres[0] : '0',
    sizes: ['0'],
    price: Number(data.price.replaceAll(' ', '')) || 0,
    priceText: data.price ? data.price + ' ₽' : '',
    quantity: buyout.quantity,
    sex: buyout.gender,
    searchQuery: buyout.searchQuery.split(', '),
    adress: buyout.point,
    dateRange: [buyout.dateStart, buyout.dateEnd],
    selectedSize: buyout.sizeparam,
    rules: buyout.rules,
    appartmentNumber: buyout.appartmentNumber,
    purchaseSoon: buyout.purchaseSoon,
    deliveryType: buyout.deliveryType,
  }
})
