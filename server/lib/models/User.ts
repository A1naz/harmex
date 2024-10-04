import { Schema, model, Document } from 'mongoose';
import { v4 as uuid } from 'uuid';

// Interface for User document
export interface IUser extends  Document {
  phoneNumber?: string;
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
}

// Mongoose Schema for User
const UserSchema = new Schema<IUser>({
  phoneNumber: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
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
});

// Mongoose Model for User
export const User = model<IUser>('User', UserSchema);
