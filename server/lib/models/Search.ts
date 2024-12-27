import { model, Schema } from 'mongoose'

const searchSchema = new Schema({
        title: { type: String },
        path: { type: String },
        phrases: [{ type: String, required: false }],
})

export const Search = model('search', searchSchema)
