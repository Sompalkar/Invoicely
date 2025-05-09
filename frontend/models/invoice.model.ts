import mongoose from "mongoose"

export interface ILineItem {
  description: string
  quantity: number
  price: number
  taxable: boolean
}

export interface ITaxInfo {
  cgstRate: number
  sgstRate: number
  cgstAmount: number
  sgstAmount: number
  taxableAmount: number
}

export interface ITempClient {
  name: string
  email: string
  phone?: string
  address?: string
}

export interface IInvoice extends mongoose.Document {
  invoiceNumber: string
  clientId?: mongoose.Types.ObjectId
  tempClient?: ITempClient
  userId: mongoose.Types.ObjectId
  totalAmount: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  dueDate: Date
  paidDate?: Date
  lineItems: ILineItem[]
  notes?: string
  taxInfo: ITaxInfo
  createdAt: Date
  updatedAt: Date
}

const lineItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
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
})

const taxInfoSchema = new mongoose.Schema({
  cgstRate: {
    type: Number,
    default: 9,
  },
  sgstRate: {
    type: Number,
    default: 9,
  },
  cgstAmount: {
    type: Number,
    required: true,
  },
  sgstAmount: {
    type: Number,
    required: true,
  },
  taxableAmount: {
    type: Number,
    required: true,
  },
})

const tempClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: String,
  address: String,
})

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    tempClient: tempClientSchema,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue", "cancelled"],
      default: "draft",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
    },
    lineItems: [lineItemSchema],
    notes: String,
    taxInfo: taxInfoSchema,
  },
  { timestamps: true },
)

// Generate invoice number before saving
invoiceSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.models.Invoice.countDocuments()
    this.invoiceNumber = `INV-${String(count + 1).padStart(5, "0")}`
  }
  next()
})

export const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", invoiceSchema)
