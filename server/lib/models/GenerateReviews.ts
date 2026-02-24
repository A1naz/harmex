import { Schema, model } from 'mongoose'
import { reportsConnection } from '~/server/connections/reports'

const GenerateReviewsSchema = new Schema({
  taskId: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, default: 'generateRewievs' },
  mp: { type: String, required: true },
  article: { type: Number, required: true },
  status: { type: String, required: true, },
  summ: { type: Number, required: true },
  createdDate: { type: Date, required: false, default: Date.now },
})

export const GenerateReviews = reportsConnection.model('GenerateReviews', GenerateReviewsSchema, 'GenerateReviews')
