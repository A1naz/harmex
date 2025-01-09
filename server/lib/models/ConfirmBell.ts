import { model, Schema } from 'mongoose'

const ConfirmBellSchema = new Schema({
  phone: { type: String, required: true },
  id: { type: String, required: true },
  date: { type: Date, required: true }
})

export const ConfirmBell = model('confirmBell', ConfirmBellSchema)
