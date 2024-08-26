import MenuBuilder from '~/server/utils/menuBuilder'
import { User } from '~~/server/lib/models/User'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const myTeams = await User.find({ uuidCompany: user.uuid }).sort({ _id: -1 })

  const format = myTeams.map((user) => {
    const { menu, allowedPathes } = user.uuidCompany
      ? MenuBuilder.filteredAccess(user.acesses)
      : MenuBuilder.filteredAccess()

    return {
      isBanned: user.isBanned,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.phoneNumber,
      uuid: user.uuid,
      uuidCompany: user.uuidCompany,
      acesses: user.acesses,
      emailConfirmed: user.emailConfirmed,
      mmenuItems: menu,
      allowedPathes: allowedPathes,
      post: user.post ? user.post : 'manager',
    }
  })
  return format
})
