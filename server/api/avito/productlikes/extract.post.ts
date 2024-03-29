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
  const type = url.includes('ozon.ru/brand') ? 'brand' : 'product'

  console.log(url)
  if (type === 'product') {
    const article = extractArticulFromOzonLink(url)

    //@ts-ignore
    const data: any = await $fetch('http://95.163.249.133:4141', {
      method: 'POST',
      body: {
        type: 'avitoProduct',
        url: url.replaceAll(' ', ''),
      },
    })

    if (!data) {
      return createError({
        statusCode: 400,
        message: 'Товар не найден',
      })
    }

    console.log(data);
    

    if (!data) {
      throw createError({
        statusCode: 400,
        message: 'Не удалось получить данные о продукте',
      })
    }

    return {
      type: 'product',
      image: data.image || '',
      article: Number(data.article) || 0,
      name: data.name || '',
      price: data.price || 0,
      priceText: data.price + ' ₽' || '0 ₽',
    }
  } else if (type === 'brand') {
    return {
      type: 'brand',
      name: 'неизвестно',
      id: 'неизвестно',
      image: 'неизвестно',
    }
  }
})
