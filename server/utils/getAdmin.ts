import auth from '~~/server/utils/auth'
import { User } from '../lib/models/User' // Переименовал импорт в 'auth'

export async function getAdminEntity(event: any): Promise<IUser | void> {
  try {
    const user = await auth.user(event)
    if (!user)
      return sendRedirect(event, '/auth', 302)

    if (user.uuidCompany) {
      const admin = await User.findOne({ uuid: user.uuidCompany })
      if (!admin)
        return sendRedirect(event, '/auth', 302)
      return admin
    }
    else {
      return user
    }
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e: any) {
    return sendRedirect(event, '/auth', 302)
  }
}
