import { Schema } from 'mongoose'
import { AvitoConnection } from '~/server/connections/avito'

const ReportSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  card: { type: String, required: true },
  screenshots: [{ type: String, required: true }],
  buyout: { type: Schema.Types.ObjectId, required: true, ref: 'Buyout' },
})

export const Report = AvitoConnection.model('Report', ReportSchema)
