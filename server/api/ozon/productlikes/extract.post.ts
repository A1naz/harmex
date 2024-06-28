import { getServerSession } from '#auth'
import { findImage, findProductCard } from '@/server/lib/helpers'
import { User } from '@/server/lib/models/User'
import { v4 as uuid } from 'uuid'
const config = useRuntimeConfig()
const proxy = config.CHANGING_PROXY
import request from 'request'

function extractArticulFromOzonLink(link: string) {
  const pattern = /(\d+)\/?(?:\?.*?)?$/
  const match = link.match(pattern)
  if (match) {
    return match[1]
  } else {
    return null
  }
}

function isValidUrl(urlString: string) {
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // validate protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ) // validate fragment locator
  return !!urlPattern.test(urlString)
}
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const { url } = await readBody(event)
  if (!isValidUrl(url)) {
    throw createError({
      statusCode: 400,
      message: 'invalid url',
    })
  }
  if (url.includes('ozon.ru/seller')) {
    return createError({
      statusCode: 400,
      message: 'Не удалось получить данные о товаре/бренде',
    })
  }

  const type = url.includes('ozon.ru/brand') ? 'brand' : 'product'

  if (type === 'product') {
    const article = extractArticulFromOzonLink(url)

    //@ts-ignore
    const data: any = await $fetch('http://65.109.129.174:3211', {
      method: 'POST',
      body: {
        type: 'ozonProduct',
        url: `https://www.ozon.ru/product/${article}/`,
        token: config.PARSER_TOKEN,
      },
    })

    if (!data) {
      return createError({
        statusCode: 400,
        message: 'Товар не найден',
      })
    }

    if (!data) {
      throw createError({
        statusCode: 400,
        message: 'Не удалось получить данные о продукте',
      })
    }

    return {
      type: 'product',
      image: data.image || '',
      article: article,
      name: data.name || '',
      price: data.price || 0,
      priceText: data.price + ' ₽' || '0 ₽',
    }
  } else if (type === 'brand') {

    const data: any = await $fetch('http://65.109.129.174:3211', {
      method: 'POST',
      body: {
        type: 'ozonBrand',
        url,
        token: config.PARSER_TOKEN,
      },
    })

    if (!data) {
      return createError({
        statusCode: 400,
        message: 'Бренд не найден',
      })
    }

    return {
      type: 'brand',
      name: data.name || '',
      id: data.id || 0,
      image: data.image || '',
    }
  }
})
