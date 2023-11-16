import { Schema, model } from 'mongoose'
import { IPlan } from '@/data/types'
import { Tariff } from './Tariff';

interface IPlansSchema extends IPlan, Document {}

const PlanSchema = new Schema({
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    tariff: { type: Tariff.schema, required: true }
})

PlanSchema.pre('save', function (next) {
    // Добавляем 3 часа к полю "date"
    this.createdAt.setHours(this.createdAt.getHours() + 3);
    next();
  });

export const Plans = model<IPlansSchema>('Plans', PlanSchema)
