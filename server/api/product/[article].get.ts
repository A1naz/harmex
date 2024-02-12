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
      Cookie: `abt_data=${cookies}`,
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
