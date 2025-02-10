const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const { link } = getQuery(event)
  console.log(link)

  const data: any = await $fetch('http://95.163.249.133:3000', {
    method: 'POST',
    body: {
      type: 'ozonHotels',
      url: link,
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
  console.log(data)
  // const data = {
  //   article: '1102120416',
  //   roomsData:
  //     [{
  //       name: 'Номер «Стандарт» с отдельным входом — «Игора. Времена года»',
  //       price: '8 800 ₽'
  //     },
  //     {
  //       name:
  //         'Номер "Студия" с отдельным входом для маломобильных групп населения - "Игора. Времена года."',
  //       price: '19 000 ₽'
  //     },
  //     {
  //       name: 'Номер «Студия» с отдельным входом — «Игора. Времена года»',
  //       price: '19 000 ₽'
  //     }],
  //   image:
  //     'https://ir-3.ozone.ru/s3/hotels-widget-api-2/operators_dir/wc1000/ozonhotels_6489861140000_638638986591292551b7958915a6ce.jpg',
  //   name: 'Игора. Времена Года Отель, 4*'
  // }

  if (!data || !data.roomsData || !data.roomsData.length) {
    return createError({
      statusCode: 400,
      message: 'Номер(а) не найден(ы)',
    })
  }

  return {
    product: {
      image: data.image || '',
      article: data.article || '',
      roomsData: data.roomsData || [],
      priceText: data.roomsData && data.roomsData.length ? data.roomsData[0].price : '',
      price: data.roomsData && data.roomsData.length ?
        !isNaN(data.roomsData[0].price.replaceAll(' ', '').replaceAll('₽', '').replaceAll(' ', '')) ? Number(data.roomsData[0].price.replaceAll(' ', '').replaceAll('₽', '').replaceAll(' ', '')) :
          0 : 0,
      name: data.name || '',
    },
  }
})
