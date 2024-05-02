import { Schema, model } from 'mongoose'
import { OzonConnection } from '~/server/connections/ozon'
import { v4 as uuid } from 'uuid'

const QuestionLikesSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  article: { type: String, required: true },
  status: {
    type: String,
    default: 'created',
    enum: ['created', 'work', 'completed', 'nofunds', 'deleting', 'deleted'],
  },
  image: { type: String },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  total: { type: Number },
  createdDate: { type: Date, default: new Date() },
  endedDate: { type: Date, default: null },
  progress: { type: Number },
  questions: { type: Array },
  dateStart: { type: Date },
  dateEnd: { type: Date },
  period: { type: String },
  uuid: { type: String, default: uuid() },
})

// LikeSchema.pre('save', function (next) {
//   // Добавляем 3 часа к полю "date"
//   this.createdDate.setHours(this.createdDate.getHours() + 3)
//   next()
// })

export const QuestionLike = OzonConnection.model('QuestionLikes', QuestionLikesSchema)

