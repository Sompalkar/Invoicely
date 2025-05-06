import express from "express"
import Client from "../models/Client.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Get all clients for the user
router.get("/", async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.id })
    res.json(clients)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get a specific client
router.get("/:id", async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!client) {
      return res.status(404).json({ message: "Client not found" })
    }

    res.json(client)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create a new client
router.post("/", async (req, res) => {
  try {
    const { name, email, address, phone } = req.body

    const client = new Client({
      userId: req.user.id,
      name,
      email,
      address,
      phone,
    })

    await client.save()

    res.status(201).json({
      message: "Client created successfully",
      client,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update a client
router.put("/:id", async (req, res) => {
  try {
    const { name, email, address, phone } = req.body

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        name,
        email,
        address,
        phone,
        updatedAt: Date.now(),
      },
      { new: true },
    )

    if (!client) {
      return res.status(404).json({ message: "Client not found" })
    }

    res.json({
      message: "Client updated successfully",
      client,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Delete a client
router.delete("/:id", async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!client) {
      return res.status(404).json({ message: "Client not found" })
    }

    res.json({ message: "Client deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
