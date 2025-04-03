import { Notification } from '~~/server/lib/models/Notification'

export default defineEventHandler(async (event) => {
        const user = await getAdminEntity(event)
        if (!user) return []

        const { lastGetDate }: any = getQuery(event)

        const date = new Date(JSON.parse(lastGetDate))   
        
        const notifications = await Notification.find({
                activationDate: { $lt: date },
                // date: { $gt: date },
                $or: [
                        { forAll: false, removedUser: { $ne: user._id }, users: { $in: [user._id] } },
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

        return format

})