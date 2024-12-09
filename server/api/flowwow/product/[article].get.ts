const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const user = (await getAdminEntity(event)) as any
  if (!user) return sendRedirect(event, '/auth', 302)

  const { article }: any = getQuery(event)

  //@ts-ignore
  const data: any = await $fetch('http://95.163.249.133:3000', {
    method: 'POST',
    body: {
      type: 'flowwowProduct',
      url: article.replaceAll(' ', ''),
      token: config.PARSER_TOKEN,
    },
  }).catch((e) => {
    throw createError({
      statusCode: 404,
      message:
        'Не удалось получить информацию по товару. Пожалуйста, проверьте правильность введенного артикула.',
    })
  })


  console.log(data)
  return {
    product: {
      slug: data.slug || '',
      image: data.image || '',
      article: data.article,
      url: article,
      name: data.name || '',
      parameters: data.parameters && data.parameters.length ? data.parameters : ['0'],
      sizes: ['0'],
      price: Number(data.price.replaceAll(' ', '')) || 0,
      priceText: data.price ? data.price + ' ₽' : '',
    },
  }
})
