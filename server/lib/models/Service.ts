import type { Document } from 'mongoose'
import { model, Schema } from 'mongoose'
import { v4 as uuid } from 'uuid'

// Interface for Service document
export interface IService extends Document {
  uuid: string
  name: string
  items: Array<any> // You can define a more specific type for items if known
  mainImage: string
  images: Array<string> // Assuming images is an array of image URLs (strings)
  video?: string
  price: number
  rating: number
  advanced: number
  description: string
  disabled: boolean
  slug: string
}

// Mongoose Schema for Service
const ServiceSchema = new Schema<IService>({
  uuid: { type: String, unique: true, required: true, default: uuid() },
  name: { type: String, required: true },
  items: { type: [], default: [] }, // Mixed type for array
  mainImage: { type: String, required: true },
  images: { type: [String], default: [] }, // Array of strings for images
  video: { type: String },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  advanced: { type: Number, default: 0 },
  description: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  slug: { type: String, required: false },
})

// Mongoose Model for Service
export const Service = model<IService>('Service', ServiceSchema)
