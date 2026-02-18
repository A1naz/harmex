import { User } from '~~/server/lib/models/User'

export default defineNitroPlugin(() => {
  // Called when the session is fetched during SSR for the Vue composable (/api/_auth/session)
  // Or when we call useUserSession().fetch()
  sessionHooks.hook('fetch', async (session) => {
    if (!session.user) {
      throw createError({
      })
    }
    const user = await User.findOne({ uuid: session.user.uuid })
 
    if (!user) {
      throw createError({})
    }

    if (user.roles && user.roles[0] === 'staff') {
      const admin = await User.findOne({ uuid: user.uuidCompany })
      if (!admin) throw createError({
        statusCode: 400,
        message: 'Admin not found'
      })
      user.balance = admin.balance
      user.fizFace = admin.fizFace
      user.staff = true
      user.ffEnabled = admin.ffEnabled
      user.adminUsername = admin.username
      user.needVerification = admin.needVerification
    }

    session.user = {
      uuid: user.uuid,
      phoneNumber: user.phoneNumber,
      email: user.email ? user.email : '',
      emailConfirmed: user.emailConfirmed,
      phoneConfirmed: user.phoneConfirmed,
      isTwoFaEnabled: user.isTwoFaEnabled,
      acesses: user.acesses,
      username: user.username,
      balance: user.balance,
      fizFace: user.fizFace,
      orgInn: user.orgInn,
      orgName: user.orgName,
      ffEnabled: user.ffEnabled,
      docType: user.fizFace ? 'Fiz' : user.orgKey === 'ИП' ? 'IP' : 'OOO',
      orgIP: user.lastOrgInfo ? user.lastOrgInfo.orgName : 'ИП БАЛАШОВ АНДРЕЙ ЭДУАРДОВИЧ',
      docName: user.lastOrgInfo ? user.lastOrgInfo.docName : 'oferta',
      staff: user.staff,
      adminUsername: user.adminUsername,
      needVerification: user.needVerification ? user.needVerification : false,
    }

  })

  // Called when we call useUserSession().clear() or clearUserSession(event)
  // sessionHooks.hook('clear', async (session, event) => {

  // })
})
