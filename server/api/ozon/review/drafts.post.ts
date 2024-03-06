import { ReviewDraft } from "~/server/lib/models/ozon/ReviewDraft"
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const body = await readBody(event)
    if(!body) throw new Error('Не все поля заполнены запрос')

    const newDraft = new ReviewDraft({
        user,
        draftName: body.draftName,
        article: body.article,
        text: body.text,
    })

    const res = await newDraft.save()

    await userLog(event,
        {
            documentType: DocuemntEnum.Review,
            documentId: res._id ,
            comment: 'Создан черновик'
        })

    return res._id ? true : false
})
