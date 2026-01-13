import { Delivery } from '~~/server/lib/models/goldApple/Delivery'
import { Buyout } from '~~/server/lib/models/goldApple/Buyout'

export default eventHandler(async (event) => {

  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { type, string, dateRange } = getQuery(event)

  // Обработка dateRange
  let dateFilter = {};
  if (dateRange) {
    try {
      const parsedDateRange = JSON.parse(dateRange as string);
      if (Array.isArray(parsedDateRange) && parsedDateRange.length === 2) {
        const startDate = new Date(parsedDateRange[0]);
        const endDate = new Date(parsedDateRange[1]);
        dateFilter = {
          updatedAt: {
            $gte: startDate,
            $lte: endDate
          }
        };
      }
    } catch (e) {
      console.error("Error parsing dateRange:", e);
    }
  }

  let deliveries

  if (string) {
    const uuid = string?.toString().replaceAll('#', '')
    deliveries = await Delivery.find({
      user,
      ...dateFilter,
     $or: [
        { uuidbuyout: uuid },
        { point: { $regex: string, $options: 'i' } },
        { article: Number(string) },
        { article: string },
      ]
    }).sort({
      _id: -1,
    })
  } else {
    deliveries = await Delivery.find({ 
      user,
      ...dateFilter
    }).sort({
      _id: -1,
    })
  }

  const buyouts = await Buyout.find({ _id: { $in: deliveries.map(item => item.idbuyout) } })

  const format = await Promise.all(
    deliveries.map(async (delivery) => {
      const buyout = buyouts.find((item) => item._id.valueOf() === delivery.idbuyout.valueOf())

      if (!buyout)
        return null

      const phone = delivery.recipientphone
      const replaced = `+${phone[0]} (***) *** ${phone.slice(7)}`
      const currentstatus = delivery.statusdelivery?.length ? delivery.statusdelivery[delivery.statusdelivery.length - 1].status : 'Неизвестно'
      const statusupdated = delivery.statusdelivery?.length ? new Date(delivery.statusdelivery[delivery.statusdelivery.length - 1].date) : new Date()
      return {
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
