import { Cart } from '@/server/lib/models/Cart'
import { DocuemntEnum } from '~/data/enums'

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
    size: size == '0' ? 'none' : size,
    article,
    amount,
    period,
    image,
    name,
    createdDate: new Date(),
  })
  const res = await created.save()

  await userLog(event,
    {
        documentType: DocuemntEnum.Cart,
        documentId: res._id.toString(),
    })

  return {
    status: 'ok',
  }
})
