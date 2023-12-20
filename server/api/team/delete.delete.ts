import { User } from '@/server/lib/models/User'
import { DocuemntEnum } from '~/data/enums'

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

  await userLog(event,
    {
        documentType: DocuemntEnum.User,
        documentId: user.uuid,
    })

  return {
    status: 'ok',
    message: 'user was deleted',
  }
})
