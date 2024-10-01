import { Schema, model } from 'mongoose'
import { v4 as uuid } from 'uuid'

const ServiceSchema = new Schema({
  uuid: { type: String, unique: true, required: true, default: uuid() },
  name: { type: String, required: true },
  items: { type: Array, default: [] },
  mainImage: { type: String, required: true },
  images: { type: Array, default: [] },
  video: { type: String },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  advanced: { type: Number, default: 0 },
  desctiption: { type: String, default: '' },
})

export const Service = model('Service', ServiceSchema)
