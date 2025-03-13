import fs from "node:fs";
const config = useRuntimeConfig();

//@ts-ignore
export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const params = event.context.params as any;
  const article = params.article;
  console.log(article);
  
  //@ts-ignore
  const data: any = await $fetch("http://95.163.249.133:3000", {
    method: "POST",
    body: {
      type: "avitoProduct",
      url: `https://www.avito.ru/${article}`,
      token: config.PARSER_TOKEN,
    },
  }).catch((e) => {
    throw createError({
      statusCode: 404,
      message:
        "Не удалось получить информацию по товару. Пожалуйста, проверьте правильность введенного артикула.",
    });
  });

  if (!data) {
    return createError({
      statusCode: 400,
      message: "Товар не найден",
    });
  }

  return {
    product: {
      image: data.image || "",
      article: article,
      name: data.name || "",
      sizes: ["0"],
      price: data.price || 0,
      priceText: data.price ? data.price + " ₽" : "",
    },
  };
});
