import { Schema, model } from 'mongoose'
import { AvitoConnection } from '~/server/connections/avito'

const PVZSchema = new Schema({
  pointId: { type: Number },
  coordinates: { type: Object },
  isOwn: { type: Boolean },
  status: { type: String },
})

export const PVZ = AvitoConnection.model('pvz', PVZSchema, 'pvz')
