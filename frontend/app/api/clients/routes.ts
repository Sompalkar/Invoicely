import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import {Client} from "@/models/client.model"
import { authMiddleware } from "@/lib/auth"

// 
connectToDatabase()

export async function GET(req: NextRequest) {
  try {
    // Get the user session
    const session = await authMiddleware(req)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get all clients for the current user
    const clients = await Client.find({ userId: session.user.id })

    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ message: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get the user session
    const session = await authMiddleware(req)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the client data from the request body
    const data = await req.json()

    // Create a new client
    const client = new Client({
      ...data,
      userId: session.user.id,
    })

    // Save the client
    await client.save()

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ message: "Failed to create client" }, { status: 500 })
  }
}
