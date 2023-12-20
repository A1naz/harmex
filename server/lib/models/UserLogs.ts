import { Schema, model } from 'mongoose'
import { IUserLogs } from '@/data/types'

interface IUserLogsSchema extends IUserLogs, Document {}

const UserLogsSchema = new Schema<IUserLogsSchema>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userNick: { type: String, required: true },
    userEmail: { type: String, required: true },
    uuidCompany: { type: String, required: false },
    description: { type: String, required: true },
    documentType: { type: String, required: true },
    documentId: { type: Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, default: ()=>{ 
        const nowDate = new Date()
        nowDate.setHours(nowDate.getHours() + 3)
        return nowDate
    } }
})

export const UserLogs = model<IUserLogsSchema>('UserLogs', UserLogsSchema)
