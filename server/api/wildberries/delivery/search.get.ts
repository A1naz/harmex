import { Buyout } from '~~/server/lib/models/wildberries/Buyout'

import { Delivery } from '~~/server/lib/models/wildberries/Delivery'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { type, string } = getQuery(event)

  const all = await Delivery.find({ user })
  let deliveries

  if (type === 'uuid') {
    const uuid = string?.toString().replaceAll('#', '')
    deliveries = await Delivery.find({ user, uuidbuyout: uuid }).sort({
      _id: -1,
    })
  }
  else if (type === 'article') {
    deliveries = await Delivery.find({
      user,
      article: { $in: [Number(string), string?.toString()] },
    }).sort({
      _id: -1,
    })
  }
  else {
    deliveries = await Delivery.find({ user }).sort({
      _id: -1,
    })
  }

  const buyouts = await Buyout.find({
    _id: { $in: deliveries.map(item => item.idbuyout) },
  })

  const format = await Promise.all(
    deliveries.map(async (delivery) => {
      const buyout = buyouts.find(
        item => item._id.valueOf() === delivery.idbuyout.valueOf(),
      )

      if (!buyout)
        return null

      const place = all.findIndex(
        item => item._id.toString() === delivery._id.toString(),
      )

      const phone = delivery.recipientphone
      const replaced = `+${phone[0]} (***) *** ${phone.slice(7)}`
      const currentstatus = delivery.statusdelivery?.length
        ? delivery.statusdelivery[delivery.statusdelivery.length - 1].status
        : 'Неизвестно'
      const statusupdated = delivery.statusdelivery?.length
        ? new Date(
          delivery.statusdelivery[delivery.statusdelivery.length - 1].date,
        )
        : new Date()
      return {
        place: place + 1,
        uuid: buyout.uuid,
        article: delivery.article,
        pricebuy: delivery.pricebuy,
        size: buyout.sizeparam,
        point: delivery.point,
        statusdelivery: delivery.statusdelivery,
        currentstatus,
        statusupdated,
        productname: buyout.product.name,
        productimage: buyout.product.image,
        receiptcode: delivery.receiptcode ? delivery.receiptcode : undefined,
        receiptcodeqr: delivery.receiptcodeqr
          ? delivery.receiptcodeqr
          : undefined,
        recipient: delivery.recipient,
        recipientphone: replaced,
        updatedAt: delivery.updatedAt,
      }
    }),
  )
  const filtered = format.filter(Boolean)
  return filtered
})
