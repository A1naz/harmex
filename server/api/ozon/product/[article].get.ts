import fs from 'node:fs'
import { getServerSession } from '#auth'
import { findImage, findProductCard } from '~~/server/lib/helpers'
import { ProxySearchQuery } from '~/server/lib/models/ProxySearchQuery'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { ConnectionPoolClosedEvent } from 'mongodb'
const config = useRuntimeConfig()
const apiKey = config.serverLoadApiKey

//@ts-ignore
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const params = event.context.params as any
  const article = params.article
  console.log(`https://www.ozon.ru/product/${article}/`)

  //@ts-ignore
  const data: any = await $fetch('http://95.163.249.133:4141', {
    method: 'POST',
    body: {
      type: 'ozonProduct',
      url: `https://www.ozon.ru/product/${article}/`,
    },
  })

  if (!data) {
    return createError({
      statusCode: 400,
      message: 'Товар не найден',
    })
  }

  return {
    product: {
      image: data.image || '',
      article: article,
      name: data.name || '',
      sizes: data.sizes.length ? data.sizes : ['0'],
      price: data.price || 0,
      priceText: data.price ? data.price + ' ₽' : '',
    },
  }
})
