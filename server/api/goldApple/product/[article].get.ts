const config = useRuntimeConfig();

export default eventHandler(async (event) => {
  const user = (await getAdminEntity(event)) as any;
  if (!user) return sendRedirect(event, "/auth", 302);

  const { article }: any = getQuery(event);

  //@ts-ignore
  const data: any = await $fetch('http://95.163.249.133:3000', {
    method: 'POST',
    body: {
      type: 'zyaProduct',
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

  // const data = {
  //   article: "80280200013",
  //   image:
  //     "https://pcdn.goldapple.ru/p/p/80280200013/web/696d674d61696e5f35313639373633366265663634353366623535333535366161633530396238348dd7831aaec4faa.jpg",
  //   name: "Man in Black",
  //   volumes: ["60", "100"],
  //   colors: [],
  //   price: [9180, 12445],
  // }

  if (data.error) {
    throw createError({
      statusCode: 404,
      message: data.message,
    });
  }

  return {
    product: {
      image: data.image || "",
      article: data.article,
      url: article,
      name: data.name || "",
      parameters: data.volumes && data.volumes.length ? data.volumes : ["нет"],
      colors: data.colors && data.colors.length ? data.colors : ["нет"],
      prices: data.price && data.price.length ? data.price : ["0"],
      price: Number(data.price && data.price.length ? data.price[0] : "0"),
      priceText:
        Number(data.price && data.price.length ? data.price[0] : "0") + " ₽",
    },
  };
});
