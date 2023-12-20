import { UserLogs } from '~/server/lib/models/UserLogs'

export default eventHandler(async (event) => {

  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const logs = await UserLogs.find({ user: user.uuid }).sort({ _id: -1 })
  

  return {
    status: 'ok',
    data: []
  }
})
