import fs from 'node:fs'
import { getServerSession } from '#auth'
import { findImage, findProductCard } from '~~/server/lib/helpers'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const params = event.context.params as any
  // const url = findProductCard(params.article)
  // const url = `https://card.wb.ru/cards/detail?appType=0&curr=rub&nm=${params.article}`
  // const data: any = await $fetch(url, {
  //   method: 'GET',
  // }).catch((e) => {
  //   if (e.status === 404) {
  //     throw createError({
  //       message: 'Не найдена информация по данному артикулу.',
  //     })
  //   }
  // })
  // const rawData: any = await $fetch(
  //   `https://card.wb.ru/cards/detail?spp=0&regions=80,64,38,4,115,83,33,68,70,69,30,86,40,1,66,31,48,110,22&pricemarginCoeff=1.0&reg=0&appType=1&emp=0&locale=ru&lang=ru&curr=rub&couponsGeo=2,12,7,3,6,21&dest=12358289&nm=${params.article}`,
  //   {
  //     method: 'GET',
  //   }
  // )
  // const priceData = rawData
  // let sizes = []

  // if (priceData?.data?.products[0]?.sizes)
  //   sizes = priceData?.data?.products[0]?.sizes
  //     .filter((item: any) => item.stocks.length)
  //     .map((item: any) => item.origName)
  // else sizes = data?.sizes_table?.values.map((size: any) => size.tech_size)

  //  if (!sizes || sizes.length === 0) {
  //   throw createError({
  //     statusCode: 400,
  //     message: 'Не удалось получить информацию по товару. Пожалуйста, проверьте правильность введенного артикула.'
  //   })
  // }

  // fs.writeFileSync('sizes.json', JSON.stringify(sizes))
  // const product = priceData?.data?.products.find(
  //   (item: any) => item.id === Number(params.article)
  // )
  // const priceRaw = product?.salePriceU.toString()
  // let instock = false
  // if (!product) {
  //   throw createError({
  //     statusCode: 400,
  //     message: 'Не удалось получить информацию по товару. Пожалуйста, проверьте правильность введенного артикула.'
  //   })
  // }
  // product.sizes.forEach((size: any) => {
  //   if (size.stocks.length > 0) instock = true
  // })
  // if (!priceRaw || !sizes) {
  //   throw createError({
  //     statusCode: 400,
  //     message: 'Не удалось получить информацию по товару. Пожалуйста, проверьте правильность введенного артикула.'
  //   })
  // }
  // if (!instock) {
  //   throw createError({
  //     statusCode: 400,
  //     message: 'Товара нет в наличии',
  //   })
  // }
  // const price = priceRaw?.substring(0, priceRaw.length - 2)
  // const currency = new Intl.NumberFormat('ru-RU', {
  //   style: 'currency',
  //   currency: 'RUB',
  //   minimumFractionDigits: 0,
  //   maximumFractionDigits: 0,
  // })
  // const priceText = currency.format(price)
  // const image = findImage(params.article)

  // const productInfo = rawData.data.products[0]

  return {
    product: {
      image:
        'https://content2.flowwow-images.com/data/flowers/1000x1000/36/1692322048_61821136.jpg',
      article: params.article as number,
      name: 'Лавандовые сны',
      sizes: [],
      price: 2905,
      priceText: '2905 ₽',
    },
  }
})
