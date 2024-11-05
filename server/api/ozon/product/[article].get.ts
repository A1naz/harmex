const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const params = event.context.params as any
  const article = params.article


  console.log('start');
  
  await new Promise((resolve) => setTimeout(resolve, 100000))

  console.log('stop');
  


  console.log(config.PARSER_TOKEN)

  const data: any = await $fetch('http://95.163.249.133:3000', {
    method: 'POST',
    body: {
      type: 'ozonProduct',
      url: `https://www.ozon.ru/product/${article}/`,
      token: config.PARSER_TOKEN,
    },
  }).catch((e) => {
    // eslint-disable-next-line no-console
    console.log(e)

    throw createError({
      statusCode: 404,
      message: 'Не удалось получить информацию по товару. Пожалуйста, проверьте правильность введенного артикула.',
    })
  })

  if (!data) {
    return createError({
      statusCode: 400,
      message: 'Товар не найден',
    })
  }

  console.log(data);
  

  return {
    product: {
      image: data.image || '',
      article,
      name: data.name || '',
      sizes: data.sizes.length ? data.sizes : ['0'],
      price: data.price || 0,
      priceText: data.price ? `${data.price} ₽` : '',
    },
  }
})
