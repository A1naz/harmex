import { Schema, model } from 'mongoose'

const PaymentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: new Date() },
  status: { type: String, required: true },
  details: {
    type: Object,
    required: false,
    default: {
      url: null,
      transferCard: null,
      transferSum: null,
    },
  },
  type: { type: Number, required: true },
})

// PaymentSchema.pre('save', function (next) {
//   // Добавляем 3 часа к полю "date"
//   this.date.setHours(this.date.getHours() + 3)
//   next()
// })


export const Payment = model('Payment', PaymentSchema)
