import { ReviewDraft } from "~/server/lib/models/ReviewDraft"

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const body = await readBody(event)
    if(!body.draft) throw new Error('Неправильный запрос')
    
    var draft: IReviewDraft = new ReviewDraft({
        user: body.draft.user,
        draftName: body.draft.draftName ? body.draft.draftName: '',
        article: body.draft.article,
        text: body.draft.text,
    })

    await draft.save()

  return draft
})
