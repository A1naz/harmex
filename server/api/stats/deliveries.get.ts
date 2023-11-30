﻿import { Delivery } from '~/server/lib/models/Delivery'

export default eventHandler(async (event) => {
  
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { period } = getQuery(event)

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

  const deliveries = await Delivery.aggregate([
        { $match: {
            user: user._id,
            status: 'completed',
            updatedAt: filter.updatedAt
        }},
        { $project: { 
            updatedAt: 1,
            point: 1,
            article: 1,
            point_city: 1,
            point_state: 1,
        }}
    ])
    if(deliveries.length == 0) return {}

    const cityQty = new Map()
    deliveries.forEach( del => {
        const city = del.point_city ? `${del.point_city} (${del.point_state})` : del.point
        const qty = cityQty.get(city) ? cityQty.get(city) + 1 : 1
        cityQty.set(city, qty)
    })
    const delivs = {
        data: Array.from(cityQty.values()),
        labels: Array.from(cityQty.keys()),
        articles: []
    }

    return delivs
})
