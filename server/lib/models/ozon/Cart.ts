import { Schema } from 'mongoose'
import { OzonConnection } from '~/server/connections/ozon'

const CartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'created' },
  query: { type: String, required: true },
  article: { type: String, required: true },
  amount: { type: Number, required: true },
  period: { type: String, required: true },
  name: { type: String },
  image: { type: String },
  size: { type: String, required: true },
  createdDate: { type: Date, default: new Date() },
  endedDate: { type: Date },
  uuid: { type: String },
})

// CartSchema.pre('save', function (next) {
//   // Добавляем 3 часа к полю "date"
//   this.createdDate.setHours(this.createdDate.getHours() + 3);
//   next();
// });

export const Cart = OzonConnection.model('Cart', CartSchema)
