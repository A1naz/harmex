import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import MenuBuilder from '~/server/utils/menuBuilder'
import { UserRoles } from '~/data/types'

export default eventHandler(async (event) => {

  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid }, {acesses: 1})
  if (!user) return sendRedirect(event, '/auth', 302)

  const { allowedPathes} = user.roles[0] == UserRoles.staff 
    ? MenuBuilder.filteredAccess(user.acesses) 
    : MenuBuilder.filteredAccess()

  return {
    accesses: allowedPathes,
    status: 'ok',
  }
})
