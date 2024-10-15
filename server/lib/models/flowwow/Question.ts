import { Schema } from 'mongoose'
import { v4 as uuid } from 'uuid'
import { FlowwowConnection } from '~/server/connections/flowwow'

const QuestionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'created' },
  article: { type: String, required: true },
  text: { type: String, required: true },
  image: { type: String },
  gender: { type: String },
  createdDate: { type: Date, default: new Date(Date.now()) },
  publishDate: { type: Date, required: true },
  uuid: { type: String, default: uuid() },
})

// QuestionSchema.pre('save', function (next) {
//   // Добавляем 3 часа к полю "date"
//   this.createdDate.setHours(this.createdDate.getHours() + 3)
//   next()
// })

export const Question = FlowwowConnection.model('Question', QuestionSchema)
