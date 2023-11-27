import jwt from 'jsonwebtoken'
import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { tgBotOptions } from '~/server/lib/models/tgBotOptions'

export default eventHandler(async (event) => {
  if (event.req.headers.cookie) {
    event.req.headers.cookie = event.req.headers.cookie.replace(
      /next-auth\.session-token=[^;]*/,
      `next-auth.session-token=${event.req.headers.authorization}`
    )
  }

  const session = (await getServerSession(event)) as any

  if (!session) {
    console.log('error');
    
    return {
      status: 'error',
    }
  }

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return {
      status: 'error',
    }

  console.log('ok')

  return {
    status: 'ok',
  }
})
