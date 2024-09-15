import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)


  const client = {
    email: user.email ? user.email : '',
    username: user.email === user.username ? '' : user.username,
    uuid: user.uuid,
    balance: user.balance,
    firstName: user.firstName,
    lastName: user.lastName,
    hasPassword: !!user.password,
    isBanned: user.isBanned,
  }

  return {
    client,
    status: 'ok',
  }
})
