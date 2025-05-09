import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import {Product} from "@/models/product.model"
import { authMiddleware } from "@/lib/auth"

// Connect to MongoDB
connectToDatabase()

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the user session
    const session = await authMiddleware(req)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the product ID from the URL
    const { id } = params

    // Get the product
    const product = await Product.findOne({ _id: id, userId: session.user.id })

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the user session
    const session = await authMiddleware(req)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the product ID from the URL
    const { id } = params

    // Get the product data from the request body
    const data = await req.json()

    // Update the product
    const product = await Product.findOneAndUpdate({ _id: id, userId: session.user.id }, data, { new: true })

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the user session
    const session = await authMiddleware(req)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the product ID from the URL
    const { id } = params

    // Delete the product
    const product = await Product.findOneAndDelete({ _id: id, userId: session.user.id })

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 })
  }
}
