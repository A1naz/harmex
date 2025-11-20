import { model, Schema, Document } from "mongoose";

interface IEmailLog extends Document {
  userId: string;
  campaignDay: number;
  email: string;
  subject: string;
  status: "sent" | "failed";
  error?: string;
  sentAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>({
  userId: { type: String, required: true, ref: "User" },
  campaignDay: { type: Number, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  status: { type: String, enum: ["sent", "failed"], required: true },
  error: { type: String },
  sentAt: { type: Date, default: Date.now },
});

// Index for faster queries
EmailLogSchema.index({ userId: 1, campaignDay: 1 });
EmailLogSchema.index({ sentAt: 1 });

export const EmailLog = model<IEmailLog>("EmailLog", EmailLogSchema);

