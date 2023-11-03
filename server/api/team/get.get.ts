import { User } from '~~/server/lib/models/User'

export default eventHandler(async (event) => {

  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const myTeams = await User.find({ uuidCompany: user.uuid }).sort({ _id: -1 })
  const format = myTeams.map((user) => {
    return {
        isBanned: user.isBanned,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        uuid: user.uuid,
        uuidCompany: user.uuidCompany,
        acesses: user.acesses,
        emailConfirmed: user.emailConfirmed,
    }
  })
  return format
})
