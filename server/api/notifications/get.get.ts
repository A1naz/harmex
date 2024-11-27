import { Notification } from '~~/server/lib/models/Notification'

export default defineEventHandler(async (event) => {
        const user = await getAdminEntity(event)
        if (!user) return sendRedirect(event, '/auth', 302)

        const { lastGetDate }: any = getQuery(event)

        const date = new Date(JSON.parse(lastGetDate))

        const notifications = await Notification.find({
                $or: [
                        { isRemoved: { $ne: true }, user: user._id, date: { $gt: date } },
                        { forAll: true, removedUser: { $ne: user._id }, date: { $gt: date } },
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
                        uuid: notification.uuid,
                        text: notification.text,
                        date: notification.date,
                        isReaded: notification.isReaded ? true : false,
                }
        })

        return format.sort(a => !a.isReaded ? -1 : 1)

})