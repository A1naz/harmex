import { ObjectId } from 'mongodb'
import { ReviewDraft } from '~/server/lib/models/wildberries/ReviewDraft'
import { parseObjectId } from '~/server/utils/security'

export default eventHandler(async (event) => {
  const user: any = await getAdminEntity(event)
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)
  if (!body._id)
    throw new Error('Неправильный запрос')

  const res = await ReviewDraft.deleteOne(
    {
      user: new ObjectId(user._id),
      _id: parseObjectId(body._id),
    },
  )

  await userLog(event, {
    documentType: DocuemntEnum.Review,
    documentId: body._id,
    comment: 'Удален черновик',
  })

  return res
})
