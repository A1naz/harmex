import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { Buyout } from '~/server/lib/models/Buyout'
import { Delivery } from '~/server/lib/models/Delivery'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const allDeliveriesCount = await Delivery.countDocuments({ user })
  const activeDeliveriesCount = await Delivery.countDocuments({
    user,
    status: 'active',
  })
  const availableDeliveriesCount = await Delivery.countDocuments({
    user,
    status: 'active',
    statusdelivery: { $elemMatch: { status: 'Готов к выдаче' } },
  })

  const completedDeliveriesCount = await Delivery.countDocuments({
    user,
    status: 'completed',
    statusdelivery: { $elemMatch: { status: 'Получено' } },
  })

  const penaltyDeliveriesCount = await Delivery.countDocuments({
    status: 'completed',
    statusdelivery: { $not: { $elemMatch: { status: 'Получено' } } },
  })

  return {
    all: allDeliveriesCount,
    active: availableDeliveriesCount,
    completed: completedDeliveriesCount,
    penalty: penaltyDeliveriesCount,
  }
})
