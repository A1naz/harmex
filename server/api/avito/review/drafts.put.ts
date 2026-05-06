import { ObjectId } from "mongodb"
import { ReviewDraft } from "~/server/lib/models/avito/ReviewDraft"
import { DocuemntEnum } from '~/data/enums'
import { parseObjectId, pickAllowedFields } from '~/server/utils/security'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const body = await readBody(event)
    if(!body?._id) throw new Error('Неправильный запрос')

    const update = pickAllowedFields(body, ['draftName', 'article', 'text'])

    const res = await ReviewDraft.updateOne(
        { 
            user: new ObjectId(user._id),
            _id: parseObjectId(body._id)
        },
        { $set: update }
    )

    await userLog(event,
        {
            documentType: DocuemntEnum.Review,
            documentId: body._id ,
            comment: 'Изменен черновик'
        })

  return res.modifiedCount == 1 ? true : false
})
