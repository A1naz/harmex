import fs from 'node:fs'
import { getServerSession } from '#auth'
import { findImage, findProductCard } from '~~/server/lib/helpers'
const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const { article }: any = getQuery(event)

  //@ts-ignore
  const data: any = await $fetch('http://65.109.129.174:3211', {
    method: 'POST',
    body: {
      type: 'flowwowProduct',
      url: article.replaceAll(' ', ''),
      token: config.PARSER_TOKEN
    },
  }).catch((e) => {
    throw createError({
      statusCode: 404,
      message:
        'Не удалось получить информацию по товару. Пожалуйста, проверьте правильность введенного артикула.',
    })
  })

  return {
    product: {
      image: data.image || '',
      article: data.article,
      url: article,
      name: data.name || '',
      sizes: ['0'],
      price: data.price || 0,
      priceText: data.price ? data.price + ' ₽' : '',
    },
  }
})
