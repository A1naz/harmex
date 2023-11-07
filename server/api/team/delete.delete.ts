import { User } from '@/server/lib/models/User'

export default eventHandler(async (event) => {

  const body = await readBody(event)
  const { uuid } = body

  const user = await User.findOne({ uuid: uuid })
  if (!user) {
    throw createError({
    statusCode: 400,
    message: 'Такого пользователя не существует',
  })
}

  await user.deleteOne()
  return {
    status: 'ok',
    message: 'user was deleted',
  }
})
