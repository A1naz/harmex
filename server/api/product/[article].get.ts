import fs from 'node:fs'
import { getServerSession } from '#auth'
import { findImage, findProductCard } from '~~/server/lib/helpers'
import { proxies } from '~~/server/lib/proxy'
import { HttpsProxyAgent } from 'https-proxy-agent'

const randomNumber = Math.floor(Math.random() * proxies.length)

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const proxyAgent = new HttpsProxyAgent(`https://${proxies[randomNumber]}`)

  const params = event.context.params as any
  const url = `https://www.ozon.ru/api/entrypoint-api.bx/page/json/v2?url=%2Fproduct/${params.article}`
  const data: any = await $fetch(url, {
    method: 'GET',
    agent: proxyAgent,
    parseResponse: JSON.parse,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    },
  }).catch((e) => {
    if (e.status === 404) {
      throw createError({
        message: 'Не найдена информация по данному артикулу.',
      })
    }
  })

 const pictureData = JSON.parse(data.widgetStates['webAspects-418255-default-1'])
 console.log(pictureData.aspects[0].variants[0].data.picture);
 const image = pictureData.aspects[0].variants[0].data.picture

  return {
    product: {
      image: image || '',
      article: params.article as number,
      name: `dsaad${Math.random()}` || '',
      sizes: ['0'],
      price: 0,
      priceText: '1323 руб.',
    },
  }
})
