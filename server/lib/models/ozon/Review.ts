import { Schema, model } from "mongoose";
import { OzonConnection } from "~/server/connections/ozon";
import { v4 as uuid } from "uuid";

const ReviewSchema = new Schema({
  article: { type: Number, required: true },
  name: { type: String, required: true },
  uuidbuyout: { type: String },
  rating: { type: Number, required: true },
  text: { type: String, required: false },
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
      "editing",
    ],
  },
  recipientphone: { type: String, required: true },
  videoKey: { type: String, required: false },
  originalVideoName: { type: String, required: false },
  isPhotoEnabled: { type: Boolean, required: false },
  isVideoEnabled: { type: Boolean, required: false },
  createdAt: { type: Date, required: false, default: Date.now },
  uuid: { type: String },
  // Поля для хранения измененных данных
  textEdited: { type: String, required: false },
  ratingEdited: { type: Number, required: false },
  imagesEdited: { type: Array, required: false },
  videoKeyEdited: { type: String, required: false },
  originalVideoNameEdited: { type: String, required: false },
  isPhotoEnabledEdited: { type: Boolean, required: false },
  isVideoEnabledEdited: { type: Boolean, required: false },
  publishDateEdited: { type: Date, required: false },
  editedAt: { type: Date, required: false },
  point: { type: String, default: "" },
  pvz: { type: Boolean, default: false },
  whatLiked: { type: Object }
});

export const Review = OzonConnection.model("Review", ReviewSchema);

// ReviewSchema.pre('save', function (next) {
//   // Добавляем 3 часа к полю "date"
//   this.date.setHours(this.date.getHours() + 3);
//   next();
// });
