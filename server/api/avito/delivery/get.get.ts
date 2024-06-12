import { Delivery } from '~/server/lib/models/avito/Delivery'
import { Buyout } from '~/server/lib/models/avito/Buyout'
import { getAdminEntity } from '~/server/utils/getAdmin'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { status, limit, skip } = getQuery(event)

  // const all = await Delivery.find({ user })
  let deliveries
  if (status === 'all') {
    deliveries = await Delivery.find({ user })
      .sort({ _id: -1 })
      .skip(skip as number)
      .limit(limit as number)
  } else if (status === 'active') {
    deliveries = await Delivery.find({ user, status: 'active' })
      .sort({
        _id: -1,
      })
      .skip(skip as number)
      .limit(limit as number)
  } else if (status === 'completed') {
    deliveries = await Delivery.find({ user, status: 'completed' })
      .sort({
        _id: -1,
      })
      .skip(skip as number)
      .limit(limit as number)
  } else if (status === 'canceled') {
    deliveries = await Delivery.find({ user, status: 'canceled' })
      .sort({
        _id: -1,
      })
      .skip(skip as number)
      .limit(limit as number)
  } else if (status === 'onTheWay') {
    const response = await Delivery.find({ user, status: 'active' }).sort({
      _id: -1,
    })
    const substrings = ['Ожидается', 'пути', 'задерживается']
    deliveries = response
      .filter((delivery) => {
        return delivery.statusdelivery[
          delivery.statusdelivery.length - 1
        ].status
          .split(' ')
          .some((word: string) => substrings.includes(word))
      })
      .splice((skip as number) ? (skip as number) : 0, limit as number)
  } else if (status === 'pickupReady') {
    const response = await Delivery.find({ user, status: 'active' }).sort({
      _id: -1,
    })

    deliveries = response
      .filter(
        (delivery, index) =>
          delivery.statusdelivery[delivery.statusdelivery.length - 1].status.includes(
            'заказ доставлен'
          )
      )
      .splice(skip as number, limit as number)
  } else {
    return {
      error: 'Неизвестный статус',
    }
  }
  const buyouts = await Buyout.find({ _id: { $in: deliveries.map((item) => item.idbuyout) } })
  const format = await Promise.all(
    deliveries.map(async (delivery) => {
      const buyout = buyouts.find((item) => item._id.valueOf() === delivery.idbuyout.valueOf())
      if (!buyout) return null

      // const place = all.findIndex(
      //   item => item._id.toString() === delivery._id.toString(),
      // )

      const phone = delivery.recipientphone
      const replaced = `+${phone[0]} (***) *** ${phone.slice(7)}`
      const currentstatus = delivery.statusdelivery?.length
        ? delivery.statusdelivery[delivery.statusdelivery.length - 1].status
        : 'Неизвестно'
      const statusupdated = delivery.statusdelivery?.length
        ? delivery.statusdelivery[delivery.statusdelivery.length - 1].date
        : new Date()
      return {
        // place: place + 1,
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
    })
  )
  const filtered = format.filter(Boolean)
  return filtered
})
