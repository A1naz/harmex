import { Schema, model } from 'mongoose'
import { v4 as uuid } from 'uuid'

const UserSchema = new Schema({
  phoneNumber: { type: String },
  username: { type: String, unique: true, required: true },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, unique: false, required: false },
  password: { type: String, required: false },
  uuid: { type: String, unique: true, required: true, default: uuid() },
  isBanned: { type: Boolean, default: false },
  emailConfirmed: { type: Boolean, default: false },
  balance: { type: Number, default: 0, required: true },
  registrationDate: { type: Date, default: Date.now },
  newPassword: { type: String },
})

export const User = model('User', UserSchema)
