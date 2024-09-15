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

  if (type === 'product') {
    const article = extractArticulFromOzonLink(url)
    const productUrl = `http://api.ozon.ru/composer-api.bx/page/json/v2?url=/products/${article}`

    const options = {
      url: productUrl,
      proxy: 'http://' + proxy,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
        // Cookie:
          // '__Secure-ext_xcid=89c7c7cd172fff859cee568c5341d887; __Secure-user-id=0; __Secure-ab-group=80; abt_data=1b63138336bf1dfdba79892d04d9c817:8f7d0be5672b4ebe662babb09b5ba75405c0110a9df0e95f47b28201aeeaf676131138aea066178892f49489d2be1475c2f6c9f4b1f1d9283ec4f4662518b3a3bf47472f4b12cbd3c8c2882b38ba6c307af0f96b6a89e0aa6076fe868adebb7627aba68119fad45d59000cd1e545a7c935f6e0534756e2bd590ae47ea3a158edf43884f595616818a73b7603b677d2985f358eae8ca0038aed2b30d83ae5374465ea1a099c067a68f8a463f57e3bf87091ac46f52acd4cd4c1bf46c859d366d6; __Secure-refresh-token=4.0.vFaBlDu-SJCbJoyXxv5syQ.80.AeHnovws_Z3Z1M0__ENXF6TU6l4FRJy30a4BvraIXEF0_XOtQ7ua2KXCgsbZmRTHjg..20240213150705.18-X0vwjB-XbClTatUO9Pf1TWodGWzVzfqzRzaRkp-4; __Secure-access-token=4.0.vFaBlDu-SJCbJoyXxv5syQ.80.AeHnovws_Z3Z1M0__ENXF6TU6l4FRJy30a4BvraIXEF0_XOtQ7ua2KXCgsbZmRTHjg..20240213150705.07ZVnPGDT8dU2qUQW_hg3ydnN1vZolKYVz4rZGjg-0I',
      },
    }

    const data: any = await new Promise((resolve, reject) => {
      request.get(options, function (error, response, body) {
        if (!error) {
          resolve(JSON.parse(body)) 
        } else {
          console.log(error)

          reject(new Error(`Непредвиденный статус код`)) 
        }
      })
    })
    
    if (!data) {
      throw createError({
        statusCode: 400,
        message: 'Не удалось получить данные о продукте',
      })
    }

    const productData = JSON.parse(
      data.widgetStates['webStickyProducts-726428-default-1']
    )
    let price = 0

    try {
      price = parseInt(
        JSON.parse(data.widgetStates['webPrice-3121879-default-1'])
          .price.replaceAll(' ', '')
          .replace(/[\s ]/g, '')
      )
    } catch (error) {}
    const image = productData.coverImageUrl
    const name = productData.name

    return {
      type: 'product',
      image: image || '',
      article: article,
      name: name || '',
      price: price || 0,
      priceText: price + ' ₽' || '0 ₽',
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
