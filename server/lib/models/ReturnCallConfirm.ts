import { model, Schema } from "mongoose";

const returnCallConfirmSchema = new Schema(
  {
    phone: { type: String, required: true },
    callId: { type: String, required: true },
    dialStatus: { type: String, required: true, default: "pending" },
  },
  { timestamps: true }
);

export const ReturnCallConfirm = model(
  "returnCallConfirm",
  returnCallConfirmSchema
);
