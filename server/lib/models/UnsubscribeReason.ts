import mongoose from 'mongoose'

const UnsubscribeReasonSchema = new mongoose.Schema({
  userUuid: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
  },
  reason: {
    type: String,
    required: true,
    enum: ['not_interested', 'too_frequent', 'other'],
  },
  customText: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const UnsubscribeReason = mongoose.model('UnsubscribeReason', UnsubscribeReasonSchema)
