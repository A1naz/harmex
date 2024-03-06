import { getServerSession } from '#auth'
import request from 'request'
const config = useRuntimeConfig()
const proxy = config.CHANGING_PROXY
const apiKey = config.serverLoadApiKey

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const params = event.context.params as any

  const accountData: any = await $fetch(
    'http://api.topvtop.pro/api/accounts/getAccountOzon',
    {
      method: 'POST',
      parseResponse: JSON.parse,
      body: {
        api_key: apiKey,
        type: 'walk',
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
  
  const url = `http://api.ozon.ru/composer-api.bx/page/json/v2?url=/products/${params.article}`

  const options = {
    url: url,
    proxy: 'http://' + proxy,
    headers: {
      'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
      Cookie: `abt_data=${cookies}`,
        // `__Secure-ext_xcid=89c7c7cd172fff859cee568c5341d887; __Secure-user-id=0; __Secure-ab-group=80; abt_data=7805954a28e2ac17aa3b701dfc7bb28b:3c01809f12d3531a28561d97d332c97ad9651bc1dca88d98e9cc7e2a7ea467629a8e4f8eb679e5ce3404cd51a53b5cb356518297fb312448e1ded814765fd5d9c24c22cf26240bc5bd940293e940861541352d32a7dfd33932c74e1e4b2567f03cad2862763a0d343f4220212817b63da3d9edf7f43ef6e1316e772621d1354d65ee0cbf9c0ec34d23ffea99a746399eb681fc9b7cb1ac71d74de1bf108d87ca9ab5eadc8914a9cdcf956e093947bcdb2294004b45f95775ff728266c23f2b969d230145ea9f60f32a04661d0491daa70caefcbcf1e1bc4758a746a3210ae0e613f4930d53e0a957991a3b7c91daf165c3294faab2f0fae651985f8d437b055e6cbcc0f41670ee2742f8e4fb7e2e5ffdd3b310d9f79e8168fb1dd95778214c1b12b3e55e0942157909d6228e300df713f72a176f4bc4b4a6e6986a1ab1db2cae6ccd3f1f08cb27a5af198949842a035ef30c40ebea8061203e96942d3451f2a801ba7d0fe86199b3866d7101fb460add287640ec4e4e1dd7f713dd89ee1db101c66d5976595620a9754a89d2cb6d27a6; __Secure-refresh-token=4.0.vFaBlDu-SJCbJoyXxv5syQ.80.AeHnovws_Z3Z1M0__ENXF6TU6l4FRJy30a4BvraIXEF0_XOtQ7ua2KXCgsbZmRTHjg..20240301144425.eaIKGzOg1Zva2wJmWuX09c7ZyaashX2KVZZoGE_7-RE; __Secure-access-token=4.0.vFaBlDu-SJCbJoyXxv5syQ.80.AeHnovws_Z3Z1M0__ENXF6TU6l4FRJy30a4BvraIXEF0_XOtQ7ua2KXCgsbZmRTHjg..20240301144425.knG8DYwFluhchEN9B8z4GF1uqiwD0AI-HFNKQcQugGE; __cf_bm=vdNmep9QqgEd8hnGkaBlp9pcgPlBr.jv4EXNLMzE7Jc-1709297065-1.0-ASUz4nY8rHUJRTZQ/rIwgwyS9zUv7WSJXsUZDhfzXrFSFJt/pnwDVkFyKj9Pr2C6DsnvM8IQD1OLRa7G7NUwOeM=`,
    },
  }

  // const data: any = await $fetch(url, {
  //   method: 'GET',
  //   agent: proxyAgent,
  //   parseResponse: JSON.parse,
  //   headers: {
  //     'User-Agent':
  //       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
  //     Cookie: '__Secure-ext_xcid=89c7c7cd172fff859cee568c5341d887; __Secure-user-id=0; __Secure-ab-group=80; abt_data=1b63138336bf1dfdba79892d04d9c817:8f7d0be5672b4ebe662babb09b5ba75405c0110a9df0e95f47b28201aeeaf676131138aea066178892f49489d2be1475c2f6c9f4b1f1d9283ec4f4662518b3a3bf47472f4b12cbd3c8c2882b38ba6c307af0f96b6a89e0aa6076fe868adebb7627aba68119fad45d59000cd1e545a7c935f6e0534756e2bd590ae47ea3a158edf43884f595616818a73b7603b677d2985f358eae8ca0038aed2b30d83ae5374465ea1a099c067a68f8a463f57e3bf87091ac46f52acd4cd4c1bf46c859d366d6; __Secure-refresh-token=4.0.vFaBlDu-SJCbJoyXxv5syQ.80.AeHnovws_Z3Z1M0__ENXF6TU6l4FRJy30a4BvraIXEF0_XOtQ7ua2KXCgsbZmRTHjg..20240213150705.18-X0vwjB-XbClTatUO9Pf1TWodGWzVzfqzRzaRkp-4; __Secure-access-token=4.0.vFaBlDu-SJCbJoyXxv5syQ.80.AeHnovws_Z3Z1M0__ENXF6TU6l4FRJy30a4BvraIXEF0_XOtQ7ua2KXCgsbZmRTHjg..20240213150705.07ZVnPGDT8dU2qUQW_hg3ydnN1vZolKYVz4rZGjg-0I',
  //   },
  // }).catch((e) => {
  //   if (e.status === 404) {
  //     console.log(e)

  //     throw createError({
  //       message: 'Не найдена информация по данному артикулу.',
  //     })
  //   }
  // })

  const data: any = await new Promise((resolve, reject) => {
    request.get(options, function (error, response, body) {  
      if (!error && response.statusCode == 200) {
        resolve(JSON.parse(body)) 
      } else {
    console.log(error)
          reject(new Error(`Не найдена информация по данному артикулу.`)) 
      }
    })
  })

  if (!data || !data.widgetStates) {
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
