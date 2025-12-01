import { Schema, model } from "mongoose";
import { wildberriesConnection } from "~/server/connections/wildberries";
import { v4 as uuid } from "uuid";

const ReviewSchema = new Schema({
  article: { type: Number, required: true },
  name: { type: String, required: true },
  uuidbuyout: { type: String },
  rating: { type: Number, required: true },
  text: { type: String, required: false },
  positive: { type: String, default: "" },
  negative: { type: String, default: "" },
  date: { type: Date, required: true },
  publishDate: { type: Date, required: false },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  delivery: { type: Schema.Types.ObjectId, ref: "Delivery", required: true },
  images: { type: Array, required: false },
  status: {
    type: String,
    required: true,
    enum: [
      "created",
      "waiting",
      "working",
      "published",
      "canceled",
      "nofunds",
      "deleting",
      "deleted",
      "addition",
      "added",
      "disputing",
      "disputed",
      "reviewsUpdate"
    ],
  },
  recipientphone: { type: String, required: true },
  videoKey: { type: String, required: false },
  originalVideoName: { type: String, required: false },
  isVideoEnabled: { type: Boolean, required: false },
  isPhotoEnabled: { type: Boolean, required: false },
  createdAt: { type: Date, required: false, default: Date.now },
  uuid: { type: String },
  additionText: { type: String, default: "" },
  disputed: { type: Boolean, default: false },
});

export const Review = wildberriesConnection.model("Review", ReviewSchema);

// ReviewSchema.pre('save', function (next) {
//   // Добавляем 3 часа к полю "date"
//   this.date.setHours(this.date.getHours() + 3)
//   next()
// })
