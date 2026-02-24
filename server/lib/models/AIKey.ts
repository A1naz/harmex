import { model, Schema } from "mongoose";

const AIKeySchema = new Schema(
  {
    aiProvider: { type: String, required: true },
    apiKey: { type: String, required: false, default: '' },
    folderId: { type: String, required: false, default: '' },
    projectId: { type: String, required: false, default: '' },
    priority: { type: Number, required: false, default: 1 },
    isActive: { type: Boolean, required: false, default: true },
    failCount: { type: Number, required: false, default: 0 },
    successCount: { type: Number, required: false, default: 0 },
  },
  { timestamps: true }
)

export const AIKey = model('AIKey', AIKeySchema)
