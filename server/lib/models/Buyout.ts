import { Schema, model } from 'mongoose'
import { v4 as uuid } from 'uuid'
import { User } from './User'

const ProductSchema = new Schema({
  name: { type: String, required: true, text: true },
  price: { type: String, required: true },
  priceText: { type: String, required: true },
  image: { type: String, required: true },
})
const BuyoutSchema = new Schema({
  searchQuery: { type: String, required: true, text: true },
  sizeparam: { type: String, required: true, text: true },
  quantity: { type: Number, required: true, text: true, max: 50 },
  gender: { type: String, required: true, text: true },
  article: { type: Number, required: true, text: true },
  point: { type: String, required: true, text: true },
  point_city: { type: String, required: true },
  point_state: { type: String, required: true },
  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  product: { type: ProductSchema, required: true },
  rules: { type: Array, required: true },
  status: { type: String, required: true, text: true, enum: ['completed', 'created', 'archived', 'active', 'work', 'paused', 'nofunds'] },
  user: { type: Schema.Types.ObjectId, ref: User, required: true },
  uuid: { type: String, default: uuid() },
  createdAt: { type: Date, default: Date.now },
  place: { type: Number, required: true },
  completed: { type: Number, required: false, default: 0 },
  data5: { type: {}, default: '' },
  data6: { type: {}, default: '' },
  data7: { type: {}, default: '' },
  data8: { type: {}, default: '' },
  data9: { type: {}, default: '' },
  data10: { type: {}, default: '' },
  data11: { type: {}, default: '' },
  data12: { type: {}, default: '' },
  data13: { type: {}, default: '' },
  data14: { type: {}, default: '' },
  data15: { type: {}, default: '' },
  data16: { type: {}, default: '' },
  data17: { type: {}, default: '' },
  data18: { type: {}, default: '' },
})

BuyoutSchema.pre('save', function (next) {
  // Добавляем 3 часа к полю "date"
  this.createdAt.setHours(this.createdAt.getHours() + 3);
  // this.dateStart.setHours(this.dateStart.getHours() + 3);
  // this.dateEnd.setHours(this.dateEnd.getHours() + 3);
  next();
});

export const Buyout = model('Buyout', BuyoutSchema)
