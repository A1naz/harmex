import { Schema, model } from "mongoose";

const PricesSchema = new Schema({
 tariffs: {
  type: Object, 
  required: true
}
})

export const Prices = model('Prices', PricesSchema)
