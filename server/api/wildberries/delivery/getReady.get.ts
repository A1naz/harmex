import { Buyout } from '~~/server/lib/models/wildberries/Buyout'

import { Delivery } from '~~/server/lib/models/wildberries/Delivery'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { dateRange }: any = getQuery(event)
  let trueDateRange = {}
  if (dateRange) {
    trueDateRange = {
      updatedAt: {
        $gte: new Date(JSON.parse(dateRange[0])).setHours(0, 0, 0, 0),
        $lt: new Date(JSON.parse(dateRange[1])).setHours(23, 59, 0, 0),
      },
    }
  }
  const all = await Delivery.find({ ...trueDateRange, user }).sort({ _id: -1 }).limit(500)

  const buyoutsId = all.map(item => item.idbuyout)
  const buyouts = await Buyout.find({ _id: { $in: buyoutsId } })
  const format = await Promise.all(
    all.map(async (delivery) => {
      const buyout = buyouts.find(buyout => buyout._id.valueOf() === delivery.idbuyout.valueOf())
      if (!buyout)
        return null
      const place = all.findIndex(
        item => item._id.toString() === delivery._id.toString(),
      )

      const phone = delivery.recipientphone
      const replaced = `+${phone[0]} (***) *** ${phone.slice(7)}`
      const currentstatus = delivery.statusdelivery?.length ? delivery.statusdelivery[delivery.statusdelivery.length - 1].status : 'Неизвестно'
      const statusupdated = delivery.statusdelivery?.length ? new Date(delivery.statusdelivery[delivery.statusdelivery.length - 1].date) : new Date()
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

  const filtered = format.filter((item) => {
    if (item)
      return item!.currentstatus === 'Готов к выдаче' || item!.currentstatus === 'Готов к получению' || item!.currentstatus.includes('Получите до') || item!.currentstatus.includes('Заберите до')
    else
      return false
  })
  const points = {} as any
  filtered.forEach((item, index) => {
    if (points[item!.point])
      points[item!.point].push(item)
    else
      points[item!.point] = [item]
  })
  return points
})
