import { Schema, model } from 'mongoose'
import { PVZOzonConnection } from '~/server/connections/ozonPVZ'

const PVZSchema = new Schema({
  pointId: { type: String },
  coordinates: { type: Object },
  name: { type: String },
  isOwn: { type: Boolean },
  status: { type: String },
})

export const PVZ = PVZOzonConnection.model('avitopvz', PVZSchema, 'avitopvz')
