import { v4 as uuid } from 'uuid'
import { getServerSession } from '#auth'
import { User } from '~~/server/lib/models/User'
import { BuyoutTemplate } from '~/server/lib/models/BuyoutTemplate'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const query = getQuery(event)
  const title: any = query.title
  const templateUuid = uuid()
  const templateTitle = title.length > 0 ? title : `Шаблон #${templateUuid}`
  const body = await readBody(event)
  const products: any = body  

  await BuyoutTemplate.create({
    uuid: templateUuid,
    user: user._id,
    userUuid: user.uuid,
    title: templateTitle,
    buyoutsArray: products,
  })

  return {
    status: 'ok',
  }
})
