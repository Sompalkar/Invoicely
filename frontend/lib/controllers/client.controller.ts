import { type NextRequest, NextResponse } from "next/server"
import { Client } from "@/models/client.model"
import { connectToDatabase } from "@/lib/db"
import { authMiddleware } from "@/lib/auth"

export async function getClients(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await authMiddleware(req)

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get clients for this user
    const clients = await Client.find({ userId: user._id }).sort({ createdAt: -1 })

    return NextResponse.json(clients)
  } catch (error) {
    console.error("Get clients error:", error)
    return NextResponse.json({ message: "Failed to get clients" }, { status: 500 })
  }
}

export async function getClient(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await authMiddleware(req)

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get client
    const client = await Client.findOne({ _id: params.id, userId: user._id })

    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Get client error:", error)
    return NextResponse.json({ message: "Failed to get client" }, { status: 500 })
  }
}

export async function createClient(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await authMiddleware(req)

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, email, phone, address } = await req.json()

    // Validate input
    if (!name || !email) {
      return NextResponse.json({ message: "Name and email are required" }, { status: 400 })
    }

    // Create client
    const client = await Client.create({
      name,
      email,
      phone,
      address,
      userId: user._id,
    })

    return NextResponse.json({
      success: true,
      client,
    })
  } catch (error) {
    console.error("Create client error:", error)
    return NextResponse.json({ message: "Failed to create client" }, { status: 500 })
  }
}

export async function updateClient(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await authMiddleware(req)

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, email, phone, address } = await req.json()

    // Validate input
    if (!name || !email) {
      return NextResponse.json({ message: "Name and email are required" }, { status: 400 })
    }

    // Find and update client
    const client = await Client.findOneAndUpdate(
      { _id: params.id, userId: user._id },
      { name, email, phone, address },
      { new: true },
    )

    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      client,
    })
  } catch (error) {
    console.error("Update client error:", error)
    return NextResponse.json({ message: "Failed to update client" }, { status: 500 })
  }
}

export async function deleteClient(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await authMiddleware(req)

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Find and delete client
    const client = await Client.findOneAndDelete({ _id: params.id, userId: user._id })

    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully",
    })
  } catch (error) {
    console.error("Delete client error:", error)
    return NextResponse.json({ message: "Failed to delete client" }, { status: 500 })
  }
}
