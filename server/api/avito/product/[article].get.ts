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
    // product: {
    //   image: data.image || '',
    //   article: article,
    //   name: data.name || '',
    //   sizes: data.sizes.length ? data.sizes : ['0'],
    //   price: data.price || 0,
    //   priceText: data.price ? data.price + ' ₽' : '',
    // },
    product: {
      image: "https://80.img.avito.st/image/1/1.1iNd4ra4esprVfjHfbHrCS5AeMzjQ_jca054yO1LcsDr.oOPrM_Hf2lbOR0MiNorXf_VDR7vAhPC45t_OKmeYSAY",
      article: "3808121318",
      name: "Золотые часы женские бу",
      sizes: ['0'],
      description: "Часы Noblia Woman SZ2172-11A Аналоговые женские кварцевые Аналоговые 03 ATM Водостойкие Сталь с покрытием из желтого золота Белый 26 5 Кожа Коричневый Prezzo: ?",
      price: 17000,
      priceText: '17000 ₽',
  }
  }
})
