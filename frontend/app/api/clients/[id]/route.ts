import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import {Client} from "@/models/client.model"
import { authMiddleware } from "@/lib/auth"

 
connectToDatabase();
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the user session
    const session = await authMiddleware(req)
    console.log(session, "helo ")

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the client ID from the URL
    const { id } = params

    // Get the client
    const client = await Client.findOne({ _id: id, userId: session.user.id })

    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ message: "Failed to fetch client" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the user session
    const session = await authMiddleware(req)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the client ID from the URL
    const { id } = params

    // Get the client data from the request body
    const data = await req.json()

    // Update the client
    const client = await Client.findOneAndUpdate({ _id: id, userId: session.user.id }, data, { new: true })

    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ message: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the user session
    const session = await authMiddleware(req)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the client ID from the URL
    const { id } = params

    // Delete the client
    const client = await Client.findOneAndDelete({ _id: id, userId: session.user.id })

    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Client deleted successfully" })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json({ message: "Failed to delete client" }, { status: 500 })
  }
}
