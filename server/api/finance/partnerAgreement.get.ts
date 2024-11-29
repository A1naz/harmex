export default eventHandler(async (event) => {
    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    if (user.fizFace) {
        return user.isPartnerWithdrawAvailable
    } else {
        return true
    }
})