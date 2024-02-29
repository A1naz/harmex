import fs from 'node:fs'
import { getServerSession } from '#auth'
import { findImage, findProductCard } from '~~/server/lib/helpers'
import { ProxySearchQuery } from '~/server/lib/models/ProxySearchQuery'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { ConnectionPoolClosedEvent } from 'mongodb'
const config = useRuntimeConfig()
const apiKey = config.serverLoadApiKey

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const params = event.context.params as any
  const allProxies: any = await ProxySearchQuery.find()
  const proxies: string[] = allProxies[0].proxies
  const randomNumber = Math.floor(Math.random() * (proxies.length - 1))
  const proxyAgent = new HttpsProxyAgent(`https://${proxies[randomNumber]}`)

  const accountData: any = await $fetch(
    'http://api.topvtop.pro/api/accounts/getAccountOzon',
    {
      method: 'POST',
      parseResponse: JSON.parse,
      body: {
        api_key: apiKey,
        type: 'product',
        article: params.article,
        required: {
          cookies: true,
        },
      },
    }
  )

    const isFree: any = await $fetch(
      'http://api.topvtop.pro/api/accounts/freeAccountOzon',
      {
        method: 'POST',
        body: {
          api_key: apiKey,
          account_id: accountData.info.account._id,
        },
      }
    ) 
  
  const cookies = accountData.info.cookies.find(
    (cookie: any) => cookie.name === 'abt_data'
  ).value

  const url = `https://www.ozon.ru/api/entrypoint-api.bx/page/json/v2?url=%2Fproduct/${params.article}`
  const data: any = await $fetch(url, {
    method: 'GET',
    agent: proxyAgent,
    parseResponse: JSON.parse,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
      Cookie: '__Secure-ext_xcid=89c7c7cd172fff859cee568c5341d887; __Secure-user-id=0; __Secure-ab-group=80; abt_data=1b63138336bf1dfdba79892d04d9c817:8f7d0be5672b4ebe662babb09b5ba75405c0110a9df0e95f47b28201aeeaf676131138aea066178892f49489d2be1475c2f6c9f4b1f1d9283ec4f4662518b3a3bf47472f4b12cbd3c8c2882b38ba6c307af0f96b6a89e0aa6076fe868adebb7627aba68119fad45d59000cd1e545a7c935f6e0534756e2bd590ae47ea3a158edf43884f595616818a73b7603b677d2985f358eae8ca0038aed2b30d83ae5374465ea1a099c067a68f8a463f57e3bf87091ac46f52acd4cd4c1bf46c859d366d6; __Secure-refresh-token=4.0.vFaBlDu-SJCbJoyXxv5syQ.80.AeHnovws_Z3Z1M0__ENXF6TU6l4FRJy30a4BvraIXEF0_XOtQ7ua2KXCgsbZmRTHjg..20240213150705.18-X0vwjB-XbClTatUO9Pf1TWodGWzVzfqzRzaRkp-4; __Secure-access-token=4.0.vFaBlDu-SJCbJoyXxv5syQ.80.AeHnovws_Z3Z1M0__ENXF6TU6l4FRJy30a4BvraIXEF0_XOtQ7ua2KXCgsbZmRTHjg..20240213150705.07ZVnPGDT8dU2qUQW_hg3ydnN1vZolKYVz4rZGjg-0I',
    },
  }).catch((e) => {
    if (e.status === 404) {
      console.log(e)

      throw createError({
        message: 'Не найдена информация по данному артикулу.',
      })
    }
  })

  if (!data) {
    throw createError({
      message: 'Не найдена информация по данному артикулу.',
    })
  }

  const productData = JSON.parse(
    data.widgetStates['webStickyProducts-726428-default-1']
  )
  let productPrice = 0

  try {
    productPrice = parseInt(
      JSON.parse(data.widgetStates['webPrice-3121879-default-1'])
        .price.replaceAll(' ', '')
        .replace(/[\s ]/g, '')
    )
  } catch (error) {}

  let sizesData: any

  try {
    sizesData = JSON.parse(data.widgetStates['webAspects-418255-default-1'])
  } catch (error) {}

  let variants: any = []

  try {
    variants = sizesData.aspects.find((el: any) => el.type == 'sizes').variants
  } catch (error) {}

  const sizes = variants.map((el: any) => el.data.searchableText)
  const image = productData.coverImageUrl
  const name = productData.name

  return {
    product: {
      image: image || '',
      article: params.article as number,
      name: name || '',
      sizes: sizes.length ? sizes : ['0'],
      price: productPrice,
      priceText: productPrice ? productPrice + ' ₽' : '',
    },
  }
})
