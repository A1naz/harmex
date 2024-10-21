import { Cart } from '~~/server/lib/models/wildberries/Cart'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { item } = await readBody(event)
  const cart = await Cart.findOne({ user, uuid: item.uuid })
  if (!cart) {
    throw createError({
      statusCode: 400,
      message: 'Корзина не найдена',
    })
  }
  cart.status = 'created';
  const res = await cart.save();
  await userLog(event,
    {
        documentType: DocuemntEnum.Cart,
        documentId: item.uuid,
        comment: 'Возобновлен документ'
    })
  return {
    status: 'ok',
  }
})
