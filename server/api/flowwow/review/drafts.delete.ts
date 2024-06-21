import { ObjectId } from "mongodb"
import { ReviewDraft } from "~/server/lib/models/flowwow/ReviewDraft"
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const body = await readBody(event)
    if(!body._id) throw new Error('Неправильный запрос')

    const res = await ReviewDraft.deleteOne(
        { 
            user: new ObjectId(user._id),
            _id: body._id 
        }
    )

    await userLog(event,
        {
            documentType: DocuemntEnum.Review,
            documentId: body._id ,
            comment: 'Удален черновик'
        })

  return res
})
