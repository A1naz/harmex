import { Notification } from '~~/server/lib/models/Notification'

export default defineEventHandler(async (event) => {
        const user = await getAdminEntity(event)
        if (!user) return sendRedirect(event, '/auth', 302)

        const { lastGetDate }: any = getQuery(event)

        const date = new Date(JSON.parse(lastGetDate))

        const notifications = await Notification.find({
                activationDate: { $gt: date },
                date: { $gt: date },
                $or: [
                        { isRemoved: { $ne: true }, users: { $in: [user._id] } },
                        { forAll: true, removedUser: { $ne: user._id } },
                ]
        }).sort({ date: -1 })

        if (!notifications || notifications.length === 0) {
                return []
        }

        const format = notifications.map((notification: any) => {
                if (notification.forAll && notification.readUser) {
                        if (notification.readUser.includes(user._id)) {
                                notification.isReaded = true
                        } else {
                                notification.isReaded = false
                        }

                }

                return {
                        category: notification.category,
                        uuid: notification.uuid,
                        text: notification.text,
                        date: notification.date,
                        isReaded: notification.isReaded ? true : false,
                }
        })

        return format.sort(a => !a.isReaded ? -1 : 1)

})