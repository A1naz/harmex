import { Schema, model } from 'mongoose'
import { IUserLogs } from '@/data/types'

interface IUserLogsSchema extends IUserLogs, Document {}

const UserLogsSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    documentType: { type: String, required: true },
    documentId: { type: Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, default: Date.now }
})

UserLogsSchema.pre('save', function (next) {
  // Добавляем 3 часа к полю "date"
  this.createdAt.setHours(this.createdAt.getHours() + 3)
  next()
})

export const UserLogs = model<IUserLogsSchema>('UserLogs', UserLogsSchema)
