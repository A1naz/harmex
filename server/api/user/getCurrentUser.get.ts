import { User } from '~~/server/lib/models/User'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session) {
    return sendRedirect(event, '/auth', 302)
  }
  const user = await User.findOne({ uuid: session.user?.uuid }).select('-_id -password -__v')
  if (!user) {
    return sendRedirect(event, '/auth', 302)
  }
  return user
})
