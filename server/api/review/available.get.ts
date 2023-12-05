import { Delivery } from '@/server/lib/models/Delivery'
import { ObjectId } from 'mongodb'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const { skip, limit } = getQuery(event)

    const limitA = limit ? parseInt(limit.toString(), 10) : 0
    const skipA = skip ? parseInt(skip.toString(), 10) : 0

  const pipeLine: any[] = [
    { $match: {
        user: new ObjectId(user._id),
        status: 'completed',
        reviewed: false,
    }},
    { $sort: { _id: -1 } },
    { $project: {
        _id: 1,
        article: 1,
        updatedAt: 1,
        pricebuy: 1,
        idbuyout: 1,
        uuidbuyout: 1,
        data8: 1 // gender
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
        gender: ["$data8","$buyout.gender"],
        sizeparam: '$buyout.sizeparam'
    }},
    { $group: {
          _id: "$article",
          article: { $last: "$article"},
          lastUpdated: { $last: "$updatedAt"},
          count: { $sum: 1 },
          productimage: { $addToSet: "$productimage" },
          productname: { $addToSet: "$productname" },
          delivs: {
            $push: {
              delivId: "$_id",
              pricebuy: "$pricebuy",
              updatedAt: "$updatedAt",
              buyoutId: '$uuidbuyout',
              gender: "$gender",
              sizeparam: '$sizeparam'
            },
          },
    }},
    { $project: { _id: 0 } }
  ]

  if(limitA > 0) pipeLine.splice(2, 0, { $limit: limitA })
  if(skipA > 0) pipeLine.splice(2, 0, { $skip: skipA })

  const readyForReview = await Delivery.aggregate(pipeLine)
  if (!readyForReview) return []

  return [...readyForReview]
})

