import { Schema, model } from 'mongoose'
import { v4 as uuid } from 'uuid'
import { OzonConnection } from '~/server/connections/ozon'

const ViewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'work' },
  article: { type: String, required: true },
  searchText: { type: String, required: true },
  searchType: { type: String, required: true },
  image: { type: String },
  createdDate: { type: Date, default: new Date(Date.now()) },
  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  amount: { type: Number, required: true },
  uuid: { type: String},
})


export const View = OzonConnection.model('View', ViewSchema)
