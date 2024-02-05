import { Schema, model } from 'mongoose'

const PVZSchema = new Schema({
  pointId: { type: Number },
  coordinates: { type: Object },
  isOwn: { type: Boolean },
  status: { type: String },
})

export const PVZ = model('pvz', PVZSchema, 'pvz')
