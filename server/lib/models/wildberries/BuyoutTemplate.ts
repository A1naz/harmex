import { Schema } from 'mongoose'
import { v4 as uuid } from 'uuid'
import { wildberriesConnection } from '~/server/connections/wildberries'
import { User } from '~/server/lib/models/User'

const BuyoutTemplateSchema = new Schema({
  uuid: { type: String, default: uuid(), required: true },
  user: { type: Schema.Types.ObjectId, ref: User, required: true },
  userUuid: { type: String, required: true },
  title: { type: String, required: true, text: true },
  buyoutsArray: { type: [Object], required: true },
})

export const BuyoutTemplate = wildberriesConnection.model('BuyoutTemplate', BuyoutTemplateSchema)
