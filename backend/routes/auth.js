import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      })
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" })

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router
