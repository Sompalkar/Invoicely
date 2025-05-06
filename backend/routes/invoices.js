import express from "express"
import fs from "fs"
import path from "path"
import PDFDocument from "pdfkit"
import sgMail from "@sendgrid/mail"
import Invoice from "../models/Invoice.js"
import Client from "../models/Client.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Get all invoices for the user with filters
router.get("/", async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query
    const query = { userId: req.user.id }

    if (status) {
      query.status = status
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const invoices = await Invoice.find(query).populate("clientId", "name email").sort({ createdAt: -1 })

    res.json(invoices)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get a specific invoice
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate("clientId", "name email address phone")

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" })
    }

    res.json(invoice)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Generate and send invoice
router.post("/", async (req, res) => {
  try {
    const { clientId, totalAmount, dueDate, lineItems } = req.body

    // Verify client exists and belongs to user
    const client = await Client.findOne({
      _id: clientId,
      userId: req.user.id,
    })

    if (!client) {
      return res.status(404).json({ message: "Client not found" })
    }

    // Generate invoice number
    const invoiceCount = await Invoice.countDocuments({ userId: req.user.id })
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(3, "0")}`

    // Create invoice metadata in database
    const invoice = new Invoice({
      userId: req.user.id,
      clientId,
      invoiceNumber,
      totalAmount,
      dueDate,
      status: "draft",
    })

    await invoice.save()

    // Generate PDF invoice
    const pdfPath = path.join(process.cwd(), "temp", `${invoiceNumber}.pdf`)

    // Ensure temp directory exists
    if (!fs.existsSync(path.join(process.cwd(), "temp"))) {
      fs.mkdirSync(path.join(process.cwd(), "temp"))
    }

    // Create PDF
    await generateInvoicePDF(
      {
        invoice: {
          number: invoiceNumber,
          date: new Date(),
          dueDate: new Date(dueDate),
          totalAmount,
        },
        client: {
          name: client.name,
          email: client.email,
          address: client.address,
          phone: client.phone,
        },
        lineItems,
      },
      pdfPath,
    )

    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Send invoice via email
router.post("/:id/send", async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate("clientId", "name email")

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" })
    }

    // Check if invoice is in draft status
    if (invoice.status !== "draft") {
      return res.status(400).json({ message: "Invoice has already been sent" })
    }

    // Generate PDF invoice (assuming it was already created or recreate it)
    const pdfPath = path.join(process.cwd(), "temp", `${invoice.invoiceNumber}.pdf`)

    // Send email with PDF attachment
    const msg = {
      to: invoice.clientId.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: `Invoice ${invoice.invoiceNumber} from Your Company`,
      text: `Please find attached invoice ${invoice.invoiceNumber} for $${invoice.totalAmount}. Payment is due by ${new Date(invoice.dueDate).toLocaleDateString()}.`,
      html: `<p>Please find attached invoice ${invoice.invoiceNumber} for $${invoice.totalAmount}.</p><p>Payment is due by ${new Date(invoice.dueDate).toLocaleDateString()}.</p>`,
      attachments: [
        {
          content: fs.readFileSync(pdfPath).toString("base64"),
          filename: `Invoice-${invoice.invoiceNumber}.pdf`,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    }

    await sgMail.send(msg)

    // Update invoice status to sent
    invoice.status = "sent"
    invoice.sentAt = Date.now()
    await invoice.save()

    // Delete the temporary PDF file
    fs.unlinkSync(pdfPath)

    res.json({
      message: "Invoice sent successfully",
      invoice,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update invoice status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body

    if (!["draft", "sent", "paid", "overdue", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const updateData = { status, updatedAt: Date.now() }

    // If status is paid, set paidAt date
    if (status === "paid") {
      updateData.paidAt = Date.now()
    }

    const invoice = await Invoice.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, updateData, {
      new: true,
    })

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" })
    }

    res.json({
      message: "Invoice status updated successfully",
      invoice,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Helper function to generate PDF invoice
async function generateInvoicePDF(data, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const writeStream = fs.createWriteStream(outputPath)

      doc.pipe(writeStream)

      // Add company logo/header
      doc.fontSize(20).text("Invoicely", { align: "center" })
      doc.moveDown()

      // Invoice details
      doc.fontSize(16).text("INVOICE", { align: "right" })
      doc
        .fontSize(10)
        .text(`Invoice Number: ${data.invoice.number}`, { align: "right" })
        .text(`Date: ${data.invoice.date.toLocaleDateString()}`, { align: "right" })
        .text(`Due Date: ${data.invoice.dueDate.toLocaleDateString()}`, { align: "right" })

      doc.moveDown()

      // Client information
      doc.fontSize(12).text("Bill To:")
      doc
        .fontSize(10)
        .text(data.client.name)
        .text(data.client.address || "")
        .text(data.client.email)
        .text(data.client.phone || "")

      doc.moveDown()

      // Line items
      const tableTop = 250
      const itemCodeX = 50
      const descriptionX = 100
      const quantityX = 350
      const priceX = 400
      const amountX = 450

      doc
        .fontSize(10)
        .text("Item", itemCodeX, tableTop)
        .text("Description", descriptionX, tableTop)
        .text("Qty", quantityX, tableTop)
        .text("Price", priceX, tableTop)
        .text("Amount", amountX, tableTop)

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke()

      let tableRow = tableTop + 25

      data.lineItems.forEach((item) => {
        doc
          .fontSize(10)
          .text(item.item || "", itemCodeX, tableRow)
          .text(item.description, descriptionX, tableRow)
          .text(item.quantity.toString(), quantityX, tableRow)
          .text(`$${item.price.toFixed(2)}`, priceX, tableRow)
          .text(`$${(item.quantity * item.price).toFixed(2)}`, amountX, tableRow)

        tableRow += 20
      })

      doc.moveTo(50, tableRow).lineTo(550, tableRow).stroke()

      // Total
      doc
        .fontSize(10)
        .text("Total:", 400, tableRow + 15)
        .text(`$${data.invoice.totalAmount.toFixed(2)}`, amountX, tableRow + 15)

      // Footer
      doc.fontSize(10).text("Thank you for your business!", 50, 700, { align: "center" })

      doc.end()

      writeStream.on("finish", () => {
        resolve()
      })

      writeStream.on("error", (error) => {
        reject(error)
      })
    } catch (error) {
      reject(error)
    }
  })
}

export default router
