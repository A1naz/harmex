import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import MenuBuilder from '~/server/utils/menuBuilder'
import { Client } from '~/data/types'
import { UserRoles } from '~/data/enums'
import getTariffs from '~/server/utils/getTariffs'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const tariffs = await getTariffs(user.MPTariffs)

  if (!user.partner || !user.partner.secondLevelPercent) {
    user.partner = {
      refCount: 0,
      rewardPercent: 5,
      secondLevelPercent: 2,
      balance: 0,
      followCount: 0,
    }

    await user.save()
  }

  const { menu, allowedPathes } =
    user.roles[0] == UserRoles.staff
      ? MenuBuilder.filteredAccess(user.acesses)
      : MenuBuilder.filteredAccess()

  if (user.roles[0] == UserRoles.staff) {
    const admin = await User.findOne({ uuid: user.uuidCompany })
    if (!admin) return sendRedirect(event, '/auth', 302)
    user.tariff = admin.tariff
    user.balance = admin.balance
    user.fizFace = admin.fizFace
    user.staff = true
    user.ffEnabled = admin.ffEnabled
  }

  const client: Client = {
    email: user.email ? user.email : '',
    username: user.email === user.username ? '' : user.username,
    uuid: user.uuid,
    telegram: user.telegram || undefined,
    balance: user.balance,
    firstName: user.firstName,
    lastName: user.lastName,
    hasPassword: !!user.password,
    telegramUserId: user.telegramUserId,
    apiKeys: user.apiKeys?.length ? user.apiKeys : [],
    wbApiKeys: user.wbApiKeys?.length ? user.wbApiKeys : [],
    partner: user.partner,
    isBanned: user.isBanned,
    role: user.roles[0],
    mmenuItems: menu,
    allowedPathes: allowedPathes,
    tariff: tariffs,
    isTwoFaEnabled: user.isTwoFaEnabled ? true : false,
    orgKey: user.orgKey ? user.orgKey : '',
    orgName: user.orgName ? user.orgName : '',
    orgOgrn: user.orgOgrn ? user.orgOgrn : '',
    orgInn: user.orgInn ? user.orgInn : '',
    middleName: user.middleName ? user.middleName : '',
    phoneNumber: user.phoneNumber ? user.phoneNumber : '',
    ffEnabled: user.ffEnabled ? true : false,
    bik: user.bik,
    rs: user.rs,
    fizFace: user.fizFace ? true : false,
    staff: user.staff,
  }

  return {
    client,
    status: 'ok',
  }
})
