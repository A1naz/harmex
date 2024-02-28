import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)

  const { wbApiKeys, mp } = body

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const filtered = wbApiKeys.filter((key: string) => key.length)

  const apiKey = user.apiKeys.find(apiKey => apiKey.mp === mp)

  if (apiKey) {
    const newKeys = wbApiKeys.filter((key: string) => key.length && !apiKey.keys.includes(key));
    
    apiKey.keys.push(...newKeys);
    console.log('founded ', mp);
} else {
    // Если объект с данным mp не найден, создаем новый объект с ключами wbApiKeys
    user.apiKeys.push({ mp: mp, keys: wbApiKeys.filter((key: string) => key.length) });
}
  user.wbApiKeys = filtered

  await user.save()
  return {
    status: 'ok',
  }
})
