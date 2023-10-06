import { Buyout } from '@/server/lib/models/Buyout'
import { User } from '~/server/lib/models/User'
import { BuyoutTemplate } from '~/server/lib/models/BuyoutTemplate'
import { getServerSession } from '#auth'
import { findImage, findProductCard } from '@/server/lib/helpers'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  
  const query = getQuery(event)
  const uuid = query.uuid
  await BuyoutTemplate.deleteOne({ uuid })

  return { status: 'ok' }
})
