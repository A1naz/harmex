import { Schema, model } from 'mongoose'
import { OzonConnection } from '~/server/connections/ozon'

const TestThirdSchema = new Schema({
  test: { type: String, required: true },
})

export const TestThird = OzonConnection.model('TestThird', TestThirdSchema)


