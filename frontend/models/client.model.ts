import mongoose from "mongoose"

export interface IClient extends mongoose.Document {
  name: string
  email: string
  phone?: string
  address?: string
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
)

export const Client = mongoose.models.Client || mongoose.model<IClient>("Client", clientSchema)
