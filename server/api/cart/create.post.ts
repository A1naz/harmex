import { Cart } from '@/server/lib/models/Cart'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { article, amount, period, query, size, productData } = await readBody(event)
  if (amount > 1000 || amount <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Не больше 1000 добавлений за один заказ',
    })
  }
  const { image, name } = productData
  const created = new Cart({
    user,
    query,
    size,
    article,
    amount,
    period,
    image,
    name,
    createdDate: new Date(),
  })
  await created.save()
  return {
    status: 'ok',
  }
})
