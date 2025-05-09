import mongoose from "mongoose"

export interface IProduct extends mongoose.Document {
  name: string
  description: string
  price: number
  taxable: boolean
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    taxable: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
)

export const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema)
