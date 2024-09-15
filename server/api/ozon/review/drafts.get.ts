import { SortOrder } from "mongoose"
import { ReviewDraft } from "~/server/lib/models/ozon/ReviewDraft"

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const { sort, search } = getQuery(event)
    const searchObj: {[x: string]: string} = search ? JSON.parse(search.toString()) : {}
    const sortObj: {[x: string]: SortOrder} = sort ? JSON.parse(sort.toString()) : {}

    const query = ReviewDraft.find({ user: user._id })
    if(searchObj) query.find(searchObj)
    if(sortObj) query.sort(sortObj)

    const res = await query
    if (!res) return []

    return res
})
