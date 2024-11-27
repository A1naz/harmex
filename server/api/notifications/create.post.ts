import { Notification } from '~~/server/lib/models/Notification'
import { User } from '~~/server/lib/models/User'
import { v4 as uuid } from 'uuid'

export default defineEventHandler(async (event) => {
        const { message } = await readBody(event)

        const user = await User.findOne({ username: 'test' })

        if (!user) {
                return {
                        status: 'error',
                        error: 'user not found',
                }
        }

        await Notification.create({ text: message, user: user._id, uuid: uuid(), date: new Date() })

        return {
                status: 'ok',
        }
})