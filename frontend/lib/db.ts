import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/invoicely"

// Global variable to track connection status
let isConnected = false

export async function connectToDatabase() {
  if (isConnected) {
    return
  }

  try {
    const db = await mongoose.connect(MONGODB_URI)

    isConnected = !!db.connections[0].readyState

    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

export function getConnection() {
  return mongoose.connection
}
