import { Schema, model } from 'mongoose'
import { AvitoConnection } from '~/server/connections/avito'
import { v4 as uuid } from 'uuid'

const ReviewSchema = new Schema({
  article: { type: Number, required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  text: { type: String, required: false },
  date: { type: Date, required: true },
  publishDate: { type: Date, required: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  delivery: { type: Schema.Types.ObjectId, ref: 'Delivery', required: true },
  images: { type: Array, required: false },
  status: { type: String, required: true, enum: ['created', 'waiting', 'working', 'published', 'canceled', 'nofunds', 'deleting', 'deleted'] },
  recipientphone: { type: String, required: true },
  uuid: { type: String},
})

export const Review = AvitoConnection.model('Review', ReviewSchema)

// ReviewSchema.pre('save', function (next) {
//   // Добавляем 3 часа к полю "date"
//   this.date.setHours(this.date.getHours() + 3);
//   next();
// });