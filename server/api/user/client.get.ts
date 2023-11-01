import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import MenuBuilder from '~/server/utils/menuBuilder'


export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user: IUser = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  // if (user.isBanned) {
  //   return sendRedirect(event, '/auth', 302)
  // }
  // if (user.isBanned) {
  //   return sendRedirect(event, '/auth', 302)
  // }

  if (!user.partner) {
    user.partner = {
      refCount: 0,
      rewardPercent: 10,
      balance: 0,
    }
    await user.save()
  }

  const preparedMenu = user.uuidCompany ? MenuBuilder.filter(user.acesses) : MenuBuilder.full()

  const client = {
    email: user.email,
    username: user.email === user.username ? undefined : user.username,
    uuid: user.uuid,
    telegram: user.telegram || undefined,
    balance: user.balance,
    firstName: user.firstName,
    lastName: user.lastName,
    hasPassword: !!user.password,
    telegramUserId: user.telegramUserId,
    wbApiKeys: user.wbApiKeys?.length ? user.wbApiKeys : [],
    partner: user.partner,
    isBanned: user.isBanned,
    mmenuItems: preparedMenu,
  }

  return {
    client,
    status: 'ok',
  }
})
