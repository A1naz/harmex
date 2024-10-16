import { User } from '~~/server/lib/models/User'

export default defineEventHandler(async (event) => {
  const isAuth = await getUserSession(event)

  if (!isAuth) {
    return { acesses: [], quickAccesses: [] }
  }

  const user = await User.findOne({ uuid: isAuth.user?.uuid }).select('uuid acesses quickAccesses')

  if (!user) {
    return { acesses: [], quickAccesses: [] }
  }

  return { acesses: user.acesses, quickAccesses: user.quickAccesses }
})
