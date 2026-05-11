import { ObjectId } from 'mongodb'
import { DocuemntEnum } from '~/data/enums'
import { ReviewDraft } from '~/server/lib/models/wildberries/ReviewDraft'
import { parseObjectId, pickAllowedFields } from '~/server/utils/security'

export default eventHandler(async (event) => {
  const user: any = await getAdminEntity(event)
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)
  if (!body?._id)
    throw new Error('Неправильный запрос')

  const update = pickAllowedFields(body, ['draftName', 'article', 'text'])

  const res = await ReviewDraft.updateOne(
    {
      user: new ObjectId(user._id),
      _id: parseObjectId(body._id),
    },
    { $set: update },
  )

  await userLog(event, {
    documentType: DocuemntEnum.Review,
    documentId: body._id,
    comment: 'Изменен черновик',
  })

  // eslint-disable-next-line eqeqeq
  return res.modifiedCount == 1
})
