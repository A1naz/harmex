import { model, Schema } from 'mongoose'
import { v4 as uuid } from 'uuid'
import { Tariff } from './Tariff'

interface IUserSchema extends IUser, Document { }

const partnerSchema = new Schema({
  balance: { type: Number, default: 0 },
  refCount: { type: Number, default: 0 },
  rewardPercent: { type: Number, default: 5 },
  followCount: { type: Number, default: 0 },
  secondLevelPercent: { type: Number, default: 2 },
})

const UserSchema = new Schema<IUserSchema>({
  orgKey: { type: String },
  orgName: { type: String },
  orgOgrn: { type: String },
  orgInn: { type: String, required: false, unique: true },
  middleName: { type: String },
  phoneNumber: { type: String },

  bankInfo: { type: Object, required: false },
  ks: { type: String },
  rs: { type: String },
  bik: { type: String },

  isBanned: { type: Boolean, default: false },
  username: { type: String, unique: true, required: true },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, unique: false, required: false },
  emailConfirmed: { type: Boolean, default: false },
  phoneConfirmed: { type: Boolean, default: false },
  apiKeys: [
    {
      mp: { type: String, required: true },
      keys: { type: [String], required: false },
    },
  ],
  wbApiKey: { type: String, required: false },
  wbApiKeys: { type: [String], required: false },
  password: { type: String, required: false },
  uuid: { type: String, unique: true, required: true, default: uuid() },

  uuidCompany: { type: String, unique: false },
  acesses: [{ type: String, required: false }],

  roles: [{ type: String, ref: 'Role' }],
  MPTariffs: [
    {
      mp: { type: String },
      prices: { type: Tariff.schema, required: true },
    },
  ],
  twoFaQR: { type: String, required: false },
  twoFaSecret: { type: String, required: false },
  isTwoFaEnabled: { type: Boolean, default: false },

  tabs: [{ type: String }],
  balance: { type: Number, default: 0, required: true },
  registrationDate: { type: Date, default: Date.now },
  newPassword: { type: String },
  landing: { type: String },
  ffEnabled: { type: Boolean, default: false },
  partner: {
    type: partnerSchema,
    ref: 'Partner',
    default: {
      balance: 0,
      refCount: 0,
      rewardPercent: 5,
      secondLevelPercent: 2,
      followCount: 0,
    },
  },
  fizFace: { type: Boolean, default: false },
  quickAccesses: { type: [String], default: [] },
  services: { type: [String], default: [] },
  favourites: { type: [String], default: [] },
  votedFor: { type: [String], default: [] },
  votedForService: { type: [Object], default: [] },
  isPartnerWithdrawAvailable: { type: Boolean, default: false },
})

export const User = model<IUserSchema>('User', UserSchema)
