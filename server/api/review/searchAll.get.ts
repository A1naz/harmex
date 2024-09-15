import { Delivery } from '@/server/lib/models/Delivery'
import { Buyout } from '@/server/lib/models/Buyout'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const { status, type, string } = getQuery(event)

  let trueStatus: any
  if (status == 'all') {
    trueStatus = {}
  } else {
    trueStatus = status
  }

  let readyForReview

  if (type === 'article') {
    readyForReview = await Delivery.find({
      status: trueStatus,
      user,
      $text: { $search: string?.toString() },
    }).sort({
      createdAt: -1,
    })
  } else if (type === 'uuid') {
    const uuid = string?.toString().replaceAll('#', '')
    readyForReview = await Delivery.find({
      status: trueStatus,
      user,
      uuidbuyout: uuid,
    }).sort({
      createdAt: -1,
    })
  }

  if (!readyForReview) return []

  const format = await Promise.all(
    readyForReview.map(async (delivery) => {
      const buyout = await Buyout.findOne({ _id: delivery.idbuyout })
      if (!buyout) return undefined
      return {
        status: trueStatus,
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
    })
  )
  return format.filter((item) => item !== undefined)
})
