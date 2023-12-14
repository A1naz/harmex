import { ReviewDraft } from "~/server/lib/models/ReviewDraft"

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const { type, string } = getQuery(event)

    const res = await ReviewDraft.find({user: user._id})
    if (!res) return []

  return res
})
