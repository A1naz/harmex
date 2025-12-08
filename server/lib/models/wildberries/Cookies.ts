import { PVZOzonConnection } from "~/server/connections/ozonPVZ";
import { Schema, model } from 'mongoose'

const CookiesSchema = new Schema(
  {
    _id: {
      type: String,
      default: "wbCookies",
    },
    cookieString: {
      type: String,
      required: true,
    },
    cookies: [
      {
        name: String,
        value: String,
        domain: String,
        path: String,
        expires: Number,
        size: Number,
        httpOnly: Boolean,
        secure: Boolean,
        session: Boolean,
        sameSite: String,
        priority: String,
        sameParty: Boolean,
        sourceScheme: String,
        partitionKey: String,
      },
    ],
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    _id: false,
  }
);

export const WbCookies = PVZOzonConnection.model("cookiesWbParser", CookiesSchema, "cookiesWbParser");
