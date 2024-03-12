﻿import { Delivery } from '~/server/lib/models/ozon/Delivery'

export default eventHandler(async (event) => {
  
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { period, article } = getQuery(event)

  const currentDate = new Date() // Текущая дата
  let filter: any = {} // Начинаем с пустого фильтраD

  switch (period) {
    case 'today':
      filter.updatedAt = {
        $gte: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        ).setHours(3, 0, 0, 0),
        $lt: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + 1
        ).setHours(23, 59, 59, 999),
      }
      break
    case 'yesterday':
      filter.updatedAt = {
        $gte: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 1
        ).setHours(3, 0, 0, 0),
        $lt: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        ).setHours(3, 0, 0, 0),
      }
      break
    case 'week':
      const oneWeekAgo = new Date(currentDate)
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      oneWeekAgo.setHours(3, 0, 0, 0)
      filter.updatedAt = {
        $gte: oneWeekAgo,
        $lt: currentDate,
      }
      break
    case 'month':
      filter.updatedAt = {
        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
      }
      break
    case 'lastMonth':
      filter.updatedAt = {
        $gte: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        ),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      }
      break
    default:
      // Обработка неверного значения параметра period, если необходимо
      break
  }

  const delivsPL: any[] = [
    { $match: {
        user: user._id,
        status: 'completed',
        updatedAt: filter.updatedAt,
    }},
    { $project: {
        idbuyout: 1,
        updatedAt: 1,
        point: 1,
        article: 1
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
        point_city: "$buyout.point_city",
        point_state: "$buyout.point_state",
    }},
  ]

    const deliveries = await Delivery.aggregate(delivsPL)

    if(deliveries.length == 0) return {}

    const cityQtys = new Map()
    const articleQtys = new Map()

    for(const del of deliveries){
        const articleName = del.article
        const articleQty = articleQtys.has(articleName) ? articleQtys.get(articleName) + 1 : 1
        articleQtys.set(articleName, articleQty)

        if(article !== '' && article !== articleName) continue

        const cityName = del.point_city ? `${del.point_city} (${del.point_state})` : del.point
        const citQty = cityQtys.has(cityName) ? cityQtys.get(cityName) + 1 : 1
        cityQtys.set(cityName, citQty)
    }


    const delivs = {
        data: Array.from(cityQtys.values()),
        labels: Array.from(cityQtys.keys()),
        articles: Array.from(articleQtys, ([value, qty]) => ({ value, qty }))
    }

    return delivs
})
