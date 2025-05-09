import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import {Product} from "@/models/product.model"
import { authMiddleware } from "@/lib/auth"

// Connect to MongoDB
 connectToDatabase()

export async function GET(req: NextRequest) {
  try {
    // Get the user session
    const session = await authMiddleware(req)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get all products for the current user
    const products = await Product.find({ userId: session.user.id })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get the user session
    const session = await authMiddleware(req)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the product data from the request body
    const data = await req.json()

    // Create a new product
    const product = new Product({
      ...data,
      userId: session.user.id,
    })

    // Save the product
    await product.save()

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 })
  }
}
