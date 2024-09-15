import { Schema, model } from 'mongoose'

const tgBotOptionsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isEnabled: { type: Boolean, required: true },
  settings: [{ type: Object }],
})

export const tgBotOptions = model('tgBotOptions', tgBotOptionsSchema)
