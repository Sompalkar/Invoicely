import { type NextRequest, NextResponse } from "next/server"
import { Invoice } from "@/models/invoice.model"
import { Client } from "@/models/client.model"
import { connectToDatabase } from "@/lib/db"
import { authMiddleware } from "@/lib/auth"

export async function getInvoices(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await authMiddleware(req)

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get invoices for this user
    const invoices = await Invoice.find({ userId: user._id }).populate("clientId", "name email").sort({ createdAt: -1 })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Get invoices error:", error)
    return NextResponse.json({ message: "Failed to get invoices" }, { status: 500 })
  }
}

export async function getInvoice(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await authMiddleware(req)

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get invoice
    const invoice = await Invoice.findOne({ _id: params.id, userId: user._id }).populate(
      "clientId",
      "name email phone address",
    )

    if (!invoice) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Get invoice error:", error)
    return NextResponse.json({ message: "Failed to get invoice" }, { status: 500 })
  }
}

export async function createInvoice(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await authMiddleware(req)

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { clientId, tempClient, totalAmount, dueDate, lineItems, notes, taxInfo } = await req.json()

    // Validate input
    if (!totalAmount || !dueDate || !lineItems || lineItems.length === 0 || !taxInfo) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Either clientId or tempClient must be provided
    if (!clientId && !tempClient) {
      return NextResponse.json({ message: "Either clientId or tempClient must be provided" }, { status: 400 })
    }

    // If clientId is provided, verify it exists and belongs to the user
    if (clientId) {
      const client = await Client.findOne({ _id: clientId, userId: user._id })
      if (!client) {
        return NextResponse.json({ message: "Client not found" }, { status: 404 })
      }
    }

    // Create invoice
    const invoice = await Invoice.create({
      clientId: clientId || undefined,
      tempClient: tempClient || undefined,
      userId: user._id,
      totalAmount,
      dueDate,
      lineItems,
      notes,
      taxInfo,
    })

    return NextResponse.json({
      success: true,
      invoice,
    })
  } catch (error) {
    console.error("Create invoice error:", error)
    return NextResponse.json({ message: "Failed to create invoice" }, { status: 500 })
  }
}

export async function updateInvoice(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await authMiddleware(req)

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { status, paidDate, notes } = await req.json()

    // Find invoice
    const invoice = await Invoice.findOne({ _id: params.id, userId: user._id })

    if (!invoice) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 })
    }

    // Update fields
    if (status) invoice.status = status
    if (paidDate) invoice.paidDate = new Date(paidDate)
    if (notes !== undefined) invoice.notes = notes

    await invoice.save()

    return NextResponse.json({
      success: true,
      invoice,
    })
  } catch (error) {
    console.error("Update invoice error:", error)
    return NextResponse.json({ message: "Failed to update invoice" }, { status: 500 })
  }
}

export async function deleteInvoice(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await authMiddleware(req)

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Find and delete invoice
    const invoice = await Invoice.findOneAndDelete({ _id: params.id, userId: user._id })

    if (!invoice) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Invoice deleted successfully",
    })
  } catch (error) {
    console.error("Delete invoice error:", error)
    return NextResponse.json({ message: "Failed to delete invoice" }, { status: 500 })
  }
}
