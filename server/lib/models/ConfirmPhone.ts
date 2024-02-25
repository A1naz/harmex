import { Schema, model } from 'mongoose'

const ConfirmPhoneSchema = new Schema({
  phone: { type: String, required: true },
  code: { type: String, required: true },
  date: { type: Date, required: true },
})

export const ConfirmPhone = model('confirmPhone', ConfirmPhoneSchema,)
