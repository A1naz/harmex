import type { Document } from 'mongoose'
import { model, Schema } from 'mongoose'

enum VerificationCodeType {
  register = 'register',
  resetPassword = 'resetPassword',
}
interface IVerificationCode extends Document {
  phoneNumber: string
  verificationCode: string
  createdAt: Date
  type: VerificationCodeType
}

const verificationCodeSchema = new Schema({
  phoneNumber: { type: String, required: true, unique: true },
  verificationCode: { type: String, required: true },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // expires in 5 minutes
})

export const VerificationCode = model<IVerificationCode>('VerificationCode', verificationCodeSchema)
