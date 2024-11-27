import { Notification } from '~~/server/lib/models/Notification'

export default defineEventHandler(async (event) => {
        const user = await getAdminEntity(event)
        if (!user) return sendRedirect(event, '/auth', 302)

        const notifications = await Notification.find({
                $or: [
                        { isReaded: { $ne: true }, user: user._id },
                        { forAll: true, readUser: { $ne: user._id } }
                ]
        }).sort({ createdAt: -1 }).select('-_id -__v')

        console.log(notifications)

        return {
                status: 'ok',
        }
})