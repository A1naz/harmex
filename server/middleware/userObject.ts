import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {

    const session = (await getServerSession(event)) as any
    if (!session) return sendRedirect(event, '/auth', 302)
  
    const data = await User.findOne({ uuid: session.uuid })
    if (!data) return sendRedirect(event, '/auth', 302)
  
    let user
    if (data.uuidCompany) {
      user = await User.findOne({ uuid: data.uuidCompany })
    }else{
      user = data
    }

    setCookie(event, 'user', JSON.stringify(user))

})