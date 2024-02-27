import { Schema, model } from 'mongoose'
import { OzonConnection } from '~/server/connections/ozon'

const TestSecondSchema = new Schema({
  test: { type: String, required: true },
})

export const TestSecond = OzonConnection.model('TestSecond', TestSecondSchema)


