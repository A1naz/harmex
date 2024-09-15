import { Schema, model } from 'mongoose'

const confirmInnSchema = new Schema({
  phone: { type: String, required: true },
  inn: { type: String, required: true },
  date: { type: Date, default: new Date(Date.now()) },
})

export const ConfirmInn = model('confirmInn', confirmInnSchema,)
