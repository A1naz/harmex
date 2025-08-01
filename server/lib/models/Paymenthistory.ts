import { model, Schema } from "mongoose";

const paymenthistorySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  summ: { type: String, required: true },
  type: { type: String },
  article: { type: Schema.Types.Mixed },
  typeoperations: { type: String },
  basisoperation: { type: String, text: true },
  dataoperation: { type: Date },
  comment: { type: String },
  refRewarded: { type: Boolean, default: false },
  mp: { type: String },
  nameOrganization: { type: String },
  nds: { type: Number },
  summnds: { type: Number },
});

export const paymenthistory = model("paymenthistory", paymenthistorySchema);
