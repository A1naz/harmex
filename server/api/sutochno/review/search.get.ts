import { Delivery } from '@/server/lib/models/sutochno/Delivery'
import { Buyout } from '@/server/lib/models/sutochno/Buyout'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const { type, string } = getQuery(event)

  let readyForReview

  if (type === 'article') {
    readyForReview = await Delivery.find({
      user,
      status: 'completed',
      reviewed: false,
      $text: { $search: string?.toString() },
    }).sort({
      createdAt: -1,
    })
  }
  else if (type === 'uuid') {
    const uuid = string?.toString().replaceAll('#', '')
    readyForReview = await Delivery.find({
      user,
      status: 'completed',
      reviewed: false,
      uuidbuyout: uuid,
    }).sort({
      createdAt: -1,
    })
  }

  if (!readyForReview)
    return []

  const format = await Promise.all(
    readyForReview.map(async (delivery) => {
      const buyout = await Buyout.findOne({ _id: delivery.idbuyout })
      if (!buyout)
        return undefined
      return {
        buyoutuuid: buyout.uuid,
        sex: buyout.gender,
        article: delivery.article,
        pricebuy: delivery.pricebuy,
        size: buyout.sizeparam,
        productname: buyout.product.name,
        productimage: buyout.product.image,
        updatedAt: delivery.updatedAt,
        id: delivery._id,
      }
    }),
  )
  return format.filter(item => item !== undefined)
})
