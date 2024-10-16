import { Schema } from 'mongoose'
import { FlowwowConnection } from '~/server/connections/flowwow'

const FFPVZSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pvzs: { type: Array, default: [] },
})

export const FFPVZ = FlowwowConnection.model('FFPVZ', FFPVZSchema)
