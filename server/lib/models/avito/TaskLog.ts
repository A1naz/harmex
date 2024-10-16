import { Schema } from 'mongoose'
import { AvitoConnection } from '~/server/connections/avito'

const TaskLogSchema = new Schema({
  date: { type: Date, required: true },
  text: { type: String, required: true, text: true },
  task: { type: Schema.Types.ObjectId, required: true },
  type: { type: String, required: true },
  taskUuid: { type: String, required: true },
})

export const TaskLog = AvitoConnection.model('TaskLog', TaskLogSchema)
