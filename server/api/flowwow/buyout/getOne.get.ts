import { Buyout } from '@/server/lib/models/flowwow/Buyout'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { uuid } = getQuery(event)

  const all = await Buyout.find({ user })
  const buyout = await Buyout.findOne({ user, uuid })
  if (!buyout) {
    throw createError({
      statusCode: 404,
      message: 'Buyout not found',
    })
  }

  const place = all.findIndex(item => item.uuid === buyout.uuid)
  return {
    place: buyout.place ? buyout.place : place + 1,
    uuid: buyout.uuid,
    article: buyout.article,
    searchQuery: buyout.searchQuery,
    point: buyout.point,
    dateStart: buyout.dateStart,
    dateEnd: buyout.dateEnd,
    sizeparam: buyout.sizeparam,
    quantity: buyout.quantity,
    gender: buyout.gender,
    status: buyout.status,
    rules: buyout.rules,
    createdAt: buyout.createdAt,
    product: buyout.product,
    purchaseSoon: buyout.purchaseSoon,
    key: buyout.key,
  }
})
