import {User} from "~~/server/lib/models/User";

export default eventHandler(async (event) => {
    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

        return user.isPartnerWithdrawAvailable
    })