import { Schema, model } from 'mongoose'
import { WBConnection } from '~/server/connections/wb'

const TestSchema = new Schema({
  test: { type: String, required: true },
})

export const Test = WBConnection.model('Test', TestSchema)


