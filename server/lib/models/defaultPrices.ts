import { model, Schema } from 'mongoose'
import { Tariff } from './Tariff'

const defaultPricesSchema = new Schema({
  values: { type: [] },
})

export const DefaultPrices = model('defaultPrices', defaultPricesSchema)
