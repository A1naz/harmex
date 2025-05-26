import { Schema, model } from 'mongoose'
import { goldApplePVZConnection } from '~/server/connections/goldApplePVZ'

const PVZSchema = new Schema({
  pointId: { type: Number },
  coordinates: { type: Object },
  isOwn: { type: Boolean },
  status: { type: String },
  address: { type: String },
})

export const PVZ = goldApplePVZConnection.model('pvz', PVZSchema, 'pvz')
