import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { BuyoutTemplate } from '~/server/lib/models/BuyoutTemplate'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const templates: any = await BuyoutTemplate.find({ user }).sort({ _id: -1 })
  const format =  templates.map((item: any) => {
    return {
      uuid: item.uuid,
      title: item.title,
      buyoutsArray: item.buyoutsArray,
    }
  })

  return { templates: format }
})
