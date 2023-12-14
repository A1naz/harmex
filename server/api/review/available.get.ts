import { Delivery } from '@/server/lib/models/Delivery'
import { ObjectId } from 'mongodb'
import { SelectOptionsReviews } from '@/data/enums'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const { skip, limit, search } = getQuery(event)

  const pipeLine: any[] = [
    { $match: {
        user: new ObjectId(user._id),
        reviewed: false,
        status: 'completed',
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
          countAvailable: { $sum: 1 },
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

  const limitA = limit ? parseInt(limit.toString(), 10) : 100
  const skipA = skip ? parseInt(skip.toString(), 10) : 0
  const searchParse = search ? JSON.parse(search?.toString()) : undefined

  if(Object.values(searchParse)[0] !== '') {
    if (Object.keys(searchParse)[0] == SelectOptionsReviews.uuidBuyout){
        pipeLine.splice(3,0, { $match: {...searchParse}} ) // after $project
    } else {
        pipeLine.splice(1,0, { $match: {...searchParse}} ) // after $match
    }
  }

  if(skipA > 0) pipeLine.push({ $skip: skipA })
  if(limitA > 0) pipeLine.push({ $limit: limitA })

    const readyForReview = await Delivery.aggregate(pipeLine)
    if (!readyForReview) return []

    const soonForReview = await Delivery.aggregate([
        { $match: {
            user: new ObjectId(user._id),
            status: 'active',
            reviewed: false,
        }},
        { $group: {
            _id: '$article',
            count: { $sum: 1 }
        }}
    ])

    const genderMap = new Map<string, string>([
        ['female', 'Женский'],
        ['male', 'Мужской'],
    ])
    const sex = (genders: string[]): string => {
        for(const gen of genders){
            let foundGen = genderMap.get(gen.toLowerCase())
            if (foundGen) return foundGen
        }
        return 'Нет'
    }
    const formated = readyForReview.map( r => {
        const countSoon = soonForReview.filter( sfr => sfr._id == r.article)
        return {
            ...r,
            countSoon: countSoon.length > 0 ? countSoon[0].count : 0,
            delivs: r.delivs.map((d: any) => {
                return {
                        ...d,
                        sex: d.gender = sex(d.gender)
                    }
            })
        }
    })

  return formated
})

