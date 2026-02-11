import mongoose from 'mongoose'

const UTMTagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  utmCode: {
    type: String,
    required: true,
    unique: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true,
  },
  createdByUsername: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  transitionToPortal: {
    type: Number,
    default: 0,
  },
  transitionToLanding: {
    type: Number,
    default: 0,
  },
  registrationsCount: {
    type: Number,
    default: 0,
  },
  paymentsCount: {
    type: Number,
    default: 0,
  },
})

export const UTMTag = mongoose.model('UTMTag', UTMTagSchema)

