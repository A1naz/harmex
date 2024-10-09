import { User } from '~~/server/lib/models/User'

export default eventHandler(async (event) => {
  const params = getQuery(event)
  const { uuid } = params
  if (!uuid) return { status: 'error', error: 'missing uuid' }

  const user = await User.findOne({ uuid })
  if (!user) return { status: 'error', error: 'user not found' }

  if (user.newEmail) {
    user.email = user.newEmail
    user.newEmail = ''
  }

  user.emailConfirmed = true
  await user.save()

  const sessionUser = await getUserSession(event);

  if (sessionUser.user && sessionUser.user.uuid === user.uuid) {
    sessionUser.user.emailConfirmed = true;
    if (user.email) {
      sessionUser.user.email = user.email;
    }
    await setUserSession(event, sessionUser);
  }

  return sendRedirect(event, '/auth?emailConfirmed=true', 302)
})
