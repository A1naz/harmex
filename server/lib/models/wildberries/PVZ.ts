import { Schema, model } from 'mongoose'
import { PVZOzonConnection } from '~/server/connections/ozonPVZ'

const PVZSchema = new Schema({
  id: { type: Number },
  lt: { type: Number, required: true },
  lg: { type: Number, required: true },
  w: { type: String },
  a: { type: String }
})

export const PVZ = PVZOzonConnection.model('pvzwb', PVZSchema, 'pvzwb')
