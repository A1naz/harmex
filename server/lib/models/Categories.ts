import { model, Schema } from 'mongoose'
import { PVZOzonConnection } from '~/server/connections/ozonPVZ'

const CategoriesSchema = new Schema({
        marketplace: { type: String },
        categories: { type: Array },
})

export const Categories = PVZOzonConnection.model('categories', CategoriesSchema, 'categories')
