import { Schema, model } from 'mongoose'
import { FlowwowConnection } from '~/server/connections/flowwow'
import { v4 as uuid } from 'uuid'

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
  uuid: {type: String, default: uuid()},
})

// CartSchema.pre('save', function (next) {
//   this.createdDate.setHours(this.createdDate.getHours() + 3);
//   next();
// });

export const Cart = FlowwowConnection.model('Cart', CartSchema)
