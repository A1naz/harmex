import { ObjectId } from 'mongodb'
import { DocuemntEnum } from '~/data/enums'
import { ReviewDraft } from '~/server/lib/models/ozon/ReviewDraft'

export default eventHandler(async (event) => {
  const user: any = await getAdminEntity(event)
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)
  if (!body)
    throw new Error('Неправильный запрос')

  const res = await ReviewDraft.updateOne(
    {
      user: new ObjectId(user._id),
      _id: body._id,
    },
    { ...body },
  )

  await userLog(event, {
    documentType: DocuemntEnum.Review,
    documentId: body._id,
    comment: 'Изменен черновик',
  })

  return res.modifiedCount === 1
})
