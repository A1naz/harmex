import { Cart } from '~/server/lib/models/ozon/Cart'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { item } = await readBody(event)
 
  const cart = await Cart.findOne({ user, _id: item.id })
  if (!cart) {
    throw createError({
      statusCode: 400,
      message: 'Корзина не найдена',
    })
  }
  cart.status = 'created';
  const res = await cart.save();
  return {
    status: 'ok',
  }
})
