import { model, Schema } from 'mongoose'

const notificationSchema = new Schema({
        text: { type: String, required: true, text: true },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        uuid: { type: String },
        forAll: { type: Boolean, default: false },
        readUser: { type: Array },
        date: { type: Date, default: new Date(Date.now()) },
        expireDate: { type: Date },
})

export const Notification = model('notification', notificationSchema)
