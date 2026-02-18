import { findImage, findProductCard } from '@/server/lib/helpers'
import { User } from '@/server/lib/models/User'

function isValidUrl(urlString: string) {
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' // validate protocol
    + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // validate domain name
    + '((\\d{1,3}\\.){3}\\d{1,3}))' // validate OR ip (v4) address
    + '(:\\d+)?(\\/[-\\w%.~+]*)*' // validate port and path
    + '(\\?[;&\\w%.~+=-]*)?' // validate query string
    + '(#[-\\w]*)?$',
    'i',
  ) // validate fragment locator
  return !!urlPattern.test(urlString)
}
export default eventHandler(async (event) => {
  const session = ((await getUserSession(event)).user) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { url } = await readBody(event)
  if (!isValidUrl(url)) {
    throw createError({
      statusCode: 400,
      message: 'invalid url',
    })
  }

  let trueUrl = url

  const index = trueUrl.indexOf('detail.aspx')
  if (index !== -1) {
    trueUrl = trueUrl.substring(0, index + 'detail.aspx'.length)
  }
  const splitted = trueUrl.split('/')
  if (splitted.at(-1) === 'detail.aspx') {
    const article = splitted[splitted.length - 2]
    const url = `https://card.wb.ru/cards/detail?appType=0&curr=rub&nm=${article}`
    const data: any = await $fetch(url, {
      method: 'GET',
    }).catch((e) => {
      if (e.status === 404) {
        throw createError({
          message: 'Не найдена информация по данному артикулу.',
        })
      }
    })
    const rawData: any = await $fetch(
      `https://card.wb.ru/cards/detail?spp=0&regions=80,64,38,4,115,83,33,68,70,69,30,86,40,1,66,31,48,110,22&pricemarginCoeff=1.0&reg=0&appType=1&emp=0&locale=ru&lang=ru&curr=rub&couponsGeo=2,12,7,3,6,21&dest=12358289&nm=${article}`,
      {
        method: 'GET',
      },
    )
    const priceData = rawData

    const product = priceData?.data?.products.find(
      (item: any) => item.id === Number(article),
    )
    const priceRaw = product?.salePriceU.toString()
    if (!product) {
      return createError({
        statusCode: 400,
        message: 'Не удалось получить данные о товаре',
      })
    }
    if (!priceRaw) {
      return createError({
        statusCode: 400,
        message: 'Не удалось получить данные о товаре',
      })
    }

    const price = priceRaw?.substring(0, priceRaw.length - 2)
    const currency = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    const priceText = currency.format(price)
    const image = await findImage(Number(article))

    return {
      type: 'product',
      image,
      article: (article as number),
      name: `${rawData.data.products[0].brand} / ${rawData.data.products[0].brand}` || '',
      price: (price as number) || 0,
      priceText: (priceText as string) || '',
    }
  }
  else if (splitted.at(-2) === 'brands') {
    const brand = splitted.at(-1)

    // https://www.wildberries.ru/webapi/spa/brands/metatags/vaccum-and-pack - новая ссылка, если перестанет работать
    // @ts-ignore
    const data: { name: string, id: number, siteId: number, hash: string } = await $fetch(
      `https://static-basket-01.wbbasket.ru/vol0/data/brands/${brand}.json`,
      { method: 'GET' },
    )

    const image = `https://static-basket-01.wbbasket.ru/vol1/sellers/brands/${data.hash}.webp`
    return {
      type: 'brand',
      name: data.name,
      id: data.id,
      image,
    }
  }
})
