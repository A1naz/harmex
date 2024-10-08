import { Schema, model, Document } from 'mongoose';
import { v4 as uuid } from 'uuid';

// Interface for User document
export interface IUser extends Document {
  phoneNumber: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  uuid: string;
  isBanned: boolean;
  emailConfirmed: boolean;
  phoneConfirmed: boolean;
  balance: number;
  registrationDate: Date;
  newPassword?: string;
  confirmCode?: string;
  newEmail?: string;
  isTwoFaEnabled: boolean;
  twoFaSecret?: string;
  twoFaQR?: string;
}

// Mongoose Schema for User
const UserSchema = new Schema<IUser>({
  phoneNumber: { type: String, unique: true, required: true },
  username: { type: String, unique: false, required: false },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  password: { type: String },
  uuid: { type: String, unique: true, required: true, default: uuid() },
  isBanned: { type: Boolean, default: false },
  emailConfirmed: { type: Boolean, default: false },
  phoneConfirmed: { type: Boolean, default: false },
  balance: { type: Number, default: 0, required: true },
  registrationDate: { type: Date, default: Date.now },
  newPassword: { type: String },
  confirmCode: { type: String },
  newEmail: { type: String, required: false },
  isTwoFaEnabled: { type: Boolean, default: false },
  twoFaSecret: { type: String, default: '' },
  twoFaQR: { type: String, required: false },
});

// Mongoose Model for User
export const User = model<IUser>('User', UserSchema);
