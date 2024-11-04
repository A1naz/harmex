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
    session.user = {
      uuid: user.uuid,
      phoneNumber: user.phoneNumber,
      email: user.email ? user.email : '',
      emailConfirmed: user.emailConfirmed,
      isTwoFaEnabled: user.isTwoFaEnabled,
      acesses: user.acesses,
      username: user.username,
      balance: user.balance,
      fizFace: user.fizFace,
    }
  })

  // Called when we call useUserSession().clear() or clearUserSession(event)
  // sessionHooks.hook('clear', async (session, event) => {

  // })
})
