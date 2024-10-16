import { User } from '@/server/lib/models/User'

export default eventHandler(async (event) => {
  const userAuth = await getUserSession(event)

  const foundedUser = await User.findOne({ uuid: userAuth.user?.uuid })

  if (!foundedUser)
    return sendRedirect(event, '/auth', 302)

  const { changeTo } = getQuery(event)

  if (foundedUser.isTwoFaEnabled) {
    foundedUser.isTwoFaEnabled = false
  }
  else {
    foundedUser.isTwoFaEnabled = changeTo
  }
  console.log(foundedUser.isTwoFaEnabled)

  await foundedUser.save()

  return {
    status: 'ok',
  }
})
