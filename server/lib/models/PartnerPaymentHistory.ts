import { Schema, model } from 'mongoose'
import { User } from './User'

const PartnerPaymentHistoryModel = new Schema({
  user: { type: Schema.Types.ObjectId, ref: User, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now(), required: true },
})


PartnerPaymentHistoryModel.pre('save', function (next) {
  // Добавляем 3 часа к полю "date"
  this.date.setHours(this.date.getHours() + 3);
  next();
});

export const PartnerPaymentHistory = model('PartnerPaymentHistory', PartnerPaymentHistoryModel)
