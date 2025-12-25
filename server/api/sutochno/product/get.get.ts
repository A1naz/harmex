const config = useRuntimeConfig();

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any;
  if (!session) return sendRedirect(event, "/auth", 302);

  const { link } = getQuery(event);

  const data: any = await $fetch("http://95.163.249.133:3000", {
    method: "POST",
    body: {
      type: "sutochno",
      url: link,
      token: config.PARSER_TOKEN,
    },
  }).catch((e) => {
    // eslint-disable-next-line no-console
    console.log(e);

    throw createError({
      statusCode: 404,
      message:
        "Не удалось получить информацию по товару. Пожалуйста, проверьте правильность введенного артикула.",
    });
  });

  if (!data || !data.article) {
    return createError({
      statusCode: 400,
      message: "Номер(а) не найден(ы)",
    });
  }

  return {
    product: {
      image: data.image
        ? data.image.includes("https")
          ? data.image
          : `https:${data.image}`
        : "",
      article: data.article || "",
      roomName: data.roomName,
      priceText: data.price ? `${data.price} ₽` : "0 ₽",
      price: data.price || 0,
      name: data.name || "",
    },
  };
});
