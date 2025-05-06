import express from "express"
import Invoice from "../models/Invoice.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Get revenue report
router.get("/revenue", async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    // Default to last 12 months if no dates provided
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(end.getFullYear() - 1, end.getMonth(), 1)

    // Aggregate monthly revenue
    const revenueData = await Invoice.aggregate([
      {
        $match: {
          userId: req.user.id,
          status: "paid",
          paidAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$paidAt" },
            month: { $month: "$paidAt" },
          },
          total: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ])

    // Format the data for frontend charts
    const formattedData = revenueData.map((item) => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      total: item.total,
    }))

    res.json(formattedData)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get outstanding invoices report
router.get("/outstanding", async (req, res) => {
  try {
    const outstandingInvoices = await Invoice.find({
      userId: req.user.id,
      status: { $in: ["sent", "overdue"] },
    }).populate("clientId", "name email")

    // Calculate total outstanding amount
    const totalOutstanding = outstandingInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)

    // Group by client
    const byClient = {}
    outstandingInvoices.forEach((invoice) => {
      const clientId = invoice.clientId._id.toString()
      if (!byClient[clientId]) {
        byClient[clientId] = {
          client: invoice.clientId,
          invoices: [],
          total: 0,
        }
      }
      byClient[clientId].invoices.push(invoice)
      byClient[clientId].total += invoice.totalAmount
    })

    res.json({
      totalOutstanding,
      invoiceCount: outstandingInvoices.length,
      outstandingInvoices,
      byClient: Object.values(byClient),
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get invoice status summary
router.get("/status-summary", async (req, res) => {
  try {
    const statusSummary = await Invoice.aggregate([
      {
        $match: {
          userId: req.user.id,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total: { $sum: "$totalAmount" },
        },
      },
    ])

    res.json(statusSummary)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
