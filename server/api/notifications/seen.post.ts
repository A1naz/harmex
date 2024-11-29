import { Notification } from '~~/server/lib/models/Notification'

export default defineEventHandler(async (event) => {
        const user = await getAdminEntity(event)
        if (!user) return sendRedirect(event, '/auth', 302)

        const { uuid }: any = getQuery(event)

        const notification = await Notification.findOne({ uuid })

        if (!notification) {
                return {
                        status: 'error',
                        error: 'notification not found',
                }
        }

        if (notification.forAll) {
                notification.readUser.push(user._id)
        } else {
                notification.isReaded = true
        }

        await notification.save()

        return {
                status: 'ok',
        }

})