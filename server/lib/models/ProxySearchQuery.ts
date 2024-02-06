import { Schema, model } from 'mongoose'

const ProxySearchQuerySchema = new Schema({
  proxies: [{ type: String, required: true }],
})

export const ProxySearchQuery = model('ProxySearchQuery', ProxySearchQuerySchema)
