import { model, Schema, Document } from "mongoose";

interface IEmailCampaign extends Document {
  day: number;
  subject: string;
  htmlContent: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmailCampaignSchema = new Schema<IEmailCampaign>(
  {
    day: { type: Number, required: true, unique: true, min: 1, max: 21 },
    subject: { type: String, required: true },
    htmlContent: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const EmailCampaign = model<IEmailCampaign>(
  "EmailCampaign",
  EmailCampaignSchema
);

