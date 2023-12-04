import { Delivery } from '@/server/lib/models/Delivery'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const { skip, limit } = getQuery(event)

    const limitA = limit ? parseInt(limit.toString(), 10) : 0
    const skipA = skip ? parseInt(skip.toString(), 10) : 0

  const options: any = {
    user,
    status: 'completed',
    reviewed: false,
  }

  const pipeLine: any[] = [
    { $match: options },
    { $sort: { _id: -1 } },
    { $skip: limitA },
    { $limit: skipA },
    { $project: {
        _id: 1,
        article: 1,
        data8: 1,
        updatedAt: 1,
        pricebuy: 1,
        idbuyout: 1,
    }},
    { $lookup: {
        from: "buyouts",
        localField: "idbuyout",
        foreignField: "_id",
        as: "buyout",
    }},
    { $unwind: {
        path: "$buyout",
    }},
    { $addFields: {
        size: "$buyout.sizeparam",
        productname: "$buyout.product.name",
        productimage: "$buyout.product.image",
    }},
    { $group: {
        _id: "$article",
        lastUpdated: { $last: "$updatedAt" },
        count: { $sum: 1 },
        productimage: {  $addToSet: "$productimage" },
        productname: { $addToSet: "$productname" },
        delivs: {
          $push: {
            deliv_id: "$_id",
            pricebuy: "$pricebuy",
            updatedAt: "$updatedAt",
          }
        }
    }}
  ]

  //   const readyForReview = await Delivery.find(options)
//     .sort({
//       _id: -1,
//     })
//     .skip((skip as number) || 0)
//     .limit((limit as number) || 0)

//   if (!readyForReview) return []
  
//   const format = await Promise.all(
//     readyForReview.map(async (delivery) => {
//       const buyout = await Buyout.findOne({ _id: delivery.idbuyout })
//       if (!buyout) return undefined
//       return {
//         buyoutuuid: buyout.uuid,
//         sex: delivery.data8 ? delivery.data8 : buyout.gender,
//         article: delivery.article,
//         pricebuy: delivery.pricebuy,
//         size: buyout.sizeparam,
//         productname: buyout.product.name,
//         productimage: buyout.product.image,
//         updatedAt: delivery.updatedAt,
//         id: delivery._id,
//       }
//     })
//   )

  const readyForReview = await Delivery.aggregate(pipeLine)
  if (!readyForReview) return []

  return readyForReview
})
